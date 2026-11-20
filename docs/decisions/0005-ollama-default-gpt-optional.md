# 0005: Keep local Ollama as the default and allow GPT as an optional provider
- Date: 2026-11-20
- Status: Accepted
- Related: amends [0004](0004-local-ollama-instead-of-paid-llm-api.md); `backend/app/llm.py`, `backend/app/llm_openai.py`, `backend/tests/test_llm_provider.py`

**Context:** Decision 0004 ruled out paid APIs. The project owner then got OpenAI API access, and the local 3B model is slow to download and less accurate on bills.

**Decision:** `LLM_PROVIDER` in `backend/.env` selects `ollama` (default, free, local) or `openai` (GPT through the official `openai` SDK, strict structured output from the same `BillFields` model). Both classes expose the same four methods, so the agent and API are unchanged. We rejected replacing Ollama outright: the free, offline path is still the default anyone cloning the repo can run without a key.

**Consequences:** Better accuracy is one setting away, but GPT costs money per bill and sends bill photos to OpenAI. Two providers mean two code paths to keep in step.

**Revisit when:** One provider goes unused for a month, or the owner picks a single provider for a deployment.
