-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM - DATABASE SETUP
-- Run this in MySQL to set up everything
-- ============================================

-- STEP 1: Create the database
CREATE DATABASE IF NOT EXISTS hospital;
USE hospital;

-- STEP 2: Create Doctor table
CREATE TABLE IF NOT EXISTS Doctor (
    doctor_id       INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    specialization  VARCHAR(100)  NOT NULL,
    email           VARCHAR(100),
    availability_from TIME,
    availability_to   TIME,
    room_no         VARCHAR(20)
);

-- STEP 3: Create Patient table
CREATE TABLE IF NOT EXISTS Patient (
    patient_id  INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    gender      VARCHAR(10),
    age         INT,
    disease     VARCHAR(100),
    join_date   DATE,
    blood_group VARCHAR(5)
);

-- STEP 4: Create Appointment_Details table
--         Links Patient → Doctor (Foreign Keys)
CREATE TABLE IF NOT EXISTS Appointment_Details (
    appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
    patient_id       INT NOT NULL,
    doctor_id        INT NOT NULL,
    appointment_date DATE,
    bill_amount      DECIMAL(10,2),

    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES Doctor(doctor_id)   ON DELETE CASCADE
);

-- STEP 5: Insert sample doctors so the app has data to show
INSERT INTO Doctor (name, specialization, email, availability_from, availability_to, room_no)
VALUES
  ('Dr. Arjun Mehta',    'Cardiologist',    'arjun@hospital.com',   '09:00:00', '17:00:00', 'A-101'),
  ('Dr. Priya Sharma',   'Dermatologist',   'priya@hospital.com',   '10:00:00', '16:00:00', 'B-202'),
  ('Dr. Rahul Verma',    'Neurologist',     'rahul@hospital.com',   '08:00:00', '14:00:00', 'C-303'),
  ('Dr. Sneha Patel',    'Orthopedic',      'sneha@hospital.com',   '11:00:00', '18:00:00', 'D-404'),
  ('Dr. Vikram Singh',   'General Physician','vikram@hospital.com', '07:00:00', '15:00:00', 'E-505');

-- Verify everything was created
SHOW TABLES;
SELECT * FROM Doctor;
