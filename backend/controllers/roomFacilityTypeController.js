const RoomFacilityType = require('../models/roomFacilityTypeModel');

// @desc    Get all facility types
const getRoomFacilityTypes = async (req, res) => {
    try {
        const facilityTypes = await RoomFacilityType.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: facilityTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new facility type
const addRoomFacilityType = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Please provide a facility type name' });
        }

        const facilityType = await RoomFacilityType.create({ name });
        res.status(201).json({ success: true, data: facilityType });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Facility type already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update facility type
const updateRoomFacilityType = async (req, res) => {
    try {
        const facilityType = await RoomFacilityType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!facilityType) {
            return res.status(404).json({ success: false, message: 'Facility type not found' });
        }
        res.status(200).json({ success: true, data: facilityType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete facility type
const deleteRoomFacilityType = async (req, res) => {
    try {
        const facilityType = await RoomFacilityType.findByIdAndDelete(req.params.id);
        if (!facilityType) {
            return res.status(404).json({ success: false, message: 'Facility type not found' });
        }
        res.status(200).json({ success: true, message: 'Facility type removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRoomFacilityTypes,
    addRoomFacilityType,
    updateRoomFacilityType,
    deleteRoomFacilityType
};
