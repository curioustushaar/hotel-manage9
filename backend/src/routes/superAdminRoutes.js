const express = require('express');
const router = express.Router();
const { protect, superAdmin } = require('../middleware/authMiddleware');
const {
    createAdmin,
    getAllAdmins,
    toggleAdminStatus,
    updateSubscription
} = require('../controllers/superAdminController');

router.post('/create-admin', protect, superAdmin, createAdmin);
router.get('/admins', protect, superAdmin, getAllAdmins);
router.put('/toggle-status/:id', protect, superAdmin, toggleAdminStatus);
router.put('/update-subscription/:id', protect, superAdmin, updateSubscription);

module.exports = router;
