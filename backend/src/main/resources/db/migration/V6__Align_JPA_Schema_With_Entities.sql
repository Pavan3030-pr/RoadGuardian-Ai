-- Align the database schema with the current JPA entity model.

ALTER TABLE accidents ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_id BIGINT;

ALTER TABLE emergency_responses RENAME COLUMN type TO response_type;
ALTER TABLE emergency_responses RENAME COLUMN assigned_to_id TO responder_id;
ALTER TABLE emergency_responses RENAME COLUMN remarks TO notes;
ALTER TABLE emergency_responses ADD COLUMN IF NOT EXISTS eta_minutes INTEGER;
ALTER TABLE emergency_responses ADD COLUMN IF NOT EXISTS current_latitude DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE emergency_responses ADD COLUMN IF NOT EXISTS current_longitude DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE emergency_responses ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMP;
ALTER TABLE emergency_responses ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE emergency_responses ADD COLUMN IF NOT EXISTS vehicle_registration VARCHAR(50);

ALTER TABLE live_tracking RENAME COLUMN heading TO direction;
ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_emergency_responses_responder_id ON emergency_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_live_tracking_updated_at ON live_tracking(last_updated);
