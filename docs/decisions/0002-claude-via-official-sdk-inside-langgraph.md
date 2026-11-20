# 0002: Call Claude through the official SDK inside a LangGraph graph
- Date: 2026-11-20
- Status: Superseded by [0004](0004-local-ollama-instead-of-paid-llm-api.md)
- Related: `backend/app/llm.py`, `backend/app/agent.py`, `BUILD_BRIEF.md`

**Context:** The workflow has a loop (retry extraction in vision mode when checks fail) and the job brief asks for LangGraph and structured LLM output.

**Decision:** LangGraph owns control flow (`extract → validate → compare → explain`, with a conditional edge back to extract). Every Claude call goes through the `anthropic` Python SDK: `beta.messages.parse` with a Pydantic `BillFields` for extraction, `stop_reason` checked before reading output, and server-side refusal fallback enabled. We rejected LangChain's Claude wrapper: it adds a dependency layer that lags new API features such as `fallbacks`.

**Consequences:** Nodes are plain functions with the LLM injected, so tests run the real graph with a fake LLM. We write our own thin client code.

**Revisit when:** The graph needs tools Claude chooses itself, where the SDK tool runner or Managed Agents would replace the hand-built loop.
