SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- FUNCTION
CREATE OR REPLACE FUNCTION public.update_society_fund_balance() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status = 'SUCCESS' AND (OLD.status IS NULL OR OLD.status != 'SUCCESS') THEN
        UPDATE society_funds 
        SET balance = balance + NEW.amount_paid,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = 1;
            
        UPDATE maintenance_bills
        SET status = 'PAID',
            paid_date = CURRENT_TIMESTAMP
        WHERE id = NEW.bill_id;
    END IF;
    RETURN NEW;
END;
$$;

-- WINGS
CREATE TABLE public.wings (
    id bigint NOT NULL,
    wing_name character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE SEQUENCE public.wings_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.wings_id_seq OWNED BY public.wings.id;
ALTER TABLE ONLY public.wings ALTER COLUMN id SET DEFAULT nextval('public.wings_id_seq'::regclass);
ALTER TABLE ONLY public.wings ADD CONSTRAINT wings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.wings ADD CONSTRAINT wings_wing_name_key UNIQUE (wing_name);

-- CREDENTIALS
CREATE TABLE public.credentials (
    id bigint NOT NULL,
    login_identifier character varying(100) NOT NULL,
    password_hash character varying(255),
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT credentials_role_check CHECK (((role)::text = ANY ((ARRAY['SECRETARY'::character varying, 'CARETAKER'::character varying, 'RESIDENT'::character varying])::text[])))
);
CREATE SEQUENCE public.credentials_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.credentials_id_seq OWNED BY public.credentials.id;
ALTER TABLE ONLY public.credentials ALTER COLUMN id SET DEFAULT nextval('public.credentials_id_seq'::regclass);
ALTER TABLE ONLY public.credentials ADD CONSTRAINT credentials_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.credentials ADD CONSTRAINT credentials_login_identifier_key UNIQUE (login_identifier);
CREATE UNIQUE INDEX unique_secretary_role ON public.credentials USING btree (role) WHERE ((role)::text = 'SECRETARY'::text);

-- SECRETARY PROFILES
CREATE TABLE public.secretary_profiles (
    id bigint NOT NULL,
    credential_id bigint NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    flat_no character varying(20) NOT NULL,
    mobile_number character varying(15) NOT NULL,
    email character varying(100) NOT NULL,
    bank_name character varying(100) NOT NULL,
    account_number character varying(50) NOT NULL,
    ifsc_code character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE SEQUENCE public.secretary_profiles_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.secretary_profiles_id_seq OWNED BY public.secretary_profiles.id;
ALTER TABLE ONLY public.secretary_profiles ALTER COLUMN id SET DEFAULT nextval('public.secretary_profiles_id_seq'::regclass);
ALTER TABLE ONLY public.secretary_profiles ADD CONSTRAINT secretary_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.secretary_profiles ADD CONSTRAINT secretary_profiles_credential_id_key UNIQUE (credential_id);
ALTER TABLE ONLY public.secretary_profiles ADD CONSTRAINT secretary_profiles_email_key UNIQUE (email);
ALTER TABLE ONLY public.secretary_profiles ADD CONSTRAINT secretary_profiles_mobile_number_key UNIQUE (mobile_number);
ALTER TABLE ONLY public.secretary_profiles ADD CONSTRAINT secretary_profiles_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE CASCADE;

-- CARETAKER PROFILES
CREATE TABLE public.caretaker_profiles (
    id bigint NOT NULL,
    credential_id bigint NOT NULL,
    serial_number integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    mobile_number character varying(15) NOT NULL,
    age integer NOT NULL,
    aadhaar_number character varying(12) NOT NULL,
    permanent_address text NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT caretaker_profiles_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);
CREATE SEQUENCE public.caretaker_profiles_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.caretaker_profiles_serial_number_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.caretaker_profiles_id_seq OWNED BY public.caretaker_profiles.id;
ALTER SEQUENCE public.caretaker_profiles_serial_number_seq OWNED BY public.caretaker_profiles.serial_number;
ALTER TABLE ONLY public.caretaker_profiles ALTER COLUMN id SET DEFAULT nextval('public.caretaker_profiles_id_seq'::regclass);
ALTER TABLE ONLY public.caretaker_profiles ALTER COLUMN serial_number SET DEFAULT nextval('public.caretaker_profiles_serial_number_seq'::regclass);
ALTER TABLE ONLY public.caretaker_profiles ADD CONSTRAINT caretaker_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.caretaker_profiles ADD CONSTRAINT caretaker_profiles_credential_id_key UNIQUE (credential_id);
ALTER TABLE ONLY public.caretaker_profiles ADD CONSTRAINT caretaker_profiles_serial_number_key UNIQUE (serial_number);
ALTER TABLE ONLY public.caretaker_profiles ADD CONSTRAINT caretaker_profiles_mobile_number_key UNIQUE (mobile_number);
ALTER TABLE ONLY public.caretaker_profiles ADD CONSTRAINT caretaker_profiles_aadhaar_number_key UNIQUE (aadhaar_number);
ALTER TABLE ONLY public.caretaker_profiles ADD CONSTRAINT caretaker_profiles_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE CASCADE;

-- RESIDENT PROFILES
CREATE TABLE public.resident_profiles (
    id bigint NOT NULL,
    credential_id bigint,
    resident_type character varying(10) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    mobile_number character varying(15) NOT NULL,
    aadhaar_last_four character varying(4) NOT NULL,
    landlord_id bigint,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resident_profiles_resident_type_check CHECK (((resident_type)::text = ANY ((ARRAY['OWNER'::character varying, 'TENANT'::character varying])::text[]))),
    CONSTRAINT resident_profiles_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'NO_LONGER_IN_SOCIETY'::character varying])::text[])))
);
CREATE SEQUENCE public.resident_profiles_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.resident_profiles_id_seq OWNED BY public.resident_profiles.id;
ALTER TABLE ONLY public.resident_profiles ALTER COLUMN id SET DEFAULT nextval('public.resident_profiles_id_seq'::regclass);
ALTER TABLE ONLY public.resident_profiles ADD CONSTRAINT resident_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.resident_profiles ADD CONSTRAINT resident_profiles_credential_id_key UNIQUE (credential_id);
ALTER TABLE ONLY public.resident_profiles ADD CONSTRAINT resident_profiles_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.resident_profiles ADD CONSTRAINT resident_profiles_landlord_id_fkey FOREIGN KEY (landlord_id) REFERENCES public.resident_profiles(id) ON DELETE SET NULL;

-- FLATS
CREATE TABLE public.flats (
    id bigint NOT NULL,
    wing_id bigint NOT NULL,
    flat_number character varying(10) NOT NULL,
    owner_id bigint NOT NULL,
    current_tenant_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE SEQUENCE public.flats_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.flats_id_seq OWNED BY public.flats.id;
ALTER TABLE ONLY public.flats ALTER COLUMN id SET DEFAULT nextval('public.flats_id_seq'::regclass);
ALTER TABLE ONLY public.flats ADD CONSTRAINT flats_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.flats ADD CONSTRAINT unique_wing_flat UNIQUE (wing_id, flat_number);
ALTER TABLE ONLY public.flats ADD CONSTRAINT flats_wing_id_fkey FOREIGN KEY (wing_id) REFERENCES public.wings(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.flats ADD CONSTRAINT flats_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.resident_profiles(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.flats ADD CONSTRAINT flats_current_tenant_id_fkey FOREIGN KEY (current_tenant_id) REFERENCES public.resident_profiles(id) ON DELETE SET NULL;

-- GLOBAL MAINTENANCE SETTINGS
CREATE TABLE public.global_maintenance_settings (
    id bigint NOT NULL,
    monthly_amount numeric(10,2) NOT NULL,
    late_fee_per_day numeric(10,2) DEFAULT 50.00 NOT NULL,
    validity_days integer DEFAULT 10 NOT NULL,
    updated_by bigint,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE SEQUENCE public.global_maintenance_settings_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.global_maintenance_settings_id_seq OWNED BY public.global_maintenance_settings.id;
ALTER TABLE ONLY public.global_maintenance_settings ALTER COLUMN id SET DEFAULT nextval('public.global_maintenance_settings_id_seq'::regclass);
ALTER TABLE ONLY public.global_maintenance_settings ADD CONSTRAINT global_maintenance_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.global_maintenance_settings ADD CONSTRAINT global_maintenance_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.secretary_profiles(id) ON DELETE SET NULL;

-- MAINTENANCE BILLS
CREATE TABLE public.maintenance_bills (
    id bigint NOT NULL,
    flat_id bigint NOT NULL,
    billing_month date NOT NULL,
    base_amount numeric(10,2) NOT NULL,
    penalty_amount numeric(10,2) DEFAULT 0.00,
    total_amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    due_date date NOT NULL,
    paid_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT maintenance_bills_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying])::text[])))
);
CREATE SEQUENCE public.maintenance_bills_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.maintenance_bills_id_seq OWNED BY public.maintenance_bills.id;
ALTER TABLE ONLY public.maintenance_bills ALTER COLUMN id SET DEFAULT nextval('public.maintenance_bills_id_seq'::regclass);
ALTER TABLE ONLY public.maintenance_bills ADD CONSTRAINT maintenance_bills_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.maintenance_bills ADD CONSTRAINT unique_flat_billing_month UNIQUE (flat_id, billing_month);
ALTER TABLE ONLY public.maintenance_bills ADD CONSTRAINT maintenance_bills_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id) ON DELETE RESTRICT;

-- PAYMENT TRANSACTIONS
CREATE TABLE public.payment_transactions (
    id bigint NOT NULL,
    bill_id bigint NOT NULL,
    razorpay_order_id character varying(100) NOT NULL,
    razorpay_payment_id character varying(100),
    amount_paid numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'CREATED'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['CREATED'::character varying, 'SUCCESS'::character varying, 'FAILED'::character varying])::text[])))
);
CREATE SEQUENCE public.payment_transactions_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.payment_transactions_id_seq OWNED BY public.payment_transactions.id;
ALTER TABLE ONLY public.payment_transactions ALTER COLUMN id SET DEFAULT nextval('public.payment_transactions_id_seq'::regclass);
ALTER TABLE ONLY public.payment_transactions ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payment_transactions ADD CONSTRAINT payment_transactions_razorpay_order_id_key UNIQUE (razorpay_order_id);
ALTER TABLE ONLY public.payment_transactions ADD CONSTRAINT payment_transactions_razorpay_payment_id_key UNIQUE (razorpay_payment_id);
ALTER TABLE ONLY public.payment_transactions ADD CONSTRAINT payment_transactions_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.maintenance_bills(id) ON DELETE RESTRICT;

-- SOCIETY FUNDS
CREATE TABLE public.society_funds (
    id bigint NOT NULL,
    balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE SEQUENCE public.society_funds_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.society_funds_id_seq OWNED BY public.society_funds.id;
ALTER TABLE ONLY public.society_funds ALTER COLUMN id SET DEFAULT nextval('public.society_funds_id_seq'::regclass);
ALTER TABLE ONLY public.society_funds ADD CONSTRAINT society_funds_pkey PRIMARY KEY (id);

-- COMPLAINTS
CREATE TABLE public.complaints (
    id bigint NOT NULL,
    raised_by_id bigint NOT NULL,
    subject character varying(150) NOT NULL,
    description text NOT NULL,
    photo_url character varying(500),
    photo_public_id character varying(100),
    video_url character varying(500),
    video_public_id character varying(100),
    target_type character varying(20) NOT NULL,
    target_wing_id bigint,
    target_resident_id bigint,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT complaints_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'RESOLVED'::character varying])::text[]))),
    CONSTRAINT complaints_target_type_check CHECK (((target_type)::text = ANY ((ARRAY['ALL'::character varying, 'INDIVIDUAL'::character varying, 'WING'::character varying])::text[])))
);
CREATE SEQUENCE public.complaints_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;
ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);
ALTER TABLE ONLY public.complaints ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.complaints ADD CONSTRAINT complaints_raised_by_id_fkey FOREIGN KEY (raised_by_id) REFERENCES public.credentials(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.complaints ADD CONSTRAINT complaints_target_resident_id_fkey FOREIGN KEY (target_resident_id) REFERENCES public.resident_profiles(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.complaints ADD CONSTRAINT complaints_target_wing_id_fkey FOREIGN KEY (target_wing_id) REFERENCES public.wings(id) ON DELETE SET NULL;

-- CARETAKER ISSUES
CREATE TABLE public.caretaker_issues (
    id bigint NOT NULL,
    complaint_id bigint,
    assigned_caretaker_id bigint NOT NULL,
    description text NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    caretaker_comments text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT caretaker_issues_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying, 'RESOLVED'::character varying])::text[])))
);
CREATE SEQUENCE public.caretaker_issues_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.caretaker_issues_id_seq OWNED BY public.caretaker_issues.id;
ALTER TABLE ONLY public.caretaker_issues ALTER COLUMN id SET DEFAULT nextval('public.caretaker_issues_id_seq'::regclass);
ALTER TABLE ONLY public.caretaker_issues ADD CONSTRAINT caretaker_issues_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.caretaker_issues ADD CONSTRAINT caretaker_issues_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.caretaker_issues ADD CONSTRAINT caretaker_issues_assigned_caretaker_id_fkey FOREIGN KEY (assigned_caretaker_id) REFERENCES public.caretaker_profiles(id) ON DELETE RESTRICT;

-- PERMISSION REQUESTS
CREATE TABLE public.permission_requests (
    id bigint NOT NULL,
    resident_id bigint NOT NULL,
    flat_id bigint NOT NULL,
    subject character varying(150) NOT NULL,
    description text NOT NULL,
    request_date date NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT permission_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);
CREATE SEQUENCE public.permission_requests_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.permission_requests_id_seq OWNED BY public.permission_requests.id;
ALTER TABLE ONLY public.permission_requests ALTER COLUMN id SET DEFAULT nextval('public.permission_requests_id_seq'::regclass);
ALTER TABLE ONLY public.permission_requests ADD CONSTRAINT permission_requests_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.permission_requests ADD CONSTRAINT permission_requests_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.resident_profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.permission_requests ADD CONSTRAINT permission_requests_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id) ON DELETE CASCADE;

-- REGISTRATION REQUESTS
CREATE TABLE public.registration_requests (
    id bigint NOT NULL,
    resident_type character varying(10) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    wing_name character varying(10) NOT NULL,
    flat_number character varying(10) NOT NULL,
    mobile_number character varying(15) NOT NULL,
    aadhaar_last_four character varying(4) NOT NULL,
    landlord_name character varying(100),
    landlord_flat_number character varying(10),
    landlord_mobile_number character varying(15),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT registration_requests_resident_type_check CHECK (((resident_type)::text = ANY ((ARRAY['OWNER'::character varying, 'TENANT'::character varying])::text[]))),
    CONSTRAINT registration_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);
CREATE SEQUENCE public.registration_requests_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.registration_requests_id_seq OWNED BY public.registration_requests.id;
ALTER TABLE ONLY public.registration_requests ALTER COLUMN id SET DEFAULT nextval('public.registration_requests_id_seq'::regclass);
ALTER TABLE ONLY public.registration_requests ADD CONSTRAINT registration_requests_pkey PRIMARY KEY (id);

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
    id bigint NOT NULL,
    announcement_type character varying(20) NOT NULL,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT announcements_announcement_type_check CHECK (((announcement_type)::text = ANY ((ARRAY['ALERT'::character varying, 'NOTIFICATION'::character varying])::text[])))
);
CREATE SEQUENCE public.announcements_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;
ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);
ALTER TABLE ONLY public.announcements ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);

-- PROPERTY POSTS
CREATE TABLE public.property_posts (
    id bigint NOT NULL,
    flat_id bigint NOT NULL,
    owner_name character varying(100) NOT NULL,
    contact_number character varying(15) NOT NULL,
    post_type character varying(10) NOT NULL,
    furnishing_type character varying(20) NOT NULL,
    availability_date date NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT property_posts_furnishing_type_check CHECK (((furnishing_type)::text = ANY ((ARRAY['FULLY_FURNISHED'::character varying, 'SEMI_FURNISHED'::character varying, 'UNFURNISHED'::character varying])::text[]))),
    CONSTRAINT property_posts_post_type_check CHECK (((post_type)::text = ANY ((ARRAY['RENT'::character varying, 'SELL'::character varying])::text[]))),
    CONSTRAINT property_posts_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'RENTED_OUT'::character varying, 'SOLD_OUT'::character varying])::text[])))
);
CREATE SEQUENCE public.property_posts_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.property_posts_id_seq OWNED BY public.property_posts.id;
ALTER TABLE ONLY public.property_posts ALTER COLUMN id SET DEFAULT nextval('public.property_posts_id_seq'::regclass);
ALTER TABLE ONLY public.property_posts ADD CONSTRAINT property_posts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.property_posts ADD CONSTRAINT property_posts_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id) ON DELETE CASCADE;

-- TRIGGER
CREATE TRIGGER trg_payment_success AFTER UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.update_society_fund_balance();

-- =====================
-- SEED DATA (INSERTs)
-- =====================

-- Wings
INSERT INTO public.wings (id, wing_name, created_at) VALUES
(1, 'A', '2026-06-23 10:50:04.829142'),
(2, 'B', '2026-06-23 10:50:04.829142'),
(3, 'C', '2026-06-23 10:50:04.829142'),
(4, 'D', '2026-06-23 10:50:04.829142'),
(5, 'E', '2026-06-23 10:50:04.829142');
SELECT setval('public.wings_id_seq', 5, true);

-- Credentials
INSERT INTO public.credentials (id, login_identifier, password_hash, role, created_at) VALUES
(1,  'secretary@urbansync.com', '$2a$10$soS2TruOOrkOnbdU7akelet1SEpvRyIxmuXs6FlHEIDuA/G5eiwjC', 'SECRETARY', '2026-06-23 10:50:04.829142'),
(2,  '9876500001', NULL, 'CARETAKER', '2026-06-23 10:50:04.829142'),
(3,  '9876500002', NULL, 'CARETAKER', '2026-06-23 10:50:04.829142'),
(4,  '9876500003', NULL, 'CARETAKER', '2026-06-23 10:50:04.829142'),
(5,  '9876500004', NULL, 'CARETAKER', '2026-06-23 10:50:04.829142'),
(6,  '9876500005', NULL, 'CARETAKER', '2026-06-23 10:50:04.829142'),
(7,  '9988776601', NULL, 'RESIDENT',  '2026-06-23 10:50:04.829142'),
(8,  '9988776602', NULL, 'RESIDENT',  '2026-06-23 10:50:04.829142'),
(9,  '9988776603', NULL, 'RESIDENT',  '2026-06-23 10:50:04.829142'),
(10, '9988776604', NULL, 'RESIDENT',  '2026-06-23 10:50:04.829142'),
(11, '9988776605', NULL, 'RESIDENT',  '2026-06-23 10:50:04.829142');
SELECT setval('public.credentials_id_seq', 11, true);

-- Secretary Profiles
INSERT INTO public.secretary_profiles (id, credential_id, first_name, last_name, flat_no, mobile_number, email, bank_name, account_number, ifsc_code, created_at) VALUES
(1, 1, 'Ramesh', 'Sharma', 'A-501', '9876510001', 'secretary@urbansync.com', 'SBI', '1111111111', 'SBIN0000001', '2026-06-23 10:50:04.829142');
SELECT setval('public.secretary_profiles_id_seq', 1, true);

-- Caretaker Profiles
INSERT INTO public.caretaker_profiles (id, credential_id, serial_number, first_name, last_name, mobile_number, age, aadhaar_number, permanent_address, status, created_at) VALUES
(1, 2, 1, 'Ramu',   'Yadav',  '9876500001', 35, '111122223333', '123 Caretaker Lane, Mumbai', 'ACTIVE', '2026-06-23 10:50:04.829142'),
(2, 3, 2, 'Shamu',  'Paswan', '9876500002', 40, '222233334444', '456 Caretaker Lane, Pune',   'ACTIVE', '2026-06-23 10:50:04.829142'),
(3, 4, 3, 'Hari',   'Singh',  '9876500003', 28, '333344445555', '789 Caretaker Lane, Delhi',  'ACTIVE', '2026-06-23 10:50:04.829142'),
(4, 5, 4, 'Gopal',  'Verma',  '9876500004', 32, '444455556666', '101 Caretaker Lane, Nagpur', 'ACTIVE', '2026-06-23 10:50:04.829142'),
(5, 6, 5, 'Krishna','Patil',  '9876500005', 45, '555566667777', '202 Caretaker Lane, Nashik', 'ACTIVE', '2026-06-23 10:50:04.829142');
SELECT setval('public.caretaker_profiles_id_seq', 5, true);
SELECT setval('public.caretaker_profiles_serial_number_seq', 5, true);

-- Resident Profiles
INSERT INTO public.resident_profiles (id, credential_id, resident_type, first_name, last_name, mobile_number, aadhaar_last_four, landlord_id, status, created_at) VALUES
(1, 7,  'OWNER',  'Amit',  'Sharma', '9988776601', '1234', NULL, 'ACTIVE', '2026-06-23 10:50:04.829142'),
(2, 8,  'OWNER',  'Priya', 'Nair',   '9988776602', '5678', NULL, 'ACTIVE', '2026-06-23 10:50:04.829142'),
(3, 9,  'OWNER',  'John',  'Doe',    '9988776603', '9012', NULL, 'ACTIVE', '2026-06-23 10:50:04.829142'),
(4, 10, 'TENANT', 'Ravi',  'Patel',  '9988776604', '3456', 1,    'ACTIVE', '2026-06-23 10:50:04.829142'),
(5, 11, 'TENANT', 'Suman', 'Sen',    '9988776605', '7890', 2,    'ACTIVE', '2026-06-23 10:50:04.829142');
SELECT setval('public.resident_profiles_id_seq', 5, true);

-- Flats
INSERT INTO public.flats (id, wing_id, flat_number, owner_id, current_tenant_id, created_at) VALUES
(1, 1, '101', 1, NULL, '2026-06-23 10:50:04.829142'),
(2, 2, '202', 2, NULL, '2026-06-23 10:50:04.829142'),
(3, 3, '303', 3, NULL, '2026-06-23 10:50:04.829142'),
(4, 1, '102', 1, 4,    '2026-06-23 10:50:04.829142'),
(5, 2, '203', 2, 5,    '2026-06-23 10:50:04.829142');
SELECT setval('public.flats_id_seq', 5, true);

-- Global Maintenance Settings
INSERT INTO public.global_maintenance_settings (id, monthly_amount, late_fee_per_day, validity_days, updated_by, updated_at) VALUES
(1, 1500.00, 50.00, 10, 1, '2026-06-23 10:50:04.829142'),
(2, 1600.00, 50.00, 10, 1, '2026-06-23 10:50:04.829142'),
(3, 1700.00, 50.00, 10, 1, '2026-06-23 10:50:04.829142'),
(4, 1800.00, 50.00, 10, 1, '2026-06-23 10:50:04.829142'),
(5, 2000.00, 50.00, 10, 1, '2026-06-23 10:50:04.829142');
SELECT setval('public.global_maintenance_settings_id_seq', 5, true);

-- Maintenance Bills
INSERT INTO public.maintenance_bills (id, flat_id, billing_month, base_amount, penalty_amount, total_amount, status, due_date, paid_date, created_at) VALUES
(1, 1, '2026-06-01', 2000.00, 0.00, 2000.00, 'PAID',    '2026-06-10', '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142'),
(2, 2, '2026-06-01', 2000.00, 0.00, 2000.00, 'PENDING', '2026-06-10', NULL,                          '2026-06-23 10:50:04.829142'),
(3, 3, '2026-06-01', 2000.00, 0.00, 2000.00, 'PENDING', '2026-06-10', NULL,                          '2026-06-23 10:50:04.829142'),
(4, 4, '2026-06-01', 2000.00, 0.00, 2000.00, 'PAID',    '2026-06-10', '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142'),
(5, 5, '2026-06-01', 2000.00, 0.00, 2000.00, 'PAID',    '2026-06-10', '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142');
SELECT setval('public.maintenance_bills_id_seq', 5, true);

-- Payment Transactions
INSERT INTO public.payment_transactions (id, bill_id, razorpay_order_id, razorpay_payment_id, amount_paid, status, created_at) VALUES
(1, 1, 'order_001', 'pay_001', 2000.00, 'SUCCESS', '2026-06-23 10:50:04.829142'),
(2, 2, 'order_002', NULL,      2000.00, 'CREATED', '2026-06-23 10:50:04.829142'),
(3, 3, 'order_003', NULL,      2000.00, 'CREATED', '2026-06-23 10:50:04.829142'),
(4, 4, 'order_004', 'pay_004', 2000.00, 'SUCCESS', '2026-06-23 10:50:04.829142'),
(5, 5, 'order_005', 'pay_005', 2000.00, 'SUCCESS', '2026-06-23 10:50:04.829142');
SELECT setval('public.payment_transactions_id_seq', 5, true);

-- Society Funds
INSERT INTO public.society_funds (id, balance, last_updated) VALUES
(1, 56000.00,  '2026-06-23 10:50:04.829142'),
(2, 100000.00, '2026-06-23 10:50:04.829142'),
(3, 25000.00,  '2026-06-23 10:50:04.829142'),
(4, 10000.00,  '2026-06-23 10:50:04.829142'),
(5, 5000.00,   '2026-06-23 10:50:04.829142');
SELECT setval('public.society_funds_id_seq', 5, true);

-- Complaints
INSERT INTO public.complaints (id, raised_by_id, subject, description, photo_url, photo_public_id, video_url, video_public_id, target_type, target_wing_id, target_resident_id, status, resolved_at, created_at) VALUES
(1, 7, 'Water Leakage in Parking', 'Water dripping from ceiling near slot A-12.', 'https://res.cloudinary.com/urbansync/image/upload/v123/parking_leak.jpg', 'parking_leak_123', NULL, NULL, 'ALL',        NULL, NULL, 'PENDING',  NULL,                    '2026-06-23 10:50:04.829142'),
(2, 8, 'Lift 1 Speaker Noise',     'Voice announcement in Lift 1 is crackling.',   'https://res.cloudinary.com/urbansync/image/upload/v123/lift_speaker.jpg', 'lift_speaker_123', NULL, NULL, 'ALL',        NULL, NULL, 'PENDING',  NULL,                    '2026-06-23 10:50:04.829142'),
(3, 9, 'Stray Dog in Lobby',       'A stray dog has entered the building lobby.',   'https://res.cloudinary.com/urbansync/image/upload/v123/stray_dog.jpg',   'stray_dog_123',   NULL, NULL, 'WING',       3,    NULL, 'RESOLVED', '2026-06-22 14:00:00',   '2026-06-23 10:50:04.829142'),
(4, 1, 'Overflowing Garbage Bins', 'Garbage bins outside Wing B are overflowing.', 'https://res.cloudinary.com/urbansync/image/upload/v123/garbage.jpg',     'garbage_123',     NULL, NULL, 'WING',       2,    NULL, 'PENDING',  NULL,                    '2026-06-23 10:50:04.829142'),
(5, 7, 'Corridor Light Out',       'Tubelight flickering outside flat 101.',        'https://res.cloudinary.com/urbansync/image/upload/v123/light.jpg',       'light_123',       NULL, NULL, 'INDIVIDUAL', NULL, 1,    'PENDING',  NULL,                    '2026-06-23 10:50:04.829142');
SELECT setval('public.complaints_id_seq', 5, true);

-- Caretaker Issues
INSERT INTO public.caretaker_issues (id, complaint_id, assigned_caretaker_id, description, status, caretaker_comments, updated_at, created_at) VALUES
(1, 1, 1, 'Fix water leakage in Wing A parking area.',    'PROCESSING', 'Joint pipe identified, applying chemical sealant.', '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142'),
(2, 2, 2, 'Inspect Lift 1 speaker issue.',                'PENDING',    NULL,                                                '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142'),
(3, 3, 3, 'Gently escort stray dog out of C wing lobby.', 'RESOLVED',   'Dog escorted out of building safely.',              '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142'),
(4, 4, 4, 'Clear secondary bins near Wing B.',            'PENDING',    NULL,                                                '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142'),
(5, 5, 5, 'Replace tube light outside flat 101.',         'PROCESSING', 'LED tube purchased, will install today.',           '2026-06-23 10:50:04.829142', '2026-06-23 10:50:04.829142');
SELECT setval('public.caretaker_issues_id_seq', 5, true);

-- Permission Requests
INSERT INTO public.permission_requests (id, resident_id, flat_id, subject, description, request_date, status, rejection_reason, created_at) VALUES
(1, 1, 1, 'Balcony Renovation', 'Requesting permission to install safety nets in balcony.',  '2026-07-01', 'PENDING',  NULL,                     '2026-06-23 10:50:04.829142'),
(2, 2, 2, 'Pet Permission',     'Requesting permission to keep a dog.',                       '2026-07-02', 'APPROVED', NULL,                     '2026-06-23 10:50:04.829142'),
(3, 3, 3, 'Tenant Move-In',     'Requesting permission for shifting truck on Sunday.',        '2026-07-03', 'APPROVED', NULL,                     '2026-06-23 10:50:04.829142'),
(4, 4, 4, 'AC Installation',    'Requesting permission to mount AC unit.',                    '2026-07-04', 'REJECTED', 'Cannot drill on facade.','2026-06-23 10:50:04.829142'),
(5, 5, 5, 'Late Night Party',   'Requesting permission for a birthday party up to 11 PM.',   '2026-07-05', 'PENDING',  NULL,                     '2026-06-23 10:50:04.829142');
SELECT setval('public.permission_requests_id_seq', 5, true);

-- Registration Requests
INSERT INTO public.registration_requests (id, resident_type, first_name, last_name, wing_name, flat_number, mobile_number, aadhaar_last_four, landlord_name, landlord_flat_number, landlord_mobile_number, status, rejection_reason, created_at) VALUES
(1, 'OWNER',  'Vicky',   'Kaushal',  'A', '304', '9999988881', '1111', NULL,           NULL,    NULL,           'PENDING',  NULL,                       '2026-06-23 10:50:04.829142'),
(2, 'OWNER',  'Katrina', 'Kaif',     'B', '405', '9999988882', '2222', NULL,           NULL,    NULL,           'APPROVED', NULL,                       '2026-06-23 10:50:04.829142'),
(3, 'TENANT', 'Deepika', 'Padukone', 'C', '506', '9999988883', '3333', 'Ranveer Singh','C-506', '9999977771',   'PENDING',  NULL,                       '2026-06-23 10:50:04.829142'),
(4, 'TENANT', 'Alia',    'Bhatt',    'D', '607', '9999988884', '4444', 'Ranbir Kapoor','D-607', '9999977772',   'REJECTED', 'Landlord contact mismatch','2026-06-23 10:50:04.829142'),
(5, 'OWNER',  'Sid',     'Malhotra', 'E', '708', '9999988885', '5555', NULL,           NULL,    NULL,           'PENDING',  NULL,                       '2026-06-23 10:50:04.829142');
SELECT setval('public.registration_requests_id_seq', 5, true);

-- Announcements
INSERT INTO public.announcements (id, announcement_type, title, message, created_at) VALUES
(1, 'ALERT',        'Scheduled Power Outage', 'Power outage for maintenance on 25th June from 10 AM to 1 PM. Lift will be closed.',              '2026-06-23 10:50:04.829142'),
(2, 'NOTIFICATION', 'Lift 2 Servicing',       'Lift 2 in Wing B will be shut down for service today from 2 PM to 4 PM.',                         '2026-06-23 10:50:04.829142'),
(3, 'ALERT',        'Water Tank Cleaning',    'Water supply suspended on 27th June from 2 PM to 5 PM due to tank cleaning.',                     '2026-06-23 10:50:04.829142'),
(4, 'NOTIFICATION', 'Yoga Camp Start',        'Yoga camp starts this Sunday at 7 AM in clubhouse. Registrations open.',                          '2026-06-23 10:50:04.829142'),
(5, 'ALERT',        'Common Area Fumigation', 'Pest control fumigation will be conducted in common park areas Saturday morning.',                 '2026-06-23 10:50:04.829142');
SELECT setval('public.announcements_id_seq', 5, true);

-- Property Posts
INSERT INTO public.property_posts (id, flat_id, owner_name, contact_number, post_type, furnishing_type, availability_date, status, created_at) VALUES
(1, 1, 'Amit Sharma', '9988776601', 'RENT', 'FULLY_FURNISHED', '2026-07-01', 'ACTIVE',     '2026-06-23 10:50:04.829142'),
(2, 2, 'Priya Nair',  '9988776602', 'SELL', 'SEMI_FURNISHED',  '2026-08-01', 'ACTIVE',     '2026-06-23 10:50:04.829142'),
(3, 3, 'John Doe',    '9988776603', 'RENT', 'UNFURNISHED',     '2026-07-15', 'ACTIVE',     '2026-06-23 10:50:04.829142'),
(4, 4, 'Amit Sharma', '9988776601', 'SELL', 'FULLY_FURNISHED', '2026-09-01', 'ACTIVE',     '2026-06-23 10:50:04.829142'),
(5, 5, 'Priya Nair',  '9988776602', 'RENT', 'SEMI_FURNISHED',  '2026-07-10', 'RENTED_OUT', '2026-06-23 10:50:04.829142');
SELECT setval('public.property_posts_id_seq', 5, true);

-- Grants
GRANT ALL ON SCHEMA public TO urbansync_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO urbansync_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO urbansync_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO urbansync_user;