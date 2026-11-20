# QA suites

End-to-end checks run before a release, in addition to the unit tests in `backend/tests`.

| Suite | What it covers |
|---|---|
| `api_qa.py` | 42 API cases: bad files, size limits, consent, not-a-bill photos (no invented bills), rotated/tiny/mislabelled photos, Ask and speech validation, prompt injection, CORS, path traversal, rate limits and header spoofing, nothing stored in public mode |
| `ui_qa.py` | 34 browser cases in Edge for the guided flow: 3 taps to the camera; guards (a link cannot skip consent); the photo check's three outcomes; browser back and forward; a non-bill photo end to end; the free example; ready-made questions; language and larger text; keyboard and focus; every screen with 0 axe-core violations and no tap target under 44 px; widths 320–1280 px |

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
