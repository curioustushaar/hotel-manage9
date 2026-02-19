const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Hotel = require('../models/Hotel');

// @desc    Get hotel by ID (for admin/staff to view their own hotel)
// @route   GET /api/hotel/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id)
            .populate('adminId', 'name email phone');
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Verify user has access to this hotel (either owns it or is staff)
        if (req.user.role === 'super_admin' || 
            req.user.hotelId?.toString() === hotel._id.toString()) {
            res.status(200).json(hotel);
        } else {
            res.status(403).json({ message: 'Access denied. You can only view your own hotel information.' });
        }
    } catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({ 
            message: 'Error fetching hotel details', 
            error: error.message 
        });
    }
});

module.exports = router;
