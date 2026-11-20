"""Why is the bill what it is? Plain Python rules over the fields and the printed bill history.

No LLM here: every reason and number is computed, so it cannot be invented. The LLM only puts
these reasons into plain Urdu/English, and the frontend renders them from fixed sentence templates.

Pakistan-specific rules used:
- Arrears: unpaid amounts from earlier bills are added to the total. When the previous month's
  printed bill minus its payment equals the arrears, we can name the month it came from.
- Protected consumers (NEPRA tariff determination, 2021): a non-ToU household that used 200 units
  or less in each of the last 6 months gets lower rates. One month above 200 makes it unprotected.
- FPA (fuel price adjustment), taxes, late-payment surcharge and subsidy are printed on the bill.
"""

from datetime import date

from .schemas import BillFields, Comparison, HistoryRow, Insight

PROTECTED_LIMIT = 200  # units per month
PROTECTED_MONTHS = 6


def add_months(d: date, months: int) -> date:
    index = d.year * 12 + d.month - 1 + months
    return date(index // 12, index % 12 + 1, 1)


def history_row(fields: BillFields, month: date) -> HistoryRow | None:
    return next((r for r in fields.history if r.month == month), None)


def find_insights(fields: BillFields, comparison: Comparison | None) -> list[Insight]:
    insights: list[Insight] = []
    month = fields.billing_month

    # 1. Unpaid amount from earlier bills: often the single biggest reason a total looks high.
    if fields.arrears and fields.arrears > 0:
        values: dict = {"arrears": fields.arrears}
        prev = history_row(fields, add_months(month, -1)) if month else None
        if prev and prev.bill is not None and prev.payment is not None and abs(prev.bill - prev.payment - fields.arrears) <= 1:
            values |= {"from_month": prev.month.isoformat(), "billed": prev.bill, "paid": prev.payment}
        insights.append(Insight(code="arrears", values=values))

    # 2. Units compared with last month.
    if comparison and fields.units is not None:
        insights.append(Insight(code="units_vs_last_month", values={
            "units": fields.units, "previous_units": comparison.previous_units,
            "diff": comparison.units_diff, "previous_month": comparison.previous_month.isoformat(),
        }))

    # 3. Same month last year: separates "we used more" from "it is just summer".
    last_year = history_row(fields, add_months(month, -12)) if month else None
    if last_year and last_year.units is not None and fields.units is not None:
        insights.append(Insight(code="units_vs_last_year", values={
            "units": fields.units, "last_year_units": last_year.units,
            "diff": fields.units - last_year.units, "last_year_month": last_year.month.isoformat(),
        }))

    # 4. Protected / unprotected status.
    category = (fields.category or "").lower().replace("-", " ")
    unprotected = "unprotected" in category or "non protected" in category
    protected = not unprotected and "protected" in category
    if month:
        window = [r for r in fields.history
                  if add_months(month, -PROTECTED_MONTHS) <= r.month < month and r.units is not None]
        over = [r for r in window if r.units > PROTECTED_LIMIT]
        if unprotected and over:
            worst = max(over, key=lambda r: r.units)
            insights.append(Insight(code="unprotected_because", values={
                "month": worst.month.isoformat(), "units": worst.units, "limit": PROTECTED_LIMIT,
                "months": PROTECTED_MONTHS,
            }))
        elif unprotected:
            insights.append(Insight(code="unprotected", values={"limit": PROTECTED_LIMIT, "months": PROTECTED_MONTHS}))
        elif protected:
            insights.append(Insight(code="protected", values={"limit": PROTECTED_LIMIT, "months": PROTECTED_MONTHS}))
    if fields.units is not None and fields.units > PROTECTED_LIMIT and not unprotected:
        insights.append(Insight(code="over_limit", values={"units": fields.units, "limit": PROTECTED_LIMIT,
                                                           "months": PROTECTED_MONTHS}))

    # 5-8. Charges printed on the bill.
    if fields.fpa and fields.fpa > 0:
        insights.append(Insight(code="fpa", values={"fpa": fields.fpa}))
    if fields.taxes and fields.taxes > 0:
        values = {"taxes": fields.taxes}
        if fields.current_bill:
            values["current_bill"] = fields.current_bill
        insights.append(Insight(code="taxes", values=values))
    if fields.payable_after_due and fields.amount and fields.payable_after_due > fields.amount:
        insights.append(Insight(code="late_fee", values={
            "extra": round(fields.payable_after_due - fields.amount, 2),
            "payable_after_due": fields.payable_after_due,
        }))
    if fields.subsidy and fields.subsidy > 0:
        insights.append(Insight(code="subsidy", values={"subsidy": fields.subsidy}))
    return insights


def insight_sentences(insights: list[Insight]) -> list[str]:
    """English sentences for the LLM prompt. Numbers are already final; the LLM only rephrases."""
    out = []
    for i in insights:
        v = i.values
        if i.code == "arrears":
            s = f"Rs {v['arrears']:,.0f} of the total is unpaid money from earlier bills (arrears)"
            if "from_month" in v:
                s += (f": the {date.fromisoformat(v['from_month']):%B %Y} bill was Rs {v['billed']:,.0f} "
                      f"and only Rs {v['paid']:,.0f} was paid")
            out.append(s + ".")
        elif i.code == "units_vs_last_month":
            d = v["diff"]
            change = "the same as" if d == 0 else f"{abs(d)} {'more' if d > 0 else 'fewer'} than"
            out.append(f"Units this month: {v['units']}, {change} {date.fromisoformat(v['previous_month']):%B %Y} ({v['previous_units']}).")
        elif i.code == "units_vs_last_year":
            d = v["diff"]
            change = "the same as" if d == 0 else f"{abs(d)} {'more' if d > 0 else 'fewer'} than"
            out.append(f"That is {change} the same month last year ({v['last_year_units']} units).")
        elif i.code == "unprotected_because":
            out.append(f"The household is UNPROTECTED (higher rates) because {date.fromisoformat(v['month']):%B %Y} "
                       f"used {v['units']} units, above the {v['limit']}-unit limit; it can become protected "
                       f"again after {v['months']} months at {v['limit']} units or less.")
        elif i.code == "unprotected":
            out.append(f"The household is UNPROTECTED (higher rates): it used more than {v['limit']} units "
                       f"in at least one of the last {v['months']} months.")
        elif i.code == "protected":
            out.append(f"The household is PROTECTED (lower rates); staying at {v['limit']} units or less "
                       f"every month keeps it that way.")
        elif i.code == "over_limit":
            out.append(f"This month used {v['units']} units, above {v['limit']}: the household may lose "
                       f"protected (lower) rates for the next {v['months']} months.")
        elif i.code == "fpa":
            out.append(f"Rs {v['fpa']:,.0f} fuel price adjustment (FPA) is included.")
        elif i.code == "taxes":
            out.append(f"Taxes on this bill: Rs {v['taxes']:,.0f}.")
        elif i.code == "late_fee":
            out.append(f"Paying after the due date adds Rs {v['extra']:,.0f} (total Rs {v['payable_after_due']:,.0f}).")
        elif i.code == "subsidy":
            out.append(f"The government gave a subsidy of Rs {v['subsidy']:,.0f} on this bill.")
    return out
