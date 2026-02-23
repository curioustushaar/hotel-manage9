const mongoose = require('mongoose');

const folioEntrySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['ROOM_CHARGE', 'EXTRA_CHARGE', 'PAYMENT', 'DISCOUNT', 'REFUND'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['CASH', 'UPI', 'CARD', 'BANK', 'NONE'],
        default: 'NONE'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: String,
        default: 'System'
    }
});

const folioSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["PRIMARY", "SECONDARY", "COMPANY"],
        default: "PRIMARY"
    },
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
    },
    entries: [folioEntrySchema],
    subtotal: {
        type: Number,
        default: 0
    },
    discountTotal: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        default: 0
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Folio', folioSchema);
