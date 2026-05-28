-- Flyway migration: convert latitude/longitude to NUMERIC for Postgres
BEGIN;

ALTER TABLE accidents ALTER COLUMN latitude TYPE NUMERIC USING latitude::numeric;
ALTER TABLE accidents ALTER COLUMN longitude TYPE NUMERIC USING longitude::numeric;

COMMIT;