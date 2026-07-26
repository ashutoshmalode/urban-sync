-- ============================================================
-- UrbanSync Complete Schema + Seed Data
-- Run this on urbansync_db after dropping all tables
-- Secretary login: secretary@urbansync.com / #UrbanSync@123
-- ============================================================

-- ============================================================
-- STEP 1: Permissions
-- ============================================================
GRANT ALL PRIVILEGES ON DATABASE urbansync_db TO urbansync_user;
GRANT ALL ON SCHEMA public TO urbansync_user;

-- ============================================================
-- STEP 2: Drop all tables
-- ============================================================
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS society_funds CASCADE;
DROP TABLE IF EXISTS maintenance_bills CASCADE;
DROP TABLE IF EXISTS global_maintenance_settings CASCADE;
DROP TABLE IF EXISTS caretaker_issues CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS property_posts CASCADE;
DROP TABLE IF EXISTS flats CASCADE;
DROP TABLE IF EXISTS permission_requests CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS registration_requests CASCADE;
DROP TABLE IF EXISTS resident_profiles CASCADE;
DROP TABLE IF EXISTS caretaker_profiles CASCADE;
DROP TABLE IF EXISTS secretary_profiles CASCADE;
DROP TABLE IF EXISTS credentials CASCADE;
DROP TABLE IF EXISTS wings CASCADE;

-- ============================================================
-- STEP 3: Create tables
-- ============================================================

CREATE TABLE wings (
    id          BIGSERIAL PRIMARY KEY,
    wing_name   VARCHAR(10)  NOT NULL UNIQUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE credentials (
    id                 BIGSERIAL PRIMARY KEY,
    login_identifier   VARCHAR(100) NOT NULL UNIQUE,
    password_hash      VARCHAR(255),
    role               VARCHAR(20)  NOT NULL,
    created_at         TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE secretary_profiles (
    id               BIGSERIAL PRIMARY KEY,
    first_name       VARCHAR(50)  NOT NULL,
    last_name        VARCHAR(50)  NOT NULL,
    email            VARCHAR(100) NOT NULL UNIQUE,
    mobile_number    VARCHAR(15)  NOT NULL UNIQUE,
    flat_number      VARCHAR(20)  NOT NULL,
    bank_name        VARCHAR(100),
    account_number   VARCHAR(20),
    ifsc_code        VARCHAR(20),
    credential_id    BIGINT       NOT NULL UNIQUE REFERENCES credentials(id),
    created_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE caretaker_profiles (
    id                 BIGSERIAL PRIMARY KEY,
    first_name         VARCHAR(50)  NOT NULL,
    last_name          VARCHAR(50)  NOT NULL,
    mobile_number      VARCHAR(15)  NOT NULL UNIQUE,
    age                INTEGER      NOT NULL,
    aadhaar_number     VARCHAR(12)  NOT NULL UNIQUE,
    permanent_address  TEXT         NOT NULL,
    serial_number      INTEGER      NOT NULL UNIQUE,
    status             VARCHAR(20)  DEFAULT 'ACTIVE',
    credential_id      BIGINT       UNIQUE REFERENCES credentials(id),
    created_at         TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE resident_profiles (
    id                BIGSERIAL PRIMARY KEY,
    first_name        VARCHAR(50)  NOT NULL,
    last_name         VARCHAR(50)  NOT NULL,
    mobile_number     VARCHAR(15)  NOT NULL,
    aadhaar_last_four VARCHAR(4)   NOT NULL,
    resident_type     VARCHAR(10)  NOT NULL,
    flat_number       VARCHAR(20),
    landlord_id       BIGINT,
    status            VARCHAR(20)  DEFAULT 'ACTIVE',
    credential_id     BIGINT       UNIQUE REFERENCES credentials(id),
    created_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE registration_requests (
    id                       BIGSERIAL PRIMARY KEY,
    first_name               VARCHAR(50)  NOT NULL,
    last_name                VARCHAR(50)  NOT NULL,
    mobile_number            VARCHAR(15)  NOT NULL,
    aadhaar_last_four        VARCHAR(4)   NOT NULL,
    resident_type            VARCHAR(10)  NOT NULL,
    wing_name                VARCHAR(10),
    flat_number              VARCHAR(20)  NOT NULL,
    landlord_name            VARCHAR(100),
    landlord_flat_number     VARCHAR(20),
    landlord_mobile_number   VARCHAR(15),
    status                   VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    rejection_reason         TEXT,
    created_at               TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE flats (
    id                  BIGSERIAL PRIMARY KEY,
    flat_number         VARCHAR(20)  NOT NULL UNIQUE,
    wing_id             BIGINT       NOT NULL REFERENCES wings(id),
    owner_id            BIGINT       REFERENCES resident_profiles(id),
    current_tenant_id   BIGINT       REFERENCES resident_profiles(id),
    created_at          TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE property_posts (
    id                  BIGSERIAL PRIMARY KEY,
    flat_id             BIGINT       REFERENCES flats(id),
    owner_name          VARCHAR(100) NOT NULL,
    contact_number      VARCHAR(15)  NOT NULL,
    listing_type        VARCHAR(10)  NOT NULL,
    furnishing_status   VARCHAR(20)  NOT NULL,
    availability_date   DATE,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE complaints (
    id                  BIGSERIAL PRIMARY KEY,
    raised_by_id        BIGINT       REFERENCES resident_profiles(id),
    subject             VARCHAR(255) NOT NULL,
    description         TEXT         NOT NULL,
    photo_url           TEXT,
    target_type         VARCHAR(20),
    target_resident_id  BIGINT       REFERENCES resident_profiles(id),
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    resolved_at         TIMESTAMP,
    created_at          TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE caretaker_issues (
    id               BIGSERIAL PRIMARY KEY,
    assigned_to_id   BIGINT       NOT NULL REFERENCES caretaker_profiles(id),
    assigned_by_id   BIGINT       REFERENCES secretary_profiles(id),
    title            VARCHAR(255) NOT NULL,
    description      TEXT         NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    resolved_at      TIMESTAMP,
    created_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE announcements (
    id              BIGSERIAL PRIMARY KEY,
    created_by_id   BIGINT       REFERENCES secretary_profiles(id),
    type            VARCHAR(20)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    created_at      TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE permission_requests (
    id               BIGSERIAL PRIMARY KEY,
    raised_by_id     BIGINT       REFERENCES resident_profiles(id),
    subject          VARCHAR(255) NOT NULL,
    description      TEXT         NOT NULL,
    request_date     DATE,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE global_maintenance_settings (
    id                           BIGSERIAL PRIMARY KEY,
    maintenance_amount           NUMERIC(10,2) NOT NULL DEFAULT 0,
    due_fine_per_day             NUMERIC(10,2) NOT NULL DEFAULT 50,
    validity_days                INTEGER       NOT NULL DEFAULT 10,
    last_updated_at              TIMESTAMP,
    last_updated_by_secretary_at TIMESTAMP
);

CREATE TABLE maintenance_bills (
    id              BIGSERIAL PRIMARY KEY,
    flat_id         BIGINT        REFERENCES flats(id),
    resident_id     BIGINT        REFERENCES resident_profiles(id),
    base_amount     NUMERIC(10,2) NOT NULL,
    fine_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(10,2) NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    bill_month      INTEGER       NOT NULL,
    bill_year       INTEGER       NOT NULL,
    due_date        DATE          NOT NULL,
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE society_funds (
    id            BIGSERIAL PRIMARY KEY,
    balance       NUMERIC(12,2) NOT NULL DEFAULT 0,
    last_updated  TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE payment_transactions (
    id                   BIGSERIAL PRIMARY KEY,
    bill_id              BIGINT        REFERENCES maintenance_bills(id),
    razorpay_order_id    VARCHAR(100),
    razorpay_payment_id  VARCHAR(100),
    amount_paid          NUMERIC(10,2),
    status               VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at           TIMESTAMP     DEFAULT NOW()
);

-- ============================================================
-- STEP 4: Indexes
-- ============================================================
CREATE INDEX idx_credentials_login    ON credentials(login_identifier);
CREATE INDEX idx_resident_mobile      ON resident_profiles(mobile_number);
CREATE INDEX idx_resident_flat        ON resident_profiles(flat_number);
CREATE INDEX idx_resident_status      ON resident_profiles(status);
CREATE INDEX idx_caretaker_mobile     ON caretaker_profiles(mobile_number);
CREATE INDEX idx_caretaker_serial     ON caretaker_profiles(serial_number);
CREATE INDEX idx_registration_status  ON registration_requests(status);
CREATE INDEX idx_registration_mobile  ON registration_requests(mobile_number);
CREATE INDEX idx_flats_flat_number    ON flats(flat_number);
CREATE INDEX idx_maintenance_status   ON maintenance_bills(status);
CREATE INDEX idx_maintenance_resident ON maintenance_bills(resident_id);
CREATE INDEX idx_payment_bill         ON payment_transactions(bill_id);
CREATE INDEX idx_complaints_status    ON complaints(status);
CREATE INDEX idx_permission_status    ON permission_requests(status);

-- ============================================================
-- STEP 5: Seed Data
-- ============================================================

-- Wings (A to E)
INSERT INTO wings (wing_name, created_at) VALUES
('A', NOW()), ('B', NOW()), ('C', NOW()), ('D', NOW()), ('E', NOW());

-- Credentials
-- Secretary: secretary@urbansync.com / #UrbanSync@123
-- BCrypt hash of #UrbanSync@123
INSERT INTO credentials (login_identifier, password_hash, role, created_at) VALUES
('secretary@urbansync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SECRETARY', NOW()),
-- Caretakers (no password - OTP login)
('9001234501', NULL, 'CARETAKER', NOW()),
('9001234502', NULL, 'CARETAKER', NOW()),
-- Residents (no password - OTP login)
('9111111101', NULL, 'RESIDENT', NOW()),
('9111111102', NULL, 'RESIDENT', NOW()),
('9111111103', NULL, 'RESIDENT', NOW()),
('9111111104', NULL, 'RESIDENT', NOW()),
('9111111105', NULL, 'RESIDENT', NOW());

-- Secretary Profile
INSERT INTO secretary_profiles (first_name, last_name, email, mobile_number, flat_number, bank_name, account_number, ifsc_code, credential_id, created_at) VALUES
('Ashutosh', 'Malode', 'secretary@urbansync.com', '9876543210', 'A-101', 'SBI', '1234567890', 'SBIN0001234', 1, NOW());

-- Caretaker Profiles
INSERT INTO caretaker_profiles (first_name, last_name, mobile_number, age, aadhaar_number, permanent_address, serial_number, status, credential_id, created_at) VALUES
('Ramesh', 'Kumar', '9001234501', 35, '123456789001', 'Village Nagpur, Maharashtra', 1, 'ACTIVE', 2, NOW()),
('Suresh', 'Yadav', '9001234502', 40, '123456789002', 'Village Pune, Maharashtra', 2, 'ACTIVE', 3, NOW());

-- Resident Profiles
INSERT INTO resident_profiles (first_name, last_name, mobile_number, aadhaar_last_four, resident_type, flat_number, landlord_id, status, credential_id, created_at) VALUES
('Rahul',   'Sharma',  '9111111101', '1234', 'OWNER',  'A-201', NULL, 'ACTIVE', 4, NOW()),
('Priya',   'Verma',   '9111111102', '5678', 'TENANT', 'B-301', 1,    'ACTIVE', 5, NOW()),
('Amit',    'Patel',   '9111111103', '9012', 'OWNER',  'C-401', NULL, 'ACTIVE', 6, NOW()),
('Sneha',   'Joshi',   '9111111104', '3456', 'OWNER',  'D-501', NULL, 'ACTIVE', 7, NOW()),
('Vikram',  'Singh',   '9111111105', '7890', 'OWNER',  'E-601', NULL, 'ACTIVE', 8, NOW());

-- Registration Requests (mix of PENDING, APPROVED, REJECTED)
INSERT INTO registration_requests (first_name, last_name, mobile_number, aadhaar_last_four, resident_type, wing_name, flat_number, landlord_name, landlord_flat_number, landlord_mobile_number, status, rejection_reason, created_at) VALUES
('Karan',   'Mehta',   '9222222201', '1111', 'OWNER',  'A', 'A-202', NULL,          NULL,    NULL,          'PENDING',  NULL,                          NOW()),
('Deepa',   'Nair',    '9222222202', '2222', 'TENANT', 'B', 'B-302', 'Rahul Sharma','A-201', '9111111101',  'PENDING',  NULL,                          NOW()),
('Rohit',   'Gupta',   '9222222203', '3333', 'OWNER',  'C', 'C-402', NULL,          NULL,    NULL,          'APPROVED', NULL,                          NOW()),
('Pooja',   'Iyer',    '9222222204', '4444', 'OWNER',  'D', 'D-502', NULL,          NULL,    NULL,          'REJECTED', 'Flat already occupied',       NOW()),
('Manish',  'Tiwari',  '9222222205', '5555', 'OWNER',  'E', 'E-602', NULL,          NULL,    NULL,          'PENDING',  NULL,                          NOW());

-- Flats
INSERT INTO flats (flat_number, wing_id, owner_id, current_tenant_id, created_at) VALUES
('A-201', 1, 1, NULL, NOW()),
('B-301', 2, 1, 2,    NOW()),
('C-401', 3, 3, NULL, NOW()),
('D-501', 4, 4, NULL, NOW()),
('E-601', 5, 5, NULL, NOW());

-- Property Posts
INSERT INTO property_posts (flat_id, owner_name, contact_number, listing_type, furnishing_status, availability_date, is_active, created_at) VALUES
(1, 'Rahul Sharma', '9111111101', 'RENT', 'FULLY_FURNISHED',  '2026-08-01', TRUE,  NOW()),
(3, 'Amit Patel',   '9111111103', 'SALE', 'SEMI_FURNISHED',   '2026-09-01', TRUE,  NOW()),
(4, 'Sneha Joshi',  '9111111104', 'RENT', 'NON_FURNISHED',    '2026-08-15', TRUE,  NOW()),
(5, 'Vikram Singh', '9111111105', 'SALE', 'FULLY_FURNISHED',  '2026-10-01', FALSE, NOW());

-- Complaints
INSERT INTO complaints (raised_by_id, subject, description, photo_url, target_type, target_resident_id, status, resolved_at, created_at) VALUES
(1, 'Water leakage in corridor', 'There is water leakage near flat A-201 corridor', NULL,  'RESIDENT', NULL, 'PENDING',  NULL, NOW()),
(2, 'Garbage not collected',     'Garbage has not been collected for 3 days',         NULL,  'ALL',      NULL, 'PENDING',  NULL, NOW()),
(3, 'Noise complaint',           'Loud music from neighbouring flat after 10pm',       NULL,  'RESIDENT', 1,   'RESOLVED', NOW(), NOW()),
(4, 'Parking issue',             'Unauthorized vehicle parked in my slot',             NULL,  'ALL',      NULL, 'PENDING',  NULL, NOW()),
(5, 'Lift not working',          'Lift in Wing E is not functioning since yesterday',  NULL,  'ALL',      NULL, 'RESOLVED', NOW(), NOW());

-- Caretaker Issues
INSERT INTO caretaker_issues (assigned_to_id, assigned_by_id, title, description, status, resolved_at, created_at) VALUES
(1, 1, 'Fix water tap in parking',     'Water tap near parking area is leaking badly',         'PENDING',    NULL, NOW()),
(1, 1, 'Clean terrace area',           'Terrace needs thorough cleaning before monsoon',        'PROCESSING', NULL, NOW()),
(2, 1, 'Replace lobby light bulbs',    'Multiple bulbs in lobby area are fused',               'PENDING',    NULL, NOW()),
(2, 1, 'Repair main gate hinge',       'Main gate hinge is broken and makes loud noise',       'RESOLVED',   NOW(), NOW()),
(1, 1, 'Pest control in basement',     'Pest control required in basement parking area',        'PENDING',    NULL, NOW());

-- Announcements
INSERT INTO announcements (created_by_id, type, title, message, created_at) VALUES
(1, 'ALERT',        'Water Supply Cut',          'Water supply will be cut from 10AM to 2PM on 26 July for maintenance work.',          NOW()),
(1, 'NOTIFICATION', 'Lift Maintenance',          'Lift 1 in Wing A will be under maintenance on 27 July. Please use Lift 2.',           NOW()),
(1, 'ALERT',        'Power Cut Notice',          'Electricity will be cut from 6PM to 8PM on 28 July due to transformer maintenance.',  NOW()),
(1, 'NOTIFICATION', 'Society Meeting',           'Monthly society meeting will be held on 30 July at 7PM in the community hall.',       NOW()),
(1, 'NOTIFICATION', 'New Watchman Introduced',  'A new security watchman Mr. Ganesh will join duty from 1 August.',                    NOW());

-- Permission Requests
INSERT INTO permission_requests (raised_by_id, subject, description, request_date, status, rejection_reason, created_at) VALUES
(1, 'Guest Entry',    'My parents are visiting from 25-28 July. Request permission for their stay.',    '2026-07-25', 'APPROVED', NULL,                         NOW()),
(2, 'Delivery Entry', 'Expecting furniture delivery on 26 July between 11AM to 1PM.',                  '2026-07-26', 'PENDING',  NULL,                         NOW()),
(3, 'Vehicle Entry',  'My relative will park their car in visitor parking for 2 days.',                '2026-07-27', 'REJECTED', 'Visitor parking is full',    NOW()),
(4, 'Maid Entry',     'New maid will start from 28 July. Request permanent entry permission.',          '2026-07-28', 'PENDING',  NULL,                         NOW()),
(5, 'Guest Entry',    'College friends visiting for a get-together on 29 July evening.',               '2026-07-29', 'APPROVED', NULL,                         NOW());

-- Global Maintenance Settings
INSERT INTO global_maintenance_settings (maintenance_amount, due_fine_per_day, validity_days, last_updated_at) VALUES
(2000.00, 50.00, 10, NOW());

-- Maintenance Bills
INSERT INTO maintenance_bills (flat_id, resident_id, base_amount, fine_amount, total_amount, status, bill_month, bill_year, due_date, paid_at, created_at) VALUES
(1, 1, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(2, 2, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(3, 3, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(4, 4, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(5, 5, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(1, 1, 2000.00, 750.00, 2750.00, 'PENDING', 7, 2026, '2026-07-10', NULL,  NOW()),
(2, 2, 2000.00, 750.00, 2750.00, 'PENDING', 7, 2026, '2026-07-10', NULL,  NOW()),
(3, 3, 2000.00, 500.00, 2500.00, 'PENDING', 7, 2026, '2026-07-10', NULL,  NOW()),
(4, 4, 2000.00, 0.00,   2000.00, 'PAID',    7, 2026, '2026-07-10', NOW(), NOW()),
(5, 5, 2000.00, 0.00,   2000.00, 'PAID',    7, 2026, '2026-07-10', NOW(), NOW());

-- Society Fund
INSERT INTO society_funds (balance, last_updated) VALUES (18000.00, NOW());

-- Payment Transactions
INSERT INTO payment_transactions (bill_id, razorpay_order_id, razorpay_payment_id, amount_paid, status, created_at) VALUES
(1,  'order_test_001', 'pay_test_001', 2000.00, 'SUCCESS', NOW()),
(2,  'order_test_002', 'pay_test_002', 2000.00, 'SUCCESS', NOW()),
(3,  'order_test_003', 'pay_test_003', 2000.00, 'SUCCESS', NOW()),
(4,  'order_test_004', 'pay_test_004', 2000.00, 'SUCCESS', NOW()),
(5,  'order_test_005', 'pay_test_005', 2000.00, 'SUCCESS', NOW()),
(9,  'order_test_006', 'pay_test_006', 2000.00, 'SUCCESS', NOW()),
(10, 'order_test_007', 'pay_test_007', 2000.00, 'SUCCESS', NOW());

-- Grant final permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO urbansync_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO urbansync_user;

-- ============================================================
-- Verify
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
-- ============================================================
