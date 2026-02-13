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
    routeFolioTransactions,
    checkInBooking,
    addBookingPayment,
    amendBookingStay,
    moveBookingRoom,
    exchangeBookingRoom,
    addBookingVisitor,
    markBookingNoShow,
    voidBooking,
    cancelBooking
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

// Operation routes
router.post('/check-in/:id', checkInBooking);
router.post('/add-payment/:id', addBookingPayment);
router.post('/amend-stay/:id', amendBookingStay);
router.post('/room-move/:id', moveBookingRoom);
router.post('/room-exchange/:id', exchangeBookingRoom);
router.post('/add-visitor/:id', addBookingVisitor);
router.post('/no-show/:id', markBookingNoShow);
router.post('/void/:id', voidBooking);
router.post('/cancel/:id', cancelBooking);

// Folio routing
router.post('/:bookingId/route-folio', routeFolioTransactions);

module.exports = router;
