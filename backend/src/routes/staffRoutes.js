const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus
} = require('../controllers/staffController');

router.use(protect); // All routes need authentication

router.route('/')
    .get(getStaff)
    .post(admin, addStaff);

router.route('/:id')
    .put(admin, updateStaff)
    .delete(admin, deleteStaff);

router.put('/toggle/:id', admin, toggleStaffStatus);

module.exports = router;
