const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservationModel');

// GET all reservations
router.get('/list', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: reservations
        });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservations',
            error: error.message
        });
    }
});

// GET reservation by ID (Universal for Stay Management)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] GET /api/reservations/${id} - Fetching stay details (v2.1)`);

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`[ERROR] Invalid ObjectId: ${id}`);
            return res.status(400).json({ success: false, message: 'Invalid reservation ID format' });
        }

        const Booking = require('../models/bookingModel');
        const Reservation = require('../models/reservationModel');

        let data = await Reservation.findById(id);

        if (!data) {
            console.log(`[DEBUG] Not found in Reservation model, checking Booking...`);
            const booking = await Booking.findById(id);
            if (booking) {
                console.log(`[DEBUG] Found in Booking model: ${booking.referenceId || booking.bookingId}`);
                data = {
                    _id: booking._id,
                    reservationId: booking.referenceId || booking.bookingId,
                    guestName: booking.guestName,
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    checkInTime: booking.scheduledCheckInTime || '14:00',
                    checkOutTime: booking.scheduledCheckOutTime || '11:00',
                    nights: booking.numberOfNights,
                    adults: booking.numberOfAdults,
                    children: booking.numberOfChildren,
                    ratePerNight: booking.pricePerNight,
                    taxPercentage: booking.taxPercentage || 12,
                    discount: booking.discount || 0,
                    grandTotal: booking.totalAmount,
                    balance: booking.remainingAmount,
                    status: booking.status,
                    roomNumber: booking.roomNumber,
                    roomType: booking.roomType
                };
            }
        } else {
            console.log(`[DEBUG] Found in Reservation model: ${data.referenceId}`);
            data = {
                _id: data._id,
                reservationId: data.referenceId,
                guestName: data.guestName,
                checkInDate: data.checkInDate,
                checkOutDate: data.checkOutDate,
                checkInTime: data.checkInTime || '14:00',
                checkOutTime: data.checkOutTime || '11:00',
                nights: data.nights,
                adults: data.adults || 1,
                children: data.children || 0,
                ratePerNight: (data.amount / (data.nights || 1)) || 0,
                taxPercentage: 12,
                discount: 0,
                grandTotal: data.amount,
                balance: data.balance,
                status: data.status,
                roomNumber: data.roomNumber,
                roomType: data.roomType
            };
        }

        if (!data) {
            console.warn(`[WARN] Stay record not found for ID: ${id}`);
            return res.status(404).json({ success: false, message: 'Stay record not found' });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('[CRITICAL] Error fetching stay details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch record', error: error.message });
    }
});

// PUT Check-In Reservation
router.put('/checkin/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findById(id);

        if (!reservation) {
            console.log("Reservation not found for ID:", id);
            const all = await Reservation.find();
            console.log("All IDs in DB:", all.map(r => r._id.toString()));
            return res.status(500).json({ message: "Debug: ID mismatch" });
        }

        // Update fields from sidebar form
        reservation.status = "IN_HOUSE";
        reservation.checkInDate = req.body.arrivalDate;
        reservation.checkInTime = req.body.checkInTime;
        reservation.idProofType = req.body.idProofType;
        reservation.idNumber = req.body.idNumber;
        reservation.adults = req.body.adults;
        reservation.children = req.body.children;
        reservation.vehicleNumber = req.body.vehicleNumber;
        reservation.securityDeposit = req.body.securityDeposit;
        reservation.remarks = req.body.remarks;

        await reservation.save();

        res.status(200).json({
            success: true,
            message: "Check-In successful",
            updatedReservation: reservation
        });

    } catch (error) {
        console.error('Error checking in reservation:', error);
        res.status(500).json({ message: error.message });
    }
});

// PUT Amend Stay
router.put('/amend/:id', async (req, res) => {
    // We'll use the logic in bookingController but exposed via this route
    const { amendBookingStay } = require('../controllers/bookingController');
    return amendBookingStay(req, res);
});

// PUT Room Move
router.put('/:id/room-move', async (req, res) => {
    const { moveBookingRoom } = require('../controllers/bookingController');
    return moveBookingRoom(req, res);
});

// PUT Room Exchange
router.put('/:id/exchange-room', async (req, res) => {
    const { exchangeBookingRoom } = require('../controllers/bookingController');
    return exchangeBookingRoom(req, res);
});

// PUT No-Show
router.put('/:id/no-show', async (req, res) => {
    console.log(`[Route Hit] PUT /api/reservations/${req.params.id}/no-show`);
    const { markNoShow } = require('../controllers/reservationController');
    return markNoShow(req, res);
});

// PUT Void
router.put('/:id/void', async (req, res) => {
    console.log(`[Route Hit] PUT /api/reservations/${req.params.id}/void`);
    const { voidReservation } = require('../controllers/reservationController');
    return voidReservation(req, res);
});

module.exports = router;
