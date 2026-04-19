-- ============================================================
-- Medical Staff Scheduling System — MySQL Database Schema
-- Run this script in MySQL before starting the Spring Boot app
-- ============================================================
CREATE DATABASE IF NOT EXISTS medsched_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medsched_db;
-- Drop tables if they exist to prevent errors when re-running
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS admin_users;
-- ── ADMIN USERS (LOGIN) ──────────────────────────────────────
CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);
-- ── STAFF ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    empid VARCHAR(20) NOT NULL UNIQUE,
    empname VARCHAR(100) NOT NULL,
    empsalary DECIMAL(12, 2) DEFAULT 0.00,
    emp_role VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    shift_type ENUM('MORNING', 'EVENING', 'NIGHT') DEFAULT 'MORNING',
    work_hours INT DEFAULT 8,
    qualification VARCHAR(150),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    joining_date DATE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);
-- ── ATTENDANCE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    att_date DATE NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    status ENUM('PRESENT', 'ABSENT', 'ON_LEAVE', 'LATE') DEFAULT 'ABSENT',
    notes VARCHAR(255),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    UNIQUE KEY uq_staff_date (staff_id, att_date)
);
-- ── SHIFTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    shift_type ENUM('MORNING', 'EVENING', 'NIGHT') NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    notes VARCHAR(255),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);
-- ── LEAVE REQUESTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);
-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    type ENUM('INFO', 'WARNING', 'DANGER', 'SUCCESS') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    staff_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE
    SET NULL
);
-- ── DEFAULT ADMIN USER ───────────────────────────────────────
INSERT INTO admin_users (username, password)
VALUES ('admin', 'admin123');
-- ── SAMPLE STAFF DATA ────────────────────────────────────────
INSERT INTO staff (
        empid,
        empname,
        empsalary,
        emp_role,
        department,
        shift_type,
        work_hours,
        qualification,
        phone,
        email,
        joining_date,
        status
    )
VALUES (
        'EMP001',
        'Dr. JEEVA',
        95000.00,
        'Doctor',
        'Cardiology',
        'MORNING',
        8,
        'MBBS',
        '9876543210',
        'jeevadoc@gmail.com',
        '2020-06-15',
        'Active'
    ),
    (
        'EMP002',
        'Dr. RAM',
        88000.00,
        'Doctor',
        'Neurology',
        'EVENING',
        8,
        'MBBS',
        '9876543211',
        'ramdoc@gmail.com',
        '2019-03-20',
        'Active'
    ),
    (
        'EMP003',
        'ABARNA',
        42000.00,
        'Nurse',
        'ICU',
        'NIGHT',
        8,
        'BSc Nursing',
        '9876543212',
        'abarnanurse@gmail.com',
        '2021-08-01',
        'Active'
    ),
    (
        'EMP004',
        'Dr. RAGHU',
        110000.00,
        'Surgeon',
        'Surgery',
        'MORNING',
        9,
        'MBBS, MS General Surgery',
        '9876543213',
        'raghudoc@gmail.com',
        '2018-11-10',
        'Active'
    ),
    (
        'EMP005',
        'Dr. SELVAMUTHU',
        78000.00,
        'Doctor',
        'Pediatrics',
        'MORNING',
        8,
        'MBBS, MD Pediatrics',
        '9876543214',
        'selvadoc@gmail.com',
        '2022-01-05',
        'Active'
    ),
    (
        'EMP006',
        'Nurse KAVITHA',
        40000.00,
        'Nurse',
        'Emergency',
        'EVENING',
        8,
        'BSc Nursing',
        '9876543215',
        'kavithanurse@gmail.com',
        '2021-07-12',
        'Active'
    ),
    (
        'EMP007',
        'Mr. ADHI',
        35000.00,
        'Technician',
        'Emergency',
        'MORNING',
        8,
        'BSc Radiology',
        '9876543216',
        'adhitech@gmail.com',
        '2020-04-18',
        'Active'
    ),
    (
        'EMP008',
        'Dr. SURIYA',
        92000.00,
        'Doctor',
        'Emergency',
        'MORNING',
        8,
        'MBBS',
        '9876543217',
        'suriyadoc@gmail.com',
        '2017-09-25',
        'Active'
    ),
    (
        'EMP009',
        'Ms. kashika',
        30000.00,
        'Receptionist',
        'Administration',
        'MORNING',
        8,
        'B.Com',
        '9876543218',
        'kashikareceptionist@gmail.com',
        '2023-02-14',
        'Active'
    ),
    (
        'EMP010',
        'Mr. MADHAVAN',
        38000.00,
        'Pharmacist',
        'Pharmacy',
        'EVENING',
        8,
        'B.Pharma',
        '9876543219',
        'madhavanpharmacist@gmail.com',
        '2020-10-30',
        'Active'
    ),
    (
        'EMP011',
        'Dr. Pooja',
        85000.00,
        'Doctor',
        'Orthopedics',
        'MORNING',
        8,
        'MBBS, MS Ortho',
        '9876543220',
        'poojadoctor@gmail.com',
        '2021-05-22',
        'Active'
    ),
    (
        'EMP012',
        'Nurse vishesh',
        43000.00,
        'Nurse',
        'Surgery',
        'NIGHT',
        8,
        'BSc Nursing',
        '9876543221',
        'visheshnurse@gmail.com',
        '2022-09-08',
        'Inactive'
    );
-- ── SAMPLE ATTENDANCE ────────────────────────────────────────
INSERT INTO attendance (staff_id, att_date, check_in, check_out, status)
VALUES (
        1,
        CURDATE(),
        CONCAT(CURDATE(), ' 07:02:00'),
        NULL,
        'PRESENT'
    ),
    (
        2,
        CURDATE(),
        CONCAT(CURDATE(), ' 15:05:00'),
        NULL,
        'PRESENT'
    ),
    (
        3,
        CURDATE(),
        CONCAT(CURDATE(), ' 23:00:00'),
        NULL,
        'PRESENT'
    ),
    (
        4,
        CURDATE(),
        CONCAT(CURDATE(), ' 07:30:00'),
        NULL,
        'LATE'
    ),
    (5, CURDATE(), NULL, NULL, 'ABSENT'),
    (
        6,
        CURDATE(),
        CONCAT(CURDATE(), ' 15:01:00'),
        NULL,
        'PRESENT'
    ),
    (
        7,
        CURDATE(),
        CONCAT(CURDATE(), ' 08:00:00'),
        CONCAT(CURDATE(), ' 16:00:00'),
        'PRESENT'
    ),
    (
        8,
        CURDATE(),
        CONCAT(CURDATE(), ' 07:00:00'),
        NULL,
        'PRESENT'
    ),
    (9, CURDATE(), NULL, NULL, 'ON_LEAVE'),
    (
        10,
        CURDATE(),
        CONCAT(CURDATE(), ' 15:00:00'),
        NULL,
        'PRESENT'
    ),
    (
        11,
        CURDATE(),
        CONCAT(CURDATE(), ' 07:10:00'),
        NULL,
        'PRESENT'
    ),
    (12, CURDATE(), NULL, NULL, 'ABSENT');
-- ── SAMPLE SHIFTS ────────────────────────────────────────────
INSERT INTO shifts (
        staff_id,
        shift_type,
        shift_date,
        start_time,
        end_time,
        room
    )
VALUES (
        1,
        'MORNING',
        CURDATE(),
        '07:00:00',
        '15:00:00',
        'Cardiology OPD'
    ),
    (
        2,
        'EVENING',
        CURDATE(),
        '15:00:00',
        '23:00:00',
        'Neurology Ward'
    ),
    (
        3,
        'NIGHT',
        CURDATE(),
        '23:00:00',
        '07:00:00',
        'ICU'
    ),
    (
        4,
        'MORNING',
        CURDATE(),
        '07:00:00',
        '15:00:00',
        'OR-1'
    ),
    (
        6,
        'EVENING',
        CURDATE(),
        '15:00:00',
        '23:00:00',
        'Emergency'
    ),
    (
        8,
        'MORNING',
        CURDATE(),
        '07:00:00',
        '15:00:00',
        'Oncology OPD'
    ),
    (
        11,
        'MORNING',
        CURDATE(),
        '07:00:00',
        '15:00:00',
        'Ortho Ward'
    );
-- ── SAMPLE LEAVE REQUESTS ────────────────────────────────────
INSERT INTO leave_requests (staff_id, start_date, end_date, reason, status)
VALUES (
        5,
        CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL 3 DAY),
        'Family emergency',
        'PENDING'
    ),
    (
        9,
        DATE_SUB(CURDATE(), INTERVAL 1 DAY),
        DATE_ADD(CURDATE(), INTERVAL 2 DAY),
        'Medical leave',
        'APPROVED'
    ),
    (
        12,
        DATE_ADD(CURDATE(), INTERVAL 2 DAY),
        DATE_ADD(CURDATE(), INTERVAL 5 DAY),
        'Personal reasons',
        'PENDING'
    );
-- ── SAMPLE NOTIFICATIONS ─────────────────────────────────────
INSERT INTO notifications (message, type, is_read, staff_id)
VALUES (
        'Dr. Arjun Sharma has checked in for Morning shift.',
        'SUCCESS',
        FALSE,
        1
    ),
    (
        'Shift conflict detected in Surgery on upcoming Sunday.',
        'WARNING',
        FALSE,
        NULL
    ),
    (
        'Leave request from Dr. Meena Joshi is pending approval.',
        'INFO',
        FALSE,
        5
    ),
    (
        'Nurse Rekha Patel marked as Emergency Available.',
        'INFO',
        TRUE,
        3
    ),
    (
        'Scheduled system backup completed successfully.',
        'SUCCESS',
        TRUE,
        NULL
    ),
    (
        'Dr. Ramesh Kumar check-in is 30 minutes late.',
        'WARNING',
        FALSE,
        4
    );