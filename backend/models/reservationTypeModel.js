const mongoose = require('mongoose');

const reservationTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Reservation Type name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReservationType', reservationTypeSchema);
