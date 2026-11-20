from datetime import date

from app.agent import build_graph
from app.schemas import BillFields, Explanation

GOOD = BillFields(account_no="0000-DEMO-0421", billing_month=date(2026, 11, 1),
                  previous_reading=15480, current_reading=15800, units=320,
                  amount=10420.0, due_date=date(2026, 12, 8))
# OCR misread "320" as "820", so the units check fails.
BAD = GOOD.model_copy(update={"units": 820})


class FakeLLM:
    """Stands in for Claude; records which extraction mode was used. Never touches the network."""

    def __init__(self, text_result: BillFields, image_result: BillFields):
        self.text_result, self.image_result = text_result, image_result
        self.calls: list[str] = []

    def extract_from_text(self, ocr_text):
        self.calls.append("text")
        return self.text_result

    def extract_from_image(self, image_bytes, media_type):
        self.calls.append("image")
        return self.image_result

    def explain(self, fields, comparison, warnings):
        self.calls.append("explain")
        return Explanation(english="explained", urdu="وضاحت")


def last_month(account_no, billing_month):
    return {"billing_month": date(2026, 10, 1), "units": 250, "amount": 7850.0}


def run(llm):
    graph = build_graph(llm, last_month)
    return graph.invoke({"image_bytes": b"img", "media_type": "image/png", "ocr_text": "text"})


def test_the_graph_retries_in_vision_mode_once_when_validation_fails():
    llm = FakeLLM(text_result=BAD, image_result=GOOD)
    state = run(llm)
    assert llm.calls == ["text", "image", "explain"]
    assert state["mode"] == "vision"
    assert state["warnings"] == []
    assert state["fields"].units == 320


def test_the_graph_retries_only_once_and_keeps_the_warnings_if_vision_also_fails():
    llm = FakeLLM(text_result=BAD, image_result=BAD)
    state = run(llm)
    assert llm.calls == ["text", "image", "explain"]
    assert state["attempts"] == 2
    assert any("do not match readings" in w for w in state["warnings"])


def test_the_graph_skips_the_retry_when_ocr_extraction_is_valid():
    llm = FakeLLM(text_result=GOOD, image_result=BAD)
    state = run(llm)
    assert llm.calls == ["text", "explain"]
    assert state["mode"] == "ocr"


def test_compare_reports_percent_change_against_last_month():
    state = run(FakeLLM(text_result=GOOD, image_result=GOOD))
    assert state["comparison"].units_change_pct == 28.0
    assert state["comparison"].amount_change_pct == 32.7


def test_compare_reports_plain_differences_and_last_months_price_per_unit():
    comparison = run(FakeLLM(text_result=GOOD, image_result=GOOD))["comparison"]
    assert comparison.units_diff == 70
    assert comparison.amount_diff == 2570.0
    assert comparison.previous_cost_per_unit == 31.4


def test_the_graph_returns_the_explanation_in_english_and_urdu():
    explanation = run(FakeLLM(text_result=GOOD, image_result=GOOD))["explanation"]
    assert explanation.english == "explained"
    assert explanation.urdu == "وضاحت"
