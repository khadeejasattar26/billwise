-- Urdu explanation alongside the English one (decision 0006).
-- New databases get this column from schema.sql; run this once on databases created earlier:
--   docker compose exec -T db psql -U billwise -d billwise < backend/migrations/001_add_explanation_ur.sql
ALTER TABLE bills ADD COLUMN IF NOT EXISTS explanation_ur TEXT NOT NULL DEFAULT '';
