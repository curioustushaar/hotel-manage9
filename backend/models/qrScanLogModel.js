const mongoose = require('mongoose');

const qrScanLogSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    guestMobile: {
        type: String
    },
    scanDateTime: {
        type: Date,
        default: Date.now
    },
    deviceInfo: {
        userAgent: String,
        platform: String,
        language: String
    },
    ipAddress: String,
    status: {
        type: String,
        enum: ['success', 'failed', 'unauthorized'],
        default: 'success'
    },
    failureReason: String
}, {
    timestamps: true
});

module.exports = mongoose.model('QRScanLog', qrScanLogSchema);
