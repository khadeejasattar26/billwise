"""The BillWise agent: a LangGraph StateGraph  extract -> validate -> (retry extract | compare) -> explain.

If the cheap OCR-text extraction fails the plain-Python checks, the graph loops back once and
asks the vision model to read the original photo instead. That self-correcting loop is what makes this
an agent rather than a single prompt.
"""

from datetime import date
from typing import Any, Callable, Literal, Protocol, TypedDict

from langgraph.graph import END, START, StateGraph

from .schemas import BillFields, Comparison, Explanation, cost_per_unit

MAX_ATTEMPTS = 2  # one OCR-text attempt + at most one vision retry


class LLM(Protocol):
    def extract_from_text(self, ocr_text: str) -> BillFields: ...
    def extract_from_image(self, image_bytes: bytes, media_type: str) -> BillFields: ...
    def explain(self, fields: BillFields, comparison: Comparison | None, warnings: list[str]) -> Explanation: ...


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
        difference = fields.current_reading - fields.previous_reading
        if fields.units != difference:
            errors.append(
                f"Units {fields.units} do not match readings "
                f"{fields.current_reading} - {fields.previous_reading} = {difference}."
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
        if not (fields.account_no and fields.billing_month and fields.units is not None and fields.amount):
            return {"comparison": None}
        prev = previous_bill(fields.account_no, fields.billing_month)
        if prev is None:
            return {"comparison": None}
        return {"comparison": Comparison(
            previous_month=prev["billing_month"],
            previous_units=prev["units"],
            previous_amount=float(prev["amount"]),
            units_change_pct=percent_change(prev["units"], fields.units),
            amount_change_pct=percent_change(float(prev["amount"]), fields.amount),
            units_diff=fields.units - prev["units"],
            amount_diff=round(fields.amount - float(prev["amount"]), 2),
            previous_cost_per_unit=cost_per_unit(float(prev["amount"]), prev["units"]),
        )}

    def explain(state: BillState) -> BillState:
        explanation = llm.explain(state["fields"], state.get("comparison"), state.get("warnings", []))
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
