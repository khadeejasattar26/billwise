-- Charges, printed bill history and computed reasons (decision 0007).
-- New databases get this column from schema.sql; run this once on databases created earlier:
--   docker compose exec -T db psql -U billwise -d billwise < backend/migrations/002_add_details.sql
ALTER TABLE bills ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}';
