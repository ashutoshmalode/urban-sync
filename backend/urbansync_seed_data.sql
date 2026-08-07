-- ============================================================
-- UrbanSync Society Management System
-- Complete Seed Data — August 2026
-- Run this after urbansync_schema_final.sql
-- ============================================================

-- Disable triggers temporarily for clean insert
SET session_replication_role = replica;

-- ============================================================
-- 1. WINGS
-- ============================================================
INSERT INTO wings (id, name, created_at) VALUES
(1, 'A', '2026-08-02 11:55:06.609684'),
(2, 'B', '2026-08-02 11:55:06.609684'),
(3, 'C', '2026-08-02 11:55:06.609684'),
(4, 'D', '2026-08-02 11:55:06.609684'),
(5, 'E', '2026-08-02 11:55:06.609684');

SELECT setval('wings_id_seq', (SELECT MAX(id) FROM wings));

-- ============================================================
-- 2. CREDENTIALS
-- ============================================================
INSERT INTO credentials (id, login_identifier, password_hash, role, created_at) VALUES
(1,  'secretary@urbansync.com', '$2b$10$c0M4En.MuQWsZzb4UBfvGuk5zVaKweu5I1fCJvrEPKWJgWykqt4yK', 'SECRETARY', '2026-08-02 11:55:06.609684'),
(2,  '9111111101', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(3,  '9111111102', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(4,  '9111111103', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(5,  '9111111104', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(6,  '9111111105', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(7,  '9111111106', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(8,  '9111111107', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(9,  '9111111108', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(10, '9111111109', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(11, '9111111110', NULL, 'RESIDENT',  '2026-08-02 11:55:06.609684'),
(12, '9001234501', NULL, 'CARETAKER', '2026-08-02 11:55:06.609684'),
(13, '9001234502', NULL, 'CARETAKER', '2026-08-02 11:55:06.609684'),
(14, '9001234503', NULL, 'CARETAKER', '2026-08-02 11:55:06.609684'),
(16, '9005005001', NULL, 'CARETAKER', '2026-08-03 02:26:46.566197'),
(17, '9005005002', NULL, 'CARETAKER', '2026-08-03 02:33:16.153715'),
(18, '9327972376', NULL, 'CARETAKER', '2026-08-03 02:44:13.823817'),
(19, '9276217954', NULL, 'CARETAKER', '2026-08-03 02:45:21.597744'),
(20, '9032786723', NULL, 'CARETAKER', '2026-08-03 03:02:03.503639'),
(21, '9005005190', NULL, 'CARETAKER', '2026-08-04 17:01:04.955559'),
(31, '7057300643', NULL, 'RESIDENT',  '2026-08-05 14:46:36.746669'),
(32, '8669716459', NULL, 'RESIDENT',  '2026-08-05 14:46:36.746669'),
(33, '8459527070', NULL, 'RESIDENT',  '2026-08-05 14:46:36.746669'),
(34, '8180911479', NULL, 'RESIDENT',  '2026-08-05 14:46:36.746669'),
(35, '7065806374', NULL, 'RESIDENT',  '2026-08-05 14:46:36.746669'),
(36, '7999164403', NULL, 'RESIDENT',  '2026-08-05 14:46:36.746669'),
(37, '8077167432', NULL, 'RESIDENT',  '2026-08-05 14:46:36.746669'),
(38, '9618816817', NULL, 'CARETAKER', '2026-08-05 17:41:08.335843'),
(39, '8407996269', NULL, 'CARETAKER', '2026-08-05 17:41:08.335843'),
(40, '8669715459', NULL, 'CARETAKER', '2026-08-06 19:12:26.371543');

SELECT setval('credentials_id_seq', (SELECT MAX(id) FROM credentials));

-- ============================================================
-- 3. SECRETARY PROFILE
-- ============================================================
INSERT INTO secretary_profiles (id, first_name, last_name, email, mobile_number, flat_number, bank_name, account_number, ifsc_code, wing_id, created_at) VALUES
(1, 'Ashutosh', 'Malode', 'secretary@urbansync.com', '9876543210', 'A-101', 'SBI', '1234567890', 'SBIN0001234', 1, '2026-08-02 11:55:06.609684');

SELECT setval('secretary_profiles_id_seq', 1);

-- ============================================================
-- 4. RESIDENT PROFILES
-- ============================================================
INSERT INTO resident_profiles (id, first_name, last_name, mobile_number, aadhaar_last_four, resident_type, flat_number, landlord_id, status, credential_id, created_at) VALUES
(1,  'Rahul',             'Sharma',   '9111111101', '1234', 'OWNER',  'A-201', NULL, 'ACTIVE', 2,  '2026-08-02 11:55:06.609684'),
(2,  'Priya',             'Verma',    '9111111102', '5678', 'TENANT', 'B-301', NULL, 'ACTIVE', 3,  '2026-08-02 11:55:06.609684'),
(3,  'Amit',              'Patel',    '9111111103', '9012', 'OWNER',  'C-401', NULL, 'ACTIVE', 4,  '2026-08-02 11:55:06.609684'),
(4,  'Sneha',             'Joshi',    '9111111104', '3456', 'OWNER',  'D-501', NULL, 'ACTIVE', 5,  '2026-08-02 11:55:06.609684'),
(5,  'Vikram',            'Singh',    '9111111105', '7890', 'OWNER',  'E-601', NULL, 'ACTIVE', 6,  '2026-08-02 11:55:06.609684'),
(6,  'Ananya',            'Gupta',    '9111111106', '2345', 'OWNER',  'A-202', NULL, 'ACTIVE', 7,  '2026-08-02 11:55:06.609684'),
(7,  'Ravi',              'Patil',    '9111111107', '6789', 'OWNER',  'B-302', NULL, 'ACTIVE', 8,  '2026-08-02 11:55:06.609684'),
(8,  'Meena',             'Nair',     '9111111108', '0123', 'TENANT', 'C-402', NULL, 'ACTIVE', 9,  '2026-08-02 11:55:06.609684'),
(9,  'Suresh',            'Iyer',     '9111111109', '4567', 'OWNER',  'D-502', NULL, 'ACTIVE', 10, '2026-08-02 11:55:06.609684'),
(10, 'Deepak',            'Tiwari',   '9111111110', '8901', 'OWNER',  'E-602', NULL, 'ACTIVE', 11, '2026-08-02 11:55:06.609684'),
(18, 'Ashutosh',          'Malode',   '7057300643', '0001', 'OWNER',  'A-150', NULL, 'ACTIVE', 31, '2026-08-05 14:46:36.746669'),
(19, 'Ashutosh Namdevrao','Malode',   '8669716459', '0002', 'OWNER',  'A-151', NULL, 'ACTIVE', 32, '2026-08-05 14:46:36.746669'),
(20, 'Onkar',             'Mutkiri',  '8459527070', '0003', 'TENANT', 'A-152', 18,   'ACTIVE', 33, '2026-08-05 14:46:36.746669'),
(21, 'Mahesh',            'Bijjargi', '8180911479', '0004', 'TENANT', 'A-153', 18,   'ACTIVE', 34, '2026-08-05 14:46:36.746669'),
(22, 'Mahtab',            'Ali',      '7065806374', '0005', 'TENANT', 'A-154', 19,   'ACTIVE', 35, '2026-08-05 14:46:36.746669'),
(23, 'Sanskar',           'Soni',     '7999164403', '0006', 'TENANT', 'A-154', 19,   'ACTIVE', 36, '2026-08-05 14:46:36.746669'),
(24, 'Anshika',           'Pandey',   '8077167432', '0007', 'TENANT', 'A-155', 19,   'ACTIVE', 37, '2026-08-05 14:46:36.746669'),
(25, 'Ashutosh',          'Malode',   '7057300643', '0987', 'OWNER',  'A-250', NULL, 'ACTIVE', 31, '2026-08-05 19:02:32.48326');

SELECT setval('resident_profiles_id_seq', (SELECT MAX(id) FROM resident_profiles));

-- ============================================================
-- 5. CARETAKER PROFILES
-- ============================================================
INSERT INTO caretaker_profiles (id, first_name, last_name, mobile_number, age, aadhaar_number, permanent_address, serial_number, status, leaving_reason, left_at, credential_id, created_at, photo_url) VALUES
(1,  'Ramesh', 'Kumar',     '9001234501', 35, '123456789001', 'Village Nagpur, Maharashtra',     1,  'ACTIVE',   NULL, NULL, 12, '2026-08-02 11:55:06.609684', NULL),
(2,  'Suresh', 'Yadav',     '9001234502', 40, '123456789002', 'Village Pune, Maharashtra',       2,  'ACTIVE',   NULL, NULL, 13, '2026-08-02 11:55:06.609684', NULL),
(3,  'Ganesh', 'Pawar',     '9001234503', 28, '123456789003', 'Village Nashik, Maharashtra',     3,  'INACTIVE', 'Contract ended', '2026-08-05 14:44:41.077212', 14, '2026-08-02 11:55:06.609684', NULL),
(5,  'Rajesh', 'Sharma',    '9005005001', 32, '123456789099', 'Village Aurangabad, Maharashtra', 4,  'ACTIVE',   NULL, NULL, 16, '2026-08-03 02:26:46.632451', NULL),
(6,  'Jayesh', 'Sharma',    '9005005002', 32, '123456789000', 'Village Aurangabad, Maharashtra', 5,  'ACTIVE',   NULL, NULL, 17, '2026-08-03 02:33:16.222763', 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/caretakers/test.jpg'),
(7,  'Vikram', 'Rathod',    '9327972376', 23, '832623773879', 'Mumbai',                          6,  'ACTIVE',   NULL, NULL, 18, '2026-08-03 02:44:13.828902', NULL),
(8,  'Vikas',  'Singh',     '9276217954', 32, '957627834948', 'Kolakata',                        7,  'ACTIVE',   NULL, NULL, 19, '2026-08-03 02:45:21.600761', 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785705315/urbansync/caretakers/i6vlxtinld5rhwvtvgzz.jpg'),
(9,  'Ranu',   'Sharma',    '9032786723', 34, '746832898929', 'Chennai',                         8,  'ACTIVE',   NULL, NULL, 20, '2026-08-03 03:02:03.510655', 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785706320/urbansync/caretakers/bloonlj7d37szlnwklao.jpg'),
(10, 'Jitesh', 'Sharma',    '9005005190', 32, '123456789900', 'Village Aurangabad, Maharashtra', 9,  'ACTIVE',   NULL, NULL, 21, '2026-08-04 17:01:04.962687', 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/caretakers/test.jpg'),
(12, 'Rohit',  'Sriramoju', '9618816817', 24, '000000000008', 'Hyderabad, Telangana',            10, 'ACTIVE',   NULL, NULL, 38, '2026-08-05 14:44:41.077212', NULL),
(13, 'Aditya', 'Ingle',     '8407996269', 23, '000000000009', 'Nagpur, Maharashtra',             11, 'ACTIVE',   NULL, NULL, 39, '2026-08-05 14:44:41.077212', NULL),
(14, 'Maya',   'Dollas',    '8669715459', 27, '123456789012', 'Nanded Maharashtra',              12, 'ACTIVE',   NULL, NULL, 40, '2026-08-06 19:12:26.475859', 'https://res.cloudinary.com/dvr0ib995/image/upload/v1786023743/urbansync/caretakers/qlclnnsboh3ukzhnthku.jpg'),
(15, 'Ram',    'Das',       '8669716459', 27, '098765432109', 'Hyderabad',                       13, 'ACTIVE',   NULL, NULL, 32, '2026-08-06 19:15:38.488721', 'https://res.cloudinary.com/dvr0ib995/image/upload/v1786023935/urbansync/caretakers/p0yhq5rxih2kl76pfch8.jpg');

SELECT setval('caretaker_profiles_id_seq', (SELECT MAX(id) FROM caretaker_profiles));

-- ============================================================
-- 6. FLATS
-- ============================================================
INSERT INTO flats (id, flat_number, wing_id, owner_id, current_tenant_id, created_at) VALUES
(1,  'A-201', 1, 1,    NULL, '2026-08-02 11:55:06.609684'),
(2,  'B-301', 2, 1,    2,    '2026-08-02 11:55:06.609684'),
(3,  'C-401', 3, 3,    NULL, '2026-08-02 11:55:06.609684'),
(4,  'D-501', 4, 4,    NULL, '2026-08-02 11:55:06.609684'),
(5,  'E-601', 5, 5,    NULL, '2026-08-02 11:55:06.609684'),
(6,  'A-202', 1, 6,    NULL, '2026-08-02 11:55:06.609684'),
(7,  'B-302', 2, 7,    NULL, '2026-08-02 11:55:06.609684'),
(8,  'C-402', 3, 3,    8,    '2026-08-02 11:55:06.609684'),
(9,  'D-502', 4, 9,    NULL, '2026-08-02 11:55:06.609684'),
(10, 'E-602', 5, 10,   NULL, '2026-08-02 11:55:06.609684'),
(11, 'A-777', 1, NULL, NULL, '2026-08-02 13:16:39.576062'),
(18, 'A-150', 1, 18,   NULL, '2026-08-05 14:46:36.746669'),
(19, 'A-151', 1, 19,   NULL, '2026-08-05 14:46:36.746669'),
(20, 'A-152', 1, 18,   20,   '2026-08-05 14:46:36.746669'),
(21, 'A-153', 1, 18,   21,   '2026-08-05 14:46:36.746669'),
(22, 'A-154', 1, 19,   22,   '2026-08-05 14:46:36.746669'),
(23, 'A-155', 1, 19,   23,   '2026-08-05 14:46:36.746669');

SELECT setval('flats_id_seq', (SELECT MAX(id) FROM flats));

-- ============================================================
-- 7. REGISTRATION REQUESTS
-- ============================================================
INSERT INTO registration_requests (id, first_name, last_name, mobile_number, aadhaar_last_four, resident_type, wing_name, flat_number, status, rejection_reason, created_at) VALUES
(1,  'Karan',     'Mehta',   '9222222201', '1111', 'OWNER',  'A', 'A-203', 'PENDING',  NULL,                       '2026-08-02 11:55:06.609684'),
(2,  'Deepa',     'Nair',    '9222222202', '2222', 'OWNER',  'B', 'B-303', 'PENDING',  NULL,                       '2026-08-02 11:55:06.609684'),
(3,  'Rohit',     'Gupta',   '9222222203', '3333', 'OWNER',  'C', 'C-403', 'APPROVED', NULL,                       '2026-08-02 11:55:06.609684'),
(4,  'Pooja',     'Iyer',    '9222222204', '4444', 'OWNER',  'D', 'D-503', 'REJECTED', NULL,                       '2026-08-02 11:55:06.609684'),
(5,  'Manish',    'Tiwari',  '9222222205', '5555', 'OWNER',  'E', 'E-603', 'APPROVED', NULL,                       '2026-08-02 11:55:06.609684'),
(6,  'Pradeep',   'Sharma',  '9222222206', '6666', 'OWNER',  'A', 'A-204', 'PENDING',  NULL,                       '2026-08-02 11:55:06.609684'),
(7,  'Kavita',    'Singh',   '9222222207', '7777', 'OWNER',  'B', 'B-304', 'PENDING',  NULL,                       '2026-08-02 11:55:06.609684'),
(8,  'Arun',      'Patel',   '9222222208', '8888', 'OWNER',  'C', 'C-404', 'REJECTED', NULL,                       '2026-08-02 11:55:06.609684'),
(9,  'Sunita',    'Joshi',   '9222222209', '9999', 'OWNER',  'D', 'D-504', 'APPROVED', NULL,                       '2026-08-02 11:55:06.609684'),
(10, 'Rajan',     'Kumar',   '9222222210', '0000', 'OWNER',  'E', 'E-604', 'PENDING',  NULL,                       '2026-08-02 11:55:06.609684'),
(11, 'Neha',      'Gupta',   '9222222211', '1122', 'TENANT', 'A', 'A-201', 'REJECTED', NULL,                       '2026-08-02 11:55:06.609684'),
(12, 'Sanjay',    'Verma',   '9222222212', '3344', 'OWNER',  'B', 'B-305', 'PENDING',  NULL,                       '2026-08-02 11:55:06.609684'),
(13, 'Ashutosh',  'Malode',  '7057300643', '0987', 'OWNER',  'A', 'A-250', 'APPROVED', NULL,                       '2026-08-05 19:02:15.341399');

SELECT setval('registration_requests_id_seq', (SELECT MAX(id) FROM registration_requests));

-- ============================================================
-- 8. PROPERTY POSTS
-- ============================================================
INSERT INTO property_posts (id, flat_id, owner_name, contact_number, listing_type, furnishing_status, availability_date, is_active, created_at) VALUES
(1,  1,  'Rahul Sharma', '9111111101', 'RENT', 'FULLY_FURNISHED',  '2026-08-01', true,  '2026-08-02 11:55:06.609684'),
(2,  2,  'Rahul Sharma', '9111111101', 'RENT', 'SEMI_FURNISHED',   '2026-08-15', true,  '2026-08-02 11:55:06.609684'),
(3,  3,  'Amit Patel',   '9111111103', 'SALE', 'NON_FURNISHED',    '2026-09-01', true,  '2026-08-02 11:55:06.609684'),
(4,  4,  'Sneha Joshi',  '9111111104', 'RENT', 'FULLY_FURNISHED',  '2026-08-10', false, '2026-08-02 11:55:06.609684'),
(5,  5,  'Vikram Singh', '9111111105', 'SALE', 'SEMI_FURNISHED',   '2026-10-01', true,  '2026-08-02 11:55:06.609684'),
(6,  6,  'Ananya Gupta', '9111111106', 'RENT', 'FULLY_FURNISHED',  '2026-08-20', true,  '2026-08-02 11:55:06.609684'),
(7,  7,  'Ravi Patil',   '9111111107', 'RENT', 'NON_FURNISHED',    '2026-09-15', true,  '2026-08-02 11:55:06.609684'),
(8,  8,  'Amit Patel',   '9111111103', 'RENT', 'SEMI_FURNISHED',   '2026-08-05', false, '2026-08-02 11:55:06.609684'),
(9,  9,  'Suresh Iyer',  '9111111109', 'SALE', 'FULLY_FURNISHED',  '2026-11-01', true,  '2026-08-02 11:55:06.609684'),
(10, 10, 'Deepak Tiwari','9111111110', 'RENT', 'NON_FURNISHED',    '2026-09-30', true,  '2026-08-02 11:55:06.609684');

SELECT setval('property_posts_id_seq', (SELECT MAX(id) FROM property_posts));

-- ============================================================
-- 9. PROPERTY POST IMAGES
-- ============================================================
INSERT INTO property_post_images (id, post_id, image_url, created_at) VALUES
(1,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img1.jpg', '2026-08-03 18:52:13.135332'),
(2,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img2.jpg', '2026-08-03 18:52:13.135332'),
(3,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img3.jpg', '2026-08-03 18:52:13.135332'),
(4,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img4.jpg', '2026-08-03 18:52:13.135332'),
(5,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img5.jpg', '2026-08-03 18:52:13.135332'),
(6,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764319/urbansync/property/ep02vauamsv2ivmihvfs.jpg', '2026-08-03 19:08:42.103218'),
(7,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764319/urbansync/property/gxwt3akbone3pszapuuo.jpg', '2026-08-03 19:08:42.103218'),
(8,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764319/urbansync/property/abl7k7asjleidca85qgv.jpg', '2026-08-03 19:08:42.103218'),
(9,  1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764319/urbansync/property/t1zxfnwrqlvwbixlfleh.jpg', '2026-08-03 19:08:42.103218'),
(10, 1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764319/urbansync/property/nendwlmoftv6hmmvz65c.jpg', '2026-08-03 19:08:42.103218'),
(11, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764366/urbansync/property/g2lo05wen4iedszjlffi.jpg', '2026-08-03 19:09:29.572587'),
(12, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764366/urbansync/property/ni39glnpyfr2wk3c4rfs.jpg', '2026-08-03 19:09:29.572587'),
(13, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764366/urbansync/property/miq3utjrzpiobdu0jusc.jpg', '2026-08-03 19:09:29.572587'),
(14, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764366/urbansync/property/fwfranhphlcvdn5lpotu.jpg', '2026-08-03 19:09:29.572587'),
(15, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764366/urbansync/property/f3upzhm4hrelxdgt5t9p.jpg', '2026-08-03 19:09:29.572587'),
(16, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764366/urbansync/property/jezs0rznhffagqyaegfl.webp','2026-08-03 19:09:29.572587'),
(17, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764366/urbansync/property/f7owbcmfng2iwxtbikfu.jpg', '2026-08-03 19:09:29.572587'),
(18, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764367/urbansync/property/nyyetjv5iy3ox3xwwpr3.jpg', '2026-08-03 19:09:29.572587'),
(19, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764367/urbansync/property/fwzkhsyjmahtlqsqitm3.jpg', '2026-08-03 19:09:29.572587'),
(20, 2, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785764367/urbansync/property/tgszxg8feaxb9i7fafhs.jpg', '2026-08-03 19:09:29.572587'),
(21, 3, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img1.jpg', '2026-08-04 17:05:06.875332'),
(22, 3, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img2.jpg', '2026-08-04 17:05:06.875332'),
(23, 3, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img3.jpg', '2026-08-04 17:05:06.875332'),
(24, 3, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img4.jpg', '2026-08-04 17:05:06.875332'),
(25, 3, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/property/img5.jpg', '2026-08-04 17:05:06.875332'),
(26, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998862/urbansync/property/lzqj4suzryyowpzzvoaq.jpg', '2026-08-06 12:17:43.697162'),
(27, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998862/urbansync/property/javhdjauprx0u4hy2d1a.jpg', '2026-08-06 12:17:43.697162'),
(28, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998862/urbansync/property/l8jjjhv6cg7v6hfbxktf.jpg', '2026-08-06 12:17:43.697162'),
(29, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998862/urbansync/property/ltnr5snmvr3byqx1ewoz.jpg', '2026-08-06 12:17:43.697162'),
(30, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998862/urbansync/property/ziwhovpxt0jyp5uuqwnv.jpg', '2026-08-06 12:17:43.697162'),
(31, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998862/urbansync/property/eujegxt09ycp3bgauhpt.webp','2026-08-06 12:17:43.697162'),
(32, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998862/urbansync/property/z6lvsq0hj7kqtz3q6wps.jpg', '2026-08-06 12:17:43.697162'),
(33, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998863/urbansync/property/oyaqwqrvcfip8hyqu24s.jpg', '2026-08-06 12:17:43.697162'),
(34, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998863/urbansync/property/ylut237urpnn0iqawkwa.jpg', '2026-08-06 12:17:43.697162'),
(35, 6, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998863/urbansync/property/cfk2fcnehxpmrnsprnos.jpg', '2026-08-06 12:17:43.697162'),
(36, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/jsnhzqewqi7n1w65byw9.jpg', '2026-08-06 12:18:02.569169'),
(37, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/ouneriwtz3pspjgdf9qg.jpg', '2026-08-06 12:18:02.569169'),
(38, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/tfstxbpmrxxl3sruoxkz.jpg', '2026-08-06 12:18:02.569169'),
(39, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/yte69tvf30nazzzdqlmh.jpg', '2026-08-06 12:18:02.569169'),
(40, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/in2wemhtncfyulxxzezf.jpg', '2026-08-06 12:18:02.569169'),
(41, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/enhsbarzueomfveu7k9r.webp','2026-08-06 12:18:02.569169'),
(42, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/itknaymespbdjxu4zccu.jpg', '2026-08-06 12:18:02.569169'),
(43, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998881/urbansync/property/ziexvhdffcymd2dwctjx.jpg', '2026-08-06 12:18:02.569169'),
(44, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998882/urbansync/property/bjvmrtbys4lhnogbz1ko.jpg', '2026-08-06 12:18:02.569169'),
(45, 7, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998882/urbansync/property/srcit9h5qsmps6pn1hnm.jpg', '2026-08-06 12:18:02.569169'),
(46, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998903/urbansync/property/iuonqxwhdjzq1ioid6yf.jpg', '2026-08-06 12:18:24.548058'),
(47, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998902/urbansync/property/a1jlyao9zln6mdtmff84.jpg', '2026-08-06 12:18:24.548058'),
(48, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998902/urbansync/property/fkatzndh89rznsovicri.jpg', '2026-08-06 12:18:24.548058'),
(49, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998902/urbansync/property/xvicbff0hyjypomkp7uw.jpg', '2026-08-06 12:18:24.548058'),
(50, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998903/urbansync/property/xvecqylowlxzabgmpuqt.jpg', '2026-08-06 12:18:24.548058'),
(51, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998903/urbansync/property/utar701iypjrqjyabulu.webp','2026-08-06 12:18:24.548058'),
(52, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998903/urbansync/property/o0oopho5isjbxywvbbpz.jpg', '2026-08-06 12:18:24.548058'),
(53, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998903/urbansync/property/pjbe0qmwcfmzjysxzrmx.jpg', '2026-08-06 12:18:24.548058'),
(54, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998904/urbansync/property/q3qwjlxherspgoxot7pm.jpg', '2026-08-06 12:18:24.548058'),
(55, 9, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998903/urbansync/property/uu8erx0vf6kszmdbwzbn.jpg', '2026-08-06 12:18:24.548058'),
(56, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998920/urbansync/property/ptvqt88jmglu3c7wamfx.jpg', '2026-08-06 12:18:41.777215'),
(57, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998920/urbansync/property/ypl2hqji7c2fythhz7jt.jpg', '2026-08-06 12:18:41.777215'),
(58, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998920/urbansync/property/nufldzbz57eyhkxyndrl.jpg', '2026-08-06 12:18:41.777215'),
(59, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998920/urbansync/property/z7g7w6gr40pgutaafjke.jpg', '2026-08-06 12:18:41.777215'),
(60, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998920/urbansync/property/c7kbigaciqxdlmx8pkch.jpg', '2026-08-06 12:18:41.777215'),
(61, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998920/urbansync/property/fafamoqv9qdkyyuhwuhc.webp','2026-08-06 12:18:41.777215'),
(62, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998921/urbansync/property/hggpmuuvmjv4ly234t91.jpg', '2026-08-06 12:18:41.777215'),
(63, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998921/urbansync/property/rvhiyoaazldsmncebgs7.jpg', '2026-08-06 12:18:41.777215'),
(64, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998921/urbansync/property/w723cnjfe4yrwctbkbx4.jpg', '2026-08-06 12:18:41.777215'),
(65, 10,'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998921/urbansync/property/kli46qpnaqgshxqgfmdn.jpg', '2026-08-06 12:18:41.777215'),
(66, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998956/urbansync/property/qnsavyqlcv8l5uf8cwpg.jpg', '2026-08-06 12:19:18.169246'),
(67, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998956/urbansync/property/avyklbrmtnjapapqaulq.jpg', '2026-08-06 12:19:18.169246'),
(68, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998956/urbansync/property/zvqyicv1ttnvfuqiof1n.jpg', '2026-08-06 12:19:18.169246'),
(69, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998956/urbansync/property/vyr4vpnoyatb981xd2k0.jpg', '2026-08-06 12:19:18.169246'),
(70, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998956/urbansync/property/bl6wux6kvpkaxtqczzs5.jpg', '2026-08-06 12:19:18.169246'),
(71, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998956/urbansync/property/skimxayysza1pc819snh.webp','2026-08-06 12:19:18.169246'),
(72, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998957/urbansync/property/yxl2y4topvf5rbet8mn3.jpg', '2026-08-06 12:19:18.169246'),
(73, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998957/urbansync/property/cvhll1juhu3tpuj5amnh.jpg', '2026-08-06 12:19:18.169246'),
(74, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998957/urbansync/property/taonoolcrrmorvtt8nzi.jpg', '2026-08-06 12:19:18.169246'),
(75, 5, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785998957/urbansync/property/vso8ei8kvx6xqdgsxamr.jpg', '2026-08-06 12:19:18.169246');

SELECT setval('property_post_images_id_seq', (SELECT MAX(id) FROM property_post_images));

-- ============================================================
-- 10. COMPLAINTS
-- ============================================================
INSERT INTO complaints (id, raised_by_id, subject, description, resolved_by_id, target_type, secretary_note, status, resolved_at, created_at) VALUES
(1,  1,  'Water leakage in corridor',       'Water leakage near flat A-201 corridor since 3 days',          NULL, 'ALL',      NULL, 'RESOLVED', '2026-08-02 12:22:33.064974', '2026-08-02 11:55:06.609684'),
(2,  2,  'Garbage not collected',           'Garbage not collected for 3 days near Wing B',                  NULL, 'ALL',      NULL, 'RESOLVED', '2026-08-02 12:22:37.187587', '2026-08-02 11:55:06.609684'),
(3,  3,  'Noise complaint',                 'Loud music from neighbouring flat after 10pm',                  NULL, 'RESIDENT', NULL, 'RESOLVED', NULL,                         '2026-08-02 11:55:06.609684'),
(4,  4,  'Parking issue',                   'Unauthorized vehicle parked in my reserved slot',               NULL, 'ALL',      NULL, 'RESOLVED', '2026-08-02 12:22:40.614583', '2026-08-02 11:55:06.609684'),
(5,  5,  'Lift not working',                'Lift in Wing E not functioning since yesterday',                NULL, 'ALL',      NULL, 'RESOLVED', NULL,                         '2026-08-02 11:55:06.609684'),
(6,  6,  'Street light broken',             'Street light near main gate is not working',                    NULL, 'ALL',      NULL, 'PENDING',  NULL,                         '2026-08-02 11:55:06.609684'),
(7,  7,  'Dog menace near gate',            'Stray dogs near society gate causing trouble at night',         NULL, 'ALL',      NULL, 'PENDING',  NULL,                         '2026-08-02 11:55:06.609684'),
(8,  8,  'Leaking pipe in basement',        'Water pipe in basement parking area leaking badly',             NULL, 'ALL',      NULL, 'RESOLVED', NULL,                         '2026-08-02 11:55:06.609684'),
(9,  9,  'Broken gate hinge',               'Main gate hinge broken and gate does not close properly',       NULL, 'ALL',      NULL, 'RESOLVED', NULL,                         '2026-08-02 11:55:06.609684'),
(10, 10, 'No water supply in morning',      'No water supply between 6am to 9am for past week',             NULL, 'ALL',      NULL, 'PENDING',  NULL,                         '2026-08-02 11:55:06.609684'),
(11, 1,  'Damaged road near Wing A',        'Road near Wing A entrance has multiple potholes',              NULL, 'ALL',      NULL, 'PENDING',  NULL,                         '2026-08-02 11:55:06.609684'),
(12, 3,  'CCTV not working at entrance',    'CCTV camera at main entrance is not recording',                NULL, 'ALL',      NULL, 'PENDING',  NULL,                         '2026-08-02 11:55:06.609684');

SELECT setval('complaints_id_seq', (SELECT MAX(id) FROM complaints));

-- ============================================================
-- 11. COMPLAINT MEDIA
-- ============================================================
INSERT INTO complaint_media (id, complaint_id, media_url, media_type, created_at) VALUES
(1, 1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/complaints/img1.jpg',                           'IMAGE', '2026-08-03 19:28:52.560857'),
(2, 1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/complaints/img2.jpg',                           'IMAGE', '2026-08-03 19:28:52.560857'),
(3, 2, 'https://res.cloudinary.com/dvr0ib995/video/upload/v1/urbansync/complaints/video1.mp4',                         'VIDEO', '2026-08-03 19:29:26.705254'),
(4, 3, 'https://res.cloudinary.com/dvr0ib995/video/upload/v1785839449/urbansync/complaints/rf7m2fnjye4ebl00jfza.mp4',  'VIDEO', '2026-08-04 16:00:50.907854'),
(5, 3, 'https://res.cloudinary.com/dvr0ib995/video/upload/v1785839499/urbansync/complaints/xodkqbpexlqrajx1ypqk.mp4', 'VIDEO', '2026-08-04 16:01:40.5811'),
(6, 3, 'https://res.cloudinary.com/dvr0ib995/video/upload/v1785839566/urbansync/complaints/dfz3227xdih2djrgrpjl.mp4', 'VIDEO', '2026-08-04 16:02:47.835482'),
(7, 1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/complaints/img1.jpg',                           'IMAGE', '2026-08-04 17:13:59.168739'),
(8, 1, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/complaints/img2.jpg',                           'IMAGE', '2026-08-04 17:13:59.168739'),
(9, 2, 'https://res.cloudinary.com/dvr0ib995/video/upload/v1/urbansync/complaints/video1.mp4',                         'VIDEO', '2026-08-04 17:14:50.064498');

SELECT setval('complaint_media_id_seq', (SELECT MAX(id) FROM complaint_media));

-- ============================================================
-- 12. CARETAKER ISSUES
-- ============================================================
INSERT INTO caretaker_issues (id, assigned_to_id, assigned_by_id, title, description, status, resolved_at, created_at) VALUES
(1,  1, 1, 'Fix water tap in parking',      'Water tap near parking area is leaking badly',                                                                                                                                   'RESOLVED',   '2026-08-07 01:53:29.15468',  '2026-08-02 11:55:06.609684'),
(2,  1, 1, 'Clean terrace area',            'Terrace needs thorough cleaning before monsoon',                                                                                                                                  'PROCESSING', NULL,                          '2026-08-02 11:55:06.609684'),
(3,  2, 1, 'Replace lobby light bulbs',     'Multiple bulbs in lobby area are fused',                                                                                                                                         'PENDING',    NULL,                          '2026-08-02 11:55:06.609684'),
(4,  2, 1, 'Repair main gate hinge',        'Main gate hinge broken and makes loud noise',                                                                                                                                    'RESOLVED',   NULL,                          '2026-08-02 11:55:06.609684'),
(5,  1, 1, 'Pest control in basement',      'Pest control required in basement parking area',                                                                                                                                 'RESOLVED',   '2026-08-07 01:53:21.873043', '2026-08-02 11:55:06.609684'),
(6,  2, 1, 'Fix elevator button panel',     'Button panel in elevator not working properly',                                                                                                                                  'PROCESSING', NULL,                          '2026-08-02 11:55:06.609684'),
(7,  3, 1, 'Clean drainage near Wing B',    'Drainage near Wing B is blocked and overflowing',                                                                                                                               'PENDING',    NULL,                          '2026-08-02 11:55:06.609684'),
(8,  3, 1, 'Paint society boundary wall',   'Boundary wall paint is peeling off badly',                                                                                                                                      'PENDING',    NULL,                          '2026-08-02 11:55:06.609684'),
(9,  1, 1, 'Fix CCTV camera at gate',       'CCTV camera at main gate not recording',                                                                                                                                        'RESOLVED',   NULL,                          '2026-08-02 11:55:06.609684'),
(10, 2, 1, 'Repair water pump motor',       'Water pump motor making noise and needs repair',                                                                                                                                 'PROCESSING', NULL,                          '2026-08-02 11:55:06.609684'),
(11, 3, 1, 'Replace broken bench in park',  'Park bench near Wing C is broken and unsafe',                                                                                                                                   'PENDING',    NULL,                          '2026-08-02 11:55:06.609684'),
(12, 1, 1, 'Fix street light near gate',    'Street light near main gate not working after 8pm',                                                                                                                             'PROCESSING', NULL,                          '2026-08-02 11:55:06.609684'),
(13, 1, 1, 'Fix Parking Tiles',             'Complete this work by today',                                                                                                                                                   'RESOLVED',   '2026-08-02 12:23:03.337886', '2026-08-02 12:09:04.044847'),
(14, 1, 1, 'Fix Club house light issue',    'Fix this issue by tommorow evening because a day after tommorow there is 1 event which will be happenning in club house so we need to fix all that issues and make club house neat and clean for make that event good', 'RESOLVED', '2026-08-02 12:18:49.750303', '2026-08-02 12:11:58.675939');

SELECT setval('caretaker_issues_id_seq', (SELECT MAX(id) FROM caretaker_issues));

-- ============================================================
-- 13. CARETAKER ISSUE MEDIA
-- ============================================================
INSERT INTO caretaker_issue_media (id, issue_id, media_url, media_type, uploaded_by, created_at) VALUES
(1,  1,  'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/issues/img1.jpg',                              'IMAGE', 'SECRETARY', '2026-08-04 16:20:03.981832'),
(2,  1,  'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/issues/img2.jpg',                              'IMAGE', 'SECRETARY', '2026-08-04 16:20:03.981832'),
(3,  1,  'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/issues/resolved.jpg',                          'IMAGE', 'CARETAKER', '2026-08-04 16:20:44.125123'),
(4,  14, 'https://res.cloudinary.com/dvr0ib995/video/upload/v1785841221/urbansync/issues/n5oqvqkqjyiqxr5fdhu9.mp4',    'VIDEO', 'SECRETARY', '2026-08-04 16:30:22.543774'),
(5,  14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841245/urbansync/issues/txcymdrlxsiua76tnk1p.jpg',    'IMAGE', 'SECRETARY', '2026-08-04 16:30:47.031295'),
(6,  14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841245/urbansync/issues/liggnmqtlm1pk8wrbph5.jpg',    'IMAGE', 'SECRETARY', '2026-08-04 16:30:47.031295'),
(7,  14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841246/urbansync/issues/achx7gpinjxdlkbljitv.jpg',    'IMAGE', 'SECRETARY', '2026-08-04 16:30:47.031295'),
(8,  14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841245/urbansync/issues/ub8tbt0kqke6w5tewyql.jpg',    'IMAGE', 'SECRETARY', '2026-08-04 16:30:47.031295'),
(9,  14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841246/urbansync/issues/a3ffwttaeuhd5iaxzfpr.jpg',    'IMAGE', 'SECRETARY', '2026-08-04 16:30:47.031295'),
(10, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841246/urbansync/issues/vbvuobwonla7bzxeua9c.webp',   'IMAGE', 'SECRETARY', '2026-08-04 16:30:47.031295'),
(11, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841264/urbansync/issues/fu4jnyosmnn1bl4j06f4.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(12, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841264/urbansync/issues/x4vygbz8ba0nzuxx6njw.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(13, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841264/urbansync/issues/k5g6jurepxgwi5xgudoc.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(14, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841264/urbansync/issues/eyqjhxrswqllekhow2rb.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(15, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841265/urbansync/issues/mdirbxjnqyj4jzo1xdtt.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(16, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841264/urbansync/issues/f024vxdhou2uncux5gko.webp',   'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(17, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841265/urbansync/issues/zai6a5bgp4hytcdwicqs.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(18, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841265/urbansync/issues/zwqg40iqo26yhlseppru.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(19, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841265/urbansync/issues/uixva6u48ymhzch4yf4j.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(20, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841265/urbansync/issues/q43qummqzd5z5hp986eo.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(21, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841265/urbansync/issues/icqq9x4hq0u8pp7lhgo7.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(22, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1785841266/urbansync/issues/hfvdd3vhwv260wchvbmi.jpg',    'IMAGE', 'CARETAKER', '2026-08-04 16:31:06.706457'),
(23, 1,  'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/issues/before1.jpg',                           'IMAGE', 'SECRETARY', '2026-08-04 17:18:23.439127'),
(24, 1,  'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/issues/before2.jpg',                           'IMAGE', 'SECRETARY', '2026-08-04 17:18:23.439127'),
(25, 1,  'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/issues/after1.jpg',                            'IMAGE', 'CARETAKER', '2026-08-04 17:19:27.609918'),
(26, 1,  'https://res.cloudinary.com/dvr0ib995/image/upload/v1/urbansync/issues/after2.jpg',                            'IMAGE', 'CARETAKER', '2026-08-04 17:19:27.609918'),
(27, 2,  'https://res.cloudinary.com/dvr0ib995/video/upload/v1/urbansync/issues/work.mp4',                              'VIDEO', 'CARETAKER', '2026-08-04 17:20:10.940069'),
(28, 14, 'https://res.cloudinary.com/dvr0ib995/image/upload/v1786047764/urbansync/issues/kvvvm906nh3tylfhgqne.jpg',    'IMAGE', 'CARETAKER', '2026-08-07 01:52:45.433769');

SELECT setval('caretaker_issue_media_id_seq', (SELECT MAX(id) FROM caretaker_issue_media));

-- ============================================================
-- 14. ANNOUNCEMENTS
-- ============================================================
INSERT INTO announcements (id, created_by_id, type, title, message, created_at) VALUES
(2,  1, 'NOTIFICATION', 'Lift Maintenance',          'Lift 1 in Wing A will be under maintenance on 6 Aug. Please use Lift 2.',                                                          '2026-08-02 11:55:06.609684'),
(3,  1, 'ALERT',        'Power Cut Notice',           'Electricity will be cut from 6PM to 8PM on 7 Aug due to transformer maintenance.',                                                 '2026-08-02 11:55:06.609684'),
(4,  1, 'NOTIFICATION', 'Society Meeting',            'Monthly society meeting on 10 Aug at 7PM in community hall. All residents please attend.',                                         '2026-08-02 11:55:06.609684'),
(5,  1, 'NOTIFICATION', 'New Watchman Joining',       'New security watchman Mr. Ganesh will join duty from 1 Aug 2026.',                                                                 '2026-08-02 11:55:06.609684'),
(6,  1, 'ALERT',        'Heavy Rain Warning',         'IMD has issued heavy rain warning for next 48 hours. Please take necessary precautions.',                                          '2026-08-02 11:55:06.609684'),
(7,  1, 'NOTIFICATION', 'Pest Control Scheduled',     'Society-wide pest control on 12 Aug. Keep windows closed between 10AM to 12PM.',                                                  '2026-08-02 11:55:06.609684'),
(8,  1, 'ALERT',        'Gate Timing Change',         'Society main gate will close at 11PM instead of 12AM starting from 1 Aug.',                                                       '2026-08-02 11:55:06.609684'),
(9,  1, 'NOTIFICATION', 'Maintenance Due Reminder',   'July maintenance bills are due by 10 Aug. Please pay to avoid fine of Rs.50 per day.',                                            '2026-08-02 11:55:06.609684'),
(10, 1, 'NOTIFICATION', 'Parking Allotment Meeting',  'Parking slot allotment meeting on 15 Aug at 6PM. All owners must attend.',                                                        '2026-08-02 11:55:06.609684'),
(11, 1, 'ALERT',        'Power Cutoff',               'Today Power will be cutoff from 9am to 12am, so please charge your important devices before that and try to use less of gadgets', '2026-08-04 18:22:23.513124');

SELECT setval('announcements_id_seq', (SELECT MAX(id) FROM announcements));

-- ============================================================
-- 15. PERMISSION REQUESTS
-- ============================================================
INSERT INTO permission_requests (id, raised_by_id, subject, description, request_date, status, rejection_reason, created_at) VALUES
(1,  1,  'Guest Entry for Parents',      'My parents are visiting from 5-8 Aug. Request entry permission for their stay.',                  '2026-08-05', 'APPROVED',  NULL,                        '2026-08-02 11:55:06.609684'),
(2,  2,  'Furniture Delivery',           'Expecting furniture delivery on 6 Aug between 11AM to 1PM. Large vehicle entry needed.',          '2026-08-06', 'APPROVED',  NULL,                        '2026-08-02 11:55:06.609684'),
(3,  3,  'Vehicle Entry for Relative',   'My relative will park their car in visitor parking for 2 days on 7-8 Aug.',                       '2026-08-07', 'REJECTED',  'Visitor parking is full',   '2026-08-02 11:55:06.609684'),
(4,  4,  'Maid Permanent Entry',         'New maid starting from 8 Aug. Request permanent daily entry permission.',                          '2026-08-08', 'REJECTED',  'Date already booked',       '2026-08-02 11:55:06.609684'),
(5,  5,  'Guest Entry for Friends',      'College friends visiting for get-together on 9 Aug evening.',                                      '2026-08-09', 'APPROVED',  NULL,                        '2026-08-02 11:55:06.609684'),
(6,  6,  'AC Installation Work',         'AC technician needs entry on 10 Aug for installation in flat A-202.',                              '2026-08-10', 'PENDING',   NULL,                        '2026-08-02 11:55:06.609684'),
(7,  7,  'Packers and Movers Entry',     'Moving some furniture out on 11 Aug. Packers and movers need entry from 9AM to 1PM.',             '2026-08-11', 'APPROVED',  NULL,                        '2026-08-02 11:55:06.609684'),
(8,  8,  'Plumber Work Permission',      'Plumber needed for bathroom repair on 12 Aug. Request entry permission.',                          '2026-08-12', 'PENDING',   NULL,                        '2026-08-02 11:55:06.609684'),
(9,  9,  'Birthday Party Guests',        'Hosting birthday party on 13 Aug. Around 20 guests expected between 6PM to 10PM.',               '2026-08-13', 'REJECTED',  'Exceeds guest limit of 10', '2026-08-02 11:55:06.609684'),
(10, 10, 'Internet Cable Work',          'Internet service technician needs building access on 14 Aug for cable installation.',             '2026-08-14', 'PENDING',   NULL,                        '2026-08-02 11:55:06.609684');

SELECT setval('permission_requests_id_seq', (SELECT MAX(id) FROM permission_requests));

-- ============================================================
-- 16. GLOBAL MAINTENANCE SETTINGS
-- ============================================================
INSERT INTO global_maintenance_settings (id, maintenance_amount, due_fine_per_day, validity_days, updated_at, created_at) VALUES
(1, 2500.00, 75.00, 15, '2026-08-02 18:15:23.262458', '2026-08-02 18:15:23.263447');

SELECT setval('global_maintenance_settings_id_seq', 1);

-- ============================================================
-- 17. MAINTENANCE BILLS
-- ============================================================
INSERT INTO maintenance_bills (id, flat_id, resident_id, base_amount, fine_amount, total_amount, status, bill_month, bill_year, due_date, paid_at, created_at) VALUES
(1,  1,  1,  2000.00, 0.00,    2000.00, 'PAID',    6, 2026, '2026-06-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(2,  2,  2,  2000.00, 0.00,    2000.00, 'PAID',    6, 2026, '2026-06-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(3,  3,  3,  2000.00, 0.00,    2000.00, 'PAID',    6, 2026, '2026-06-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(4,  4,  4,  2000.00, 0.00,    2000.00, 'PAID',    6, 2026, '2026-06-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(5,  5,  5,  2000.00, 0.00,    2000.00, 'PAID',    6, 2026, '2026-06-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(6,  1,  1,  2000.00, 2025.00, 4025.00, 'PAID',    7, 2026, '2026-07-10', '2026-08-06 11:21:33.567499', '2026-08-02 11:55:06.609684'),
(7,  2,  2,  2000.00, 2100.00, 4100.00, 'PENDING', 7, 2026, '2026-07-10', NULL,                          '2026-08-02 11:55:06.609684'),
(8,  3,  3,  2000.00, 2100.00, 4100.00, 'PENDING', 7, 2026, '2026-07-10', NULL,                          '2026-08-02 11:55:06.609684'),
(9,  4,  4,  2000.00, 0.00,    2000.00, 'PAID',    7, 2026, '2026-07-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(10, 5,  5,  2000.00, 0.00,    2000.00, 'PAID',    7, 2026, '2026-07-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(11, 6,  6,  2000.00, 2025.00, 4025.00, 'PAID',    7, 2026, '2026-07-10', '2026-08-06 20:09:30.723898', '2026-08-02 11:55:06.609684'),
(12, 7,  7,  2000.00, 0.00,    2000.00, 'PAID',    7, 2026, '2026-07-10', '2026-08-02 11:55:06.609684', '2026-08-02 11:55:06.609684'),
(13, 1,  1,  2500.00, 0.00,    2500.00, 'PAID',    8, 2026, '2026-08-15', '2026-08-02 18:26:26.547633', '2026-08-02 18:16:46.948186'),
(14, 6,  6,  2500.00, 0.00,    2500.00, 'PAID',    8, 2026, '2026-08-15', '2026-08-06 20:09:55.918172', '2026-08-05 01:02:28.39923'),
(15, 2,  2,  2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:29.497892'),
(16, 7,  7,  2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:29.691323'),
(17, 3,  3,  2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:29.738315'),
(18, 8,  8,  2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:29.937827'),
(19, 4,  4,  2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:30.012571'),
(20, 9,  9,  2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:30.103265'),
(21, 5,  5,  2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:34.276468'),
(22, 10, 10, 2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-05 01:02:34.322097'),
(23, 18, 18, 2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-06 20:18:57.607532'),
(24, 19, 19, 2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-06 20:18:57.616472'),
(25, 20, 20, 2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-06 20:18:57.629354'),
(26, 21, 21, 2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-06 20:18:57.64492'),
(27, 22, 22, 2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-06 20:18:57.653972'),
(28, 23, 23, 2500.00, 0.00,    2500.00, 'PENDING', 8, 2026, '2026-08-15', NULL,                          '2026-08-06 20:18:57.665465');

SELECT setval('maintenance_bills_id_seq', (SELECT MAX(id) FROM maintenance_bills));

-- ============================================================
-- 18. SOCIETY FUNDS
-- ============================================================
INSERT INTO society_funds (id, balance, updated_at) VALUES
(1, 32550.00, '2026-08-06 20:09:55.923165');

SELECT setval('society_funds_id_seq', 1);

-- ============================================================
-- 19. PAYMENT TRANSACTIONS
-- ============================================================
INSERT INTO payment_transactions (id, bill_id, razorpay_order_id, razorpay_payment_id, amount_paid, status, created_at) VALUES
(1,  1,  'order_test_001',         'pay_test_001',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(2,  2,  'order_test_002',         'pay_test_002',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(3,  3,  'order_test_003',         'pay_test_003',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(4,  4,  'order_test_004',         'pay_test_004',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(5,  5,  'order_test_005',         'pay_test_005',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(6,  9,  'order_test_006',         'pay_test_006',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(7,  10, 'order_test_007',         'pay_test_007',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(8,  12, 'order_test_008',         'pay_test_008',         2000.00, 'SUCCESS', '2026-08-02 11:55:06.609684'),
(9,  6,  'order_test_009',         'pay_test_009',         3050.00, 'PENDING', '2026-08-02 11:55:06.609684'),
(10, 7,  'order_test_010',         'pay_test_010',         2750.00, 'PENDING', '2026-08-02 11:55:06.609684'),
(11, 8,  'order_test_011',         'pay_test_011',         2500.00, 'PENDING', '2026-08-02 11:55:06.609684'),
(12, 11, 'order_test_012',         'pay_test_012',         2350.00, 'PENDING', '2026-08-02 11:55:06.609684'),
(13, 6,  'order_TM7hra6hYbpgOw',   NULL,                   3950.00, 'PENDING', '2026-08-05 20:05:35.065592'),
(14, 11, 'order_TMLphkKrMtJbLk',   NULL,                   4025.00, 'PENDING', '2026-08-06 09:54:43.100761'),
(15, 6,  'order_TMMtkSXyx1Qdju',   NULL,                   4025.00, 'PENDING', '2026-08-06 10:57:14.327703'),
(16, 6,  'order_TMN5lAM7MhKM0l',   NULL,                   4025.00, 'PENDING', '2026-08-06 11:08:36.569634'),
(17, 6,  'order_TMN7EEpwEWjQhC',   NULL,                   4025.00, 'PENDING', '2026-08-06 11:10:00.003196'),
(18, 6,  'order_TMNFTowszSbtha',   NULL,                   4025.00, 'PENDING', '2026-08-06 11:17:48.709113'),
(19, 6,  'order_TMNIkmyJcX6mAe',   'pay_TMNJ7FcbnCh8yU',  4025.00, 'SUCCESS', '2026-08-06 11:20:54.624221'),
(20, 11, 'order_TMWIdbB3Qo1D6A',   'pay_TMWIqiKvWKfPHj',  4025.00, 'SUCCESS', '2026-08-06 20:09:02.597108'),
(21, 14, 'order_TMWJCXyWguRXdJ',   'pay_TMWJIvqF4xOQxS',  2500.00, 'SUCCESS', '2026-08-06 20:09:34.592598');

SELECT setval('payment_transactions_id_seq', (SELECT MAX(id) FROM payment_transactions));

-- ============================================================
-- 20. SCHEDULER LOGS
-- ============================================================
INSERT INTO scheduler_logs (id, job_name, status, message, records_processed, ran_at) VALUES
(1, 'MONTHLY_BILL_GENERATION',   'SUCCESS', 'Generated 9 bills for 8/2026',       9, '2026-08-05 01:02:34.36512'),
(2, 'DAILY_FINE_RECALCULATION',  'SUCCESS', 'Recalculated fines for 4 bills',      4, '2026-08-05 01:02:40.9853'),
(3, 'MONTHLY_BILL_GENERATION',   'SUCCESS', 'Generated 0 bills for 8/2026',        0, '2026-08-05 08:18:40.645461'),
(4, 'DAILY_FINE_RECALCULATION',  'SUCCESS', 'Recalculated fines for 4 bills',      4, '2026-08-05 08:20:02.860884'),
(5, 'MONTHLY_BILL_GENERATION',   'SUCCESS', 'Generated 0 bills for 8/2026',        0, '2026-08-05 08:23:33.303312'),
(6, 'DAILY_FINE_RECALCULATION',  'SUCCESS', 'Recalculated fines for 4 bills',      4, '2026-08-05 08:23:55.635036'),
(7, 'DAILY_FINE_RECALCULATION',  'SUCCESS', 'Recalculated fines for 4 bills',      4, '2026-08-06 00:00:00.385609'),
(8, 'MONTHLY_BILL_GENERATION',   'SUCCESS', 'Generated 6 bills for 8/2026',        6, '2026-08-06 20:18:57.726667'),
(9, 'DAILY_FINE_RECALCULATION',  'SUCCESS', 'Recalculated fines for 2 bills',      2, '2026-08-07 00:00:00.208171');

SELECT setval('scheduler_logs_id_seq', (SELECT MAX(id) FROM scheduler_logs));

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'wings'               AS tbl, COUNT(*) FROM wings
UNION ALL SELECT 'credentials',              COUNT(*) FROM credentials
UNION ALL SELECT 'secretary_profiles',       COUNT(*) FROM secretary_profiles
UNION ALL SELECT 'resident_profiles',        COUNT(*) FROM resident_profiles
UNION ALL SELECT 'caretaker_profiles',       COUNT(*) FROM caretaker_profiles
UNION ALL SELECT 'flats',                    COUNT(*) FROM flats
UNION ALL SELECT 'registration_requests',    COUNT(*) FROM registration_requests
UNION ALL SELECT 'property_posts',           COUNT(*) FROM property_posts
UNION ALL SELECT 'property_post_images',     COUNT(*) FROM property_post_images
UNION ALL SELECT 'complaints',               COUNT(*) FROM complaints
UNION ALL SELECT 'complaint_media',          COUNT(*) FROM complaint_media
UNION ALL SELECT 'caretaker_issues',         COUNT(*) FROM caretaker_issues
UNION ALL SELECT 'caretaker_issue_media',    COUNT(*) FROM caretaker_issue_media
UNION ALL SELECT 'announcements',            COUNT(*) FROM announcements
UNION ALL SELECT 'permission_requests',      COUNT(*) FROM permission_requests
UNION ALL SELECT 'global_maintenance_settings', COUNT(*) FROM global_maintenance_settings
UNION ALL SELECT 'maintenance_bills',        COUNT(*) FROM maintenance_bills
UNION ALL SELECT 'society_funds',            COUNT(*) FROM society_funds
UNION ALL SELECT 'payment_transactions',     COUNT(*) FROM payment_transactions
UNION ALL SELECT 'scheduler_logs',           COUNT(*) FROM scheduler_logs
ORDER BY tbl;
