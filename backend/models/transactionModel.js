const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        required: true,
        enum: [
            'Opening Balance',
            'Collection Cash',
            'Collection Card',
            'Collection UPI',
            'Collection Bank Transfer',
            'Expense',
            'Refund',
            'Salary',
            'Other Payment'
        ]
    },
    category: {
        type: String,
        enum: ['collection', 'payout'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    by: {
        type: String,
        required: true,
        default: 'Admin'
    },
    reference: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank-transfer', 'other'],
        default: 'cash'
    }
}, {
    timestamps: true
});

// Index for better query performance
transactionSchema.index({ date: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
