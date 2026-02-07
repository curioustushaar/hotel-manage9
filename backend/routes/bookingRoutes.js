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
    // More Options Actions
    checkInBooking,
    addPaymentToBooking,
    amendStay,
    moveRoom,
    exchangeRoom,
    addVisitor,
    markNoShow,
    voidReservation,
    cancelReservation,
    getAvailableRooms,
    getOccupiedBookings
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

// ========== MORE OPTIONS ACTION ROUTES ==========

// 1. Check-in
router.post('/check-in/:id', checkInBooking);

// 2. Add Payment
router.post('/add-payment/:id', addPaymentToBooking);

// 3. Amend Stay
router.post('/amend-stay/:id', amendStay);

// 4. Room Move
router.post('/room-move/:id', moveRoom);

// 5. Room Exchange
router.post('/room-exchange/:id', exchangeRoom);

// 6. Add Visitor
router.post('/add-visitor/:id', addVisitor);

// 7. No-Show
router.post('/no-show/:id', markNoShow);

// 8. Void Reservation
router.post('/void/:id', voidReservation);

// 9. Cancel Reservation
router.post('/cancel/:id', cancelReservation);

// Helper routes for dropdowns
router.get('/available-rooms', getAvailableRooms);
router.get('/occupied-bookings', getOccupiedBookings);

module.exports = router;
