const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms/list
// @access  Public
const getRooms = async (req, res) => {
    try {
        const { floor, roomType, bedType, status } = req.query;
        let query = {};

        if (floor && floor !== 'All') query.floor = floor;
        if (roomType && roomType !== 'All') query.roomType = roomType;
        if (bedType && bedType !== 'All') query.bedType = bedType;
        if (status && status !== 'All') query.status = status;

        let rooms = await Room.find(query).sort({ roomNumber: 1 });

        // FEATURE 1 & 9: Smart Filter & Optional Smart Upgrade
        let exactMatch = true;
        if (rooms.length === 0 && (floor || roomType || bedType)) {
            exactMatch = false;
            // Find closest matches
            // We'll relax filters one by one or just fetch all and sort
            const allAvailable = await Room.find({ status: 'Available' });

            rooms = allAvailable.sort((a, b) => {
                // Priority 1: Same floor
                if (a.floor === floor && b.floor !== floor) return -1;
                if (a.floor !== floor && b.floor === floor) return 1;

                // Priority 2: Same room type
                if (a.roomType === roomType && b.roomType !== roomType) return -1;
                if (a.roomType !== roomType && b.roomType === roomType) return 1;

                // Priority 3: Same price range (closest price)
                // Since we don't have a target price in query, we can't do exact price range comparison
                // but we can sort by price as a fallback
                return a.price - b.price;
            }).slice(0, 10); // Return top 10 closest
        }

        res.status(200).json({
            success: true,
            count: rooms.length,
            exactMatch,
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
        const RoomTypePricing = require('../models/RoomTypePricing');
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
            const RoomTypePricing = require('../models/RoomTypePricing');
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

// @desc    Get available rooms for a date range
// @route   GET /api/rooms/available
// @access  Public
const getAvailableRooms = async (req, res) => {
    try {
        const { from, to, type } = req.query;
        const Booking = require('../models/Booking');
        const MaintenanceBlock = require('../models/MaintenanceBlock');

        // 1. Start with all rooms of the requested type (or all rooms if no type specified)
        let query = {};
        if (type) {
            query.roomType = type;
        }

        const allPotentialRooms = await Room.find(query).sort({ roomNumber: 1 });

        // If no dates provided, just return rooms with status 'Available' or 'Dirty'
        if (!from || !to) {
            const currentAvailable = allPotentialRooms.filter(r => ['Available', 'Dirty'].includes(r.status));
            return res.status(200).json({
                success: true,
                data: currentAvailable
            });
        }

        const checkIn = new Date(from);
        const checkOut = new Date(to);

        // 2. Identify rooms that have overlapping bookings
        const overlappingBookings = await Booking.find({
            status: { $in: ['Upcoming', 'Checked-in', 'RESERVED', 'IN_HOUSE', 'CheckedIn', 'Reserved'] },
            $and: [
                { checkInDate: { $lt: checkOut } },
                { checkOutDate: { $gt: checkIn } }
            ]
        });

        const bookedRoomNumbers = new Set();
        overlappingBookings.forEach(booking => {
            if (booking.isMulti && booking.rooms) {
                booking.rooms.forEach(r => {
                    if (r.roomNumber) bookedRoomNumbers.add(r.roomNumber);
                });
            } else if (booking.roomNumber) {
                bookedRoomNumbers.add(booking.roomNumber);
            }
        });

        // 3. Identify rooms that have maintenance blocks
        const maintenanceBlocks = await MaintenanceBlock.find({
            status: { $ne: 'Completed' },
            $and: [
                { startDate: { $lt: checkOut } },
                { endDate: { $gt: checkIn } }
            ]
        });

        maintenanceBlocks.forEach(block => {
            if (block.room) bookedRoomNumbers.add(block.room);
        });

        // 4. Filter out booked/blocked rooms from our potential list
        const availableRooms = allPotentialRooms.filter(room => !bookedRoomNumbers.has(room.roomNumber));

        res.status(200).json({
            success: true,
            count: availableRooms.length,
            data: availableRooms
        });
    } catch (error) {
        console.error('Error in getAvailableRooms:', error);
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
