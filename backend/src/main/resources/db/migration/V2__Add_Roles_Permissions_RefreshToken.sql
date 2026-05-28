-- Flyway Migration V2__Add_Roles_Permissions_RefreshToken.sql
-- RoadGuardian AI Backend - Add Roles, Permissions, and RefreshToken entities

-- Create Roles Table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_role_name ON roles(name);

-- Create Permissions Table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permission_name ON permissions(name);

-- Create User-Permission Junction Table
CREATE TABLE user_permissions (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
);

-- Create RefreshTokens Table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_expires ON refresh_tokens(expires_at);

-- Add role_id column to users table
ALTER TABLE users ADD COLUMN role_id BIGINT;

-- Create index on role_id
CREATE INDEX idx_user_role_id ON users(role_id);

-- Insert default roles
INSERT INTO roles (name, description, created_at, updated_at) VALUES
('ADMIN', 'System administrator with full access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USER', 'Regular user who can report accidents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('POLICE', 'Police officer for emergency response', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSPITAL', 'Hospital staff for medical response', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMBULANCE', 'Ambulance driver for emergency response', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default permissions
INSERT INTO permissions (name, description, created_at, updated_at) VALUES
('CREATE_ACCIDENT', 'Can create accident reports', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EDIT_ACCIDENT', 'Can edit accident details', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DELETE_ACCIDENT', 'Can delete accident reports', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VIEW_ACCIDENT', 'Can view accident details', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ASSIGN_RESOURCES', 'Can assign emergency resources', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VIEW_ANALYTICS', 'Can view analytics dashboard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_USERS', 'Can manage system users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ESCALATE_INCIDENT', 'Can escalate incidents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VIEW_LIVE_TRACKING', 'Can view live tracking', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add new columns to accidents table
ALTER TABLE accidents ADD COLUMN weather_condition VARCHAR(50);
ALTER TABLE accidents ADD COLUMN traffic_density VARCHAR(50);
ALTER TABLE accidents ADD COLUMN road_type VARCHAR(50);

-- Add status column updates to live_tracking
ALTER TABLE live_tracking ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE live_tracking RENAME COLUMN timestamp TO last_updated;

-- Add email_verified column to users
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;

-- Add profile_image_url to users
ALTER TABLE users ADD COLUMN profile_image_url TEXT;

-- Add last_login_at to users
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;

-- Drop old role column from users (after role_id is set)
ALTER TABLE users DROP COLUMN role;

-- Add foreign key constraint for role_id
ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id);
