-- ============================================================
-- UrbanSync Database Schema — Phase 0-8 Complete
-- Compatible with: PostgreSQL 16/17/18
-- Run on: urbansync_db
-- Secretary login after setup:
--   Email:    secretary@urbansync.com
--   Password: #UrbanSync@1234
-- ============================================================

-- STEP 1: Permissions
GRANT ALL PRIVILEGES ON DATABASE urbansync_db TO urbansync_user;
GRANT ALL ON SCHEMA public TO urbansync_user;

-- STEP 2: Drop all tables (safe order)
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

-- STEP 3: Create tables

CREATE TABLE wings (
    id          BIGSERIAL PRIMARY KEY,
    wing_name   VARCHAR(10) NOT NULL UNIQUE,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE credentials (
    id                BIGSERIAL PRIMARY KEY,
    login_identifier  VARCHAR(100) NOT NULL UNIQUE,
    password_hash     VARCHAR(255),
    role              VARCHAR(20)  NOT NULL,
    created_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE secretary_profiles (
    id             BIGSERIAL PRIMARY KEY,
    first_name     VARCHAR(50)  NOT NULL,
    last_name      VARCHAR(50)  NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    mobile_number  VARCHAR(15)  NOT NULL UNIQUE,
    flat_number    VARCHAR(20)  NOT NULL,
    bank_name      VARCHAR(100),
    account_number VARCHAR(20),
    ifsc_code      VARCHAR(20),
    credential_id  BIGINT       NOT NULL UNIQUE REFERENCES credentials(id),
    created_at     TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE caretaker_profiles (
    id                BIGSERIAL PRIMARY KEY,
    first_name        VARCHAR(50)  NOT NULL,
    last_name         VARCHAR(50)  NOT NULL,
    mobile_number     VARCHAR(15)  NOT NULL UNIQUE,
    age               INTEGER      NOT NULL,
    aadhaar_number    VARCHAR(12)  NOT NULL UNIQUE,
    permanent_address TEXT         NOT NULL,
    serial_number     INTEGER      NOT NULL UNIQUE,
    status            VARCHAR(20)  DEFAULT 'ACTIVE',
    leaving_reason    TEXT,
    left_at           TIMESTAMP,
    credential_id     BIGINT       UNIQUE REFERENCES credentials(id),
    created_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE resident_profiles (
    id                BIGSERIAL PRIMARY KEY,
    first_name        VARCHAR(50) NOT NULL,
    last_name         VARCHAR(50) NOT NULL,
    mobile_number     VARCHAR(15) NOT NULL,
    aadhaar_last_four VARCHAR(4)  NOT NULL,
    resident_type     VARCHAR(10) NOT NULL,
    flat_number       VARCHAR(20),
    landlord_id       BIGINT,
    status            VARCHAR(20) DEFAULT 'ACTIVE',
    credential_id     BIGINT      REFERENCES credentials(id),
    created_at        TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE registration_requests (
    id                     BIGSERIAL PRIMARY KEY,
    first_name             VARCHAR(50)  NOT NULL,
    last_name              VARCHAR(50)  NOT NULL,
    mobile_number          VARCHAR(15)  NOT NULL,
    aadhaar_last_four      VARCHAR(4)   NOT NULL,
    resident_type          VARCHAR(10)  NOT NULL,
    wing_name              VARCHAR(10),
    flat_number            VARCHAR(20)  NOT NULL,
    landlord_name          VARCHAR(100),
    landlord_flat_number   VARCHAR(20),
    landlord_mobile_number VARCHAR(15),
    status                 VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    rejection_reason       TEXT,
    created_at             TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE flats (
    id                BIGSERIAL PRIMARY KEY,
    flat_number       VARCHAR(20) NOT NULL UNIQUE,
    wing_id           BIGINT      NOT NULL REFERENCES wings(id),
    owner_id          BIGINT      REFERENCES resident_profiles(id),
    current_tenant_id BIGINT      REFERENCES resident_profiles(id),
    created_at        TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE property_posts (
    id                BIGSERIAL PRIMARY KEY,
    flat_id           BIGINT       REFERENCES flats(id),
    owner_name        VARCHAR(100) NOT NULL,
    contact_number    VARCHAR(15)  NOT NULL,
    listing_type      VARCHAR(10)  NOT NULL,
    furnishing_status VARCHAR(20)  NOT NULL,
    availability_date DATE,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE complaints (
    id                 BIGSERIAL PRIMARY KEY,
    raised_by_id       BIGINT       REFERENCES resident_profiles(id),
    subject            VARCHAR(255) NOT NULL,
    description        TEXT         NOT NULL,
    photo_url          TEXT,
    target_type        VARCHAR(20),
    target_resident_id BIGINT       REFERENCES resident_profiles(id),
    status             VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    resolved_at        TIMESTAMP,
    created_at         TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE caretaker_issues (
    id             BIGSERIAL PRIMARY KEY,
    assigned_to_id BIGINT       NOT NULL REFERENCES caretaker_profiles(id),
    assigned_by_id BIGINT       REFERENCES secretary_profiles(id),
    title          VARCHAR(255) NOT NULL,
    description    TEXT         NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    resolved_at    TIMESTAMP,
    created_at     TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE announcements (
    id            BIGSERIAL PRIMARY KEY,
    created_by_id BIGINT       REFERENCES secretary_profiles(id),
    type          VARCHAR(20)  NOT NULL,
    title         VARCHAR(255) NOT NULL,
    message       TEXT         NOT NULL,
    created_at    TIMESTAMP    DEFAULT NOW()
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
    id           BIGSERIAL PRIMARY KEY,
    flat_id      BIGINT        REFERENCES flats(id),
    resident_id  BIGINT        REFERENCES resident_profiles(id),
    base_amount  NUMERIC(10,2) NOT NULL,
    fine_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    bill_month   INTEGER       NOT NULL,
    bill_year    INTEGER       NOT NULL,
    due_date     DATE          NOT NULL,
    paid_at      TIMESTAMP,
    created_at   TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE society_funds (
    id           BIGSERIAL PRIMARY KEY,
    balance      NUMERIC(12,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE payment_transactions (
    id                  BIGSERIAL PRIMARY KEY,
    bill_id             BIGINT        REFERENCES maintenance_bills(id),
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount_paid         NUMERIC(10,2),
    status              VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMP     DEFAULT NOW()
);

-- STEP 4: Indexes
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

-- STEP 5: Seed Data

-- Wings A to E
INSERT INTO wings (wing_name, created_at) VALUES
('A', NOW()), ('B', NOW()), ('C', NOW()), ('D', NOW()), ('E', NOW());

-- Credentials
-- Secretary password: #UrbanSync@1234
INSERT INTO credentials (login_identifier, password_hash, role, created_at) VALUES
('secretary@urbansync.com', '$2b$10$c0M4En.MuQWsZzb4UBfvGuk5zVaKweu5I1fCJvrEPKWJgWykqt4yK', 'SECRETARY',  NOW()),
('9111111101', NULL, 'RESIDENT',  NOW()),
('9111111102', NULL, 'RESIDENT',  NOW()),
('9111111103', NULL, 'RESIDENT',  NOW()),
('9111111104', NULL, 'RESIDENT',  NOW()),
('9111111105', NULL, 'RESIDENT',  NOW()),
('9001234501', NULL, 'CARETAKER', NOW()),
('9001234502', NULL, 'CARETAKER', NOW());

-- Secretary profile
INSERT INTO secretary_profiles (
    first_name, last_name, email, mobile_number, flat_number,
    bank_name, account_number, ifsc_code, credential_id, created_at
) VALUES (
    'Ashutosh', 'Malode', 'secretary@urbansync.com', '9876543210', 'A-101',
    'SBI', '1234567890', 'SBIN0001234', 1, NOW()
);

-- Resident profiles
INSERT INTO resident_profiles (first_name, last_name, mobile_number, aadhaar_last_four, resident_type, flat_number, status, credential_id, created_at) VALUES
('Rahul',  'Sharma', '9111111101', '1234', 'OWNER',  'A-201', 'ACTIVE', 2, NOW()),
('Priya',  'Verma',  '9111111102', '5678', 'TENANT', 'B-301', 'ACTIVE', 3, NOW()),
('Amit',   'Patel',  '9111111103', '9012', 'OWNER',  'C-401', 'ACTIVE', 4, NOW()),
('Sneha',  'Joshi',  '9111111104', '3456', 'OWNER',  'D-501', 'ACTIVE', 5, NOW()),
('Vikram', 'Singh',  '9111111105', '7890', 'OWNER',  'E-601', 'ACTIVE', 6, NOW());

-- Caretaker profiles
INSERT INTO caretaker_profiles (first_name, last_name, mobile_number, age, aadhaar_number, permanent_address, serial_number, status, credential_id, created_at) VALUES
('Ramesh', 'Kumar', '9001234501', 35, '123456789001', 'Village Nagpur, Maharashtra', 1, 'ACTIVE', 7, NOW()),
('Suresh', 'Yadav', '9001234502', 40, '123456789002', 'Village Pune, Maharashtra',  2, 'ACTIVE', 8, NOW());

-- Flats
INSERT INTO flats (flat_number, wing_id, owner_id, current_tenant_id, created_at) VALUES
('A-201', 1, 1, NULL, NOW()),
('B-301', 2, 1, 2,    NOW()),
('C-401', 3, 3, NULL, NOW()),
('D-501', 4, 4, NULL, NOW()),
('E-601', 5, 5, NULL, NOW());

-- Property posts
INSERT INTO property_posts (flat_id, owner_name, contact_number, listing_type, furnishing_status, availability_date, is_active, created_at) VALUES
(1, 'Rahul Sharma', '9111111101', 'RENT', 'FULLY_FURNISHED', '2026-08-01', TRUE,  NOW()),
(2, 'Rahul Sharma', '9111111101', 'RENT', 'SEMI_FURNISHED',  '2026-08-15', TRUE,  NOW()),
(3, 'Amit Patel',   '9111111103', 'SALE', 'NON_FURNISHED',   '2026-09-01', TRUE,  NOW()),
(4, 'Sneha Joshi',  '9111111104', 'RENT', 'FULLY_FURNISHED', '2026-08-10', FALSE, NOW()),
(5, 'Vikram Singh', '9111111105', 'SALE', 'SEMI_FURNISHED',  '2026-10-01', TRUE,  NOW());

-- Complaints
INSERT INTO complaints (raised_by_id, subject, description, target_type, status, created_at) VALUES
(1, 'Water leakage in corridor',  'Water leakage near flat A-201 corridor',        'ALL',      'PENDING',  NOW()),
(2, 'Garbage not collected',      'Garbage not collected for 3 days',              'ALL',      'PENDING',  NOW()),
(3, 'Noise complaint',            'Loud music from neighbouring flat after 10pm',  'RESIDENT', 'RESOLVED', NOW()),
(4, 'Parking issue',              'Unauthorized vehicle parked in my slot',        'ALL',      'PENDING',  NOW()),
(5, 'Lift not working',           'Lift in Wing E not working since yesterday',    'ALL',      'RESOLVED', NOW()),
(1, 'Street light broken',        'Street light near gate is not working',         'ALL',      'PENDING',  NOW()),
(2, 'Dog menace',                 'Stray dogs near society gate causing trouble',  'ALL',      'PENDING',  NOW()),
(3, 'Leaking pipe in basement',   'Pipe in basement parking area leaking badly',   'ALL',      'PENDING',  NOW()),
(4, 'Broken gate hinge',          'Main gate hinge broken, gate does not close',   'ALL',      'RESOLVED', NOW()),
(5, 'No water supply in morning', 'No water supply between 6am to 9am daily',      'ALL',      'PENDING',  NOW());

-- Caretaker issues
INSERT INTO caretaker_issues (assigned_to_id, assigned_by_id, title, description, status, created_at) VALUES
(1, 1, 'Fix water tap in parking',    'Water tap near parking area leaking badly',       'PENDING',    NOW()),
(1, 1, 'Clean terrace area',          'Terrace needs cleaning before monsoon',            'PROCESSING', NOW()),
(2, 1, 'Replace lobby light bulbs',   'Multiple bulbs in lobby area fused',              'PENDING',    NOW()),
(2, 1, 'Repair main gate hinge',      'Main gate hinge broken and makes loud noise',     'RESOLVED',   NOW()),
(1, 1, 'Pest control in basement',    'Pest control required in basement parking',        'PENDING',    NOW()),
(2, 1, 'Fix elevator button panel',   'Button panel in elevator not working properly',   'PROCESSING', NOW()),
(1, 1, 'Clean drainage near Wing B',  'Drainage near Wing B is blocked and overflowing', 'PENDING',    NOW()),
(2, 1, 'Paint society boundary wall', 'Boundary wall paint is peeling off',              'PENDING',    NOW()),
(1, 1, 'Fix CCTV camera at gate',     'CCTV camera at main gate not working',            'RESOLVED',   NOW()),
(2, 1, 'Repair water pump motor',     'Water pump motor making noise needs repair',      'PROCESSING', NOW());

-- Registration requests
INSERT INTO registration_requests (first_name, last_name, mobile_number, aadhaar_last_four, resident_type, wing_name, flat_number, status, created_at) VALUES
('Karan',  'Mehta',  '9222222201', '1111', 'OWNER', 'A', 'A-202', 'PENDING',  NOW()),
('Deepa',  'Nair',   '9222222202', '2222', 'OWNER', 'B', 'B-302', 'PENDING',  NOW()),
('Rohit',  'Gupta',  '9222222203', '3333', 'OWNER', 'C', 'C-402', 'APPROVED', NOW()),
('Pooja',  'Iyer',   '9222222204', '4444', 'OWNER', 'D', 'D-502', 'REJECTED', NOW()),
('Manish', 'Tiwari', '9222222205', '5555', 'OWNER', 'E', 'E-602', 'APPROVED', NOW());

-- Society fund
INSERT INTO society_funds (balance, last_updated) VALUES (18000.00, NOW());

-- Maintenance settings
INSERT INTO global_maintenance_settings (
    maintenance_amount, due_fine_per_day, validity_days, last_updated_at
) VALUES (2000.00, 50.00, 10, NOW());

-- Maintenance bills
INSERT INTO maintenance_bills (flat_id, resident_id, base_amount, fine_amount, total_amount, status, bill_month, bill_year, due_date, created_at) VALUES
(1, 1, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW()),
(2, 2, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW()),
(3, 3, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW()),
(4, 4, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW()),
(5, 5, 2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW()),
(1, 1, 2000.00, 750.00, 2750.00, 'PENDING', 7, 2026, '2026-07-10', NOW()),
(2, 2, 2000.00, 750.00, 2750.00, 'PENDING', 7, 2026, '2026-07-10', NOW()),
(3, 3, 2000.00, 500.00, 2500.00, 'PENDING', 7, 2026, '2026-07-10', NOW()),
(4, 4, 2000.00, 0.00,   2000.00, 'PAID',    7, 2026, '2026-07-10', NOW()),
(5, 5, 2000.00, 0.00,   2000.00, 'PAID',    7, 2026, '2026-07-10', NOW());

-- Payment transactions
INSERT INTO payment_transactions (bill_id, razorpay_order_id, razorpay_payment_id, amount_paid, status, created_at) VALUES
(1,  'order_test_001', 'pay_test_001', 2000.00, 'SUCCESS', NOW()),
(2,  'order_test_002', 'pay_test_002', 2000.00, 'SUCCESS', NOW()),
(3,  'order_test_003', 'pay_test_003', 2000.00, 'SUCCESS', NOW()),
(4,  'order_test_004', 'pay_test_004', 2000.00, 'SUCCESS', NOW()),
(5,  'order_test_005', 'pay_test_005', 2000.00, 'SUCCESS', NOW()),
(9,  'order_test_006', 'pay_test_006', 2000.00, 'SUCCESS', NOW()),
(10, 'order_test_007', 'pay_test_007', 2000.00, 'SUCCESS', NOW());

-- STEP 6: Final permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO urbansync_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO urbansync_user;

-- ============================================================
-- VERIFY after running:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
-- Expected: 16 tables
--
-- Login: secretary@urbansync.com / #UrbanSync@1234
-- ============================================================
