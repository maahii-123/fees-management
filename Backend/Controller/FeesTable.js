const db = require('../connection/db');

// ✅ CREATE TABLE IF NOT EXISTS
const tableCreate = `
CREATE TABLE IF NOT EXISTS student_fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  mode ENUM('cash', 'upi', 'card', 'netbanking') NOT NULL,
  payment_date DATE NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  fine DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(tableCreate, (err) => {
  if (err) {
    console.error("Error creating student_fees table:", err);
  } else {
    console.log("✅ student_fees table created or already exists.");
  }
});



// ✅ Create new fee entry
const create = (req, res) => {
  const {
    student_id,
    course_name,
    amount,
    mode,
    payment_date,
    discount = 0,
    fine = 0,
    paid = 0
  } = req.body;

  const balance = parseFloat(amount) - parseFloat(discount) + parseFloat(fine) - parseFloat(paid);

  const sql = `
    INSERT INTO student_fees
    (student_id, course_name, amount, mode, payment_date, discount, fine, paid, balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [student_id, course_name, amount, mode, payment_date, discount, fine, paid, balance];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.status(500).json({ error: "Failed to insert fee record." });
    }
    res.status(201).json({ message: "Fee entry created successfully!", id: result.insertId });
  });
};



// ✅ Get all fee entries
const getAll = (req, res) => {
  const sql = `SELECT * FROM student_fees`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch Error:", err);
      return res.status(500).json({ error: "Failed to fetch fee records." });
    }
    res.status(200).json(results);
  });
};


// ✅ Get fee entry by ID
const getById = (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM student_fees WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Fetch Error:", err);
      return res.status(500).json({ error: "Failed to fetch fee record." });
    }
    if (results.length === 0) return res.status(404).json({ error: "Fee record not found." });
    res.status(200).json(results[0]);
  });
};


// ✅ Update fee entry
const update = (req, res) => {
  const id = req.params.id;
  const {
    student_id,
    course_name,
    amount,
    mode,
    payment_date,
    discount = 0,
    fine = 0,
    paid = 0
  } = req.body;

  const balance = parseFloat(amount) - parseFloat(discount) + parseFloat(fine) - parseFloat(paid);

  const sql = `
    UPDATE student_fees SET
      student_id = ?, course_name = ?, amount = ?, mode = ?, payment_date = ?,
      discount = ?, fine = ?, paid = ?, balance = ?
    WHERE id = ?
  `;
  const values = [student_id, course_name, amount, mode, payment_date, discount, fine, paid, balance, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({ error: "Failed to update fee record." });
    }
    res.status(200).json({ message: "Fee entry updated successfully." });
  });
};



// ✅ Delete fee entry
const remove = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM student_fees WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({ error: "Failed to delete fee record." });
    }
    res.status(200).json({ message: "Fee entry deleted successfully." });
  });
};

// ✅ Get all fee records for a specific student
const getFeesByStudentId = (req, res) => {
  const studentId = req.params.studentId;
  const sql = `SELECT sf.*, s.name AS student_name
    FROM student_fees sf
    JOIN student s ON sf.student_id = s.id
    WHERE sf.student_id = ?`;

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch fee details for student." });
    } else {
      res.status(200).json(result);
    }
  });
};

// ✅ Get all students with their fees and optional filter
const getStudentsWithFees = (req, res) => {
  const { studentId, course } = req.query;

  let sql = `
    SELECT 
      s.id as student_id, s.name, s.admissionNo, s.fatherName, s.mobile,
      c.name AS course, s.photo,
      sf.id AS fee_id, sf.amount, sf.mode, sf.payment_date,
      sf.discount, sf.fine, sf.paid, sf.balance
    FROM student s
    LEFT JOIN student_fees sf ON sf.student_id = s.id
    LEFT JOIN course c ON s.course_id = c.id
    WHERE 1=1`;

  const params = [];

  if (studentId) {
    sql += " AND s.id = ?";
    params.push(studentId);
  }

  if (course) {
    sql += " AND s.course_id = ?";
    params.push(course);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch students with fees." });
    } else {
      const studentsMap = new Map();

      result.forEach((row) => {
        if (!studentsMap.has(row.student_id)) {
          studentsMap.set(row.student_id, {
            id: row.student_id,
            admissionNo: row.admissionNo,
            name: row.name,
            fatherName: row.fatherName,
            mobile: row.mobile,
            course: row.course || "N/A",
            photo: row.photo,
            fees: [],
          });
        }

        if (row.fee_id) {
          studentsMap.get(row.student_id).fees.push({
            id: row.fee_id,
            amount: row.amount,
            mode: row.mode,
            paidOn: row.payment_date,
            discount: row.discount,
            fine: row.fine,
            paid: row.paid,
            balance: row.balance,
            feesGroup: "General",
            feesCode: "F001",
            dueDate: row.payment_date,
            status: row.balance > 0 ? "Due" : "Paid"
          });
        }
      });

      res.status(200).json(Array.from(studentsMap.values()));
    }
  });
};


// ✅ Get students by course ID
const getStudentsByCourseId = (req, res) => {
  const courseId = req.params.courseId;
  const sql = `SELECT id, name FROM student WHERE course_id = ?`;

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error("Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch students for course." });
    } else {
      res.status(200).json(result);
    }
  });
};

// ✅ Get student profile and their fees
const getStudentProfileAndFees = (req, res) => {
  const studentId = req.params.studentId;

  const studentSql = `SELECT * FROM student WHERE id = ?`;
  const feeSql = `SELECT * FROM student_fees WHERE student_id = ?`;

  db.query(studentSql, [studentId], (err, studentResult) => {
    if (err || studentResult.length === 0) {
      console.error("Student Fetch Error:", err);
      return res.status(500).json({ error: "Student not found." });
    }

    db.query(feeSql, [studentId], (feeErr, feeResult) => {
      if (feeErr) {
        console.error("Fee Fetch Error:", feeErr);
        return res.status(500).json({ error: "Failed to fetch fees." });
      }

      res.status(200).json({
        student: studentResult[0],
        fees: feeResult
      });
    });
  });
};

const getFeesSummary = (req, res) => {
  const query = `
    SELECT 
    IFNULL(SUM(amount), 0) AS total_amount,
    IFNULL(SUM(paid), 0) AS total_paid,
    IFNULL(SUM(discount), 0) AS total_discount,
    IFNULL(SUM(fine), 0) AS total_fine,
    (IFNULL(SUM(amount), 0) + IFNULL(SUM(fine), 0)) - (IFNULL(SUM(paid), 0) + IFNULL(SUM(discount), 0)) AS balance
  FROM student_fees
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Fees Summary Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(200).json(results); // Single row return hoti hai
  });
};


module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getFeesByStudentId,
  getStudentsWithFees,
  getStudentsByCourseId,
  getStudentProfileAndFees,
  getFeesSummary,
 
};