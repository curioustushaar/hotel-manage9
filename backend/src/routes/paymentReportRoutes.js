const express = require('express');
const router = express.Router();
const paymentReportController = require('../controllers/paymentReportController');

// Get filtered payment report
router.get('/', paymentReportController.getPaymentReport);

module.exports = router;
