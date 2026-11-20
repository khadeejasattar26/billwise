CREATE TABLE IF NOT EXISTS bills (
  id               SERIAL PRIMARY KEY,
  -- the only id ever shown to users: random, so links can't be guessed
  public_id        UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  account_no       TEXT        NOT NULL,
  billing_month    DATE        NOT NULL,
  units            INTEGER     NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL,
  due_date         DATE        NOT NULL,
  explanation      TEXT        NOT NULL,
  explanation_ur   TEXT        NOT NULL DEFAULT '',
  -- disco, category, charges, printed bill history and computed reasons
  details          JSONB       NOT NULL DEFAULT '{}',
  warnings         TEXT[]      NOT NULL DEFAULT '{}',
  extraction_mode  TEXT        NOT NULL CHECK (extraction_mode IN ('ocr', 'vision')),
  -- kept empty: OCR text can contain the consumer's name and address
  ocr_text         TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One bill per account per month; re-uploading the same bill updates it.
  UNIQUE (account_no, billing_month)
);
