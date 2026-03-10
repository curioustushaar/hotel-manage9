const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Hotel = require('../models/Hotel');

// @desc    Get hotel settings (no auth needed for frontend context)
// @route   GET /api/hotel/settings
// @access  Public
router.get('/settings', async (req, res) => {
    try {
        let hotel = await Hotel.findOne().sort({ createdAt: 1 }).lean();
        if (!hotel) {
            // Create a default hotel entry
            hotel = await Hotel.create({
                name: 'Bireena Atithi',
                address: '123, MG Road',
                city: 'Mumbai',
                state: 'Maharashtra',
                pin: '400050',
                gstNumber: '22AAAAA0000A125',
                subscription: {
                    plan: 'premium',
                    startDate: new Date(),
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    isActive: true
                }
            });
            hotel = hotel.toObject();
        }
        res.json({ success: true, data: hotel });
    } catch (error) {
        console.error('Error fetching hotel settings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
});

// @desc    Update hotel settings
// @route   PUT /api/hotel/settings
// @access  Private
router.put('/settings', protect, async (req, res) => {
    try {
        const updates = req.body;

        // Validate tax caps - service charge, cgst, sgst cannot exceed their set max
        if (updates.serviceCharge !== undefined && updates.serviceCharge > 100) {
            return res.status(400).json({ success: false, message: 'Service charge cannot exceed 100%' });
        }
        if (updates.cgst !== undefined && updates.cgst > 50) {
            return res.status(400).json({ success: false, message: 'CGST cannot exceed 50%' });
        }
        if (updates.sgst !== undefined && updates.sgst > 50) {
            return res.status(400).json({ success: false, message: 'SGST cannot exceed 50%' });
        }

        let hotel = await Hotel.findOne().sort({ createdAt: 1 });
        if (!hotel) {
            hotel = new Hotel({
                name: 'Hotel',
                address: 'Address',
                subscription: {
                    plan: 'premium',
                    startDate: new Date(),
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    isActive: true
                }
            });
        }

        // Update allowed fields
        const allowedFields = [
            'name', 'address', 'city', 'state', 'pin', 'gstNumber', 'phone', 'logoUrl',
            'currency', 'timezone', 'dateFormat', 'timeFormat',
            'taxType', 'cgst', 'sgst', 'serviceCharge', 'roomGst', 'foodGst', 'roomServiceCharge', 'inclusiveTax',
            'invoicePrefix', 'billingInvoicePrefix', 'startingInvoiceNumber', 'panNumber',
            'autoGenerateInvoice', 'autoIncrementInvoice', 'billPrintFormat', 'thankYouMessage',
            'enableRoomPosting', 'posEnabled', 'displayLogoOnBill', 'printKOTHeader',
            'paymentModes', 'billingRules', 'discountRules'
        ];

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                hotel[field] = updates[field];
            }
        });

        await hotel.save();
        res.json({ success: true, data: hotel });
    } catch (error) {
        console.error('Error updating hotel settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
});

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
