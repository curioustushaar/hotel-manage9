const Guest = require('../models/Guest');

// Get all guests
exports.getAllGuests = async (req, res) => {
    try {
        const guests = await Guest.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: guests.length,
            data: guests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching guests',
            error: error.message
        });
    }
};

// Get single guest by ID
exports.getGuestById = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: guest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching guest',
            error: error.message
        });
    }
};

// Create new guest
exports.createGuest = async (req, res) => {
    try {
        const guestData = req.body;

        // Check if guest with same mobile already exists
        const existingGuest = await Guest.findOne({ mobile: guestData.mobile });
        
        if (existingGuest) {
            return res.status(409).json({
                success: false,
                message: 'Guest with this mobile number already exists',
                data: existingGuest
            });
        }

        const guest = new Guest(guestData);
        await guest.save();

        res.status(201).json({
            success: true,
            message: 'Guest created successfully',
            data: guest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating guest',
            error: error.message
        });
    }
};

// Update guest
exports.updateGuest = async (req, res) => {
    try {
        const guest = await Guest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Guest updated successfully',
            data: guest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating guest',
            error: error.message
        });
    }
};

// Delete guest
exports.deleteGuest = async (req, res) => {
    try {
        const guest = await Guest.findByIdAndDelete(req.params.id);

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Guest deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting guest',
            error: error.message
        });
    }
};

// Search guests by name or mobile
exports.searchGuests = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const guests = await Guest.find({
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { mobile: { $regex: query } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        res.status(200).json({
            success: true,
            count: guests.length,
            data: guests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching guests',
            error: error.message
        });
    }
};
