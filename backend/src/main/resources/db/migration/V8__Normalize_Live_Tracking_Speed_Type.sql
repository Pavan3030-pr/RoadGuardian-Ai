-- Match the LiveTracking.speed Java Double mapping.

ALTER TABLE live_tracking ALTER COLUMN speed TYPE DOUBLE PRECISION USING speed::double precision;
