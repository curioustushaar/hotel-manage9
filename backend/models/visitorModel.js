const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation', // Also supports 'Booking' via polymorphic reference if needed, but strictly 'Reservation' per requirement
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    idType: {
        type: String,
        enum: ['Aadhaar', 'Passport', 'Driving License', 'PAN Card', 'Other', 'Aadhaar (ID)'], // Added 'Aadhaar (ID)' to match frontend
        default: 'Aadhaar'
    },
    idNumber: {
        type: String,
        trim: true
    },
    purpose: {
        type: String,
        trim: true
    },
    inTime: {
        type: Date,
        default: Date.now
    },
    outTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXITED'],
        default: 'ACTIVE'
    },
    chargeAmount: {
        type: Number,
        default: 0
    },
    isConvertedToGuest: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visitor', visitorSchema);
