const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hotel name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    gstNumber: {
        type: String,
        trim: true
    },
    phone: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['basic', 'premium'],
            default: 'basic',
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        expiryDate: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Method to check if subscription is expired
hotelSchema.methods.isSubscriptionExpired = function() {
    return new Date() > this.subscription.expiryDate;
};

// Method to check if subscription is expiring soon (within 7 days)
hotelSchema.methods.isExpiringSoon = function() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return this.subscription.expiryDate <= sevenDaysFromNow && this.subscription.expiryDate > new Date();
};

module.exports = mongoose.model('Hotel', hotelSchema);
