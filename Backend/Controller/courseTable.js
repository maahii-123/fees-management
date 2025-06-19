const db = require('../connection/db');

const tableCreate = `
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  fees DECIMAL(10, 2) NOT NULL,
  batch_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES batches(id)
);
`;
db.query(tableCreate, (err) => {
  if (err) console.error("Course table creation error:", err);
  else console.log("✅ 'courses' table created or already exists.");
});

// ✅ CREATE COURSE
const createCourse = (req, res) => {
  const { course_name, fees, batch_id } = req.body;
  const sql = `INSERT INTO courses (course_name, fees, batch_id) VALUES (?, ?, ?)`;
  const values = [course_name, fees, batch_id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Create Error:", err);
      return res.status(500).json({ error: "Failed to add course" });
    }
    res.status(201).json({ message: "Course added successfully!", data: result });
  });
};

// ✅ GET ALL COURSES (with batch info)
const getCourses = (req, res) => {
  const sql = `
    SELECT 
      c.id, c.course_name, c.fees, 
      b.id AS batch_id, b.batch_name, b.batch_type, b.time_from, b.time_to
    FROM courses c
    JOIN batches b ON c.batch_id = b.id
    ORDER BY c.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch courses" });
    res.status(200).json(results);
  });
};

// ✅ UPDATE COURSE
const updateCourse = (req, res) => {
  const id = req.params.id;
  const { course_name, fees, batch_id } = req.body;

  const sql = `
    UPDATE courses 
    SET course_name = ?, fees = ?, batch_id = ?
    WHERE id = ?
  `;
  const values = [course_name, fees, batch_id, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({ error: "Failed to update course" });
    }
    res.status(200).json({ message: "Course updated successfully", data: result });
  });
};

// ✅ DELETE COURSE
const deleteCourse = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM courses WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({ error: "Failed to delete course" });
    }
    res.status(200).json({ message: "Course deleted successfully", data: result });
  });
};
const getbatchesCourses = (req, res) => {
  const batchesId = req.params.id;

  const sql = `SELECT courses FROM batches WHERE id = ?`;

  db.query(sql, [batchesId], (err, result) => {
    if (err) {
      console.error("Error fetching student batches:", err);
      return res.status(500).json({ error: "Failed to fetch batches courses." });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "batches not found." });
    }

    const courses = JSON.parse(result[0].courses || "[]");
    res.status(200).json(courses);
  });
};

module.exports = {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  getbatchesCourses
};