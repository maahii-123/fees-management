
const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  getbatchesCourses
} = require('../Controller/courseTable');

// Standard RESTful route naming
router.post('/courses',authMiddleware, createCourse);             // Create course
router.get('/courses',authMiddleware, getCourses);                // Get all courses
router.put('/courses/:id',authMiddleware, updateCourse);          // Update course by ID
router.delete('/courses/:id',authMiddleware, deleteCourse);       // Delete course by ID
router.get('/:id/batches',authMiddleware, getbatchesCourses);
module.exports = router;