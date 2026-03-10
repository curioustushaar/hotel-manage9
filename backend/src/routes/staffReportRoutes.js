const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getStaffReport } = require('../controllers/staffReportController');

router.use(protect);
router.get('/', getStaffReport);

module.exports = router;
