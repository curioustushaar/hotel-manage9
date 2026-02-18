const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableName: {
        type: String,
        trim: true
    },
    tableNumber: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        default: 4
    },
    type: { // 'General', 'VIP', etc. matches controller usage
        type: String,
        default: 'General'
    },
    status: {
        type: String, // 'Available', 'Running', 'Billed', 'Reserved'
        enum: ['Available', 'Running', 'Billed', 'Reserved', 'Occupied', 'Cleaning'],
        default: 'Available'
    },

    // Runtime Order State (denormalized for performance/controller logic)
    currentOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    guests: {
        type: Number,
        default: 0
    },
    orderStartTime: Date,
    runningOrderAmount: {
        type: Number,
        default: 0
    },

    // Merging logic
    mergedTableIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table'
    }],
    originalTableName: String,
    originalCapacity: Number,

    // Reservations
    reservations: [{
        id: String, // legacy or simple ID
        guestName: String,
        date: Date,
        time: String,
        guests: Number,
        contact: String
    }],

    location: {
        type: String,
        default: 'Main Hall'
    },
    qrCode: String
}, {
    timestamps: true
});

// Helper methods from controller logic
tableSchema.methods.getOrderDuration = function () {
    if (!this.orderStartTime) return 0;
    const now = new Date();
    const start = new Date(this.orderStartTime);
    const diffMs = now - start;
    return Math.floor(diffMs / 1000 / 60); // minutes
};

tableSchema.methods.getFormattedDuration = function () {
    const minutes = this.getOrderDuration();
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

module.exports = mongoose.model('Table', tableSchema);
