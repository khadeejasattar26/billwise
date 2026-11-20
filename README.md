# BillWise

BillWise reads a photo of a Pakistani electricity bill (English + Urdu), pulls out the seven key fields, checks that they add up, compares them with last month, explains the change in plain words, and schedules a due-date reminder.

Upload a photo → get a checked table of fields, a 2–3 sentence explanation ("You used 320 units, 28% more than October…"), a month-by-month chart, and a box to ask questions about your bills.

## How it works

```
photo ──► OpenCV cleanup ──► Tesseract OCR (eng+urd) ──► LangGraph agent
          grayscale, denoise,                              │
          deskew, threshold                                ▼
                                                   ┌──────────────┐
                              ┌──────────────────► │   extract    │  LLM: OCR text → BillFields
                              │  retry once,       └──────┬───────┘  (retry: LLM reads the photo)
                              │  vision mode              ▼
                              │                    ┌──────────────┐
                              └─── checks fail ─── │   validate   │  plain Python, no LLM
                                                   └──────┬───────┘
                                     checks pass, or      ▼  already retried (warnings kept)
                                                   ┌──────────────┐
                                                   │   compare    │  last month from Postgres, % change
                                                   └──────┬───────┘
                                                          ▼
                                                   ┌──────────────┐
                                                   │   explain    │  LLM: 2–3 plain sentences
                                                   └──────┬───────┘
                                                          ▼
                                      Postgres upsert ──► n8n webhook ──► wait until due − 3 days ──► email
```

The validate step checks: all required fields present; `units == current_reading − previous_reading`; `amount > 0`; due date after the billing month. When a check fails the graph goes back to `extract` once, this time sending the vision model the original photo. That self-correcting loop is what makes it an agent rather than one prompt.

## Which job skill each part shows

| Requirement | Where |
|---|---|
| Computer vision (OpenCV) | [backend/app/vision.py](backend/app/vision.py): grayscale, upscale, denoise, deskew, adaptive threshold |
| OCR (Tesseract) | [backend/app/ocr.py](backend/app/ocr.py): `eng+urd`, page-segmentation mode 4 |
| LLMs, prompt engineering, structured output | [backend/app/llm.py](backend/app/llm.py): local `qwen2.5vl:7b` via Ollama (free, no key), output constrained to a JSON schema from a Pydantic model, `done_reason` checks |
| Agent workflow (LangGraph) | [backend/app/agent.py](backend/app/agent.py): `StateGraph` with a conditional retry edge |
| Python + FastAPI | [backend/app/main.py](backend/app/main.py): upload limits, one error shape, CORS |
| PostgreSQL | [backend/app/db.py](backend/app/db.py), [backend/schema.sql](backend/schema.sql): parameterised SQL, upsert per account-month |
| React + TypeScript + Tailwind | [frontend/src/App.tsx](frontend/src/App.tsx): Tailwind v4, loading/empty/error/success states, chart from plain divs |
| Workflow automation (n8n) | [n8n/bill-reminder.json](n8n/bill-reminder.json): Webhook → Wait → Send Email |
| Testing | [backend/tests/](backend/tests/): 11 pytest tests, no network |

Design decisions are logged in [docs/decisions/](docs/decisions/README.md).

## Setup

Requires Docker, Python 3.12, Node 20+, Tesseract with Urdu data, and Ollama. No paid API or API key is used.

```bash
# 1. Database and n8n
docker compose up -d            # Postgres on localhost:5433, n8n on localhost:5678

# 2. Tesseract + Urdu (macOS)
brew install python@3.12 tesseract
curl -fsSL -o "$(brew --prefix)/share/tessdata/urd.traineddata" \
  https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/urd.traineddata
tesseract --list-langs          # should list eng and urd

# 3. Local LLM (about 6 GB download, runs on a 16 GB Mac)
brew install ollama
ollama serve &                  # or: brew services start ollama
ollama pull qwen2.5vl:7b

# 4. Backend
cd backend
python3.12 -m venv .venv
.venv/bin/pip install fastapi uvicorn python-multipart opencv-python-headless pytesseract pillow \
  langgraph ollama pydantic "psycopg[binary]" httpx python-dotenv pytest
cp .env.example .env
.venv/bin/uvicorn app.main:app --port 8000

# 5. Frontend (new terminal)
cd frontend
cp .env.example .env            # VITE_API_URL=http://localhost:8000
npm install
npm run dev                     # http://localhost:5173

# 6. Tests (use a fake LLM, no Ollama needed)
cd backend && .venv/bin/pytest -v

# 7. n8n workflow
docker compose exec n8n n8n import:workflow --input=/workflows/bill-reminder.json
```

Environment variables (`backend/.env`): `DATABASE_URL`, `OLLAMA_HOST`, `OLLAMA_MODEL`, `N8N_WEBHOOK_URL` (empty = no reminder), `FRONTEND_ORIGIN`. To send real emails, open n8n at http://localhost:5678, add SMTP credentials to the "Send reminder email" node, set the recipient, and activate the workflow.

Sample bills: `backend/.venv/bin/python samples/make_samples.py` regenerates `samples/bill_2026_10.png` (clean scan) and `samples/bill_2026_11.png` (tilted 2°, noisy, like a phone photo). Both are synthetic: fake company, fake account number.

## 1-minute demo script

1. **(10 s)** "BillWise reads a Pakistani electricity bill photo, in English and Urdu, and explains it." Open http://localhost:5173.
2. **(15 s)** Upload `samples/bill_2026_10.png`. Point at the fields table: "OpenCV cleans the image, Tesseract reads English and Urdu, a local LLM turns the text into typed fields."
3. **(15 s)** Upload `samples/bill_2026_11.png`, the tilted noisy one. "Deskew straightened it. Python checked that units equal current minus previous reading. If that check fails, the LangGraph agent loops back once and lets the vision model read the photo directly." Point at the "Read with…" line under the explanation.
4. **(10 s)** Point at the explanation and the chart: "It compares with October from Postgres: 28% more units, 33% more money."
5. **(10 s)** Ask "Why is this month higher?" in the box. Then show n8n: "Every saved bill hits this webhook, which waits until three days before the due date and sends a reminder."

## Known limitations

- Tested on two synthetic bills only. Real bills from different distribution companies use different layouts, and Tesseract's Urdu accuracy on real phone photos is unmeasured.
- Deskew handles up to 15° of tilt and no perspective distortion (a photo taken at an angle).
- Re-uploading a bill for the same month overwrites the earlier one (see [decision 0003](docs/decisions/0003-postgres-upsert-per-account-month.md)).
- A 7B local model is less accurate than a hosted frontier model, and each call takes seconds. The validator and vision retry exist to catch its mistakes.
- No user accounts: anyone who knows an account number can list its bills.
- The n8n email node needs SMTP credentials added by hand before it sends anything.

## Next steps

- Fine-tune a YOLO model to locate the amount and readings boxes before OCR, so Tesseract reads only the regions that matter.
- Voice reminder through Vapi or Twilio as a second n8n branch.
- Deploy: backend and Postgres on a managed container host, frontend on a static host, n8n on its own instance.
