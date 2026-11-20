# 0001: Read bills with OCR first, fall back to Claude vision once
- Date: 2026-11-20
- Status: Accepted
- Related: `backend/app/agent.py`, `backend/tests/test_agent.py`, `BUILD_BRIEF.md`

**Context:** Bill photos arrive tilted, shadowed and in mixed English/Urdu. We need the seven fields reliably, and the job brief asks us to show OpenCV and Tesseract.

**Decision:** Clean the photo with OpenCV, OCR it with Tesseract (`eng+urd`), and let Claude turn the OCR text into structured fields. If the plain-Python checks fail, the graph sends Claude the original image, at most once. We rejected sending every photo straight to vision: it is simpler, but it hides the CV/OCR skills and costs more image tokens per bill.

**Consequences:** Clean bills cost one text call; hard bills cost one extra vision call. Tesseract's Urdu accuracy on real photos is unmeasured, so some bills will always take the retry.

**Revisit when:** Retries exceed about half of uploads on real bills, which would make OCR an extra step rather than a saving.
