const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        unique: true,
        trim: true
    },
    roomType: {
        type: String,
        required: [true, 'Room type is required'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Room capacity is required'],
        min: 1
    },
    price: {
        type: Number,
        required: [true, 'Room price is required'],
        min: 0
    },
    status: {
        type: String,
        enum: ['Available', 'Booked', 'Occupied', 'Under Maintenance'],
        default: 'Available'
    }
}, {
    timestamps: true
});

// Index for faster searches
roomSchema.index({ roomNumber: 1, status: 1 });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
