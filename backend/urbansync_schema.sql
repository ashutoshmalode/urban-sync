--
-- PostgreSQL database dump
--

\restrict Kj50Wzc3DEQQEDQDUUlRFQUAteHHojOgkC5auqrvLJYian2mNvP8j4OnYUi93PU

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

-- Started on 2026-07-06 12:07:23

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

--
-- TOC entry 248 (class 1255 OID 16714)
-- Name: update_society_fund_balance(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_society_fund_balance() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status = 'SUCCESS' AND (OLD.status IS NULL OR OLD.status != 'SUCCESS') THEN
        -- Add transaction amount to the global General Fund (id = 1)
        UPDATE society_funds 
        SET balance = balance + NEW.amount_paid,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = 1;
            
        -- Automatically mark the corresponding bill as PAID
        UPDATE maintenance_bills
        SET status = 'PAID',
            paid_date = CURRENT_TIMESTAMP
        WHERE id = NEW.bill_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_society_fund_balance() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 245 (class 1259 OID 17107)
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id bigint NOT NULL,
    announcement_type character varying(20) NOT NULL,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT announcements_announcement_type_check CHECK (((announcement_type)::text = ANY ((ARRAY['ALERT'::character varying, 'NOTIFICATION'::character varying])::text[])))
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 17106)
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 244
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- TOC entry 243 (class 1259 OID 17084)
-- Name: caretaker_issues; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.caretaker_issues OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 17083)
-- Name: caretaker_issues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caretaker_issues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caretaker_issues_id_seq OWNER TO postgres;

--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 242
-- Name: caretaker_issues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caretaker_issues_id_seq OWNED BY public.caretaker_issues.id;


--
-- TOC entry 223 (class 1259 OID 16886)
-- Name: caretaker_profiles; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.caretaker_profiles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16884)
-- Name: caretaker_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caretaker_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caretaker_profiles_id_seq OWNER TO postgres;

--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 221
-- Name: caretaker_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caretaker_profiles_id_seq OWNED BY public.caretaker_profiles.id;


--
-- TOC entry 222 (class 1259 OID 16885)
-- Name: caretaker_profiles_serial_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caretaker_profiles_serial_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caretaker_profiles_serial_number_seq OWNER TO postgres;

--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 222
-- Name: caretaker_profiles_serial_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caretaker_profiles_serial_number_seq OWNED BY public.caretaker_profiles.serial_number;


--
-- TOC entry 241 (class 1259 OID 17056)
-- Name: complaints; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.complaints OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17055)
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.complaints_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complaints_id_seq OWNER TO postgres;

--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 240
-- Name: complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;


--
-- TOC entry 218 (class 1259 OID 16854)
-- Name: credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credentials (
    id bigint NOT NULL,
    login_identifier character varying(100) NOT NULL,
    password_hash character varying(255),
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT credentials_role_check CHECK (((role)::text = ANY ((ARRAY['SECRETARY'::character varying, 'CARETAKER'::character varying, 'RESIDENT'::character varying])::text[])))
);


ALTER TABLE public.credentials OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16853)
-- Name: credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credentials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credentials_id_seq OWNER TO postgres;

--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 217
-- Name: credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credentials_id_seq OWNED BY public.credentials.id;


--
-- TOC entry 227 (class 1259 OID 16935)
-- Name: flats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flats (
    id bigint NOT NULL,
    wing_id bigint NOT NULL,
    flat_number character varying(10) NOT NULL,
    owner_id bigint NOT NULL,
    current_tenant_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.flats OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16934)
-- Name: flats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flats_id_seq OWNER TO postgres;

--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 226
-- Name: flats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flats_id_seq OWNED BY public.flats.id;


--
-- TOC entry 233 (class 1259 OID 16995)
-- Name: global_maintenance_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_maintenance_settings (
    id bigint NOT NULL,
    monthly_amount numeric(10,2) NOT NULL,
    late_fee_per_day numeric(10,2) DEFAULT 50.00 NOT NULL,
    validity_days integer DEFAULT 10 NOT NULL,
    updated_by bigint,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.global_maintenance_settings OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16994)
-- Name: global_maintenance_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.global_maintenance_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.global_maintenance_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 232
-- Name: global_maintenance_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.global_maintenance_settings_id_seq OWNED BY public.global_maintenance_settings.id;


--
-- TOC entry 235 (class 1259 OID 17010)
-- Name: maintenance_bills; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.maintenance_bills OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17009)
-- Name: maintenance_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_bills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_bills_id_seq OWNER TO postgres;

--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 234
-- Name: maintenance_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_bills_id_seq OWNED BY public.maintenance_bills.id;


--
-- TOC entry 237 (class 1259 OID 17028)
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17027)
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 236
-- Name: payment_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_transactions_id_seq OWNED BY public.payment_transactions.id;


--
-- TOC entry 231 (class 1259 OID 16973)
-- Name: permission_requests; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.permission_requests OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16972)
-- Name: permission_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permission_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 230
-- Name: permission_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_requests_id_seq OWNED BY public.permission_requests.id;


--
-- TOC entry 247 (class 1259 OID 17118)
-- Name: property_posts; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.property_posts OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 17117)
-- Name: property_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.property_posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_posts_id_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 246
-- Name: property_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.property_posts_id_seq OWNED BY public.property_posts.id;


--
-- TOC entry 229 (class 1259 OID 16960)
-- Name: registration_requests; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.registration_requests OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16959)
-- Name: registration_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registration_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registration_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 228
-- Name: registration_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registration_requests_id_seq OWNED BY public.registration_requests.id;


--
-- TOC entry 225 (class 1259 OID 16912)
-- Name: resident_profiles; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.resident_profiles OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16911)
-- Name: resident_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resident_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resident_profiles_id_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 224
-- Name: resident_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resident_profiles_id_seq OWNED BY public.resident_profiles.id;


--
-- TOC entry 220 (class 1259 OID 16866)
-- Name: secretary_profiles; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.secretary_profiles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16865)
-- Name: secretary_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.secretary_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secretary_profiles_id_seq OWNER TO postgres;

--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 219
-- Name: secretary_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secretary_profiles_id_seq OWNED BY public.secretary_profiles.id;


--
-- TOC entry 239 (class 1259 OID 17047)
-- Name: society_funds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.society_funds (
    id bigint NOT NULL,
    balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.society_funds OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17046)
-- Name: society_funds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.society_funds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.society_funds_id_seq OWNER TO postgres;

--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 238
-- Name: society_funds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.society_funds_id_seq OWNED BY public.society_funds.id;


--
-- TOC entry 216 (class 1259 OID 16844)
-- Name: wings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wings (
    id bigint NOT NULL,
    wing_name character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wings OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16843)
-- Name: wings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wings_id_seq OWNER TO postgres;

--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 215
-- Name: wings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wings_id_seq OWNED BY public.wings.id;


--
-- TOC entry 4856 (class 2604 OID 17110)
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- TOC entry 4852 (class 2604 OID 17087)
-- Name: caretaker_issues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_issues ALTER COLUMN id SET DEFAULT nextval('public.caretaker_issues_id_seq'::regclass);


--
-- TOC entry 4820 (class 2604 OID 16889)
-- Name: caretaker_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles ALTER COLUMN id SET DEFAULT nextval('public.caretaker_profiles_id_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 16890)
-- Name: caretaker_profiles serial_number; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles ALTER COLUMN serial_number SET DEFAULT nextval('public.caretaker_profiles_serial_number_seq'::regclass);


--
-- TOC entry 4849 (class 2604 OID 17059)
-- Name: complaints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);


--
-- TOC entry 4816 (class 2604 OID 16857)
-- Name: credentials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials ALTER COLUMN id SET DEFAULT nextval('public.credentials_id_seq'::regclass);


--
-- TOC entry 4827 (class 2604 OID 16938)
-- Name: flats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flats ALTER COLUMN id SET DEFAULT nextval('public.flats_id_seq'::regclass);


--
-- TOC entry 4835 (class 2604 OID 16998)
-- Name: global_maintenance_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_maintenance_settings ALTER COLUMN id SET DEFAULT nextval('public.global_maintenance_settings_id_seq'::regclass);


--
-- TOC entry 4839 (class 2604 OID 17013)
-- Name: maintenance_bills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_bills ALTER COLUMN id SET DEFAULT nextval('public.maintenance_bills_id_seq'::regclass);


--
-- TOC entry 4843 (class 2604 OID 17031)
-- Name: payment_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions ALTER COLUMN id SET DEFAULT nextval('public.payment_transactions_id_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 16976)
-- Name: permission_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_requests ALTER COLUMN id SET DEFAULT nextval('public.permission_requests_id_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 17121)
-- Name: property_posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_posts ALTER COLUMN id SET DEFAULT nextval('public.property_posts_id_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 16963)
-- Name: registration_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_requests ALTER COLUMN id SET DEFAULT nextval('public.registration_requests_id_seq'::regclass);


--
-- TOC entry 4824 (class 2604 OID 16915)
-- Name: resident_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resident_profiles ALTER COLUMN id SET DEFAULT nextval('public.resident_profiles_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 16869)
-- Name: secretary_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_profiles ALTER COLUMN id SET DEFAULT nextval('public.secretary_profiles_id_seq'::regclass);


--
-- TOC entry 4846 (class 2604 OID 17050)
-- Name: society_funds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.society_funds ALTER COLUMN id SET DEFAULT nextval('public.society_funds_id_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 16847)
-- Name: wings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wings ALTER COLUMN id SET DEFAULT nextval('public.wings_id_seq'::regclass);


--
-- TOC entry 5130 (class 0 OID 17107)
-- Dependencies: 245
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, announcement_type, title, message, created_at) FROM stdin;
1	ALERT	Scheduled Power Outage	Power outage for maintenance on 25th June from 10 AM to 1 PM. Lift will be closed.	2026-06-23 10:50:04.829142
2	NOTIFICATION	Lift 2 Servicing	Lift 2 in Wing B will be shut down for service today from 2 PM to 4 PM.	2026-06-23 10:50:04.829142
3	ALERT	Water Tank Cleaning	Water supply suspended on 27th June from 2 PM to 5 PM due to tank cleaning.	2026-06-23 10:50:04.829142
4	NOTIFICATION	Yoga Camp Start	Yoga camp starts this Sunday at 7 AM in clubhouse. Registrations open.	2026-06-23 10:50:04.829142
5	ALERT	Common Area Fumigation	Pest control fumigation will be conducted in common park areas Saturday morning.	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5128 (class 0 OID 17084)
-- Dependencies: 243
-- Data for Name: caretaker_issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caretaker_issues (id, complaint_id, assigned_caretaker_id, description, status, caretaker_comments, updated_at, created_at) FROM stdin;
1	1	1	Fix water leakage in Wing A parking area.	PROCESSING	Joint pipe identified, applying chemical sealant.	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
2	2	2	Inspect Lift 1 speaker issue.	PENDING	\N	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
3	3	3	Gently escort stray dog out of C wing lobby.	RESOLVED	Dog escorted out of building safely.	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
4	4	4	Clear secondary bins near Wing B.	PENDING	\N	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
5	5	5	Replace tube light outside flat 101.	PROCESSING	LED tube purchased, will install today.	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5108 (class 0 OID 16886)
-- Dependencies: 223
-- Data for Name: caretaker_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caretaker_profiles (id, credential_id, serial_number, first_name, last_name, mobile_number, age, aadhaar_number, permanent_address, status, created_at) FROM stdin;
1	2	1	Ramu	Yadav	9876500001	35	111122223333	123 Caretaker Lane, Mumbai	ACTIVE	2026-06-23 10:50:04.829142
2	3	2	Shamu	Paswan	9876500002	40	222233334444	456 Caretaker Lane, Pune	ACTIVE	2026-06-23 10:50:04.829142
3	4	3	Hari	Singh	9876500003	28	333344445555	789 Caretaker Lane, Delhi	ACTIVE	2026-06-23 10:50:04.829142
4	5	4	Gopal	Verma	9876500004	32	444455556666	101 Caretaker Lane, Nagpur	ACTIVE	2026-06-23 10:50:04.829142
5	6	5	Krishna	Patil	9876500005	45	555566667777	202 Caretaker Lane, Nashik	ACTIVE	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5126 (class 0 OID 17056)
-- Dependencies: 241
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaints (id, raised_by_id, subject, description, photo_url, photo_public_id, video_url, video_public_id, target_type, target_wing_id, target_resident_id, status, resolved_at, created_at) FROM stdin;
1	7	Water Leakage in Parking	Water dripping from ceiling near slot A-12.	https://res.cloudinary.com/urbansync/image/upload/v123/parking_leak.jpg	parking_leak_123	\N	\N	ALL	\N	\N	PENDING	\N	2026-06-23 10:50:04.829142
2	8	Lift 1 Speaker Noise	Voice announcement in Lift 1 is crackling.	https://res.cloudinary.com/urbansync/image/upload/v123/lift_speaker.jpg	lift_speaker_123	\N	\N	ALL	\N	\N	PENDING	\N	2026-06-23 10:50:04.829142
3	9	Stray Dog in Lobby	A stray dog has entered the building lobby.	https://res.cloudinary.com/urbansync/image/upload/v123/stray_dog.jpg	stray_dog_123	\N	\N	WING	3	\N	RESOLVED	2026-06-22 14:00:00	2026-06-23 10:50:04.829142
4	1	Overflowing Garbage Bins	Garbage bins outside Wing B are overflowing.	https://res.cloudinary.com/urbansync/image/upload/v123/garbage.jpg	garbage_123	\N	\N	WING	2	\N	PENDING	\N	2026-06-23 10:50:04.829142
5	7	Corridor Light Out	Tubelight flickering outside flat 101.	https://res.cloudinary.com/urbansync/image/upload/v123/light.jpg	light_123	\N	\N	INDIVIDUAL	\N	1	PENDING	\N	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5103 (class 0 OID 16854)
-- Dependencies: 218
-- Data for Name: credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credentials (id, login_identifier, password_hash, role, created_at) FROM stdin;
2	9876500001	\N	CARETAKER	2026-06-23 10:50:04.829142
3	9876500002	\N	CARETAKER	2026-06-23 10:50:04.829142
4	9876500003	\N	CARETAKER	2026-06-23 10:50:04.829142
5	9876500004	\N	CARETAKER	2026-06-23 10:50:04.829142
6	9876500005	\N	CARETAKER	2026-06-23 10:50:04.829142
7	9988776601	\N	RESIDENT	2026-06-23 10:50:04.829142
8	9988776602	\N	RESIDENT	2026-06-23 10:50:04.829142
9	9988776603	\N	RESIDENT	2026-06-23 10:50:04.829142
10	9988776604	\N	RESIDENT	2026-06-23 10:50:04.829142
11	9988776605	\N	RESIDENT	2026-06-23 10:50:04.829142
1	secretary@urbansync.com	$2a$10$soS2TruOOrkOnbdU7akelet1SEpvRyIxmuXs6FlHEIDuA/G5eiwjC	SECRETARY	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5112 (class 0 OID 16935)
-- Dependencies: 227
-- Data for Name: flats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flats (id, wing_id, flat_number, owner_id, current_tenant_id, created_at) FROM stdin;
1	1	101	1	\N	2026-06-23 10:50:04.829142
2	2	202	2	\N	2026-06-23 10:50:04.829142
3	3	303	3	\N	2026-06-23 10:50:04.829142
4	1	102	1	4	2026-06-23 10:50:04.829142
5	2	203	2	5	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5118 (class 0 OID 16995)
-- Dependencies: 233
-- Data for Name: global_maintenance_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_maintenance_settings (id, monthly_amount, late_fee_per_day, validity_days, updated_by, updated_at) FROM stdin;
1	1500.00	50.00	10	1	2026-06-23 10:50:04.829142
2	1600.00	50.00	10	1	2026-06-23 10:50:04.829142
3	1700.00	50.00	10	1	2026-06-23 10:50:04.829142
4	1800.00	50.00	10	1	2026-06-23 10:50:04.829142
5	2000.00	50.00	10	1	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5120 (class 0 OID 17010)
-- Dependencies: 235
-- Data for Name: maintenance_bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_bills (id, flat_id, billing_month, base_amount, penalty_amount, total_amount, status, due_date, paid_date, created_at) FROM stdin;
2	2	2026-06-01	2000.00	0.00	2000.00	PENDING	2026-06-10	\N	2026-06-23 10:50:04.829142
3	3	2026-06-01	2000.00	0.00	2000.00	PENDING	2026-06-10	\N	2026-06-23 10:50:04.829142
1	1	2026-06-01	2000.00	0.00	2000.00	PAID	2026-06-10	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
4	4	2026-06-01	2000.00	0.00	2000.00	PAID	2026-06-10	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
5	5	2026-06-01	2000.00	0.00	2000.00	PAID	2026-06-10	2026-06-23 10:50:04.829142	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5122 (class 0 OID 17028)
-- Dependencies: 237
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, bill_id, razorpay_order_id, razorpay_payment_id, amount_paid, status, created_at) FROM stdin;
2	2	order_002	\N	2000.00	CREATED	2026-06-23 10:50:04.829142
3	3	order_003	\N	2000.00	CREATED	2026-06-23 10:50:04.829142
1	1	order_001	pay_001	2000.00	SUCCESS	2026-06-23 10:50:04.829142
4	4	order_004	pay_004	2000.00	SUCCESS	2026-06-23 10:50:04.829142
5	5	order_005	pay_005	2000.00	SUCCESS	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5116 (class 0 OID 16973)
-- Dependencies: 231
-- Data for Name: permission_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission_requests (id, resident_id, flat_id, subject, description, request_date, status, rejection_reason, created_at) FROM stdin;
1	1	1	Balcony Renovation	Requesting permission to install safety nets in balcony.	2026-07-01	PENDING	\N	2026-06-23 10:50:04.829142
2	2	2	Pet Permission	Requesting permission to keep a dog.	2026-07-02	APPROVED	\N	2026-06-23 10:50:04.829142
3	3	3	Tenant Move-In	Requesting permission for shifting truck on Sunday.	2026-07-03	APPROVED	\N	2026-06-23 10:50:04.829142
4	4	4	AC Installation	Requesting permission to mount AC unit.	2026-07-04	REJECTED	Cannot drill on facade.	2026-06-23 10:50:04.829142
5	5	5	Late Night Party	Requesting permission for a birthday party up to 11 PM.	2026-07-05	PENDING	\N	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5132 (class 0 OID 17118)
-- Dependencies: 247
-- Data for Name: property_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_posts (id, flat_id, owner_name, contact_number, post_type, furnishing_type, availability_date, status, created_at) FROM stdin;
1	1	Amit Sharma	9988776601	RENT	FULLY_FURNISHED	2026-07-01	ACTIVE	2026-06-23 10:50:04.829142
2	2	Priya Nair	9988776602	SELL	SEMI_FURNISHED	2026-08-01	ACTIVE	2026-06-23 10:50:04.829142
3	3	John Doe	9988776603	RENT	UNFURNISHED	2026-07-15	ACTIVE	2026-06-23 10:50:04.829142
4	4	Amit Sharma	9988776601	SELL	FULLY_FURNISHED	2026-09-01	ACTIVE	2026-06-23 10:50:04.829142
5	5	Priya Nair	9988776602	RENT	SEMI_FURNISHED	2026-07-10	RENTED_OUT	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5114 (class 0 OID 16960)
-- Dependencies: 229
-- Data for Name: registration_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registration_requests (id, resident_type, first_name, last_name, wing_name, flat_number, mobile_number, aadhaar_last_four, landlord_name, landlord_flat_number, landlord_mobile_number, status, rejection_reason, created_at) FROM stdin;
1	OWNER	Vicky	Kaushal	A	304	9999988881	1111	\N	\N	\N	PENDING	\N	2026-06-23 10:50:04.829142
2	OWNER	Katrina	Kaif	B	405	9999988882	2222	\N	\N	\N	APPROVED	\N	2026-06-23 10:50:04.829142
3	TENANT	Deepika	Padukone	C	506	9999988883	3333	Ranveer Singh	C-506	9999977771	PENDING	\N	2026-06-23 10:50:04.829142
4	TENANT	Alia	Bhatt	D	607	9999988884	4444	Ranbir Kapoor	D-607	9999977772	REJECTED	Landlord contact mismatch	2026-06-23 10:50:04.829142
5	OWNER	Sid	Malhotra	E	708	9999988885	5555	\N	\N	\N	PENDING	\N	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5110 (class 0 OID 16912)
-- Dependencies: 225
-- Data for Name: resident_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resident_profiles (id, credential_id, resident_type, first_name, last_name, mobile_number, aadhaar_last_four, landlord_id, status, created_at) FROM stdin;
1	7	OWNER	Amit	Sharma	9988776601	1234	\N	ACTIVE	2026-06-23 10:50:04.829142
2	8	OWNER	Priya	Nair	9988776602	5678	\N	ACTIVE	2026-06-23 10:50:04.829142
3	9	OWNER	John	Doe	9988776603	9012	\N	ACTIVE	2026-06-23 10:50:04.829142
4	10	TENANT	Ravi	Patel	9988776604	3456	1	ACTIVE	2026-06-23 10:50:04.829142
5	11	TENANT	Suman	Sen	9988776605	7890	2	ACTIVE	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5105 (class 0 OID 16866)
-- Dependencies: 220
-- Data for Name: secretary_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secretary_profiles (id, credential_id, first_name, last_name, flat_no, mobile_number, email, bank_name, account_number, ifsc_code, created_at) FROM stdin;
1	1	Ramesh	Sharma	A-501	9876510001	secretary@urbansync.com	SBI	1111111111	SBIN0000001	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5124 (class 0 OID 17047)
-- Dependencies: 239
-- Data for Name: society_funds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.society_funds (id, balance, last_updated) FROM stdin;
2	100000.00	2026-06-23 10:50:04.829142
3	25000.00	2026-06-23 10:50:04.829142
4	10000.00	2026-06-23 10:50:04.829142
5	5000.00	2026-06-23 10:50:04.829142
1	56000.00	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5101 (class 0 OID 16844)
-- Dependencies: 216
-- Data for Name: wings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wings (id, wing_name, created_at) FROM stdin;
1	A	2026-06-23 10:50:04.829142
2	B	2026-06-23 10:50:04.829142
3	C	2026-06-23 10:50:04.829142
4	D	2026-06-23 10:50:04.829142
5	E	2026-06-23 10:50:04.829142
\.


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 244
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 5, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 242
-- Name: caretaker_issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caretaker_issues_id_seq', 5, true);


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 221
-- Name: caretaker_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caretaker_profiles_id_seq', 5, true);


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 222
-- Name: caretaker_profiles_serial_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caretaker_profiles_serial_number_seq', 5, true);


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 240
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaints_id_seq', 5, true);


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 217
-- Name: credentials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credentials_id_seq', 11, true);


--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 226
-- Name: flats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.flats_id_seq', 5, true);


--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 232
-- Name: global_maintenance_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.global_maintenance_settings_id_seq', 5, true);


--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 234
-- Name: maintenance_bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_bills_id_seq', 5, true);


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 236
-- Name: payment_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_transactions_id_seq', 5, true);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 230
-- Name: permission_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permission_requests_id_seq', 5, true);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 246
-- Name: property_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.property_posts_id_seq', 5, true);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 228
-- Name: registration_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registration_requests_id_seq', 5, true);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 224
-- Name: resident_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resident_profiles_id_seq', 5, true);


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 219
-- Name: secretary_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secretary_profiles_id_seq', 1, true);


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 238
-- Name: society_funds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.society_funds_id_seq', 5, true);


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 215
-- Name: wings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wings_id_seq', 5, true);


--
-- TOC entry 4935 (class 2606 OID 17116)
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 17095)
-- Name: caretaker_issues caretaker_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_issues
    ADD CONSTRAINT caretaker_issues_pkey PRIMARY KEY (id);


--
-- TOC entry 4895 (class 2606 OID 16905)
-- Name: caretaker_profiles caretaker_profiles_aadhaar_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles
    ADD CONSTRAINT caretaker_profiles_aadhaar_number_key UNIQUE (aadhaar_number);


--
-- TOC entry 4897 (class 2606 OID 16899)
-- Name: caretaker_profiles caretaker_profiles_credential_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles
    ADD CONSTRAINT caretaker_profiles_credential_id_key UNIQUE (credential_id);


--
-- TOC entry 4899 (class 2606 OID 16903)
-- Name: caretaker_profiles caretaker_profiles_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles
    ADD CONSTRAINT caretaker_profiles_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 4901 (class 2606 OID 16897)
-- Name: caretaker_profiles caretaker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles
    ADD CONSTRAINT caretaker_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4903 (class 2606 OID 16901)
-- Name: caretaker_profiles caretaker_profiles_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles
    ADD CONSTRAINT caretaker_profiles_serial_number_key UNIQUE (serial_number);


--
-- TOC entry 4931 (class 2606 OID 17067)
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 16863)
-- Name: credentials credentials_login_identifier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_login_identifier_key UNIQUE (login_identifier);


--
-- TOC entry 4884 (class 2606 OID 16861)
-- Name: credentials credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 16941)
-- Name: flats flats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 17003)
-- Name: global_maintenance_settings global_maintenance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_maintenance_settings
    ADD CONSTRAINT global_maintenance_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 17019)
-- Name: maintenance_bills maintenance_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_bills
    ADD CONSTRAINT maintenance_bills_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 17036)
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 17038)
-- Name: payment_transactions payment_transactions_razorpay_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_razorpay_order_id_key UNIQUE (razorpay_order_id);


--
-- TOC entry 4927 (class 2606 OID 17040)
-- Name: payment_transactions payment_transactions_razorpay_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_razorpay_payment_id_key UNIQUE (razorpay_payment_id);


--
-- TOC entry 4915 (class 2606 OID 16983)
-- Name: permission_requests permission_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_requests
    ADD CONSTRAINT permission_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 17128)
-- Name: property_posts property_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_posts
    ADD CONSTRAINT property_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 16971)
-- Name: registration_requests registration_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration_requests
    ADD CONSTRAINT registration_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4905 (class 2606 OID 16923)
-- Name: resident_profiles resident_profiles_credential_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resident_profiles
    ADD CONSTRAINT resident_profiles_credential_id_key UNIQUE (credential_id);


--
-- TOC entry 4907 (class 2606 OID 16921)
-- Name: resident_profiles resident_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resident_profiles
    ADD CONSTRAINT resident_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 16874)
-- Name: secretary_profiles secretary_profiles_credential_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_profiles
    ADD CONSTRAINT secretary_profiles_credential_id_key UNIQUE (credential_id);


--
-- TOC entry 4889 (class 2606 OID 16878)
-- Name: secretary_profiles secretary_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_profiles
    ADD CONSTRAINT secretary_profiles_email_key UNIQUE (email);


--
-- TOC entry 4891 (class 2606 OID 16876)
-- Name: secretary_profiles secretary_profiles_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_profiles
    ADD CONSTRAINT secretary_profiles_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 4893 (class 2606 OID 16872)
-- Name: secretary_profiles secretary_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_profiles
    ADD CONSTRAINT secretary_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 17054)
-- Name: society_funds society_funds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.society_funds
    ADD CONSTRAINT society_funds_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 17021)
-- Name: maintenance_bills unique_flat_billing_month; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_bills
    ADD CONSTRAINT unique_flat_billing_month UNIQUE (flat_id, billing_month);


--
-- TOC entry 4911 (class 2606 OID 16943)
-- Name: flats unique_wing_flat; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT unique_wing_flat UNIQUE (wing_id, flat_number);


--
-- TOC entry 4878 (class 2606 OID 16850)
-- Name: wings wings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wings
    ADD CONSTRAINT wings_pkey PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 16852)
-- Name: wings wings_wing_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wings
    ADD CONSTRAINT wings_wing_name_key UNIQUE (wing_name);


--
-- TOC entry 4885 (class 1259 OID 16864)
-- Name: unique_secretary_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_secretary_role ON public.credentials USING btree (role) WHERE ((role)::text = 'SECRETARY'::text);


--
-- TOC entry 4956 (class 2620 OID 17134)
-- Name: payment_transactions trg_payment_success; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_success AFTER UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION public.update_society_fund_balance();


--
-- TOC entry 4953 (class 2606 OID 17101)
-- Name: caretaker_issues caretaker_issues_assigned_caretaker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_issues
    ADD CONSTRAINT caretaker_issues_assigned_caretaker_id_fkey FOREIGN KEY (assigned_caretaker_id) REFERENCES public.caretaker_profiles(id) ON DELETE RESTRICT;


--
-- TOC entry 4954 (class 2606 OID 17096)
-- Name: caretaker_issues caretaker_issues_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_issues
    ADD CONSTRAINT caretaker_issues_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE SET NULL;


--
-- TOC entry 4939 (class 2606 OID 16906)
-- Name: caretaker_profiles caretaker_profiles_credential_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caretaker_profiles
    ADD CONSTRAINT caretaker_profiles_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE CASCADE;


--
-- TOC entry 4950 (class 2606 OID 17068)
-- Name: complaints complaints_raised_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_raised_by_id_fkey FOREIGN KEY (raised_by_id) REFERENCES public.credentials(id) ON DELETE CASCADE;


--
-- TOC entry 4951 (class 2606 OID 17078)
-- Name: complaints complaints_target_resident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_target_resident_id_fkey FOREIGN KEY (target_resident_id) REFERENCES public.resident_profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4952 (class 2606 OID 17073)
-- Name: complaints complaints_target_wing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_target_wing_id_fkey FOREIGN KEY (target_wing_id) REFERENCES public.wings(id) ON DELETE SET NULL;


--
-- TOC entry 4942 (class 2606 OID 16954)
-- Name: flats flats_current_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_current_tenant_id_fkey FOREIGN KEY (current_tenant_id) REFERENCES public.resident_profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4943 (class 2606 OID 16949)
-- Name: flats flats_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.resident_profiles(id) ON DELETE RESTRICT;


--
-- TOC entry 4944 (class 2606 OID 16944)
-- Name: flats flats_wing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_wing_id_fkey FOREIGN KEY (wing_id) REFERENCES public.wings(id) ON DELETE RESTRICT;


--
-- TOC entry 4947 (class 2606 OID 17004)
-- Name: global_maintenance_settings global_maintenance_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_maintenance_settings
    ADD CONSTRAINT global_maintenance_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.secretary_profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4948 (class 2606 OID 17022)
-- Name: maintenance_bills maintenance_bills_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_bills
    ADD CONSTRAINT maintenance_bills_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id) ON DELETE RESTRICT;


--
-- TOC entry 4949 (class 2606 OID 17041)
-- Name: payment_transactions payment_transactions_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.maintenance_bills(id) ON DELETE RESTRICT;


--
-- TOC entry 4945 (class 2606 OID 16989)
-- Name: permission_requests permission_requests_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_requests
    ADD CONSTRAINT permission_requests_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id) ON DELETE CASCADE;


--
-- TOC entry 4946 (class 2606 OID 16984)
-- Name: permission_requests permission_requests_resident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_requests
    ADD CONSTRAINT permission_requests_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.resident_profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4955 (class 2606 OID 17129)
-- Name: property_posts property_posts_flat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_posts
    ADD CONSTRAINT property_posts_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(id) ON DELETE CASCADE;


--
-- TOC entry 4940 (class 2606 OID 16924)
-- Name: resident_profiles resident_profiles_credential_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resident_profiles
    ADD CONSTRAINT resident_profiles_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE SET NULL;


--
-- TOC entry 4941 (class 2606 OID 16929)
-- Name: resident_profiles resident_profiles_landlord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resident_profiles
    ADD CONSTRAINT resident_profiles_landlord_id_fkey FOREIGN KEY (landlord_id) REFERENCES public.resident_profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4938 (class 2606 OID 16879)
-- Name: secretary_profiles secretary_profiles_credential_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_profiles
    ADD CONSTRAINT secretary_profiles_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE CASCADE;


--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO urbansync_user;


--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 248
-- Name: FUNCTION update_society_fund_balance(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_society_fund_balance() TO urbansync_user;


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 245
-- Name: TABLE announcements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.announcements TO urbansync_user;


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 244
-- Name: SEQUENCE announcements_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.announcements_id_seq TO urbansync_user;


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE caretaker_issues; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.caretaker_issues TO urbansync_user;


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 242
-- Name: SEQUENCE caretaker_issues_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.caretaker_issues_id_seq TO urbansync_user;


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE caretaker_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.caretaker_profiles TO urbansync_user;


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 221
-- Name: SEQUENCE caretaker_profiles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.caretaker_profiles_id_seq TO urbansync_user;


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 222
-- Name: SEQUENCE caretaker_profiles_serial_number_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.caretaker_profiles_serial_number_seq TO urbansync_user;


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 241
-- Name: TABLE complaints; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.complaints TO urbansync_user;


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 240
-- Name: SEQUENCE complaints_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.complaints_id_seq TO urbansync_user;


--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE credentials; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.credentials TO urbansync_user;


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 217
-- Name: SEQUENCE credentials_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.credentials_id_seq TO urbansync_user;


--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE flats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.flats TO urbansync_user;


--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 226
-- Name: SEQUENCE flats_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.flats_id_seq TO urbansync_user;


--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE global_maintenance_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.global_maintenance_settings TO urbansync_user;


--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 232
-- Name: SEQUENCE global_maintenance_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.global_maintenance_settings_id_seq TO urbansync_user;


--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE maintenance_bills; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.maintenance_bills TO urbansync_user;


--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 234
-- Name: SEQUENCE maintenance_bills_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.maintenance_bills_id_seq TO urbansync_user;


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE payment_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_transactions TO urbansync_user;


--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 236
-- Name: SEQUENCE payment_transactions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payment_transactions_id_seq TO urbansync_user;


--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE permission_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.permission_requests TO urbansync_user;


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 230
-- Name: SEQUENCE permission_requests_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.permission_requests_id_seq TO urbansync_user;


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE property_posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.property_posts TO urbansync_user;


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 246
-- Name: SEQUENCE property_posts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.property_posts_id_seq TO urbansync_user;


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE registration_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.registration_requests TO urbansync_user;


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 228
-- Name: SEQUENCE registration_requests_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.registration_requests_id_seq TO urbansync_user;


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE resident_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.resident_profiles TO urbansync_user;


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE resident_profiles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.resident_profiles_id_seq TO urbansync_user;


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE secretary_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.secretary_profiles TO urbansync_user;


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 219
-- Name: SEQUENCE secretary_profiles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.secretary_profiles_id_seq TO urbansync_user;


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE society_funds; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.society_funds TO urbansync_user;


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 238
-- Name: SEQUENCE society_funds_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.society_funds_id_seq TO urbansync_user;


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 216
-- Name: TABLE wings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wings TO urbansync_user;


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 215
-- Name: SEQUENCE wings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.wings_id_seq TO urbansync_user;


--
-- TOC entry 2116 (class 826 OID 16423)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO urbansync_user;


--
-- TOC entry 2115 (class 826 OID 16422)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO urbansync_user;


-- Completed on 2026-07-06 12:07:24

--
-- PostgreSQL database dump complete
--

\unrestrict Kj50Wzc3DEQQEDQDUUlRFQUAteHHojOgkC5auqrvLJYian2mNvP8j4OnYUi93PU

