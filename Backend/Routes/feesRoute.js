
// const express = require('express');
// const router = express.Router();

// const {
//   create,
//   getAll,
//   getById,
//   getFeesByStudentId,
//   getStudentsWithFees,
//   update,
//   remove,
//   getStudentsByCourseId,
//   getStudentProfileAndFees,
//     // getFeesByDateRange  // Add this import for the new function
// } = require('../Controller/FeesTable');

// // Create new fee entry
// router.post('/create', create);

// // Get all fee records
// router.get('/getall', getAll);

// // Get fee entry by ID
// router.get('/get/:id', getById);

// // Get fee + student details by student ID
// router.get('/student/:studentId', getFeesByStudentId);

// // Get all students with their fee records
// router.get('/students-with-fees', getStudentsWithFees);

// // Get students by course ID
// router.get('/students-by-course/:courseId', getStudentsByCourseId);

// // Get student profile and fee details
// router.get('/student-profile/:studentId', getStudentProfileAndFees);

// // Update a fee entry
// router.put('/update/:id', update);

// // Delete a fee entry
// router.delete('/delete/:id', remove);


// // ✅ New Route: Get fees by date range
// // router.get('/fees/date-range', getFeesByDateRange);

// module.exports = router;



const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  create, getAll, getById,
  getFeesByStudentId, update, remove,getFeesSummary
} = require('../Controller/FeesTable');

router.post('/create',authMiddleware, create);
router.get('/getall',authMiddleware, getAll);
router.get('/get/:id',authMiddleware, getById);
router.get('/student/:studentId',authMiddleware, getFeesByStudentId);
router.put('/update/:id',authMiddleware, update);
router.delete('/delete/:id',authMiddleware, remove);
router.get("/summary",authMiddleware, getFeesSummary);


module.exports = router;
