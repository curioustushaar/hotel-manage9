const RoomFacility = require('../models/roomFacilityModel');

// @desc    Get all room facilities
// @route   GET /api/facilities
const getFacilities = async (req, res) => {
    try {
        const facilities = await RoomFacility.find();
        res.status(200).json({ success: true, data: facilities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new facility
// @route   POST /api/facilities
const addFacility = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Please provide a facility name' });
        }

        const facility = await RoomFacility.create({ name, description });
        res.status(201).json({ success: true, data: facility });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update facility
// @route   PUT /api/facilities/:id
const updateFacility = async (req, res) => {
    try {
        const facility = await RoomFacility.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!facility) {
            return res.status(404).json({ success: false, message: 'Facility not found' });
        }
        res.status(200).json({ success: true, data: facility });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
const deleteFacility = async (req, res) => {
    try {
        const facility = await RoomFacility.findByIdAndDelete(req.params.id);
        if (!facility) {
            return res.status(404).json({ success: false, message: 'Facility not found' });
        }
        res.status(200).json({ success: true, message: 'Facility removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getFacilities,
    addFacility,
    updateFacility,
    deleteFacility
};
