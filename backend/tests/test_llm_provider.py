import pytest

from app.llm import LLMError, OllamaLLM, make_llm


def test_make_llm_uses_local_ollama_by_default(monkeypatch):
    monkeypatch.delenv("LLM_PROVIDER", raising=False)
    assert isinstance(make_llm(), OllamaLLM)


def test_make_llm_uses_openai_when_asked(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    assert type(make_llm()).__name__ == "OpenAILLM"


def test_make_llm_rejects_an_unknown_provider(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "mystery")
    with pytest.raises(ValueError):
        make_llm()


def test_openai_without_a_key_fails_with_a_clear_message_and_no_network(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(LLMError, match="OPENAI_API_KEY is not set"):
        make_llm().answer("Why is it higher?", [])


def test_explain_facts_says_there_is_no_earlier_bill_when_comparison_is_missing():
    from datetime import date

    from app.llm import explain_facts
    from app.schemas import BillFields

    fields = BillFields(account_no="X", billing_month=date(2026, 10, 1), previous_reading=1,
                        current_reading=251, units=250, amount=7850.0, due_date=date(2026, 11, 8))
    facts = explain_facts(fields, None, [])
    assert "no earlier bill" in facts
    assert "250 units" in facts and "Rs 7,850" in facts and "08 November 2026" in facts
