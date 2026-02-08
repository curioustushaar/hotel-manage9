const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    // Basic Information
    fullName: {
        type: String,
        required: [true, 'Guest name is required'],
        trim: true
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    nationality: {
        type: String,
        default: 'Indian'
    },

    // Address Details
    address: {
        line: String,
        city: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        pinCode: String
    },

    // ID Proof / KYC
    idProof: {
        type: {
            type: String,
            enum: ['Aadhaar', 'Passport', 'Driving License', 'Voter ID', 'PAN Card', '']
        },
        number: String,
        frontFile: String,
        backFile: String
    },

    // Optional Details
    dob: Date,
    anniversary: Date,
    photoFile: String,
    companyName: String,
    gstNumber: String,

    // Booking Statistics
    bookingCount: {
        type: Number,
        default: 0
    },
    totalStays: {
        type: Number,
        default: 0
    },
    lastStayDate: Date,

    // System fields
    createdBy: {
        type: String,
        default: 'system'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
guestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;
