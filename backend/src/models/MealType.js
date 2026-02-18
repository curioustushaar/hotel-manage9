const mongoose = require('mongoose');

const mealTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Meal Type name is required'],
        unique: true,
        trim: true
    },
    shortCode: {
        type: String,
        required: [true, 'Short Code is required'],
        trim: true,
        uppercase: true
    },
    includedMeals: {
        type: [String],
        default: []
    },
    chargeableMeals: {
        type: [String],
        default: []
    },
    price: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MealType', mealTypeSchema);
