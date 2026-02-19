const BookingSource = require('../models/BookingSource');

const getSources = async (req, res) => {
    try {
        const sources = await BookingSource.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: sources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addSource = async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) return res.status(400).json({ success: false, message: 'Name and Type are required' });

        const source = await BookingSource.create({ name, type });
        res.status(201).json({ success: true, data: source });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Source exists' });
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateSource = async (req, res) => {
    try {
        const source = await BookingSource.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!source) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: source });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteSource = async (req, res) => {
    try {
        const source = await BookingSource.findByIdAndDelete(req.params.id);
        if (!source) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSources, addSource, updateSource, deleteSource };
