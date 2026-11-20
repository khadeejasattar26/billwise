"""Data shapes shared by the LLM, the agent and the API."""

from datetime import date

from pydantic import BaseModel, Field


class HistoryRow(BaseModel):
    """One row of the "Bill History" table printed on Pakistani bills (usually the last 12 months)."""

    month: date = Field(..., description="First day of that month, e.g. 'Sep 26' -> 2026-09-01")
    units: int | None = Field(None, description="Units consumed that month")
    bill: float | None = Field(None, description="Bill amount that month in PKR")
    payment: float | None = Field(None, description="Amount paid against that bill in PKR; 0 if unpaid")


class BillFields(BaseModel):
    """What BillWise reads from a bill. None means the field could not be read or is not printed.

    The first seven are required for a bill to be saved; the rest explain why the total is what it is.
    """

    account_no: str | None = Field(None, description="Consumer / account / reference number exactly as printed")
    billing_month: date | None = Field(None, description="First day of the billing month, e.g. 2026-10-01 for Oct 2026")
    previous_reading: int | None = Field(None, description="Previous meter reading in kWh")
    current_reading: int | None = Field(None, description="Current meter reading in kWh")
    units: int | None = Field(None, description="Units consumed in kWh as printed on the bill")
    amount: float | None = Field(None, description="Total amount payable within due date, in PKR")
    due_date: date | None = Field(None, description="Last date to pay without surcharge")
    disco: str | None = Field(None, description="Short name of the company that issued the bill, e.g. MEPCO, LESCO, K-Electric")
    category: str | None = Field(None, description="Consumer category as printed, e.g. PROTECTED or UNPROTECTED")
    multiplying_factor: int | None = Field(None, description="Meter multiplying factor (MF); usually 1")
    current_bill: float | None = Field(None, description="This month's charges including taxes ('Current Bill'), PKR")
    arrears: float | None = Field(None, description="Unpaid amount from earlier bills ('Arrears'), PKR; null if none")
    fpa: float | None = Field(None, description="Fuel price adjustment total ('Total FPA'), PKR")
    taxes: float | None = Field(None, description="Total taxes on this bill, PKR")
    subsidy: float | None = Field(None, description="Government subsidy shown on the bill, PKR")
    payable_after_due: float | None = Field(None, description="Amount payable after the due date (first late amount), PKR")
    history: list[HistoryRow] = Field(default_factory=list, description="Every row of the printed Bill History table")


class Comparison(BaseModel):
    source: str = Field("saved", description="'saved' = previous bill uploaded to BillWise; 'printed' = bill's own history table")
    previous_month: date
    previous_units: int
    previous_amount: float
    units_change_pct: float | None
    amount_change_pct: float | None
    units_diff: int
    amount_diff: float
    previous_cost_per_unit: float | None


class Explanation(BaseModel):
    """The same 2-3 sentence explanation in both languages, produced by one LLM call."""

    english: str = Field(..., description="2-3 short plain English sentences")
    urdu: str = Field(..., description="The same explanation in simple everyday Urdu script")


def cost_per_unit(amount: float | None, units: int | None) -> float | None:
    """Average rupees paid per unit (kWh). Computed in code, never by the LLM."""
    if not amount or not units:
        return None
    return round(amount / units, 2)


class Insight(BaseModel):
    """One reason the bill is what it is, found by plain Python rules (no LLM).

    `code` picks the sentence template in the frontend and the explanation prompt; `values` fills it.
    """

    code: str
    values: dict[str, float | int | str]


def energy_cost_per_unit(fields: "BillFields") -> float | None:
    """Rupees per unit for this month's electricity only.

    The total payable can include unpaid arrears, which would inflate the price per unit
    (a real bill showed Rs 96/unit instead of Rs 45). Use the "Current Bill" when printed;
    if there are arrears but no current bill, the true price is unknown.
    """
    if fields.current_bill:
        return cost_per_unit(fields.current_bill, fields.units)
    if fields.arrears:
        return None
    return cost_per_unit(fields.amount, fields.units)
