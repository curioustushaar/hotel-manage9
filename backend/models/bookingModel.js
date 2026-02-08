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

        // Transactions (Charges and Payments)
        transactions: [{
            type: {
                type: String,
                enum: ['charge', 'payment'],
                required: true
            },
            day: {
                type: String,
                required: true
            },
            particulars: {
                type: String,
                required: true
            },
            description: {
                type: String
            },
            amount: {
                type: Number,
                required: true
            },
            user: {
                type: String,
                default: 'current_user'
            },
            folioId: {
                type: Number,
                default: 0
            },
            // Routing metadata
            routedFrom: {
                type: Number
            },
            routedTo: {
                type: Number
            },
            routedBy: {
                type: String
            },
            routedAt: {
                type: Date
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],

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
