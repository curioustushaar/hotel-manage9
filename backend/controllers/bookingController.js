const Booking = require('../models/bookingModel');

// Get all bookings
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

// Create a new booking
exports.addBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        // Validate required fields
        if (!bookingData.guestName || !bookingData.mobileNumber || !bookingData.roomNumber || 
            !bookingData.checkInDate || !bookingData.checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check for duplicate room booking
        const existingBooking = await Booking.findOne({
            roomNumber: bookingData.roomNumber,
            $or: [
                {
                    checkInDate: { $lt: new Date(bookingData.checkOutDate) },
                    checkOutDate: { $gt: new Date(bookingData.checkInDate) }
                }
            ],
            status: { $in: ['Upcoming', 'Checked-in'] }
        });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message: 'Room is already booked for the selected dates'
            });
        }

        const booking = new Booking(bookingData);
        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

// Update booking
exports.updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update only provided fields
        Object.assign(booking, req.body);
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting booking',
            error: error.message
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Upcoming', 'Checked-in', 'Checked-out', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
};

// Get bookings by room number
exports.getBookingsByRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const bookings = await Booking.find({ roomNumber }).sort({ checkInDate: -1 });

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Get bookings by date range
exports.getBookingsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required'
            });
        }

        const bookings = await Booking.find({
            checkInDate: { $gte: new Date(startDate) },
            checkOutDate: { $lte: new Date(endDate) }
        }).sort({ checkInDate: -1 });

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};
