-- Add severity column to ai_recommendations (was missing from initial schema)
ALTER TABLE ai_recommendations ADD COLUMN IF NOT EXISTS severity VARCHAR(50);
