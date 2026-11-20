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
