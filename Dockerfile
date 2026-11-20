# One container: the FastAPI backend (+ the built React site, so it also works on its own URL).
# Deployed on Render's free plan (see render.yaml). Secrets come from the host's environment:
#   OPENAI_API_KEY, OPENAI_MODEL, DATABASE_URL, FRONTEND_ORIGIN
# OCR_MODE=off: on 0.1 CPU, OpenCV + Tesseract took 1-6 minutes per photo (decision 0009);
# Tesseract stays installed so OCR_MODE=tesseract works on bigger machines.

# ---- 1. build the website -------------------------------------------------------------------
FROM node:22-slim AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Empty API URL = same origin: the backend below serves both the site and the API.
ENV VITE_API_URL=""
RUN npm run build

# ---- 2. backend -----------------------------------------------------------------------------
FROM python:3.12-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng tesseract-ocr-urd libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 user
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/app ./app
COPY backend/schema.sql ./schema.sql
COPY backend/migrations ./migrations
COPY --from=web /web/dist /app/frontend_dist

ENV PYTHONUNBUFFERED=1 \
    FRONTEND_DIST=/app/frontend_dist \
    AUTO_MIGRATE=1 \
    LLM_PROVIDER=openai \
    RATE_LIMITS=on \
    OCR_MODE=off \
    PORT=10000
USER user
EXPOSE 10000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips='*'"]
