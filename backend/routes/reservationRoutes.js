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

// GET reservation by ID
router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        res.json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservation',
            error: error.message
        });
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

module.exports = router;
