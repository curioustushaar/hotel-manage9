const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    foodCode: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Starters', 'Main Course', 'Breakfast', 'Rice', 'Desserts', 'Beverages', 'Chinese', 'Continental']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        default: 'PCS',
        enum: ['PCS', 'KG', 'LBS', 'LTR']
    }
}, {
    timestamps: true
});

// Create index for faster searches
menuItemSchema.index({ itemName: 'text', category: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
