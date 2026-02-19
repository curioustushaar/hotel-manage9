const mongoose = require('mongoose');

const bookingSourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Booking Source is required'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        enum: ['Direct', 'OTA', 'Corporate', 'Travel Agent', 'Referral Source']
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BookingSource', bookingSourceSchema);
