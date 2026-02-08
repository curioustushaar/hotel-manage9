const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
        unique: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['Available', 'Running', 'Billed'],
        default: 'Available'
    },
    capacity: {
        type: Number,
        required: [true, 'Table capacity is required'],
        min: 1,
        max: 12,
        default: 4
    },
    currentOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuestMealOrder',
        default: null
    },
    runningOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    orderDuration: {
        type: Number, // Duration in seconds
        default: 0
    },
    orderStartTime: {
        type: Date,
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster searches
tableSchema.index({ tableNumber: 1, status: 1 });

// Method to calculate order duration in seconds
tableSchema.methods.getOrderDuration = function() {
    if (!this.orderStartTime) return 0;
    return Math.floor((new Date() - this.orderStartTime) / 1000);
};

// Method to format duration for display (HH:MM:SS)
tableSchema.methods.getFormattedDuration = function() {
    const seconds = this.getOrderDuration();
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
};

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
