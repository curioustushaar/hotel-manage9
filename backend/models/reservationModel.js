const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    guestName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['IN_HOUSE', 'RESERVED', 'CHECKED_OUT'],
        required: true
    },
    referenceId: {
        type: String,
        required: true,
        unique: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    nights: {
        type: Number,
        required: true
    },
    rooms: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paid: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    // Check-In fields
    checkInTime: { type: String },
    idProofType: { type: String },
    idNumber: { type: String },
    adults: { type: Number },
    children: { type: Number },
    vehicleNumber: { type: String },
    securityDeposit: { type: Number },
    remarks: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
