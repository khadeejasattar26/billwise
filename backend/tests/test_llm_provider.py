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


def test_explain_facts_spells_out_unit_and_rupee_differences_without_percentages():
    from datetime import date

    from app.llm import explain_facts
    from app.schemas import BillFields, Comparison

    fields = BillFields(account_no="X", billing_month=date(2026, 11, 1), previous_reading=15480,
                        current_reading=15800, units=320, amount=10420.0, due_date=date(2026, 12, 8))
    comparison = Comparison(previous_month=date(2026, 10, 1), previous_units=250, previous_amount=7850.0,
                            units_change_pct=28.0, amount_change_pct=32.7, units_diff=70,
                            amount_diff=2570.0, previous_cost_per_unit=31.4)
    facts = explain_facts(fields, comparison, [])
    assert "70 units more than last month" in facts
    assert "Rs 2,570 more than last month" in facts
    assert "Rs 32.56 per unit" in facts and "Rs 31.40 per unit" in facts
    assert "%" not in facts


def test_answer_prompt_sends_numbers_only_and_names_the_question_script():
    from app.llm import answer_prompt

    history = [{"billing_month": "2026-10-01", "units": 250, "amount": 7850.0, "due_date": "2026-11-08",
                "warnings": [], "explanation": "English text", "explanation_ur": "اردو متن"}]
    english = answer_prompt("Why did my bill go up?", history)
    assert "اردو متن" not in english and "English text" not in english
    assert '"rupees_per_unit": 31.4' in english
    assert "Answer in English." in english
    assert "Answer in Urdu script" in answer_prompt("میرا بل کیوں بڑھا؟", history)


def test_reply_language_detects_urdu_script_roman_urdu_and_english():
    from app.llm import reply_language

    assert reply_language("میرا بل کیوں بڑھا؟") == "ur"
    assert reply_language("mera bill kitna zyada aya?") == "ur"
    assert reply_language("Why did my bill go up?") == "en"
    assert reply_language("How many units did I use in October?") == "en"


def test_urdu_template_states_unit_and_rupee_differences_and_due_date():
    from datetime import date

    from app.llm import urdu_explanation
    from app.schemas import BillFields, Comparison

    fields = BillFields(account_no="X", billing_month=date(2026, 11, 1), previous_reading=15480,
                        current_reading=15800, units=320, amount=10420.0, due_date=date(2026, 12, 8))
    comparison = Comparison(previous_month=date(2026, 10, 1), previous_units=250, previous_amount=7850.0,
                            units_change_pct=28.0, amount_change_pct=32.7, units_diff=70,
                            amount_diff=2570.0, previous_cost_per_unit=31.4)
    text = urdu_explanation(fields, comparison, [])
    assert "320 یونٹ" in text and "70 یونٹ زیادہ" in text
    assert "10,420 روپے" in text and "2,570 روپے زیادہ" in text
    assert "8 دسمبر 2026" in text
    assert "پہلا بل" in urdu_explanation(fields, None, [])
