const CustomerIdentity = require('../models/CustomerIdentity');

const getIdentities = async (req, res) => {
    try {
        const identities = await CustomerIdentity.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: identities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addIdentity = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Identity Name is required' });

        const identity = await CustomerIdentity.create(req.body);
        res.status(201).json({ success: true, data: identity });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Identity exists' });
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateIdentity = async (req, res) => {
    try {
        const identity = await CustomerIdentity.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!identity) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: identity });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteIdentity = async (req, res) => {
    try {
        const identity = await CustomerIdentity.findByIdAndDelete(req.params.id);
        if (!identity) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getIdentities, addIdentity, updateIdentity, deleteIdentity };
