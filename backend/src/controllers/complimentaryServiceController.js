const ComplimentaryService = require('../models/ComplimentaryService');

// @desc    Get all
const getServices = async (req, res) => {
    try {
        const services = await ComplimentaryService.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add
const addService = async (req, res) => {
    try {
        const { name, category, linkedWith, quantityLimit } = req.body;
        if (!name || !category || !linkedWith || !quantityLimit) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const service = await ComplimentaryService.create({ name, category, linkedWith, quantityLimit });
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Service name exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update
const updateService = async (req, res) => {
    try {
        const service = await ComplimentaryService.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete
const deleteService = async (req, res) => {
    try {
        const service = await ComplimentaryService.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getServices, addService, updateService, deleteService };
