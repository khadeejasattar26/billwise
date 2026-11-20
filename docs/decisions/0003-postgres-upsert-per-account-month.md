# 0003: Store one bill per account per month with a Postgres upsert
- Date: 2026-11-20
- Status: Accepted
- Related: `backend/schema.sql`, `backend/app/db.py`, `BUILD_BRIEF.md`

**Context:** Users re-upload the same bill (a better photo, a retry after an error). The month-over-month comparison and the chart break if one month appears twice.

**Decision:** `bills` has `UNIQUE (account_no, billing_month)` and `db.upsert_bill` uses `INSERT … ON CONFLICT DO UPDATE`, so the latest upload for a month replaces the earlier one. All SQL is parameterised. We rejected keeping every upload and picking the newest at read time: it keeps history, but every query would need de-duplication logic.

**Consequences:** Queries stay simple and comparisons are always one row per month. An earlier upload's OCR text and warnings are overwritten and cannot be audited.

**Revisit when:** We need an audit trail of corrections, or support for split or revised bills within one month.
