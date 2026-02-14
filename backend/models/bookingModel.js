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
        referenceId: {
            type: String,
            unique: true
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

        // Check-in Details (for CHECK-IN action)
        actualCheckInDate: {
            type: Date
        },
        actualCheckInTime: {
            type: String
        },
        numberOfAdults: {
            type: Number,
            default: 1
        },
        numberOfChildren: {
            type: Number,
            default: 0
        },
        vehicleNumber: {
            type: String,
            trim: true
        },
        securityDeposit: {
            type: Number,
            default: 0
        },
        checkInRemarks: {
            type: String
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
            enum: ['Upcoming', 'Checked-in', 'Checked-out', 'Cancelled', 'No-Show', 'Voided'],
            default: 'Upcoming'
        },

        // Reservation Metadata
        reservationType: {
            type: String,
            default: 'Confirm'
        },
        bookingSource: {
            type: String,
            default: 'Direct'
        },
        businessSource: {
            type: String,
            default: 'Walk-In'
        },
        arrivalFrom: {
            type: String
        },
        purposeOfVisit: {
            type: String
        },
        scheduledCheckInTime: {
            type: String,
            default: '14:00'
        },
        scheduledCheckOutTime: {
            type: String,
            default: '11:00'
        },

        // Transactions (Charges and Payments)
        transactions: [{
            type: {
                type: String,
                enum: ['charge', 'payment', 'discount', 'refund'],
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
            paymentMethod: {
                type: String,
                enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', null],
                default: null
            },
            referenceId: {
                type: String
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

        // Visitors Log (Reference to Visitor Model)
        visitors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Visitor'
        }],

        // Cancellation / No-Show / Void Details
        cancellationDetails: {
            cancelledAt: {
                type: Date
            },
            cancellationReason: {
                type: String
            },
            cancellationCharges: {
                type: Number,
                default: 0
            },
            refundAmount: {
                type: Number,
                default: 0
            },
            refundMode: {
                type: String,
                enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', null]
            }
        },

        noShowDetails: {
            noShowAt: {
                type: Date
            },
            noShowReason: {
                type: String
            },
            noShowCharges: {
                type: Number,
                default: 0
            }
        },

        voidDetails: {
            voidedAt: {
                type: Date
            },
            voidReason: {
                type: String
            },
            voidedBy: {
                type: String
            }
        },

        // Audit Trail (for tracking all changes)
        auditTrail: [{
            action: {
                type: String,
                required: true
            },
            description: {
                type: String
            },
            performedBy: {
                type: String,
                default: 'system'
            },
            performedAt: {
                type: Date,
                default: Date.now
            },
            metadata: {
                type: mongoose.Schema.Types.Mixed
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
bookingSchema.pre('save', function (next) {
    if (this.transactions && this.transactions.length > 0) {
        const charges = this.transactions
            .filter(t => t.type === 'charge')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const discounts = this.transactions
            .filter(t => t.type === 'discount')
            .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

        const payments = this.transactions
            .filter(t => t.type === 'payment')
            .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

        const refunds = this.transactions
            .filter(t => t.type === 'refund')
            .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

        this.totalAmount = charges - discounts;
        this.advancePaid = payments - refunds;
    }

    this.remainingAmount = this.totalAmount - this.advancePaid;
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
