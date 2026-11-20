# QA suites

End-to-end checks run before a release, in addition to the unit tests in `backend/tests`.

| Suite | What it covers |
|---|---|
| `api_qa.py` | 42 API cases: bad files, size limits, consent, not-a-bill photos (no invented bills), rotated/tiny/mislabelled photos, Ask and speech validation, prompt injection, CORS, path traversal, rate limits and header spoofing, nothing stored in public mode |
| `ui_qa.py` | 21 browser cases in Edge: Urdu/RTL load, consent gate, keyboard-only use and visible focus, language persistence, Urdu error messages, stale results, phone widths 320/375/768 px, axe-core accessibility scan |

```bash
backend/.venv/bin/python qa/make_qa_images.py /tmp/qa-images
# API: :8000 local mode, :8001 public mode with tight limits
(cd backend && .venv/bin/uvicorn app.main:app --port 8000 &)
(cd backend && STORAGE=off OCR_MODE=off RATE_LIMITS=on UPLOADS_PER_HOUR=2 \
  .venv/bin/uvicorn app.main:app --port 8001 --no-proxy-headers &)
backend/.venv/bin/python qa/api_qa.py /tmp/qa-images
# UI: needs `npm run dev` in frontend/ and Playwright (pip install playwright) with Microsoft Edge
python qa/ui_qa.py /tmp/qa-images /tmp
```

Both suites call the real LLM (about 20 GPT calls in total, under 2 US cents with gpt-4.1-mini).
