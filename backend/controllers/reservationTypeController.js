const ReservationType = require('../models/reservationTypeModel');

// @desc    Get all reservation types
const getReservationTypes = async (req, res) => {
    try {
        const reservationTypes = await ReservationType.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: reservationTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new reservation type
const addReservationType = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Please provide reservation type name' });
        }

        const reservationType = await ReservationType.create({ name, description });
        res.status(201).json({ success: true, data: reservationType });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Reservation type already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update reservation type
const updateReservationType = async (req, res) => {
    try {
        const reservationType = await ReservationType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!reservationType) {
            return res.status(404).json({ success: false, message: 'Reservation type not found' });
        }
        res.status(200).json({ success: true, data: reservationType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete reservation type
const deleteReservationType = async (req, res) => {
    try {
        const reservationType = await ReservationType.findByIdAndDelete(req.params.id);
        if (!reservationType) {
            return res.status(404).json({ success: false, message: 'Reservation type not found' });
        }
        res.status(200).json({ success: true, message: 'Reservation type removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getReservationTypes,
    addReservationType,
    updateReservationType,
    deleteReservationType
};
