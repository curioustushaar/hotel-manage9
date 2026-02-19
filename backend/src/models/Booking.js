const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Core References
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        required: [true, 'Guest reference is required'],
        index: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [false, 'Room is required for stay bookings'], // Optional for "Inquiry" phase
        index: true
    },

    // Booking Metadata
    bookingId: {
        type: String, // e.g. BK-2024001
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    referenceId: String, // Additional reference field for external IDs
    source: {
        type: String,
        enum: ['Walk-In', 'Online', 'Phone', 'Corporate', 'Agent', 'Direct'],
        default: 'Walk-In'
    },
    purpose: String,

    // Legacy/Flat Fields for Frontend Support
    roomNumber: String,
    roomType: String,
    guestName: String,
    mobileNumber: String,
    email: String,
    reservationType: String,
    businessSource: String,
    idProofType: String,
    idNumber: String,
    vehicleNumber: String,
    securityDeposit: Number,

    // Multi-room support inside single booking record
    rooms: [{
        roomType: String,
        roomNumber: String,
        adults: Number,
        children: Number,
        ratePerNight: Number,
        discount: Number,
        total: Number,
        mealPlan: String
    }],

    // Stay Details
    checkInDate: {
        type: Date,
        required: true,
        index: true
    },
    checkOutDate: {
        type: Date,
        required: true,
        index: true
    },
    actualCheckIn: Date,
    actualCheckOut: Date,

    duration: {
        nights: { type: Number, required: true, default: 1 },
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 }
    },

    // Status
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow', 'RESERVED', 'IN_HOUSE', 'CHECKED_OUT', 'Upcoming', 'Checked-in', 'Checked-out'], // Added Upcoming, Checked-in, Checked-out
        default: 'Pending',
        index: true
    },

    // Finances (Snapshot)
    billing: {
        roomRate: { type: Number, required: true }, // Rate at time of booking
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        serviceCharge: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true }, // Net total
        paidAmount: { type: Number, default: 0 },
        balanceAmount: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },

        // Detailed breakdown
        extras: [{
            description: String,
            amount: Number,
            date: { type: Date, default: Date.now }
        }]
    },

    // Payment History (Embedded for transactional integrity within booking context)
    transactions: [{
        type: { type: String, enum: ['Payment', 'Refund', 'Adjustment', 'Charge'], required: true },
        amount: { type: Number, required: true },
        method: { type: String, enum: ['Cash', 'Card', 'UPI', 'Transfer'], default: 'Cash' },
        referenceId: String, // Transaction ID from payment gateway
        date: { type: Date, default: Date.now },
        notes: String,
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Staff
    }],

    // Visitors Log
    visitors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    }],

    // Internal Notes
    specialRequests: String,
    remarks: String,

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, {
    timestamps: true
});

// Middleware to auto-calculate balance and normalize status
bookingSchema.pre('save', function (next) {
    // Recalculate billing based on transactions
    if (this.transactions) {
        const totalPaid = this.transactions
            .filter(t => t.type === 'Payment')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalRefunded = this.transactions
            .filter(t => t.type === 'Refund')
            .reduce((sum, t) => sum + t.amount, 0);

        this.billing.paidAmount = totalPaid - totalRefunded;
    }

    // Recalculate total if extras added (logic can be expanded)
    // For now assuming billing.totalAmount is authoritative or calculated elsewhere

    this.billing.balanceAmount = this.billing.totalAmount - this.billing.paidAmount;
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
