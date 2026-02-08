const mongoose = require('mongoose');

const guestMealOrderSchema = new mongoose.Schema({
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'Table ID is required']
    },
    tableNumber: {
        type: Number,
        required: true
    },
    orderType: {
        type: String,
        enum: ['Direct Payment', 'Post to Room'],
        default: 'Direct Payment'
    },
    roomNumber: {
        type: String,
        default: null // Only for "Post to Room" orders
    },
    guestName: {
        type: String,
        default: null
    },
    numberOfGuests: {
        type: Number,
        default: 1,
        min: 1
    },
    items: [{
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        category: Number,
        image: String,
        subtotal: Number
    }],
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    finalAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Billed', 'Closed'],
        default: 'Active'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Online', 'Room Billing', 'Pending'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    billedAt: {
        type: Date,
        default: null
    },
    closedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    revenue: {
        type: Number,
        default: 0,
        min: 0 // For analytics
    }
}, {
    timestamps: true
});

// Index for faster searches
guestMealOrderSchema.index({ tableId: 1, status: 1 });
guestMealOrderSchema.index({ tableNumber: 1 });
guestMealOrderSchema.index({ createdAt: -1 });

// Calculate totals before saving
guestMealOrderSchema.pre('save', function(next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calculate tax (5%)
    this.tax = this.subtotal * 0.05;
    
    // Calculate total before discount
    this.totalAmount = this.subtotal + this.tax;
    
    // Calculate final amount after discount
    this.finalAmount = this.totalAmount - (this.discountAmount || 0);
    
    // Set revenue for analytics
    if (this.paymentStatus === 'Completed') {
        this.revenue = this.finalAmount;
    }
    
    next();
});

const GuestMealOrder = mongoose.model('GuestMealOrder', guestMealOrderSchema);

module.exports = GuestMealOrder;
