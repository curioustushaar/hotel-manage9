const mongoose = require('mongoose');

const roomFacilityTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Facility Type name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RoomFacilityType', roomFacilityTypeSchema);
