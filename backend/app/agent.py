"""The BillWise agent: a LangGraph StateGraph  extract -> validate -> (retry extract | compare) -> explain.

If the cheap OCR-text extraction fails the plain-Python checks, the graph loops back once and
asks the vision model to read the original photo instead. That self-correcting loop is what makes this
an agent rather than a single prompt.
"""

from datetime import date
from typing import Any, Callable, Literal, Protocol, TypedDict

from langgraph.graph import END, START, StateGraph

from .insights import add_months, find_insights, history_row
from .schemas import BillFields, Comparison, Explanation, Insight, cost_per_unit

MAX_ATTEMPTS = 2  # one OCR-text attempt + at most one vision retry


class LLM(Protocol):
    def extract_from_text(self, ocr_text: str) -> BillFields: ...
    def extract_from_image(self, image_bytes: bytes, media_type: str) -> BillFields: ...
    def explain(self, fields: BillFields, comparison: Comparison | None, warnings: list[str],
                insights: list[Insight]) -> Explanation: ...


PreviousBillLookup = Callable[[str, date], dict[str, Any] | None]


class BillState(TypedDict, total=False):
    image_bytes: bytes
    media_type: str
    ocr_text: str
    attempts: int
    mode: Literal["ocr", "vision"]
    fields: BillFields
    errors: list[str]
    warnings: list[str]
    comparison: Comparison | None
    insights: list[Insight]
    explanation: Explanation


def validate_fields(fields: BillFields) -> list[str]:
    """Plain-Python checks on the extracted fields. Returns a list of problems; empty means valid."""
    errors: list[str] = []
    for name in ("account_no", "billing_month", "units", "amount", "due_date"):
        if getattr(fields, name) in (None, ""):
            errors.append(f"Missing {name.replace('_', ' ')}.")

    if fields.previous_reading is None or fields.current_reading is None:
        errors.append("Missing meter readings, so units cannot be checked.")
    elif fields.units is not None:
        # Large connections have a multiplying factor (MF): units = reading difference x MF.
        mf = fields.multiplying_factor or 1
        difference = (fields.current_reading - fields.previous_reading) * mf
        if fields.units != difference:
            shown_mf = f" x MF {mf}" if mf != 1 else ""
            errors.append(
                f"Units {fields.units} do not match readings "
                f"({fields.current_reading} - {fields.previous_reading}){shown_mf} = {difference}."
            )

    if fields.amount is not None and fields.amount <= 0:
        errors.append(f"Amount must be above zero, got {fields.amount}.")
    if fields.due_date and fields.billing_month and fields.due_date <= fields.billing_month:
        errors.append(f"Due date {fields.due_date} is not after billing month {fields.billing_month}.")
    return errors


def percent_change(old: float, new: float) -> float | None:
    if old == 0:
        return None
    return round((new - old) / old * 100, 1)


def _comparison(fields: BillFields, source: str, month, units: int, amount: float,
                previous_cost: float | None) -> Comparison:
    return Comparison(
        source=source,
        previous_month=month,
        previous_units=units,
        previous_amount=amount,
        units_change_pct=percent_change(units, fields.units),
        amount_change_pct=percent_change(amount, fields.amount),
        units_diff=fields.units - units,
        amount_diff=round(fields.amount - amount, 2),
        previous_cost_per_unit=previous_cost,
    )


def compare_with_saved(fields: BillFields, prev: dict[str, Any] | None) -> Comparison | None:
    """Compare with the previous bill already uploaded for this account."""
    if prev is None:
        return None
    details = prev.get("details") or {}
    if details.get("current_bill"):
        previous_cost = cost_per_unit(details["current_bill"], prev["units"])
    elif details.get("arrears"):
        previous_cost = None  # total includes arrears, so a per-unit price would be wrong
    else:
        previous_cost = cost_per_unit(float(prev["amount"]), prev["units"])
    return _comparison(fields, "saved", prev["billing_month"], prev["units"], float(prev["amount"]), previous_cost)


def compare_with_printed(fields: BillFields) -> Comparison | None:
    """Compare with last month's row in the bill's own printed history table."""
    row = history_row(fields, add_months(fields.billing_month, -1))
    if row is None or row.units is None or row.bill is None:
        return None
    # The printed BILL column can include that month's arrears, so no per-unit price from it.
    return _comparison(fields, "printed", row.month, row.units, row.bill, None)


def build_graph(llm: LLM, previous_bill: PreviousBillLookup):
    """Dependencies are passed in so tests can use a fake LLM and an in-memory 'database'."""

    def extract(state: BillState) -> BillState:
        attempts = state.get("attempts", 0)
        if attempts == 0:
            fields, mode = llm.extract_from_text(state["ocr_text"]), "ocr"
        else:
            fields, mode = llm.extract_from_image(state["image_bytes"], state["media_type"]), "vision"
        return {"fields": fields, "mode": mode, "attempts": attempts + 1}

    def validate(state: BillState) -> BillState:
        errors = validate_fields(state["fields"])
        return {"errors": errors, "warnings": errors}

    def after_validate(state: BillState) -> Literal["extract", "compare"]:
        if state["errors"] and state["attempts"] < MAX_ATTEMPTS:
            return "extract"  # retry, this time sending the vision model the photo
        return "compare"

    def compare(state: BillState) -> BillState:
        fields = state["fields"]
        comparison = None
        if fields.account_no and fields.billing_month and fields.units is not None and fields.amount:
            comparison = compare_with_saved(fields, previous_bill(fields.account_no, fields.billing_month))
            if comparison is None:
                # First upload for this account: use the history table printed on the bill itself.
                comparison = compare_with_printed(fields)
        return {"comparison": comparison, "insights": find_insights(fields, comparison)}

    def explain(state: BillState) -> BillState:
        explanation = llm.explain(state["fields"], state.get("comparison"), state.get("warnings", []),
                                  state.get("insights", []))
        return {"explanation": explanation}

    graph = StateGraph(BillState)
    graph.add_node("extract", extract)
    graph.add_node("validate", validate)
    graph.add_node("compare", compare)
    graph.add_node("explain", explain)
    graph.add_edge(START, "extract")
    graph.add_edge("extract", "validate")
    graph.add_conditional_edges("validate", after_validate, ["extract", "compare"])
    graph.add_edge("compare", "explain")
    graph.add_edge("explain", END)
    return graph.compile()
