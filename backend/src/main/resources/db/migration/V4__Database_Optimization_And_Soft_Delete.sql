-- Flyway Migration V4__Database_Optimization_And_Soft_Delete.sql
-- RoadGuardian AI Backend - Performance Optimization and Soft Delete support

-- Add deleted flag to accidents and users for soft delete
ALTER TABLE accidents ADD COLUMN deleted BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN deleted BOOLEAN DEFAULT false;

-- Create composite indexes for performance optimization
-- 1. Accident search by status and severity (common dashboard filter)
CREATE INDEX idx_accidents_status_severity ON accidents(status, severity) WHERE deleted = false;

-- 2. User search by email and active status (login query)
CREATE INDEX idx_users_auth ON users(email, active) WHERE deleted = false;

-- 3. Live tracking historical analysis (ordered lookup)
CREATE INDEX idx_tracking_composite ON live_tracking(user_id, accident_id, last_updated DESC);

-- 4. Notification unread count for users
CREATE INDEX idx_notifications_unread_user ON notifications(user_id, is_read) WHERE is_read = false;

-- Add Audit Logging support
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by BIGINT REFERENCES users(id),
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
