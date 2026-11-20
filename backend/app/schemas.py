"""Data shapes shared by the LLM, the agent and the API."""

from datetime import date

from pydantic import BaseModel, Field


class BillFields(BaseModel):
    """The seven fields BillWise reads from a bill. None means the field could not be read."""

    account_no: str | None = Field(None, description="Consumer / account / reference number exactly as printed")
    billing_month: date | None = Field(None, description="First day of the billing month, e.g. 2026-10-01 for Oct 2026")
    previous_reading: int | None = Field(None, description="Previous meter reading in kWh")
    current_reading: int | None = Field(None, description="Current meter reading in kWh")
    units: int | None = Field(None, description="Units consumed in kWh as printed on the bill")
    amount: float | None = Field(None, description="Total amount payable within due date, in PKR")
    due_date: date | None = Field(None, description="Last date to pay without surcharge")


class Comparison(BaseModel):
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
