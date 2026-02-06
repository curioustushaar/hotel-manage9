const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
        unique: true
    },
    qrCode: {
        type: String,
        required: true
    },
    qrData: {
        hotelId: String,
        roomId: String,
        roomNumber: String,
        category: String,
        roomType: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
