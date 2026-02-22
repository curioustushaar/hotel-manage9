const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    // Relationship links
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
        index: true
    },
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        required: false
    },

    // Visitor Details
    name: {
        type: String,
        trim: true,
        required: true
    },
    mobile: {
        type: String,
        trim: true,
        required: true
    },
    idType: String,
    idNumber: String,

    purpose: String,
    chargeAmount: {
        type: Number,
        default: 0
    },

    // Timings
    inTime: {
        type: Date,
        default: Date.now
    },
    outTime: Date,

    status: {
        type: String,
        enum: ['ACTIVE', 'EXITED', 'OVERSTAY'],
        default: 'ACTIVE'
    },
    isConvertedToGuest: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    strictPopulate: false
});

// Virtual aliases for compatibility if needed
visitorSchema.virtual('reservation').get(function () { return this.reservationId; });
visitorSchema.virtual('checkIn').get(function () { return this.inTime; });
visitorSchema.virtual('checkOut').get(function () { return this.outTime; });


module.exports = mongoose.model('Visitor', visitorSchema);
