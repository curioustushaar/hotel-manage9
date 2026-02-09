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

module.exports = router;
