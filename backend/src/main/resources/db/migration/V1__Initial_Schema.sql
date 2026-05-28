-- Flyway Migration V1__Initial_Schema.sql
-- RoadGuardian AI Backend - Initial Database Schema

-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    vehicle_number VARCHAR(50),
    ambulance_id VARCHAR(50),
    police_id VARCHAR(50),
    hospital_id VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_phone ON users(phone);
CREATE INDEX idx_role ON users(role);

-- Accidents Table
CREATE TABLE accidents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    risk_score INTEGER NOT NULL,
    casualties INTEGER,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    reported_by_id BIGINT NOT NULL REFERENCES users(id),
    ambulance_assigned_id BIGINT REFERENCES users(id),
    police_assigned_id BIGINT REFERENCES users(id),
    hospital_assigned_id BIGINT REFERENCES users(id),
    response_time_ms BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_severity ON accidents(severity);
CREATE INDEX idx_status ON accidents(status);
CREATE INDEX idx_created_at ON accidents(created_at);
CREATE INDEX idx_location ON accidents(latitude, longitude);

-- Emergency Responses Table
CREATE TABLE emergency_responses (
    id BIGSERIAL PRIMARY KEY,
    accident_id BIGINT NOT NULL REFERENCES accidents(id),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    assigned_to_id BIGINT REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_emergency_accident ON emergency_responses(accident_id);
CREATE INDEX idx_emergency_status ON emergency_responses(status);

-- Live Tracking Table
CREATE TABLE live_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    accident_id BIGINT NOT NULL REFERENCES accidents(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(10, 2) NOT NULL,
    heading VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_tracking_user ON live_tracking(user_id);
CREATE INDEX idx_tracking_accident ON live_tracking(accident_id);

-- Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    accident_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_read ON notifications(is_read);

-- Analytics Events Table
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data TEXT,
    user_id BIGINT REFERENCES users(id),
    accident_id BIGINT REFERENCES accidents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- AI Recommendations Table
CREATE TABLE ai_recommendations (
    id BIGSERIAL PRIMARY KEY,
    accident_id BIGINT NOT NULL UNIQUE REFERENCES accidents(id),
    ambulance_needed VARCHAR(255),
    hospital_required VARCHAR(255),
    police_alert_level VARCHAR(50),
    roadblock_required VARCHAR(50),
    weather_condition VARCHAR(50),
    traffic_density VARCHAR(50),
    confidence_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_ai_accident ON ai_recommendations(accident_id);
