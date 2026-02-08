const express = require('express');
const router = express.Router();
const {
    getBookings,
    getBookingById,
    addBooking,
    updateBooking,
    deleteBooking,
    updateBookingStatus,
    getBookingsByRoom,
    getBookingsByDateRange,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    routeFolioTransactions
} = require('../controllers/bookingController');

// Main routes
router.get('/list', getBookings);
router.get('/date-range', getBookingsByDateRange);
router.post('/add', addBooking);

// ID-based routes
router.get('/:id', getBookingById);
router.put('/update/:id', updateBooking);
router.delete('/delete/:id', deleteBooking);
router.patch('/status/:id', updateBookingStatus);

// Room-based routes
router.get('/room/:roomNumber', getBookingsByRoom);

// Transaction routes
router.post('/:bookingId/transactions', addTransaction);
router.put('/:bookingId/transactions/:transactionId', updateTransaction);
router.delete('/:bookingId/transactions/:transactionId', deleteTransaction);

// Folio routing
router.post('/:bookingId/route-folio', routeFolioTransactions);

module.exports = router;
