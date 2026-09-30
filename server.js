const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

    const seedDoctor = `
    INSERT INTO Doctor (name, specialization, email, availability_from, availability_to, room_no)
    SELECT * FROM (SELECT 1 AS id, 'Dr. Arjun Mehta' AS name, 'Cardiologist' AS spec, 'arjun@hospital.com' AS email, '09:00:00' AS af, '17:00:00' AS at, 'A-101' AS rm) AS tmp
    WHERE NOT EXISTS (SELECT name FROM Doctor WHERE name = 'Dr. Arjun Mehta') LIMIT 1;
    `;

    db.query(createDoctor, () => {
        db.query(createPatient, () => {
            db.query(createAppointment, () => {
                db.query(seedDoctor, () => {
                    console.log("✅ All Tables & Seed Data Ready!");
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

db.query("SELECT DATABASE()", (err, result) => {
    console.log("DB NAME:", result);
});

db.query("SHOW TABLES", (err, result) => {
    console.log("TABLES:", result);
});

db.query("SELECT COUNT(*) AS total FROM Patient", (err, result) => {
    console.log("PATIENT COUNT:", result);
});

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});