const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    // Determines existing guest or new visitor
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        required: false // If null, use name/mobile below
    },

    // Visitor details if not a registered guest
    name: {
        type: String,
        trim: true,
        required: function () { return !this.guest; }
    },
    mobile: {
        type: String,
        trim: true,
        required: function () { return !this.guest; }
    },

    // Visit Context
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    room: { // Explicit room ref for easier querying "Current visitors in Room 101"
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },

    purpose: String,

    // Timings
    checkIn: {
        type: Date,
        default: Date.now
    },
    checkOut: Date,

    status: {
        type: String,
        enum: ['Active', 'Exited', 'Overstay'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Visitor', visitorSchema);
