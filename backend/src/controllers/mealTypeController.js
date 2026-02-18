const MealType = require('../models/MealType');

// @desc    Get all meal types
const getMealTypes = async (req, res) => {
    try {
        const mealTypes = await MealType.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: mealTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new meal type
const addMealType = async (req, res) => {
    try {
        const { name, shortCode, includedMeals, chargeableMeals } = req.body;
        if (!name || !shortCode) {
            return res.status(400).json({ success: false, message: 'Please provide name and short code' });
        }

        const mealType = await MealType.create({
            name,
            shortCode,
            includedMeals,
            chargeableMeals
        });

        res.status(201).json({ success: true, data: mealType });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Meal type already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update meal type
const updateMealType = async (req, res) => {
    try {
        const mealType = await MealType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!mealType) {
            return res.status(404).json({ success: false, message: 'Meal type not found' });
        }
        res.status(200).json({ success: true, data: mealType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete meal type
const deleteMealType = async (req, res) => {
    try {
        const mealType = await MealType.findByIdAndDelete(req.params.id);
        if (!mealType) {
            return res.status(404).json({ success: false, message: 'Meal type not found' });
        }
        res.status(200).json({ success: true, message: 'Meal type removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMealTypes,
    addMealType,
    updateMealType,
    deleteMealType
};
