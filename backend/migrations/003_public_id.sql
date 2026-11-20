-- Random, unguessable bill IDs for public links (decision 0008). Sequential ids let anyone
-- read other people's bills by trying the next number.
--   docker compose exec -T db psql -U billwise -d billwise < backend/migrations/003_public_id.sql
ALTER TABLE bills ADD COLUMN IF NOT EXISTS public_id UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS bills_public_id ON bills (public_id);
-- OCR text can contain the consumer's name and address; it is no longer stored.
UPDATE bills SET ocr_text = '' WHERE ocr_text <> '';
