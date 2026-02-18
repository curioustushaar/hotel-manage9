const BusinessSource = require('../models/BusinessSource');

const getBusinessSources = async (req, res) => {
    try {
        const sources = await BusinessSource.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: sources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addBusinessSource = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const source = await BusinessSource.create({ name });
        res.status(201).json({ success: true, data: source });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Source exists' });
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateBusinessSource = async (req, res) => {
    try {
        const source = await BusinessSource.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!source) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: source });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteBusinessSource = async (req, res) => {
    try {
        const source = await BusinessSource.findByIdAndDelete(req.params.id);
        if (!source) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getBusinessSources, addBusinessSource, updateBusinessSource, deleteBusinessSource };
