const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getAllHotels,
    getHotelById,
    createHotel,
    suspendHotel,
    activateHotel,
    renewSubscription,
    upgradePlan,
    // Legacy endpoints
    getAllAdmins,
    createAdmin,
    toggleAdminStatus,
    updateSubscription
} = require('../controllers/superAdminController');

// All routes are protected and require super_admin role
router.use(protect);
router.use(authorizeRoles('super_admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Hotel Management
router.post('/create-hotel', createHotel);
router.get('/hotels', getAllHotels);
router.get('/hotel/:id', getHotelById);

// Hotel Actions
router.patch('/suspend/:id', suspendHotel);
router.patch('/activate/:id', activateHotel);
router.patch('/renew/:id', renewSubscription);
router.patch('/upgrade-plan/:id', upgradePlan);

// Phase 1 Subscription Management Routes
router.post('/hotel/:id/extend-subscription', renewSubscription);
router.patch('/hotel/:id/toggle-status', suspendHotel);

// Legacy routes for backward compatibility
router.post('/create-admin', createAdmin);
router.get('/admins', getAllAdmins);
router.put('/toggle-status/:id', toggleAdminStatus);
router.put('/update-subscription/:id', updateSubscription);

module.exports = router;

