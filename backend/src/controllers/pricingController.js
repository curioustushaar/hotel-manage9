const RoomTypePricing = require('../models/RoomTypePricing');

// @desc    Get all pricing data
// @route   GET /api/pricing/all
const getAllPricing = async (req, res) => {
    try {
        let pricing = await RoomTypePricing.find();

        // Seed if empty
        if (pricing.length === 0) {
            const defaultPricing = [
                { roomType: 'Non-AC Standard', minPrice: 800, maxPrice: 1800, defaultPrice: 1200 },
                { roomType: 'AC Standard', minPrice: 1500, maxPrice: 3000, defaultPrice: 2000 },
                { roomType: 'Deluxe', minPrice: 2500, maxPrice: 6000, defaultPrice: 3500 },
                { roomType: 'Premium', minPrice: 4000, maxPrice: 9000, defaultPrice: 5500 },
                { roomType: 'Suite', minPrice: 6000, maxPrice: 15000, defaultPrice: 8500 }
            ];
            pricing = await RoomTypePricing.insertMany(defaultPricing);
        }

        res.status(200).json({
            success: true,
            count: pricing.length,
            data: pricing
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get pricing for a specific room type
// @route   GET /api/pricing/:roomType
const getPricingByRoomType = async (req, res) => {
    try {
        // Find exact or partial match (for flexibility)
        const pricing = await RoomTypePricing.findOne({
            roomType: { $regex: new RegExp('^' + req.params.roomType + '$', 'i') }
        });

        if (!pricing) {
            return res.status(404).json({ success: false, message: 'Pricing not found for this room type' });
        }

        res.status(200).json({ success: true, data: pricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update or create pricing
// @route   POST /api/pricing/update
const updatePricing = async (req, res) => {
    try {
        const { roomType, ...updateData } = req.body;
        const pricing = await RoomTypePricing.findOneAndUpdate(
            { roomType },
            updateData,
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: pricing });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Utility for dynamic pricing calculation
const calculateDynamicPrice = async (roomType, date) => {
    try {
        const pricing = await RoomTypePricing.findOne({ roomType });
        if (!pricing) return null;

        let finalRate = pricing.defaultPrice || pricing.minPrice;

        if (pricing.dynamicPricingEnabled) {
            const checkDate = new Date(date);
            const day = checkDate.getDay();
            const isWeekend = (day === 0 || day === 6); // Sun or Sat

            if (isWeekend) {
                finalRate *= pricing.weekendMultiplier;
            }

            // Seasonal logic could be added here (placeholder for now)
            finalRate *= pricing.seasonalMultiplier;
        }

        return Math.round(finalRate);
    } catch (error) {
        console.error('Dynamic pricing error:', error);
        return null;
    }
};

// @desc    Calculate price for specific type and date
// @route   GET /api/pricing/calculate/:roomType
const getCalculatedPrice = async (req, res) => {
    try {
        const { date } = req.query;
        const price = await calculateDynamicPrice(req.params.roomType, date || new Date());
        res.status(200).json({ success: true, price });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllPricing,
    getPricingByRoomType,
    updatePricing,
    calculateDynamicPrice,
    getCalculatedPrice
};
