# 0010: The public site stores nothing; uploads need explicit consent
- Date: 2026-11-20
- Status: Accepted
- Related: amends [0008](0008-host-on-vercel-render-neon.md); `backend/app/main.py` (`STORAGE`, `/ask`), `backend/tests/test_storage_off.py`

**Context:** Bills carry names, addresses and payment history. Pakistan's PECA 2016 penalises unauthorised use of identity information, and the draft Personal Data Protection Bill would require consent and explicit consent for transfers abroad. Once BillWise reads the printed history, the database mainly served the Ask box.

**Decision:** The hosted container runs with `STORAGE=off`: nothing is saved, and the browser sends the bill back with each question to `/ask`. Uploads need a ticked checkbox (own bill or permission; the photo goes to OpenAI in the USA), enforced by the server too. Local runs keep Postgres. We rejected 30-day storage: it keeps personal data for little benefit.

**Consequences:** No personal data at rest and no Neon needed. Results vanish on reload, and comparison with earlier uploads is lost.

**Revisit when:** Users want saved history; that would need accounts and a privacy policy reviewed by a lawyer.
