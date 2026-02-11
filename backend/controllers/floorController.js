const Floor = require('../models/floorModel');

// @desc    Get all floors
const getFloors = async (req, res) => {
    try {
        const floors = await Floor.find().sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: floors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new floor
const addFloor = async (req, res) => {
    try {
        const { name, roomCount } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Please provide a floor name' });
        }

        const floor = await Floor.create({ name, roomCount: roomCount || 0 });
        res.status(201).json({ success: true, data: floor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update floor
const updateFloor = async (req, res) => {
    try {
        const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!floor) {
            return res.status(404).json({ success: false, message: 'Floor not found' });
        }
        res.status(200).json({ success: true, data: floor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete floor
const deleteFloor = async (req, res) => {
    try {
        const floor = await Floor.findByIdAndDelete(req.params.id);
        if (!floor) {
            return res.status(404).json({ success: false, message: 'Floor not found' });
        }
        res.status(200).json({ success: true, message: 'Floor removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getFloors,
    addFloor,
    updateFloor,
    deleteFloor
};
