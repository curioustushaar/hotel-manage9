const BedType = require('../models/BedType');

// @desc    Get all bed types
const getBedTypes = async (req, res) => {
    try {
        const bedTypes = await BedType.find();
        res.status(200).json({ success: true, data: bedTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new bed type
const addBedType = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Please provide a bed type name' });
        }

        const bedType = await BedType.create({ name });
        res.status(201).json({ success: true, data: bedType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update bed type
const updateBedType = async (req, res) => {
    try {
        const bedType = await BedType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bedType) {
            return res.status(404).json({ success: false, message: 'Bed type not found' });
        }
        res.status(200).json({ success: true, data: bedType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete bed type
const deleteBedType = async (req, res) => {
    try {
        const bedType = await BedType.findByIdAndDelete(req.params.id);
        if (!bedType) {
            return res.status(404).json({ success: false, message: 'Bed type not found' });
        }
        res.status(200).json({ success: true, message: 'Bed type removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getBedTypes,
    addBedType,
    updateBedType,
    deleteBedType
};
