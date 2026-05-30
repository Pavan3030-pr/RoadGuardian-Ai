-- Match entity coordinate types where the JPA model expects DOUBLE PRECISION.

ALTER TABLE live_tracking ALTER COLUMN latitude TYPE DOUBLE PRECISION USING latitude::double precision;
ALTER TABLE live_tracking ALTER COLUMN longitude TYPE DOUBLE PRECISION USING longitude::double precision;
ALTER TABLE users ALTER COLUMN latitude TYPE DOUBLE PRECISION USING latitude::double precision;
ALTER TABLE users ALTER COLUMN longitude TYPE DOUBLE PRECISION USING longitude::double precision;
