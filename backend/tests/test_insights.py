"""Pakistan-specific reasons, on a fictional bill shaped like a real PITC bill:
last month was billed 12,000 and only 7,000 paid (arrears 5,000), and July used 240 units (> 200)."""

from datetime import date

from app.agent import build_graph, compare_with_printed, validate_fields
from app.insights import add_months, find_insights
from app.schemas import BillFields, Explanation, HistoryRow

HISTORY = [
    HistoryRow(month=date(2025, 10, 1), units=150, bill=9000, payment=9000),
    HistoryRow(month=date(2026, 5, 1), units=120, bill=3500, payment=3500),
    HistoryRow(month=date(2026, 6, 1), units=160, bill=5000, payment=5000),
    HistoryRow(month=date(2026, 7, 1), units=240, bill=15000, payment=15000),
    HistoryRow(month=date(2026, 8, 1), units=90, bill=4000, payment=0),
    HistoryRow(month=date(2026, 9, 1), units=180, bill=12000, payment=7000),
]
BILL = BillFields(
    account_no="0000-DEMO-0777", billing_month=date(2026, 10, 1), previous_reading=5000,
    current_reading=5100, units=100, amount=9600.0, due_date=date(2026, 11, 5),
    disco="MEPCO", category="UNPROTECTED", multiplying_factor=1, current_bill=4500.0,
    arrears=5000.0, fpa=100.0, taxes=700.0, subsidy=500.0, payable_after_due=9800.0, history=HISTORY,
)


def codes(insights):
    return [i.code for i in insights]


def test_add_months_crosses_year_boundaries():
    assert add_months(date(2026, 1, 1), -1) == date(2025, 12, 1)
    assert add_months(date(2026, 10, 1), -12) == date(2025, 10, 1)


def test_compare_uses_the_printed_history_when_no_bill_was_uploaded_before():
    comparison = compare_with_printed(BILL)
    assert comparison.source == "printed"
    assert comparison.previous_month == date(2026, 9, 1)
    assert comparison.units_diff == -80
    assert comparison.amount_diff == -2400.0
    assert comparison.previous_cost_per_unit is None  # printed bill amounts can include arrears


def test_price_per_unit_uses_this_months_charges_not_the_total_with_arrears():
    from app.schemas import energy_cost_per_unit

    assert energy_cost_per_unit(BILL) == 45.0  # 4,500 / 100, not 9,600 / 100
    assert energy_cost_per_unit(BILL.model_copy(update={"current_bill": None})) is None


def test_arrears_are_traced_to_last_months_unpaid_bill():
    arrears = find_insights(BILL, compare_with_printed(BILL))[0]
    assert arrears.code == "arrears"
    assert arrears.values == {"arrears": 5000.0, "from_month": "2026-09-01", "billed": 12000, "paid": 7000}


def test_unprotected_status_names_the_month_that_crossed_200_units():
    found = {i.code: i.values for i in find_insights(BILL, None)}
    assert found["unprotected_because"]["month"] == "2026-07-01"
    assert found["unprotected_because"]["units"] == 240


def test_units_are_compared_with_last_month_and_the_same_month_last_year():
    found = {i.code: i.values for i in find_insights(BILL, compare_with_printed(BILL))}
    assert found["units_vs_last_month"]["diff"] == -80
    assert found["units_vs_last_year"] == {"units": 100, "last_year_units": 150, "diff": -50,
                                           "last_year_month": "2025-10-01"}


def test_printed_charges_become_reasons():
    found = {i.code: i.values for i in find_insights(BILL, None)}
    assert found["fpa"] == {"fpa": 100.0}
    assert found["late_fee"]["extra"] == 200.0
    assert found["subsidy"] == {"subsidy": 500.0}


def test_a_protected_household_over_200_units_is_warned():
    bill = BILL.model_copy(update={"category": "PROTECTED", "units": 230, "history": []})
    assert {"protected", "over_limit"} <= set(codes(find_insights(bill, None)))


def test_validate_applies_the_meter_multiplying_factor():
    bill = BILL.model_copy(update={"previous_reading": 500, "current_reading": 510, "multiplying_factor": 10})
    assert validate_fields(bill) == []


class OneShotLLM:
    def extract_from_text(self, ocr_text):
        return BILL

    def extract_from_image(self, image_bytes, media_type):
        raise AssertionError("no retry expected")

    def explain(self, fields, comparison, warnings, insights):
        self.insights = insights
        return Explanation(english="e", urdu="u")


def test_the_graph_compares_with_printed_history_and_passes_reasons_to_the_explanation():
    llm = OneShotLLM()
    state = build_graph(llm, lambda account, month: None).invoke(
        {"image_bytes": b"", "media_type": "image/png", "ocr_text": "REFERENCE NO 0000000777 BILL MONTH OCT 26 UNITS 100 TOTAL 9,600"})
    assert state["comparison"].source == "printed"
    assert codes(llm.insights)[0] == "arrears"


def test_history_summary_adds_up_the_printed_history_in_code():
    from app.insights import history_summary

    rows = [r.model_dump(mode="json") for r in HISTORY]
    summary = history_summary(rows)
    assert summary["total_paid_rs"] == 9000 + 3500 + 5000 + 15000 + 0 + 7000
    assert summary["total_billed_rs"] == 9000 + 3500 + 5000 + 15000 + 4000 + 12000
    assert summary["highest_month"] == {"month": "2026-07-01", "units": 240}
    assert summary["months_above_200_units"] == ["2026-07-01"]
    assert history_summary(rows[:1]) is None


def test_charges_that_do_not_add_up_to_the_total_are_flagged():
    # Seen in QA: arrears misread as 1,500 on a tiny photo (4,500 + 1,500 + 100 is not 9,600).
    errors = validate_fields(BILL.model_copy(update={"arrears": 1500.0}))
    assert any("Charges do not add up" in e for e in errors)
    assert validate_fields(BILL) == []


def test_account_numbers_are_stored_with_one_spelling():
    assert BillFields(account_no=" 00 00000 0000000 ").account_no == "00000000000000"
    assert BillFields(account_no="0000-demo-0421").account_no == "0000-DEMO-0421"
