const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Route to send SMS - Protected because it costs money/API credits
router.post('/send-sms', protect, notificationController.sendSMS);

module.exports = router;
