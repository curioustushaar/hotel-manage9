const ExtraCharge = require('../models/extraChargeModel');

// @desc    Get all extra charges
const getExtraCharges = async (req, res) => {
    try {
        const charges = await ExtraCharge.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: charges });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new extra charge
const addExtraCharge = async (req, res) => {
    try {
        const { name, chargeType, amount, taxApplicable } = req.body;
        if (!name || !chargeType || amount === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const charge = await ExtraCharge.create({
            name,
            chargeType,
            amount,
            taxApplicable: taxApplicable !== undefined ? taxApplicable : true
        });

        res.status(201).json({ success: true, data: charge });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Charge already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update extra charge
const updateExtraCharge = async (req, res) => {
    try {
        const charge = await ExtraCharge.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!charge) {
            return res.status(404).json({ success: false, message: 'Charge not found' });
        }
        res.status(200).json({ success: true, data: charge });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete extra charge
const deleteExtraCharge = async (req, res) => {
    try {
        const charge = await ExtraCharge.findByIdAndDelete(req.params.id);
        if (!charge) {
            return res.status(404).json({ success: false, message: 'Charge not found' });
        }
        res.status(200).json({ success: true, message: 'Charge removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getExtraCharges,
    addExtraCharge,
    updateExtraCharge,
    deleteExtraCharge
};
