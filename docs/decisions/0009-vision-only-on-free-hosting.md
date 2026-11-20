# 0009: On the free host, send the photo straight to the vision model instead of running Tesseract
- Date: 2026-11-20
- Status: Accepted
- Related: amends [0001](0001-ocr-first-with-vision-fallback.md); `backend/app/main.py` (`OCR_MODE`), `Dockerfile`

**Context:** Measured in the container limited to Render's free size (0.1 CPU, 512 MB): with OpenCV + Tesseract an upload took 59-106 s for the samples and 394 s for a 12-megapixel phone photo. Noise removal alone took 108 s, Tesseract 161 s; cheaper filters still took 82 s and misread fields.

**Decision:** `OCR_MODE=off` on the hosted container sends a photo shrunk to 2,000 px straight to GPT vision. That took 14-22 s and every field was correct. Local runs keep `OCR_MODE=tesseract` (decision 0001). We rejected a paid host just for OCR: it costs money for no accuracy gain.

**Consequences:** The hosted app skips the CV/OCR step and the OCR-to-vision retry, so a misread photo is not re-checked by a second reader. Validation still flags inconsistent numbers.

**Revisit when:** Hosting with at least 1 full CPU is available.
