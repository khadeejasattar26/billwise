# 0007: Explain "why" with rules over the bill's printed history, and speak on the server
- Date: 2026-11-20
- Status: Accepted
- Related: `backend/app/insights.py`, `backend/app/tts.py`, `backend/migrations/002_add_details.sql`

**Context:** On a real MEPCO bill, "why did my bill go up?" failed: the bill was the account's first upload, and the history table printed on the bill was ignored. Browser speech also failed on devices without an Urdu voice.

**Decision:** Extraction now reads the charges and the printed Bill History, stored in a `details` JSON column. When nothing was saved before, the comparison uses the printed history. Reasons come from Python rules: arrears traced to a partly paid month, NEPRA's 200-unit protected rule, FPA, taxes and the late fee. We rejected letting the LLM find reasons: it can invent numbers. Audio comes from `edge-tts` Urdu voices, with the browser's voice as a fallback.

**Consequences:** Correct, explainable reasons, but more fields to extract. `edge-tts` is unofficial and could break.

**Revisit when:** NEPRA changes the 200-unit rule, or an official free Urdu speech API exists.
