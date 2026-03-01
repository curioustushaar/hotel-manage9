const express = require('express');
const router = express.Router();
const analyticsReportController = require('../controllers/analyticsReportController');
const { protect } = require('../middleware/authMiddleware'); // Optionally require authentication

// Route for Analytics Reports
router.get('/', analyticsReportController.getAnalyticsReport);

module.exports = router;
