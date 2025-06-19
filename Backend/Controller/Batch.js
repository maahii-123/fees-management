const db = require('../connection/db');

// ✅ TABLE CREATION QUERY
const tableCreate = `
  CREATE TABLE IF NOT EXISTS batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(100) NOT NULL,
    batch_type VARCHAR(50) NOT NULL,
    time_from TIME NOT NULL,
    time_to TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
db.query(tableCreate, (err) => {
  if (err) console.error("Batch table creation error:", err);
  else console.log("✅ 'batches' table created or already exists.");
});

// ✅ CREATE BATCH
const createBatch = (req, res) => {
  const { batch_name, batch_type, time_from, time_to  } = req.body;
  const sql = `
    INSERT INTO batches (batch_name, batch_type, time_from, time_to)
    VALUES (?, ?, ?, ?)
  `;
  const values = [batch_name, batch_type, time_from, time_to];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Create Error:", err);
      return res.status(500).json({ error: "Failed to add batch" });
    }
    res.status(201).json({ message: "Batch added successfully!", data: result });
  });
};


// ✅ GET ALL BATCHES
const getBatches = (req, res) => {
  const sql = `SELECT * FROM batches ORDER BY id DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch batches" });
    res.status(200).json(results);
  });
};

// ✅ UPDATE BATCH
const updateBatch = (req, res) => {
  const id = req.params.id;
  const { batch_name, batch_type, time_from, time_to } = req.body;

  const sql = `
    UPDATE batches 
    SET batch_name = ?, batch_type = ?, time_from = ?, time_to = ?
    WHERE id = ?
  `;
  const values = [batch_name, batch_type, time_from, time_to, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({ error: "Failed to update batch" });
    }
    res.status(200).json({ message: "Batch updated successfully", data: result });
  });
};

// ✅ DELETE BATCH
const deleteBatch = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM batches WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({ error: "Failed to delete batch" });
    }
    res.status(200).json({ message: "Batch deleted successfully", data: result });
  });
};



const getBatchesByCourses = (req, res) => {
  const { courses } = req.body;

  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({ error: "Courses must be a non-empty array." });
  }

  const placeholders = courses.map(() => '?').join(', ');

  const sql = `
    SELECT DISTINCT b.*
    FROM batches b
    JOIN courses c ON c.batch_id = b.id
    WHERE c.course_name IN (${placeholders})
  `;

  db.query(sql, courses, (err, results) => {
    if (err) {
      console.error("Error fetching batches by course names:", err);
      return res.status(500).json({ error: "Failed to fetch batches by course names" });
    }

    res.status(200).json(results);
  });
};



module.exports = {
  createBatch,
  getBatches,
  updateBatch,
  deleteBatch,
  getBatchesByCourses,
};

