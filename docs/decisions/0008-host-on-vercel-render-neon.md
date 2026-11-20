# 0008: Host the site on Vercel and the backend on Render's free plan, with Neon Postgres
- Date: 2026-11-20
- Status: Accepted (amended by [0010](0010-public-site-stores-nothing.md): the public site stores nothing, so Neon is not needed)
- Related: `Dockerfile`, `render.yaml`, `backend/app/ratelimit.py`, `backend/migrations/003_public_id.sql`

**Context:** BillWise needs a free public link. Vercel can't run Tesseract or OpenCV. A Hugging Face Docker Space now needs a paid PRO plan, and real bills carry names and account numbers.

**Decision:** The React site goes on Vercel and the Docker backend on Render's free plan, with the owner's existing Neon Postgres and GPT. Before going public: random UUID bill IDs, no stored OCR text, deletion after 30 days, a privacy notice and per-visitor and daily limits. We rejected Hugging Face: it is no longer free for Docker.

**Consequences:** The page loads instantly from Vercel. The backend sleeps after 15 idle minutes; the page wakes it on load, but the first upload can still take about a minute. Costs are GPT tokens only, capped in the OpenAI dashboard.

**Revisit when:** Users wait too long for wake-ups (Render Starter is $7/month), or the app needs accounts.
