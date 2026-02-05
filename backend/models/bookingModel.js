const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        // Guest Details
        guestName: {
            type: String,
            required: [true, 'Guest name is required'],
            trim: true
        },
        mobileNumber: {
            type: String,
            required: [true, 'Mobile number is required'],
            match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        idProofType: {
            type: String,
            enum: ['Aadhaar', 'Passport', 'Driving License', 'PAN Card'],
            default: 'Aadhaar'
        },
        idProofNumber: {
            type: String,
            trim: true
        },

        // Room Details
        roomType: {
            type: String,
            required: [true, 'Room type is required']
        },
        roomNumber: {
            type: String,
            required: [true, 'Room number is required']
        },
        numberOfGuests: {
            type: Number,
            required: true,
            min: 1,
            max: 6
        },

        // Stay Details
        checkInDate: {
            type: Date,
            required: [true, 'Check-in date is required']
        },
        checkOutDate: {
            type: Date,
            required: [true, 'Check-out date is required']
        },
        numberOfNights: {
            type: Number,
            required: true
        },

        // Pricing Details
        pricePerNight: {
            type: Number,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        advancePaid: {
            type: Number,
            default: 0
        },
        remainingAmount: {
            type: Number,
            calculated: true
        },

        // Status
        status: {
            type: String,
            enum: ['Upcoming', 'Checked-in', 'Checked-out', 'Cancelled'],
            default: 'Upcoming'
        },

        // Timestamps
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Pre-save middleware to calculate remaining amount
bookingSchema.pre('save', function(next) {
    this.remainingAmount = this.totalAmount - this.advancePaid;
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
