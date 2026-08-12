-- ============================================================
-- SportZone – Multi-Sport Facility Booking Platform
-- PostgreSQL 16 Schema + Seed Data
-- ============================================================

-- Drop tables if they exist (for clean restarts)
DROP TABLE IF EXISTS blocked_slots CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- TABLE 1: users
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',         -- USER | ADMIN
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',     -- ACTIVE | INACTIVE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: sports
-- ============================================================
CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,               -- BADMINTON, CRICKET, FOOTBALL, SWIMMING, TABLE_TENNIS, PICKLEBALL
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE 3: facilities
-- ============================================================
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    sport_id INT NOT NULL REFERENCES sports(id),
    name VARCHAR(150) NOT NULL,                      -- e.g. "Badminton Court 1"
    description TEXT,
    capacity INT NOT NULL DEFAULT 1,                 -- number of people allowed simultaneously
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 4: bookings
-- ============================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    facility_id INT NOT NULL REFERENCES facilities(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',  -- CONFIRMED | CANCELLED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_duration CHECK (
        end_time > start_time AND
        EXTRACT(EPOCH FROM (end_time - start_time)) <= 10800  -- max 3 hours in seconds
    ),
    CONSTRAINT chk_booking_future CHECK (
        start_time > created_at
    )
);

-- Index for fast overlap detection queries
CREATE INDEX idx_bookings_facility_time ON bookings(facility_id, start_time, end_time)
    WHERE status = 'CONFIRMED';

CREATE INDEX idx_bookings_user ON bookings(user_id);

-- ============================================================
-- TABLE 5: blocked_slots
-- ============================================================
CREATE TABLE blocked_slots (
    id SERIAL PRIMARY KEY,
    facility_id INT NOT NULL REFERENCES facilities(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    reason VARCHAR(255),                              -- e.g. "Maintenance", "Tournament"
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blocked_facility_time ON blocked_slots(facility_id, start_time, end_time);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: password123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'admin@sportzone.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',  -- BCrypt of password123
     'Admin', 'SportZone', 'ADMIN');

-- Regular user (password: password123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('00000000-0000-0000-0000-000000000002',
     'user@sportzone.com',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
     'Demo', 'User', 'USER');

-- Sports
INSERT INTO sports (name, description) VALUES
    ('BADMINTON', 'Indoor badminton courts with professional flooring and lighting'),
    ('CRICKET', 'Professional cricket practice nets with bowling machines available'),
    ('FOOTBALL', 'Full-size football grounds with natural grass'),
    ('SWIMMING', 'Olympic-size swimming pool with individual lanes'),
    ('TABLE_TENNIS', 'Professional table tennis tables in a dedicated hall'),
    ('PICKLEBALL', 'Outdoor and indoor pickleball courts');

-- Badminton Courts (4)
INSERT INTO facilities (sport_id, name, description, capacity) VALUES
    (1, 'Badminton Court 1', 'Main court with spectator seating', 4),
    (1, 'Badminton Court 2', 'Standard court', 4),
    (1, 'Badminton Court 3', 'Standard court', 4),
    (1, 'Badminton Court 4', 'Training court', 4);

-- Cricket Nets (3)
INSERT INTO facilities (sport_id, name, description, capacity) VALUES
    (2, 'Cricket Net 1', 'Full-length net with synthetic turf', 6),
    (2, 'Cricket Net 2', 'Full-length net with natural surface', 6),
    (2, 'Cricket Net 3', 'Short-pitch practice net', 4);

-- Football Grounds (2)
INSERT INTO facilities (sport_id, name, description, capacity) VALUES
    (3, 'Football Ground A', 'Full-size ground with floodlights', 22),
    (3, 'Football Ground B', '7-a-side ground', 14);

-- Swimming Lanes (6)
INSERT INTO facilities (sport_id, name, description, capacity) VALUES
    (4, 'Swimming Lane 1', 'Competition lane', 1),
    (4, 'Swimming Lane 2', 'Competition lane', 1),
    (4, 'Swimming Lane 3', 'Standard lane', 1),
    (4, 'Swimming Lane 4', 'Standard lane', 1),
    (4, 'Swimming Lane 5', 'Training lane', 1),
    (4, 'Swimming Lane 6', 'Training lane', 1);

-- Table Tennis Tables (5)
INSERT INTO facilities (sport_id, name, description, capacity) VALUES
    (5, 'Table Tennis Table 1', 'Competition table', 2),
    (5, 'Table Tennis Table 2', 'Competition table', 2),
    (5, 'Table Tennis Table 3', 'Standard table', 2),
    (5, 'Table Tennis Table 4', 'Standard table', 2),
    (5, 'Table Tennis Table 5', 'Training table', 2);

-- Pickleball Courts (3)
INSERT INTO facilities (sport_id, name, description, capacity) VALUES
    (6, 'Pickleball Court 1', 'Indoor court with professional surface', 4),
    (6, 'Pickleball Court 2', 'Indoor court', 4),
    (6, 'Pickleball Court 3', 'Outdoor court', 4);
