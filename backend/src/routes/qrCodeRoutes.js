const express = require('express');
const router = express.Router();
const {
    generateRoomQR,
    getRoomDetailsByQR,
    sendOTP,
    verifyOTPAndReservation,
    getQRScanLogs
} = require('../controllers/qrCodeController');

// Admin Routes
router.post('/generate/:roomId', generateRoomQR);
router.get('/scan-logs', getQRScanLogs);

// Guest Routes
router.get('/room-details/:roomId', getRoomDetailsByQR);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPAndReservation);

module.exports = router;
