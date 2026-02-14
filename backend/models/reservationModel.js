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
    roomNumber: {
        type: String
    },
    roomType: {
        type: String
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
    // Updated/Added fields for compliance
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
    arrivalDate: { type: Date, required: true }, // mapped from checkInDate or duplicate
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },

    // Existing fields mapped or kept
    amount: { type: Number }, // Keep for backward compatibility if needed, but prefer totalAmount
    paid: { type: Number }, // Keep for backward compatibility

    // Check-In fields
    checkInTime: { type: String },
    idProofType: { type: String },
    idNumber: { type: String },
    adults: { type: Number },
    children: { type: Number },
    vehicleNumber: { type: String },
    securityDeposit: { type: Number },

    // Visitors Reference
    visitors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    }],

    // Folio / Transactions
    transactions: [{
        type: { type: String, enum: ['charge', 'payment', 'discount', 'refund', 'NO_SHOW_CHARGE'], required: true },
        description: { type: String },
        amount: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
        user: { type: String } // audit purpose
    }],

    // No Show Details
    noShowDetails: {
        noShowAt: { type: Date },
        applyCharge: { type: Boolean },
        chargeAmount: { type: Number },
        noShowReason: { type: String }
    },

    // Void Details
    voidReason: { type: String },
    voidedAt: { type: Date },

    // Audit Log
    auditTrail: [{
        action: { type: String, required: true },
        performedBy: { type: String },
        timestamp: { type: Date, default: Date.now },
        details: { type: String }
    }],

    remarks: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
