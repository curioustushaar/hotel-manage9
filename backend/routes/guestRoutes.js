const express = require('express');
const router = express.Router();

const {
    getAllGuests,
    getGuestById,
    createGuest,
    updateGuest,
    deleteGuest,
    searchGuests
} = require('../controllers/guestController');

// GET routes
router.get('/list', getAllGuests);
router.get('/search', searchGuests);
router.get('/:id', getGuestById);

// POST routes
router.post('/add', createGuest);
router.post('/create', createGuest);

// PUT routes
router.put('/:id', updateGuest);

// DELETE routes
router.delete('/:id', deleteGuest);

module.exports = router;
