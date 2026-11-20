# 0006: Explain bills in plain Urdu first, with numbers computed in code
- Date: 2026-11-20
- Status: Accepted
- Related: `backend/app/llm.py`, `frontend/src/i18n.ts`, `backend/migrations/001_add_explanation_ur.sql`

**Context:** The project owner refocused BillWise on ordinary Pakistani households, especially older people, who need their bill explained in simple Urdu.

**Decision:** The page is Urdu-first, with an English switch. One structured LLM call returns `{english, urdu}`, stored in `explanation` and the new `explanation_ur` column. Unit and rupee differences and cost per unit are computed in code, and the LLM only puts them into words. With the local 3B model, Urdu comes from a template, because its Urdu loops and invents words. We rejected translating on each language switch: it is an extra paid call per switch.

**Consequences:** Accurate numbers in both languages and an instant switch. Template Urdu is stiffer than GPT's, and the schema gained a column.

**Revisit when:** A free local model writes reliable Urdu, or users need regional languages such as Punjabi or Sindhi.
