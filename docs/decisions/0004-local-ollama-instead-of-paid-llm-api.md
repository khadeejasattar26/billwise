# 0004: Run the LLM locally with Ollama instead of a paid API
- Date: 2026-11-20
- Status: Accepted
- Related: supersedes [0002](0002-claude-via-official-sdk-inside-langgraph.md); `backend/app/llm.py`

**Context:** The project owner decided BillWise must not use any paid API. Decision 0002 called Claude, which bills per token.

**Decision:** All LLM calls go to a local Ollama server running `qwen2.5vl:3b` through the official `ollama` Python client. It reads images, so one model covers extraction and the vision retry. Ollama's `format` constrains output to the `BillFields` JSON schema; `done_reason` is checked first. We rejected free hosted tiers such as Gemini's: they need a key, have daily limits, and free-tier prompts may be used for training, a poor fit for bill data.

**Consequences:** No cost, no key, and bills stay on the machine. Each call takes seconds on an M5 with 16 GB RAM, the model needs a 3.2 GB download, and accuracy is lower than a frontier model.

**Revisit when:** Accuracy on real bills falls short, or the app moves to a server without enough memory for the model.
