const express = require('express');
const router = express.Router();
const db = require('../connection/db');

// ✅ Get list of classes
router.get('/classes', (req, res) => {
  db.query('SELECT DISTINCT class FROM students', (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.status(200).json(result);
  });
});

// ✅ Get list of sections
router.get('/sections', (req, res) => {
  db.query('SELECT DISTINCT section FROM students', (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.status(200).json(result);
  });
});

module.exports = router;
