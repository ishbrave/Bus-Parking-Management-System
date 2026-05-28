const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDailyIncomeReport,
  getAllReportData,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/daily-income', getDailyIncomeReport);
router.get('/all', getAllReportData);

module.exports = router;
