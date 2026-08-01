-- ============================================================
-- UrbanSync Database Schema — Phase 0-8 Complete
-- Compatible with: PostgreSQL 16/17/18
-- Run on: urbansync_db
-- Secretary login: secretary@urbansync.com / #UrbanSync@1234
-- ============================================================

-- STEP 1: Permissions
GRANT ALL PRIVILEGES ON DATABASE urbansync_db TO urbansync_user;
GRANT ALL ON SCHEMA public TO urbansync_user;

-- STEP 2: Drop all tables
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

-- ============================================================
-- STEP 5: Seed Data
-- ============================================================

-- Wings
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
('9111111106', NULL, 'RESIDENT',  NOW()),
('9111111107', NULL, 'RESIDENT',  NOW()),
('9111111108', NULL, 'RESIDENT',  NOW()),
('9111111109', NULL, 'RESIDENT',  NOW()),
('9111111110', NULL, 'RESIDENT',  NOW()),
('9001234501', NULL, 'CARETAKER', NOW()),
('9001234502', NULL, 'CARETAKER', NOW()),
('9001234503', NULL, 'CARETAKER', NOW());

-- Secretary
INSERT INTO secretary_profiles (first_name, last_name, email, mobile_number, flat_number, bank_name, account_number, ifsc_code, credential_id, created_at) VALUES
('Ashutosh', 'Malode', 'secretary@urbansync.com', '9876543210', 'A-101', 'SBI', '1234567890', 'SBIN0001234', 1, NOW());

-- Caretakers (3 active)
INSERT INTO caretaker_profiles (first_name, last_name, mobile_number, age, aadhaar_number, permanent_address, serial_number, status, credential_id, created_at) VALUES
('Ramesh', 'Kumar',  '9001234501', 35, '123456789001', 'Village Nagpur, Maharashtra',  1, 'ACTIVE', 12, NOW()),
('Suresh', 'Yadav',  '9001234502', 40, '123456789002', 'Village Pune, Maharashtra',    2, 'ACTIVE', 13, NOW()),
('Ganesh', 'Pawar',  '9001234503', 28, '123456789003', 'Village Nashik, Maharashtra',  3, 'ACTIVE', 14, NOW());

-- Residents (10 residents — mix of owners and tenants)
INSERT INTO resident_profiles (first_name, last_name, mobile_number, aadhaar_last_four, resident_type, flat_number, status, credential_id, created_at) VALUES
('Rahul',   'Sharma',  '9111111101', '1234', 'OWNER',  'A-201', 'ACTIVE', 2,  NOW()),
('Priya',   'Verma',   '9111111102', '5678', 'TENANT', 'B-301', 'ACTIVE', 3,  NOW()),
('Amit',    'Patel',   '9111111103', '9012', 'OWNER',  'C-401', 'ACTIVE', 4,  NOW()),
('Sneha',   'Joshi',   '9111111104', '3456', 'OWNER',  'D-501', 'ACTIVE', 5,  NOW()),
('Vikram',  'Singh',   '9111111105', '7890', 'OWNER',  'E-601', 'ACTIVE', 6,  NOW()),
('Ananya',  'Gupta',   '9111111106', '2345', 'OWNER',  'A-202', 'ACTIVE', 7,  NOW()),
('Ravi',    'Patil',   '9111111107', '6789', 'OWNER',  'B-302', 'ACTIVE', 8,  NOW()),
('Meena',   'Nair',    '9111111108', '0123', 'TENANT', 'C-402', 'ACTIVE', 9,  NOW()),
('Suresh',  'Iyer',    '9111111109', '4567', 'OWNER',  'D-502', 'ACTIVE', 10, NOW()),
('Deepak',  'Tiwari',  '9111111110', '8901', 'OWNER',  'E-602', 'ACTIVE', 11, NOW());

-- Flats (10 flats)
INSERT INTO flats (flat_number, wing_id, owner_id, current_tenant_id, created_at) VALUES
('A-201', 1, 1,  NULL, NOW()),
('B-301', 2, 1,  2,    NOW()),
('C-401', 3, 3,  NULL, NOW()),
('D-501', 4, 4,  NULL, NOW()),
('E-601', 5, 5,  NULL, NOW()),
('A-202', 1, 6,  NULL, NOW()),
('B-302', 2, 7,  NULL, NOW()),
('C-402', 3, 3,  8,    NOW()),
('D-502', 4, 9,  NULL, NOW()),
('E-602', 5, 10, NULL, NOW());

-- Property posts (10 posts — mix of active and rented)
INSERT INTO property_posts (flat_id, owner_name, contact_number, listing_type, furnishing_status, availability_date, is_active, created_at) VALUES
(1,  'Rahul Sharma',  '9111111101', 'RENT', 'FULLY_FURNISHED',  '2026-08-01', TRUE,  NOW()),
(2,  'Rahul Sharma',  '9111111101', 'RENT', 'SEMI_FURNISHED',   '2026-08-15', TRUE,  NOW()),
(3,  'Amit Patel',    '9111111103', 'SALE', 'NON_FURNISHED',    '2026-09-01', TRUE,  NOW()),
(4,  'Sneha Joshi',   '9111111104', 'RENT', 'FULLY_FURNISHED',  '2026-08-10', FALSE, NOW()),
(5,  'Vikram Singh',  '9111111105', 'SALE', 'SEMI_FURNISHED',   '2026-10-01', TRUE,  NOW()),
(6,  'Ananya Gupta',  '9111111106', 'RENT', 'FULLY_FURNISHED',  '2026-08-20', TRUE,  NOW()),
(7,  'Ravi Patil',    '9111111107', 'RENT', 'NON_FURNISHED',    '2026-09-15', TRUE,  NOW()),
(8,  'Amit Patel',    '9111111103', 'RENT', 'SEMI_FURNISHED',   '2026-08-05', FALSE, NOW()),
(9,  'Suresh Iyer',   '9111111109', 'SALE', 'FULLY_FURNISHED',  '2026-11-01', TRUE,  NOW()),
(10, 'Deepak Tiwari', '9111111110', 'RENT', 'NON_FURNISHED',    '2026-09-30', TRUE,  NOW());

-- Registration requests (12 records — mix of statuses)
INSERT INTO registration_requests (first_name, last_name, mobile_number, aadhaar_last_four, resident_type, wing_name, flat_number, status, created_at) VALUES
('Karan',   'Mehta',   '9222222201', '1111', 'OWNER',  'A', 'A-203', 'PENDING',  NOW()),
('Deepa',   'Nair',    '9222222202', '2222', 'OWNER',  'B', 'B-303', 'PENDING',  NOW()),
('Rohit',   'Gupta',   '9222222203', '3333', 'OWNER',  'C', 'C-403', 'APPROVED', NOW()),
('Pooja',   'Iyer',    '9222222204', '4444', 'OWNER',  'D', 'D-503', 'REJECTED', NOW()),
('Manish',  'Tiwari',  '9222222205', '5555', 'OWNER',  'E', 'E-603', 'APPROVED', NOW()),
('Pradeep', 'Sharma',  '9222222206', '6666', 'OWNER',  'A', 'A-204', 'PENDING',  NOW()),
('Kavita',  'Singh',   '9222222207', '7777', 'OWNER',  'B', 'B-304', 'PENDING',  NOW()),
('Arun',    'Patel',   '9222222208', '8888', 'OWNER',  'C', 'C-404', 'REJECTED', NOW()),
('Sunita',  'Joshi',   '9222222209', '9999', 'OWNER',  'D', 'D-504', 'APPROVED', NOW()),
('Rajan',   'Kumar',   '9222222210', '0000', 'OWNER',  'E', 'E-604', 'PENDING',  NOW()),
('Neha',    'Gupta',   '9222222211', '1122', 'TENANT', 'A', 'A-201', 'REJECTED', NOW()),
('Sanjay',  'Verma',   '9222222212', '3344', 'OWNER',  'B', 'B-305', 'PENDING',  NOW());

-- Complaints (12 records — mix of statuses)
INSERT INTO complaints (raised_by_id, subject, description, target_type, status, created_at) VALUES
(1,  'Water leakage in corridor',     'Water leakage near flat A-201 corridor since 3 days',    'ALL',      'PENDING',  NOW()),
(2,  'Garbage not collected',         'Garbage not collected for 3 days near Wing B',            'ALL',      'PENDING',  NOW()),
(3,  'Noise complaint',               'Loud music from neighbouring flat after 10pm',            'RESIDENT', 'RESOLVED', NOW()),
(4,  'Parking issue',                 'Unauthorized vehicle parked in my reserved slot',         'ALL',      'PENDING',  NOW()),
(5,  'Lift not working',              'Lift in Wing E not functioning since yesterday',           'ALL',      'RESOLVED', NOW()),
(6,  'Street light broken',           'Street light near main gate is not working',              'ALL',      'PENDING',  NOW()),
(7,  'Dog menace near gate',          'Stray dogs near society gate causing trouble at night',   'ALL',      'PENDING',  NOW()),
(8,  'Leaking pipe in basement',      'Water pipe in basement parking area leaking badly',       'ALL',      'RESOLVED', NOW()),
(9,  'Broken gate hinge',             'Main gate hinge broken and gate does not close properly', 'ALL',      'RESOLVED', NOW()),
(10, 'No water supply in morning',    'No water supply between 6am to 9am for past week',        'ALL',      'PENDING',  NOW()),
(1,  'Damaged road near Wing A',      'Road near Wing A entrance has multiple potholes',         'ALL',      'PENDING',  NOW()),
(3,  'CCTV not working at entrance',  'CCTV camera at main entrance is not recording',           'ALL',      'PENDING',  NOW());

-- Caretaker issues (12 records — mix of statuses)
INSERT INTO caretaker_issues (assigned_to_id, assigned_by_id, title, description, status, created_at) VALUES
(1, 1, 'Fix water tap in parking',     'Water tap near parking area is leaking badly',          'PENDING',    NOW()),
(1, 1, 'Clean terrace area',           'Terrace needs thorough cleaning before monsoon',         'PROCESSING', NOW()),
(2, 1, 'Replace lobby light bulbs',    'Multiple bulbs in lobby area are fused',                'PENDING',    NOW()),
(2, 1, 'Repair main gate hinge',       'Main gate hinge broken and makes loud noise',           'RESOLVED',   NOW()),
(1, 1, 'Pest control in basement',     'Pest control required in basement parking area',         'PENDING',    NOW()),
(2, 1, 'Fix elevator button panel',    'Button panel in elevator not working properly',         'PROCESSING', NOW()),
(3, 1, 'Clean drainage near Wing B',   'Drainage near Wing B is blocked and overflowing',       'PENDING',    NOW()),
(3, 1, 'Paint society boundary wall',  'Boundary wall paint is peeling off badly',              'PENDING',    NOW()),
(1, 1, 'Fix CCTV camera at gate',      'CCTV camera at main gate not recording',                'RESOLVED',   NOW()),
(2, 1, 'Repair water pump motor',      'Water pump motor making noise and needs repair',        'PROCESSING', NOW()),
(3, 1, 'Replace broken bench in park', 'Park bench near Wing C is broken and unsafe',           'PENDING',    NOW()),
(1, 1, 'Fix street light near gate',   'Street light near main gate not working after 8pm',    'PROCESSING', NOW());

-- Announcements (10 records)
INSERT INTO announcements (created_by_id, type, title, message, created_at) VALUES
(1, 'ALERT',        'Water Supply Cut',           'Water supply will be cut from 10AM to 2PM on 5 Aug for maintenance work.',              NOW()),
(1, 'NOTIFICATION', 'Lift Maintenance',           'Lift 1 in Wing A will be under maintenance on 6 Aug. Please use Lift 2.',              NOW()),
(1, 'ALERT',        'Power Cut Notice',           'Electricity will be cut from 6PM to 8PM on 7 Aug due to transformer maintenance.',     NOW()),
(1, 'NOTIFICATION', 'Society Meeting',            'Monthly society meeting on 10 Aug at 7PM in community hall. All residents please attend.', NOW()),
(1, 'NOTIFICATION', 'New Watchman Joining',       'New security watchman Mr. Ganesh will join duty from 1 Aug 2026.',                    NOW()),
(1, 'ALERT',        'Heavy Rain Warning',         'IMD has issued heavy rain warning for next 48 hours. Please take necessary precautions.', NOW()),
(1, 'NOTIFICATION', 'Pest Control Scheduled',    'Society-wide pest control on 12 Aug. Keep windows closed between 10AM to 12PM.',       NOW()),
(1, 'ALERT',        'Gate Timing Change',         'Society main gate will close at 11PM instead of 12AM starting from 1 Aug.',           NOW()),
(1, 'NOTIFICATION', 'Maintenance Due Reminder',  'July maintenance bills are due by 10 Aug. Please pay to avoid fine of Rs.50 per day.', NOW()),
(1, 'NOTIFICATION', 'Parking Allotment Meeting', 'Parking slot allotment meeting on 15 Aug at 6PM. All owners must attend.',            NOW());

-- Permission requests (10 records)
INSERT INTO permission_requests (raised_by_id, subject, description, request_date, status, rejection_reason, created_at) VALUES
(1,  'Guest Entry for Parents',    'My parents are visiting from 5-8 Aug. Request entry permission for their stay.',       '2026-08-05', 'APPROVED', NULL,                        NOW()),
(2,  'Furniture Delivery',         'Expecting furniture delivery on 6 Aug between 11AM to 1PM. Large vehicle entry needed.','2026-08-06', 'PENDING',  NULL,                        NOW()),
(3,  'Vehicle Entry for Relative', 'My relative will park their car in visitor parking for 2 days on 7-8 Aug.',           '2026-08-07', 'REJECTED', 'Visitor parking is full',   NOW()),
(4,  'Maid Permanent Entry',       'New maid starting from 8 Aug. Request permanent daily entry permission.',              '2026-08-08', 'PENDING',  NULL,                        NOW()),
(5,  'Guest Entry for Friends',    'College friends visiting for get-together on 9 Aug evening.',                          '2026-08-09', 'APPROVED', NULL,                        NOW()),
(6,  'AC Installation Work',       'AC technician needs entry on 10 Aug for installation in flat A-202.',                  '2026-08-10', 'PENDING',  NULL,                        NOW()),
(7,  'Packers and Movers Entry',   'Moving some furniture out on 11 Aug. Packers and movers need entry from 9AM to 1PM.', '2026-08-11', 'APPROVED', NULL,                        NOW()),
(8,  'Plumber Work Permission',    'Plumber needed for bathroom repair on 12 Aug. Request entry permission.',              '2026-08-12', 'PENDING',  NULL,                        NOW()),
(9,  'Birthday Party Guests',      'Hosting birthday party on 13 Aug. Around 20 guests expected between 6PM to 10PM.',    '2026-08-13', 'REJECTED', 'Exceeds guest limit of 10', NOW()),
(10, 'Internet Cable Work',        'Internet service technician needs building access on 14 Aug for cable installation.',  '2026-08-14', 'PENDING',  NULL,                        NOW());

-- Maintenance settings
INSERT INTO global_maintenance_settings (maintenance_amount, due_fine_per_day, validity_days, last_updated_at) VALUES
(2000.00, 50.00, 10, NOW());

-- Maintenance bills (12 records — mix of paid and pending)
INSERT INTO maintenance_bills (flat_id, resident_id, base_amount, fine_amount, total_amount, status, bill_month, bill_year, due_date, paid_at, created_at) VALUES
(1,  1,  2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(2,  2,  2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(3,  3,  2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(4,  4,  2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(5,  5,  2000.00, 0.00,   2000.00, 'PAID',    6, 2026, '2026-06-10', NOW(), NOW()),
(1,  1,  2000.00, 1050.00,3050.00, 'PENDING', 7, 2026, '2026-07-10', NULL,  NOW()),
(2,  2,  2000.00, 750.00, 2750.00, 'PENDING', 7, 2026, '2026-07-10', NULL,  NOW()),
(3,  3,  2000.00, 500.00, 2500.00, 'PENDING', 7, 2026, '2026-07-10', NULL,  NOW()),
(4,  4,  2000.00, 0.00,   2000.00, 'PAID',    7, 2026, '2026-07-10', NOW(), NOW()),
(5,  5,  2000.00, 0.00,   2000.00, 'PAID',    7, 2026, '2026-07-10', NOW(), NOW()),
(6,  6,  2000.00, 350.00, 2350.00, 'PENDING', 7, 2026, '2026-07-10', NULL,  NOW()),
(7,  7,  2000.00, 0.00,   2000.00, 'PAID',    7, 2026, '2026-07-10', NOW(), NOW());

-- Society fund
INSERT INTO society_funds (balance, last_updated) VALUES (22000.00, NOW());

-- Payment transactions (12 records)
INSERT INTO payment_transactions (bill_id, razorpay_order_id, razorpay_payment_id, amount_paid, status, created_at) VALUES
(1,  'order_test_001', 'pay_test_001', 2000.00, 'SUCCESS', NOW()),
(2,  'order_test_002', 'pay_test_002', 2000.00, 'SUCCESS', NOW()),
(3,  'order_test_003', 'pay_test_003', 2000.00, 'SUCCESS', NOW()),
(4,  'order_test_004', 'pay_test_004', 2000.00, 'SUCCESS', NOW()),
(5,  'order_test_005', 'pay_test_005', 2000.00, 'SUCCESS', NOW()),
(9,  'order_test_006', 'pay_test_006', 2000.00, 'SUCCESS', NOW()),
(10, 'order_test_007', 'pay_test_007', 2000.00, 'SUCCESS', NOW()),
(12, 'order_test_008', 'pay_test_008', 2000.00, 'SUCCESS', NOW()),
(6,  'order_test_009', 'pay_test_009', 3050.00, 'PENDING', NOW()),
(7,  'order_test_010', 'pay_test_010', 2750.00, 'PENDING', NOW()),
(8,  'order_test_011', 'pay_test_011', 2500.00, 'PENDING', NOW()),
(11, 'order_test_012', 'pay_test_012', 2350.00, 'PENDING', NOW());

-- STEP 6: Final permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO urbansync_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO urbansync_user;

-- ============================================================
-- VERIFY:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
-- Expected: 16 tables
--
-- Login: secretary@urbansync.com / #UrbanSync@1234
-- ============================================================
