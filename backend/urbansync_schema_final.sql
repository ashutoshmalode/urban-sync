-- ============================================================
-- UrbanSync Database Schema — Final (Phase 0-6 Complete)
-- Compatible with: PostgreSQL 16/17
-- Run this on: urbansync_db
-- Secretary login after setup:
--   Email:    secretary@urbansync.com
--   Password: #UrbanSync@1234
-- ============================================================

-- ============================================================
-- STEP 1: Permissions
-- ============================================================
GRANT ALL PRIVILEGES ON DATABASE urbansync_db TO urbansync_user;
GRANT ALL ON SCHEMA public TO urbansync_user;

-- ============================================================
-- STEP 2: Drop all tables (safe order)
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

-- 1. wings
CREATE TABLE wings (
    id          BIGSERIAL PRIMARY KEY,
    wing_name   VARCHAR(10)  NOT NULL UNIQUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2. credentials
CREATE TABLE credentials (
    id                 BIGSERIAL PRIMARY KEY,
    login_identifier   VARCHAR(100) NOT NULL UNIQUE,
    password_hash      VARCHAR(255),
    role               VARCHAR(20)  NOT NULL,
    created_at         TIMESTAMP    DEFAULT NOW()
);

-- 3. secretary_profiles
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

-- 4. caretaker_profiles
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
    leaving_reason     TEXT,
    left_at            TIMESTAMP,
    credential_id      BIGINT       UNIQUE REFERENCES credentials(id),
    created_at         TIMESTAMP    DEFAULT NOW()
);

-- 5. resident_profiles
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
    credential_id     BIGINT       REFERENCES credentials(id),
    created_at        TIMESTAMP    DEFAULT NOW()
);

-- 6. registration_requests
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

-- 7. flats
CREATE TABLE flats (
    id                  BIGSERIAL PRIMARY KEY,
    flat_number         VARCHAR(20)  NOT NULL UNIQUE,
    wing_id             BIGINT       NOT NULL REFERENCES wings(id),
    owner_id            BIGINT       REFERENCES resident_profiles(id),
    current_tenant_id   BIGINT       REFERENCES resident_profiles(id),
    created_at          TIMESTAMP    DEFAULT NOW()
);

-- 8. property_posts
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

-- 9. complaints
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

-- 10. caretaker_issues
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

-- 11. announcements
CREATE TABLE announcements (
    id              BIGSERIAL PRIMARY KEY,
    created_by_id   BIGINT       REFERENCES secretary_profiles(id),
    type            VARCHAR(20)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- 12. permission_requests
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

-- 13. global_maintenance_settings
CREATE TABLE global_maintenance_settings (
    id                           BIGSERIAL PRIMARY KEY,
    maintenance_amount           NUMERIC(10,2) NOT NULL DEFAULT 0,
    due_fine_per_day             NUMERIC(10,2) NOT NULL DEFAULT 50,
    validity_days                INTEGER       NOT NULL DEFAULT 10,
    last_updated_at              TIMESTAMP,
    last_updated_by_secretary_at TIMESTAMP
);

-- 14. maintenance_bills
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

-- 15. society_funds
CREATE TABLE society_funds (
    id            BIGSERIAL PRIMARY KEY,
    balance       NUMERIC(12,2) NOT NULL DEFAULT 0,
    last_updated  TIMESTAMP     DEFAULT NOW()
);

-- 16. payment_transactions
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
-- STEP 4: Indexes for performance
-- ============================================================
CREATE INDEX idx_credentials_login     ON credentials(login_identifier);
CREATE INDEX idx_resident_mobile       ON resident_profiles(mobile_number);
CREATE INDEX idx_resident_flat         ON resident_profiles(flat_number);
CREATE INDEX idx_resident_status       ON resident_profiles(status);
CREATE INDEX idx_caretaker_mobile      ON caretaker_profiles(mobile_number);
CREATE INDEX idx_caretaker_serial      ON caretaker_profiles(serial_number);
CREATE INDEX idx_registration_status   ON registration_requests(status);
CREATE INDEX idx_registration_mobile   ON registration_requests(mobile_number);
CREATE INDEX idx_flats_flat_number     ON flats(flat_number);
CREATE INDEX idx_maintenance_status    ON maintenance_bills(status);
CREATE INDEX idx_maintenance_resident  ON maintenance_bills(resident_id);
CREATE INDEX idx_payment_bill          ON payment_transactions(bill_id);
CREATE INDEX idx_complaints_status     ON complaints(status);
CREATE INDEX idx_permission_status     ON permission_requests(status);

-- ============================================================
-- STEP 5: Seed Data
-- ============================================================

-- Wings A to E
INSERT INTO wings (wing_name, created_at) VALUES
('A', NOW()), ('B', NOW()), ('C', NOW()), ('D', NOW()), ('E', NOW());

-- Secretary credential
-- Password: #UrbanSync@1234 (BCrypt hash)
INSERT INTO credentials (login_identifier, password_hash, role, created_at) VALUES
('secretary@urbansync.com',
 '$2b$10$c0M4En.MuQWsZzb4UBfvGuk5zVaKweu5I1fCJvrEPKWJgWykqt4yK',
 'SECRETARY', NOW());

-- Secretary profile
INSERT INTO secretary_profiles (
    first_name, last_name, email, mobile_number, flat_number,
    bank_name, account_number, ifsc_code, credential_id, created_at
) VALUES (
    'Ashutosh', 'Malode', 'secretary@urbansync.com', '9876543210', 'A-101',
    'SBI', '1234567890', 'SBIN0001234', 1, NOW()
);

-- Society fund (single row, starts at 0)
INSERT INTO society_funds (balance, last_updated) VALUES (0, NOW());

-- Global maintenance settings
INSERT INTO global_maintenance_settings (
    maintenance_amount, due_fine_per_day, validity_days, last_updated_at
) VALUES (2000.00, 50.00, 10, NOW());

-- ============================================================
-- STEP 6: Final permissions
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO urbansync_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO urbansync_user;

-- ============================================================
-- STEP 7: Verify (run after execution)
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
-- Should show 16 tables
--
-- SELECT * FROM wings;           -- Should show A B C D E
-- SELECT * FROM credentials;     -- Should show secretary
-- SELECT * FROM secretary_profiles; -- Should show Ashutosh Malode
-- SELECT * FROM society_funds;   -- Should show balance 0
-- ============================================================
