const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload")

const {
  create,
  getAll,
  update,
  deleteUser,
  getStudentIds,
  getStudentCourses,
  getTotalStudents // 👈 import new controller
} = require('../Controller/userController');

router.post('/create',authMiddleware,upload.single('photo'), create);
router.get('/getall',authMiddleware, getAll);
router.put('/update/:id',authMiddleware,upload.single('photo'), update);
router.delete('/delete/:id',authMiddleware, deleteUser);
router.get('/student-ids',authMiddleware, getStudentIds);
router.get('/:id/courses',authMiddleware, getStudentCourses); // 👈 new route for fetching student courses
router.get('/total-students',authMiddleware,getTotalStudents)
module.exports = router;
