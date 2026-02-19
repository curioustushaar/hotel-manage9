const mongoose = require('mongoose');

const maintenanceBlockSchema = new mongoose.Schema({
    room: {
        type: String,
        required: [true, 'Room Number is required'],
        trim: true
    },
    blockType: {
        type: String, // e.g., Painting, AC Repair
        required: [true, 'Block Type is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start Date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End Date is required']
    },
    status: {
        type: String,
        enum: ['Blocked', 'In Progress', 'Completed'],
        default: 'Blocked'
    },
    reason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MaintenanceBlock', maintenanceBlockSchema);
