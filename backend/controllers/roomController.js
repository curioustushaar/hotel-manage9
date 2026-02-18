const Room = require('../models/roomModel');
const { computeStatusForRooms } = require('../services/availabilityService');

// @desc    Get all rooms (with optional date-based dynamic status)
// @route   GET /api/rooms/list?date=YYYY-MM-DD
// @access  Public
const getRooms = async (req, res) => {
    try {
        const { floor, roomType, bedType, status, date } = req.query;
        let query = {};

        if (floor && floor !== 'All') query.floor = floor;
        if (roomType && roomType !== 'All') query.roomType = roomType;
        if (bedType && bedType !== 'All') query.bedType = bedType;

        // Only apply static status filter if no date is provided
        // (when date is provided, status is computed dynamically)
        if (status && status !== 'All' && !date) query.status = status;

        let rooms = await Room.find(query).sort({ roomNumber: 1 });

        // FEATURE: Smart Filter fallback
        let exactMatch = true;
        if (rooms.length === 0 && (floor || roomType || bedType)) {
            exactMatch = false;
            const allAvailable = await Room.find({ status: 'Available' });
            rooms = allAvailable.sort((a, b) => {
                if (a.floor === floor && b.floor !== floor) return -1;
                if (a.floor !== floor && b.floor === floor) return 1;
                if (a.roomType === roomType && b.roomType !== roomType) return -1;
                if (a.roomType !== roomType && b.roomType === roomType) return 1;
                return a.price - b.price;
            }).slice(0, 10);
        }

        // DATE-BASED DYNAMIC STATUS: Compute status for each room based on bookings
        if (date) {
            const targetDate = new Date(date);
            if (!isNaN(targetDate.getTime())) {
                const roomsWithStatus = await computeStatusForRooms(rooms, targetDate);

                // Apply status filter AFTER computing dynamic status
                let filtered = roomsWithStatus;
                if (status && status !== 'All') {
                    filtered = roomsWithStatus.filter(r => r.computedStatus === status);
                }

                return res.status(200).json({
                    success: true,
                    count: filtered.length,
                    exactMatch,
                    dateFiltered: true,
                    filterDate: date,
                    data: filtered
                });
            }
        }

        res.status(200).json({
            success: true,
            count: rooms.length,
            exactMatch,
            dateFiltered: false,
            data: rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching rooms',
            error: error.message
        });
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching room',
            error: error.message
        });
    }
};

// @desc    Add new room
// @route   POST /api/rooms/add
// @access  Private/Admin
const addRoom = async (req, res) => {
    try {
        const { roomNumber, roomType, bedType, price, capacity, floor, status } = req.body;

        // Validation
        if (!roomNumber || !roomType || !price || !capacity || !floor) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // FEATURE: Pricing Validation
        const RoomTypePricing = require('../models/roomTypePricingModel');
        const pricing = await RoomTypePricing.findOne({ roomType });
        if (pricing) {
            if (price < pricing.minPrice || price > pricing.maxPrice) {
                return res.status(400).json({
                    success: false,
                    message: `Price ₹${price} is outside allowed range for ${roomType} (₹${pricing.minPrice} - ₹${pricing.maxPrice})`
                });
            }
        }

        // Check if room number already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: 'Room number already exists'
            });
        }

        // Create new room
        const room = await Room.create({
            roomNumber,
            roomType,
            bedType: bedType || 'Double',
            price,
            capacity,
            floor,
            status: status || 'Available',
            // PHASE 1 UPGRADE: Accept new enterprise fields
            roomViewType: req.body.roomViewType,
            smokingPolicy: req.body.smokingPolicy,
            roomSize: req.body.roomSize,
            isSmartRoom: req.body.isSmartRoom,
            dynamicRateEnabled: req.body.dynamicRateEnabled,
            facilities: req.body.facilities || []
        });

        res.status(201).json({
            success: true,
            message: 'Room added successfully',
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding room',
            error: error.message
        });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/update/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // FEATURE: Pricing Validation
        if (updateData.price && updateData.roomType) {
            const RoomTypePricing = require('../models/roomTypePricingModel');
            const pricing = await RoomTypePricing.findOne({ roomType: updateData.roomType });
            if (pricing) {
                if (updateData.price < pricing.minPrice || updateData.price > pricing.maxPrice) {
                    return res.status(400).json({
                        success: false,
                        message: `Price ₹${updateData.price} is outside allowed range for ${updateData.roomType} (₹${pricing.minPrice} - ₹${pricing.maxPrice})`
                    });
                }
            }
        }

        // If updating room number, check if new number already exists
        if (updateData.roomNumber) {
            const existingRoom = await Room.findOne({
                roomNumber: updateData.roomNumber,
                _id: { $ne: id }
            });
            if (existingRoom) {
                return res.status(400).json({
                    success: false,
                    message: 'Room number already exists'
                });
            }
        }

        const room = await Room.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating room',
            error: error.message
        });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/delete/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findByIdAndDelete(id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting room',
            error: error.message
        });
    }
};

// @desc    Get available rooms for a date range (real overlap detection)
// @route   GET /api/rooms/available?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Public
const getAvailableRooms = async (req, res) => {
    try {
        const { from, to, type, roomViewType, smokingPolicy, isSmartRoom } = req.query;

        // Build base room filter
        let query = {};
        if (type) query.roomType = type;
        if (roomViewType) query.roomViewType = roomViewType;
        if (smokingPolicy) query.smokingPolicy = smokingPolicy;
        if (isSmartRoom !== undefined) {
            query.isSmartRoom = isSmartRoom === 'true' || isSmartRoom === true;
        }

        // Exclude rooms that are under maintenance
        query.status = { $ne: 'Under Maintenance' };

        let rooms = await Room.find(query).sort({ roomNumber: 1 });

        // If date range provided, filter by real booking overlap
        if (from && to) {
            const Booking = require('../models/bookingModel');
            const checkIn = new Date(from);
            const checkOut = new Date(to);

            // Find all room numbers that have overlapping bookings
            const conflictingBookings = await Booking.find({
                checkInDate: { $lt: checkOut },
                checkOutDate: { $gt: checkIn },
                status: { $in: ['Upcoming', 'Checked-in'] }
            }).select('roomNumber rooms');

            // Collect all conflicting room numbers
            const bookedRoomNumbers = new Set();
            conflictingBookings.forEach(b => {
                if (b.roomNumber) bookedRoomNumbers.add(b.roomNumber);
                if (b.rooms && b.rooms.length > 0) {
                    b.rooms.forEach(r => {
                        if (r.roomNumber) bookedRoomNumbers.add(r.roomNumber);
                    });
                }
            });

            // Filter out booked rooms
            rooms = rooms.filter(r => !bookedRoomNumbers.has(r.roomNumber));
        }

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available rooms',
            error: error.message
        });
    }
};


module.exports = {
    getRooms,
    getRoomById,
    addRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms
};
