CREATE TABLE IF NOT EXISTS bills (
  id               SERIAL PRIMARY KEY,
  account_no       TEXT        NOT NULL,
  billing_month    DATE        NOT NULL,
  units            INTEGER     NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL,
  due_date         DATE        NOT NULL,
  explanation      TEXT        NOT NULL,
  explanation_ur   TEXT        NOT NULL DEFAULT '',
  warnings         TEXT[]      NOT NULL DEFAULT '{}',
  extraction_mode  TEXT        NOT NULL CHECK (extraction_mode IN ('ocr', 'vision')),
  ocr_text         TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One bill per account per month; re-uploading the same bill updates it.
  UNIQUE (account_no, billing_month)
);
