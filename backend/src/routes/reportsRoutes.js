const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const roomReportController = require('../controllers/roomReportController');
const kitchenReportController = require('../controllers/kitchenReportController');
const billingReportController = require('../controllers/billingReportController');

router.get('/top-selling', reportsController.getTopSellingItems);
router.get('/rooms/options', roomReportController.getRoomOptions);
router.get('/rooms', roomReportController.getRoomReport);
router.get('/kitchen', kitchenReportController.getKitchenReport);
router.get('/billing', billingReportController.getBillingReport);
router.get('/gst', reportsController.getGstReport);

module.exports = router;
