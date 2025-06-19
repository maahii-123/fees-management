const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createBatch,
  getBatches,
  updateBatch,
  deleteBatch,
  getBatchesByCourses,
} = require('../Controller/Batch');

router.post('/add',authMiddleware, createBatch);
router.get('/all',authMiddleware, getBatches);
router.post('/filter',authMiddleware, getBatchesByCourses);
router.put('/update/:id',authMiddleware, updateBatch);
router.delete('/delete/:id',authMiddleware, deleteBatch);

module.exports = router;
