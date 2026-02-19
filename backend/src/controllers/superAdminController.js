const Hotel = require('../models/Hotel');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get dashboard statistics
// @route   GET /api/super-admin/dashboard
// @access  Private (Super Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const totalHotels = await Hotel.countDocuments();
        const activeHotels = await Hotel.countDocuments({ 
            isActive: true, 
            'subscription.isActive': true 
        });
        const suspendedHotels = await Hotel.countDocuments({ 
            $or: [
                { isActive: false },
                { 'subscription.isActive': false }
            ]
        });
        
        // Get hotels expiring within 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const now = new Date();
        
        const expiringSoon = await Hotel.countDocuments({
            'subscription.expiryDate': {
                $gte: now,
                $lte: sevenDaysFromNow
            },
            'subscription.isActive': true
        });

        res.status(200).json({
            totalHotels,
            activeHotels,
            suspended: suspendedHotels,
            expiringSoon
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ 
            message: 'Error fetching dashboard statistics', 
            error: error.message 
        });
    }
};

// @desc    Get all hotels with filters
// @route   GET /api/super-admin/hotels
// @access  Private (Super Admin only)
const getAllHotels = async (req, res) => {
    try {
        const { search, status } = req.query;
        
        let query = {};
        
        // Search filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        // Status filter
        if (status === 'active') {
            query.isActive = true;
            query['subscription.isActive'] = true;
        } else if (status === 'suspended') {
            query.isActive = false;
        }
        
        const hotels = await Hotel.find(query)
            .populate('adminId', 'name email phone')
            .sort({ createdAt: -1 });
        
        res.status(200).json(hotels);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ 
            message: 'Error fetching hotels', 
            error: error.message 
        });
    }
};

// @desc    Get single hotel details
// @route   GET /api/super-admin/hotel/:id
// @access  Private (Super Admin only)
const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id)
            .populate('adminId', 'name email phone');
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        
        res.status(200).json(hotel);
    } catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({ 
            message: 'Error fetching hotel details', 
            error: error.message 
        });
    }
};

// @desc    Create new hotel with admin
// @route   POST /api/super-admin/create-hotel
// @access  Private (Super Admin only)
const createHotel = async (req, res) => {
    try {
        const {
            hotelName,
            address,
            gstNumber,
            phone,
            subscriptionPlan,
            subscriptionDuration,
            adminName,
            adminEmail,
            adminPassword,
            adminPhone
        } = req.body;

        // Validation
        if (!hotelName || !address || !subscriptionPlan || !subscriptionDuration || 
            !adminName || !adminEmail || !adminPassword) {
            return res.status(400).json({ 
                message: 'Please provide all required fields' 
            });
        }

        // Check if admin email already exists
        const existingUser = await User.findOne({ username: adminEmail });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Admin email already exists' 
            });
        }

        // Calculate subscription dates
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(subscriptionDuration));

        // Create hotel
        const hotel = await Hotel.create({
            name: hotelName,
            address,
            gstNumber,
            phone,
            isActive: true,
            subscription: {
                plan: subscriptionPlan,
                startDate,
                expiryDate,
                isActive: true
            }
        });

        // Create admin user (password will be hashed by pre-save hook)
        const admin = await User.create({
            name: adminName,
            username: adminEmail, // Using adminEmail as username
            password: adminPassword, // Will be hashed automatically by the User model's pre-save hook
            phone: adminPhone,
            role: 'admin',
            hotelId: hotel._id
        });

        // Update hotel with adminId
        hotel.adminId = admin._id;
        await hotel.save();

        res.status(201).json({
            message: 'Hotel and admin created successfully',
            hotel: {
                id: hotel._id,
                name: hotel.name,
                subscription: hotel.subscription
            },
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.username
            }
        });
    } catch (error) {
        console.error('Error creating hotel:', error);
        res.status(500).json({ 
            message: 'Error creating hotel', 
            error: error.message 
        });
    }
};

// @desc    Suspend hotel
// @route   PATCH /api/super-admin/suspend/:id
// @access  Private (Super Admin only)
const suspendHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Toggle status - if currently active, suspend; if suspended, activate
        const newStatus = !hotel.subscription.isActive;
        hotel.isActive = newStatus;
        hotel.subscription.isActive = newStatus;
        await hotel.save();

        res.status(200).json({
            message: `Hotel ${newStatus ? 'activated' : 'suspended'} successfully`,
            hotel
        });
    } catch (error) {
        console.error('Error toggling hotel status:', error);
        res.status(500).json({ 
            message: 'Error toggling hotel status', 
            error: error.message 
        });
    }
};

// @desc    Activate hotel
// @route   PATCH /api/super-admin/activate/:id
// @access  Private (Super Admin only)
const activateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        hotel.isActive = true;
        hotel.subscription.isActive = true;
        await hotel.save();

        res.status(200).json({
            message: 'Hotel activated successfully',
            hotel
        });
    } catch (error) {
        console.error('Error activating hotel:', error);
        res.status(500).json({ 
            message: 'Error activating hotel', 
            error: error.message 
        });
    }
};

// @desc    Renew hotel subscription
// @route   PATCH /api/super-admin/renew/:id
// @access  Private (Super Admin only)
const renewSubscription = async (req, res) => {
    try {
        const { duration, days } = req.body; // duration in months OR days in days
        
        // Support both duration (months) and days parameters
        const daysToAdd = days || (duration ? duration * 30 : 0);
        
        if (!daysToAdd || daysToAdd < 1) {
            return res.status(400).json({ 
                message: 'Please provide valid subscription duration (days or months)' 
            });
        }

        const hotel = await Hotel.findById(req.params.id);
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Calculate new expiry date from today or current expiry (whichever is later)
        const today = new Date();
        const currentExpiry = new Date(hotel.subscription.expiryDate);
        const startFrom = currentExpiry > today ? currentExpiry : today;
        
        const newExpiryDate = new Date(startFrom);
        newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(daysToAdd));

        hotel.subscription.expiryDate = newExpiryDate;
        hotel.subscription.isActive = true;
        hotel.isActive = true;
        await hotel.save();

        res.status(200).json({
            message: `Subscription extended by ${daysToAdd} days successfully`,
            hotel
        });
    } catch (error) {
        console.error('Error renewing subscription:', error);
        res.status(500).json({ 
            message: 'Error renewing subscription', 
            error: error.message 
        });
    }
};

// @desc    Upgrade hotel subscription plan
// @route   PATCH /api/super-admin/upgrade-plan/:id
// @access  Private (Super Admin only)
const upgradePlan = async (req, res) => {
    try {
        const { plan } = req.body;
        
        if (!plan || !['basic', 'premium'].includes(plan)) {
            return res.status(400).json({ 
                message: 'Please provide valid subscription plan (basic or premium)' 
            });
        }

        const hotel = await Hotel.findById(req.params.id);
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        hotel.subscription.plan = plan;
        await hotel.save();

        res.status(200).json({
            message: 'Subscription plan updated successfully',
            hotel
        });
    } catch (error) {
        console.error('Error upgrading plan:', error);
        res.status(500).json({ 
            message: 'Error upgrading subscription plan', 
            error: error.message 
        });
    }
};

// Legacy endpoints for backward compatibility
const getAllAdmins = getAllHotels;
const createAdmin = createHotel;
const toggleAdminStatus = suspendHotel;
const updateSubscription = renewSubscription;

module.exports = {
    getDashboardStats,
    getAllHotels,
    getHotelById,
    createHotel,
    suspendHotel,
    activateHotel,
    renewSubscription,
    upgradePlan,
    // Legacy exports
    getAllAdmins,
    createAdmin,
    toggleAdminStatus,
    updateSubscription
};

