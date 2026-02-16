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
    floor: {
        type: String,
        trim: true
    },
    bedType: {
        type: String,
        trim: true,
        default: 'Double'
    },
    status: {
        type: String,
        enum: ['Available', 'Booked', 'Occupied', 'Under Maintenance'],
        default: 'Available'
    },
    // PHASE 1 UPGRADE: Enterprise-level room attributes
    roomViewType: {
        type: String,
        enum: ['Sea View', 'City View', 'Garden View', 'Pool View', 'Mountain View'],
        default: 'City View'
    },
    smokingPolicy: {
        type: String,
        enum: ['Smoking', 'Non-Smoking'],
        default: 'Non-Smoking'
    },
    roomSize: {
        type: Number,
        default: 0,
        min: 0
    },
    isSmartRoom: {
        type: Boolean,
        default: false
    },
    dynamicRateEnabled: {
        type: Boolean,
        default: false
    },
    weekendMultiplier: {
        type: Number,
        default: 1.2
    },
    seasonalMultiplier: {
        type: Number,
        default: 1.1
    },
    facilities: [{
        type: String,
        trim: true
    }]





}, {
    timestamps: true
});

// Index for faster searches
roomSchema.index({ roomNumber: 1, status: 1 });

const Room = mongoose.model('Room', roomSchema);

// FEATURE: Price Validation Logic
roomSchema.pre('save', async function (next) {
    if (this.isModified('price') || this.isModified('roomType')) {
        const RoomTypePricing = mongoose.model('RoomTypePricing');
        const pricing = await RoomTypePricing.findOne({ roomType: this.roomType });
        if (pricing) {
            if (this.price < pricing.minPrice || this.price > pricing.maxPrice) {
                const error = new Error(`Price ₹${this.price} is outside allowed range for ${this.roomType} (₹${pricing.minPrice} - ₹${pricing.maxPrice})`);
                error.status = 400;
                return next(error);
            }
        }
    }
    next();
});

module.exports = Room;
