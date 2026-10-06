const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// ROOT ROUTE
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

/* ---------------- DATABASE CONNECTION ---------------- */

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_NAME || "hospital",
    port: process.env.DB_PORT || 3306
});
db.connect((err) => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ MySQL Connected");
        initDB();
    }
});

function initDB() {
    const createDoctor = `
    CREATE TABLE IF NOT EXISTS Doctor (
        doctor_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        availability_from TIME,
        availability_to TIME,
        room_no VARCHAR(20)
    )`;

    const createPatient = `
    CREATE TABLE IF NOT EXISTS Patient (
        patient_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(10),
        age INT,
        disease VARCHAR(100),
        join_date DATE,
        blood_group VARCHAR(5)
    )`;

    const createAppointment = `
    CREATE TABLE IF NOT EXISTS Appointment_Details (
        appointment_id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE,
        bill_amount DECIMAL(10,2),
        FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id) ON DELETE CASCADE
    )`;

    const seedDoctors = `
    INSERT IGNORE INTO Doctor (doctor_id, name, specialization, email, availability_from, availability_to, room_no) VALUES
    (1, 'Dr. Arjun Mehta', 'Cardiology', 'arjun@hospital.com', '09:00:00', '13:00:00', '101'),
    (2, 'Dr. Priya Sharma', 'Dermatology', 'priya@hospital.com', '10:00:00', '14:00:00', '102'),
    (3, 'Dr. Rahul Verma', 'Neurology', 'rahul@hospital.com', '11:00:00', '15:00:00', '103'),
    (4, 'Dr. Sneha Patel', 'Orthopedic', 'sneha@hospital.com', '09:30:00', '12:30:00', '104'),
    (5, 'Dr. Vikram Singh', 'General Physician', 'vikram@hospital.com', '12:00:00', '16:00:00', '105'),
    (6, 'Dr. Ananya Roy', 'Cardiology', 'ananya.roy@hospital.com', '08:00:00', '12:00:00', '106'),
    (7, 'Dr. Rajesh Kothari', 'Neurology', 'rajesh.k@hospital.com', '10:00:00', '14:00:00', '107'),
    (8, 'Dr. Meera Nambiar', 'Pediatrics', 'meera.n@hospital.com', '13:00:00', '17:00:00', '108'),
    (9, 'Dr. Vikramaditya Joshi', 'Orthopedic', 'vikram.j@hospital.com', '09:00:00', '13:00:00', '109'),
    (10, 'Dr. Sunita Deshmukh', 'Dermatology', 'sunita.d@hospital.com', '11:00:00', '15:00:00', '110'),
    (11, 'Dr. Farhan Qureshi', 'General Physician', 'farhan.q@hospital.com', '10:00:00', '14:00:00', '111'),
    (12, 'Dr. Kavita Reddy', 'Gynecology', 'kavita.r@hospital.com', '09:00:00', '13:00:00', '112'),
    (13, 'Dr. Siddharth Sen', 'ENT', 'siddharth.s@hospital.com', '12:00:00', '16:00:00', '113'),
    (14, 'Dr. Pooja Malhotra', 'Psychiatry', 'pooja.m@hospital.com', '10:00:00', '14:00:00', '114'),
    (15, 'Dr. Amitav Banerjee', 'Oncology', 'amitav.b@hospital.com', '09:30:00', '13:30:00', '115'),
    (16, 'Dr. Neha Kapoor', 'Pediatrics', 'neha.k@hospital.com', '11:00:00', '15:00:00', '116'),
    (17, 'Dr. Alok Nath', 'General Physician', 'alok.n@hospital.com', '12:00:00', '16:00:00', '117'),
    (18, 'Dr. Deepa Nair', 'Cardiology', 'deepa.n@hospital.com', '08:00:00', '12:00:00', '118'),
    (19, 'Dr. Manish Gupta', 'Neurology', 'manish.g@hospital.com', '10:00:00', '14:00:00', '119'),
    (20, 'Dr. Swati Ghosh', 'Dermatology', 'swati.g@hospital.com', '09:00:00', '13:00:00', '120'),
    (21, 'Dr. Tarun Saxena', 'Orthopedic', 'tarun.s@hospital.com', '11:00:00', '15:00:00', '121'),
    (22, 'Dr. Ritu Choudhury', 'ENT', 'ritu.c@hospital.com', '09:30:00', '13:30:00', '122'),
    (23, 'Dr. Nikhil Bajaj', 'Urology', 'nikhil.b@hospital.com', '12:00:00', '16:00:00', '123'),
    (24, 'Dr. Shalini Pillai', 'Gynecology', 'shalini.p@hospital.com', '10:00:00', '14:00:00', '124'),
    (25, 'Dr. Harish Bhat', 'Gastroenterology', 'harish.b@hospital.com', '08:00:00', '12:00:00', '125'),
    (26, 'Dr. Tanvi Shah', 'Endocrinology', 'tanvi.s@hospital.com', '13:00:00', '17:00:00', '126'),
    (27, 'Dr. Kunal Singhania', 'Cardiology', 'kunal.s@hospital.com', '09:00:00', '13:00:00', '127'),
    (28, 'Dr. Vandana Rao', 'Pediatrics', 'vandana.r@hospital.com', '10:00:00', '14:00:00', '128'),
    (29, 'Dr. Sameer Aggarwal', 'Pulmonology', 'sameer.a@hospital.com', '11:00:00', '15:00:00', '129'),
    (30, 'Dr. Pradeep Mishra', 'Nephrology', 'pradeep.m@hospital.com', '09:30:00', '12:30:00', '130'),
    (31, 'Dr. Smita Kulkarni', 'Ophthalmology', 'smita.k@hospital.com', '12:00:00', '16:00:00', '131'),
    (32, 'Dr. Gaurav Dubey', 'Rheumatology', 'gaurav.d@hospital.com', '08:00:00', '12:00:00', '132'),
    (33, 'Dr. Divya Menon', 'Psychiatry', 'divya.m@hospital.com', '10:00:00', '14:00:00', '133'),
    (34, 'Dr. Ashish Trivedi', 'General Surgery', 'ashish.t@hospital.com', '11:00:00', '15:00:00', '134'),
    (35, 'Dr. Bina Chawla', 'Pathology', 'bina.c@hospital.com', '09:00:00', '13:00:00', '135'),
    (36, 'Dr. Suresh Ranganathan', 'Cardiology', 'suresh.r@hospital.com', '12:00:00', '16:00:00', '136'),
    (37, 'Dr. Payal Sengupta', 'Dermatology', 'payal.s@hospital.com', '10:00:00', '14:00:00', '137'),
    (38, 'Dr. Mohit Chauhan', 'Orthopedic', 'mohit.c@hospital.com', '08:30:00', '12:30:00', '138'),
    (39, 'Dr. Kiran Deshpande', 'Gynecology', 'kiran.d@hospital.com', '13:00:00', '17:00:00', '139'),
    (40, 'Dr. Chetan Bhagat', 'Neurology', 'chetan.b@hospital.com', '09:00:00', '13:00:00', '140');
    `;

    db.query(createDoctor, () => {
        db.query(createPatient, () => {
            db.query(createAppointment, () => {
                db.query(seedDoctors, () => {
                    console.log("✅ 40 Doctors Seeded Successfully!");
                });
            });
        });
    });
}

/* ---------------- ADMIN AUTH MIDDLEWARE ---------------- */
// Password: 123456 — required for Add Doctor, Delete Patient
function adminAuth(req, res, next) {
    const password = req.headers["x-admin-password"];
    if (password === "123456") {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized. Wrong admin password." });
    }
}

/* ---------------- DOCTOR APIs ---------------- */

// GET ALL DOCTORS
app.get("/doctors", (req, res) => {
    db.query("SELECT * FROM Doctor", (err, result) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.json(result);
        }
    });
});

// ADD DOCTOR — requires admin password header
app.post("/addDoctor", adminAuth, (req, res) => {
    const {
        name,
        specialization,
        email,
        availability_from,
        availability_to,
        room_no
    } = req.body;

    db.query(
        "INSERT INTO Doctor (name, specialization, email, availability_from, availability_to, room_no) VALUES (?,?,?,?,?,?)",
        [name, specialization, email, availability_from, availability_to, room_no],
        (err) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send("Doctor Added Successfully");
            }
        }
    );
});

// CHECK DOCTOR AVAILABILITY on a given date
app.get("/checkAvailability", (req, res) => {
    const { doctor_id, date } = req.query;
    if (!doctor_id || !date) {
        return res.status(400).json({ error: "doctor_id and date are required" });
    }
    db.query(
        "SELECT COUNT(*) AS count FROM Appointment_Details WHERE doctor_id = ? AND appointment_date = ?",
        [doctor_id, date],
        (err, result) => {
            if (err) return res.send(err);
            const available = result[0].count === 0;
            res.json({ available, appointments_on_date: result[0].count });
        }
    );
});

/* ---------------- PATIENT APIs ---------------- */

// GET ALL PATIENTS
app.get("/patients", (req, res) => {
    db.query("SELECT * FROM Patient", (err, result) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.json(result);
        }
    });
});

// SEARCH PATIENTS by name or disease
app.get("/searchPatient", (req, res) => {
    const keyword = "%" + (req.query.q || "") + "%";
    db.query(
        "SELECT * FROM Patient WHERE name LIKE ? OR disease LIKE ?",
        [keyword, keyword],
        (err, result) => {
            if (err) return res.send(err);
            res.json(result);
        }
    );
});

// DELETE PATIENT — requires admin password header
app.delete("/deletePatient/:id", adminAuth, (req, res) => {
    db.query(
        "DELETE FROM Patient WHERE patient_id = ?",
        [req.params.id],
        (err) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send("Patient Deleted Successfully");
            }
        }
    );
});

/* ---------------- APPOINTMENT APIs ---------------- */

// GET ALL APPOINTMENTS — with patient name and doctor name (JOIN)
app.get("/appointments", (req, res) => {
    db.query(
        `SELECT 
            a.appointment_id,
            a.appointment_date,
            a.bill_amount,
            p.patient_id,
            p.name      AS patient_name,
            p.disease,
            d.doctor_id,
            d.name      AS doctor_name,
            d.specialization
         FROM Appointment_Details a
         JOIN Patient p ON a.patient_id = p.patient_id
         JOIN Doctor  d ON a.doctor_id  = d.doctor_id
         ORDER BY a.appointment_date DESC`,
        (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json(result);
            }
        }
    );
});

/* ---------------- BOOK APPOINTMENT (MAIN LOGIC) ---------------- */

app.post("/bookAppointment", (req, res) => {

    const {
        pname,
        gender,
        age,
        disease,
        blood_group,
        doctor_id,
        date,
        bill
    } = req.body;

    // STEP 1: Insert Patient
    const patientSql =
        "INSERT INTO Patient (name, gender, age, disease, join_date, blood_group) VALUES (?,?,?,?,CURDATE(),?)";

    db.query(
        patientSql,
        [pname, gender, age, disease, blood_group],
        (err, result) => {

            if (err) {
                console.log(err);
                res.send(err);
                return;
            }

            const patient_id = result.insertId;

            // STEP 2: Insert Appointment
            const appointmentSql =
                "INSERT INTO Appointment_Details (patient_id, doctor_id, appointment_date, bill_amount) VALUES (?,?,?,?)";

            db.query(
                appointmentSql,
                [patient_id, doctor_id, date, bill],
                (err2) => {
                    if (err2) {
                        console.log(err2);
                        res.send(err2);
                    } else {
                        res.send("✅ Appointment Booked Successfully");
                    }
                }
            );
        }
    );
});

/* ---------------- CANCEL APPOINTMENT ---------------- */
app.delete("/deleteAppointment/:id", (req, res) => {
    db.query(
        "DELETE FROM Appointment_Details WHERE appointment_id = ?",
        [req.params.id],
        (err) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send("Appointment Cancelled");
            }
        }
    );
});

/* ---------------- DASHBOARD STATS ---------------- */
app.get("/stats", (req, res) => {
    db.query(
        `SELECT
            (SELECT COUNT(*) FROM Doctor) AS total_doctors,
            (SELECT COUNT(*) FROM Patient) AS total_patients,
            (SELECT COUNT(*) FROM Appointment_Details) AS total_appointments,
            (SELECT IFNULL(SUM(bill_amount),0) FROM Appointment_Details) AS total_revenue`,
        (err, result) => {
            if (err) return res.send(err);
            res.json(result[0]);
        }
    );
});


/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});