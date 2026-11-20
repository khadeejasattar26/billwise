Build "BillWise": an AI agent that reads a photo of a Pakistani electricity bill (English + Urdu), extracts the key fields, checks them, compares with last month, explains the change in plain words, and triggers a due-date reminder. It is a 60-minute portfolio project for an AI Engineer job application, so every part must map to a job requirement and must actually run.

## Job requirements this must show
Computer vision (OpenCV), OCR (Tesseract), LLMs + prompt engineering + structured output, an agent workflow (LangGraph), Python + FastAPI, PostgreSQL, React + TypeScript + Tailwind, workflow automation (n8n). Stretch only: voice reminder via Vapi or Twilio.

## Current state of this folder (verify each before building)
- `git init` done, no commits yet.
- `docker-compose.yml`: Postgres 16 on host port 5433 (user/pass/db = billwise) and n8n on 5678. Postgres was started with `docker compose up -d db`. Check with `docker compose ps`.
- `backend/schema.sql`: `bills` table, auto-loaded by Postgres on first start. Unique on (account_no, billing_month).
- `frontend/`: Vite React TS scaffold, `tailwindcss` and `@tailwindcss/vite` installed but not configured yet.
- A Homebrew install of `python@3.12` and `tesseract` was started and may not have finished. Check `/opt/homebrew/bin/python3.12` and `/opt/homebrew/bin/tesseract`; if missing, run `HOMEBREW_NO_AUTO_UPDATE=1 brew install python@3.12 tesseract`. System Python is 3.9, which is too old for LangGraph. Download `urd.traineddata` (tessdata_fast) for Urdu.

## Backend (backend/, Python 3.12 venv at backend/.venv)
Dependencies: fastapi, uvicorn, python-multipart, opencv-python-headless, pytesseract, pillow, langgraph, anthropic, pydantic, psycopg[binary], httpx, python-dotenv, pytest.

Files, one job each:
- `app/vision.py`: OpenCV cleanup: grayscale, deskew, adaptive threshold, denoise. Returns a cleaned image.
- `app/ocr.py`: pytesseract with `eng+urd`; returns the text.
- `app/llm.py`: Claude calls through the official `anthropic` Python SDK only (no LangChain wrappers, no raw HTTP). Model `claude-opus-5-5`. Use `messages.parse` with a Pydantic `output_format` for extraction. Enable the server-side refusal fallback (`betas=["server-side-fallback-2026-07-01"]`, `fallbacks="default"`) and check `stop_reason` before reading output. Load the `claude-api` skill before writing this file and follow it. The key comes from `ANTHROPIC_API_KEY` in `backend/.env`; never hardcode it.
- `app/agent.py`: LangGraph `StateGraph` with nodes **extract → validate → compare → explain**:
  - extract: LLM turns OCR text into `BillFields` (account_no, billing_month, previous_reading, current_reading, units, amount, due_date).
  - validate: plain Python, no LLM. Rules: required fields present; units == current_reading − previous_reading; amount > 0; due_date after billing_month. On failure, take a conditional edge back to extract in **vision mode**, sending the original image to Claude, at most once. If it still fails, continue with `warnings` filled in. This retry loop is what makes it an agent rather than a single prompt, so keep it.
  - compare: load the previous month's bill for the same account from Postgres; compute % change in units and amount.
  - explain: LLM writes 2–3 plain sentences using the real numbers.
- `app/db.py`: psycopg, parameterised SQL only, never string concatenation. Upsert on (account_no, billing_month).
- `app/notify.py`: POST the saved bill to `N8N_WEBHOOK_URL` if set; skip silently if unset; never fail the request because n8n is down.
- `app/main.py`: thin routes:
  - `POST /bills` (multipart image; allow only .jpg/.jpeg/.png, max 5 MB → 415/413)
  - `GET /bills?account_no=`
  - `POST /bills/{id}/ask` with `{question}`, answered by the LLM using that account's bill history
  - One error shape everywhere: `{"error": {"code": "...", "message": "..."}}`. CORS allows the Vite dev origin only.
- `.env.example` with placeholder values. `.gitignore` covers .venv, .env, node_modules, dist.

## Sample data
`samples/make_samples.py` uses Pillow to generate 2 synthetic bill images (fake account number, consecutive months, mixed English/Urdu labels, the second month higher). Use no real person's data and no real utility company logo.

## Tests (pytest, names read as sentences)
- validate passes a correct bill; fails when units ≠ reading difference; fails on a missing due date
- the graph retries in vision mode once when validation fails (fake LLM, no network)
- upload rejects a .pdf with 415 and a 6 MB file with 413
Tests must never call the real API.

## Frontend (frontend/)
Configure Tailwind v4 via `@tailwindcss/vite`. One page: upload button → extracted fields table (with warnings highlighted) → explanation → month-by-month bar chart of amount (plain divs, no chart library) → "Ask about this bill" box. Handle loading, empty, error and success states. Use real `<button>`s and visible focus. API base URL comes from `VITE_API_URL`.

## n8n
`n8n/bill-reminder.json`: Webhook → Wait until (due_date − 3 days) → Send Email (or Telegram). Import it with `docker compose exec n8n n8n import:workflow --input=/workflows/bill-reminder.json` to prove it is valid.

## Docs
- `README.md`: what it is, a text diagram of the graph, which job skill each part shows, setup (docker compose, venv, env vars, run backend and frontend, pytest), a 1-minute demo script, known limitations, next steps (fine-tune YOLO to locate the amount box before OCR; Vapi voice reminder; deploy).
- `AGENTS.md` with the decision-log rule, and `CLAUDE.md` containing the line `AGENTS.md`.
- `docs/decisions/`: 3 records (80–150 words each): OCR-first with vision fallback; Claude via the official SDK inside LangGraph; Postgres upsert per account-month.

## Working rules
- Timebox 60 minutes. Order: backend pipeline + tests (30 min) → frontend (15) → n8n (8) → README (7). If behind, cut in this order: ask box, chart, n8n import check.
- After each part, run it for real (pytest, curl the route with a sample image, open the page) and show the actual output. Never claim something works without evidence.
- If `ANTHROPIC_API_KEY` is missing, ask me for it; don't stub the LLM outside tests.
- Commit after each part with a plain message saying what changed and why.
- Explain each part to me in 2–3 plain sentences so I can present it in an interview.
