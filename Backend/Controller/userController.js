const db = require('../connection/db');
const { v4: uuidv4 } = require('uuid');

// ✅ Create student table (simplified, no foreign key on courses_id)
const tableCreate = `
CREATE TABLE IF NOT EXISTS student (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50),
  name VARCHAR(100),
  gender ENUM('Male', 'Female', 'Other'),
  dob DATE,
  admission_date DATE,
  mobile_no VARCHAR(15),
  address TEXT,
  email VARCHAR(100),
  photo VARCHAR(255),
  education VARCHAR(100),
  courses_id INT NOT NULL,
  batch_id INT,
  batch_details VARCHAR(255),
  parent_name VARCHAR(100),
  parent_mobile VARCHAR(15),
  parent_occupation VARCHAR(100),
  total_fees DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(tableCreate, (err) => {
  if (err) throw err;
  console.log("✅ Table created or already exists.");
});

const generateNextStudentId = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT student_id FROM student ORDER BY id DESC LIMIT 1`;

    db.query(sql, (err, result) => {
      if (err) return reject(err);

      if (result.length > 0 && result[0].student_id) {
        const lastId = result[0].student_id;
        const match = lastId.match(/SKL(\d+)/);

        if (match && match[1]) {
          const num = parseInt(match[1]) + 1;
          const nextId = "SKL" + num.toString().padStart(3, "0");
          resolve(nextId);
        } else {
          // In case SKL format is not found
          resolve("SKL001");
        }
      } else {
        // No records in table yet
        resolve("SKL001");
      }
    });
  });
};


const create = async (req, res) => {
  try {
    let {
      name, gender, dob, admission_date, mobile_no, address,
      email, education, parent_name, parent_mobile,
      parent_occupation, courses_id, batch_id, batch_details
    } = req.body;

    const photo = req.file ? req.file.filename : null;

    if (!Array.isArray(courses_id)) {
      try {
        courses_id = JSON.parse(courses_id);
      } catch (err) {
        courses_id = [courses_id];
      }
    }

   
    const student_id = await generateNextStudentId();

    const insertPromises = courses_id.map((course_id) => {
      return new Promise((resolve, reject) => {
        // Fetch course fee
        const feeQuery = `SELECT fees FROM courses WHERE id = ?`;
        db.query(feeQuery, [course_id], (feeErr, feeResult) => {
          if (feeErr || feeResult.length === 0) return reject("Invalid course");

          const total_fees = parseFloat(feeResult[0].fees);

          const sql = `
            INSERT INTO student (
              student_id, name, gender, dob, admission_date, mobile_no, address,
              email, photo, education, courses_id, batch_id, batch_details,
              parent_name, parent_mobile, parent_occupation, total_fees
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            student_id, name, gender, dob, admission_date, mobile_no, address,
            email, photo, education, course_id, batch_id, batch_details,
            parent_name, parent_mobile, parent_occupation, total_fees
          ];

          db.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
      });
    });

    await Promise.all(insertPromises);

    res.status(201).json({ message: 'Student inserted for all selected courses.', student_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getAll = (req, res) => {
  const sql = `
    SELECT 
      s.id, s.student_id, s.name, s.gender, s.dob, s.admission_date, 
      s.mobile_no, s.address, s.email, s.photo, s.batch_id, s.batch_details, 
      c.course_name AS course_name, c.fees AS course_fees
    FROM student s
    JOIN courses c ON s.courses_id = c.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching student data:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.send(result);
  });
};

const getStudentIds = (req, res) => {
  const sql = 'SELECT id, student_id, name FROM student ORDER BY name';
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching student IDs:", err);
      res.status(500).json({ error: "Failed to fetch student IDs." });
    } else {
      res.status(200).json(result);
    }
  });
};

const update = async (req, res) => {
  const id = req.params.id;
  let {
    student_id, name, dob, admission_date, gender,
    mobile_no, address, email, photo, education,
    courses_id, batch_id, batch_details,
    parent_name, parent_mobile, parent_occupation
  } = req.body;

  // File upload check
  const uploadedPhoto = req.file ? req.file.filename : photo;

  // Handle courses_id: ensure it's an array
if (!Array.isArray(courses_id)) {
  if (typeof courses_id === 'string') {
    try {
      const parsed = JSON.parse(courses_id);
      courses_id = Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      courses_id = [courses_id];
    }
  } else if (courses_id !== undefined && courses_id !== null) {
    courses_id = [courses_id];
  } else {
    courses_id = [];
  }
}

if (courses_id.length === 0) {
  return res.status(400).json({ error: "No course IDs provided." });
}


  try {
    // ✅ Delete all existing rows of this student_id
    const deleteSql = `DELETE FROM student WHERE student_id = ?`;
    await new Promise((resolve, reject) => {
      db.query(deleteSql, [student_id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // ✅ Re-insert new records with updated data for all selected courses
    const insertPromises = courses_id.map((course_id) => {
      return new Promise((resolve, reject) => {
        const feeQuery = `SELECT fees FROM courses WHERE id = ?`;
        db.query(feeQuery, [course_id], (feeErr, feeResult) => {
          if (feeErr || feeResult.length === 0) return reject("Invalid course");

          const total_fees = parseFloat(feeResult[0].fees);

          const insertSql = `
            INSERT INTO student (
              student_id, name, gender, dob, admission_date, mobile_no, address,
              email, photo, education, courses_id, batch_id, batch_details,
              parent_name, parent_mobile, parent_occupation, total_fees
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            student_id, name, gender, dob, admission_date, mobile_no, address,
            email, uploadedPhoto, education, course_id, batch_id, batch_details,
            parent_name, parent_mobile, parent_occupation, total_fees
          ];

          db.query(insertSql, values, (insertErr, insertResult) => {
            if (insertErr) return reject(insertErr);
            resolve(insertResult);
          });
        });
      });
    });

    await Promise.all(insertPromises);

    res.status(200).json({ message: "Student updated successfully with new courses.", student_id });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Update failed", detail: err });
  }
};


const deleteUser = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM student WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ error: "Delete failed." });
    } else {
      res.status(200).json({ message: "Student deleted successfully!", data: result });
    }
  });
};

const getStudentCourses = (req, res) => {
  const studentId = req.params.id;

  const sql = `
    SELECT 
      s.student_id,
      s.name AS student_name,
      c.course_name AS course_name,
      c.fees AS course_fees
    FROM student s
    JOIN courses c ON s.courses_id = c.id
    WHERE s.id = ?
  `;

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Error fetching course details:", err);
      return res.status(500).json({ error: "Failed to fetch course details." });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Student not found or course not assigned." });
    }

    res.status(200).json(result[0]);
  });
};
const getTotalStudents = (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM student";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching student count:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ totalStudents: result[0].total });
  });
};

module.exports = {
  create,
  getAll,
  getStudentIds,
  update,
  deleteUser,
  getStudentCourses,
  getTotalStudents
};
