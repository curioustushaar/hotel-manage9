const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'staff', 'manager', 'receptionist', 'accountant', 'waiter'],
        default: 'staff'
    },
    phone: {
        type: String
    },
    hotelName: {
        type: String
    },
    gstNumber: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscriptionStart: {
        type: Date
    },
    subscriptionEnd: {
        type: Date
    },
    name: {
        type: String,
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: function () {
            return this.role !== 'super_admin'; // Only non-super_admin users need hotelId
        }
    },
    permissions: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
