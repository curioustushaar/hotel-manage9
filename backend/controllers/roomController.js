const Room = require('../models/roomModel');

// @desc    Get all rooms
// @route   GET /api/rooms/list
// @access  Public
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ roomNumber: 1 });

        res.status(200).json({
            success: true,
            count: rooms.length,
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

// @desc    Add new room
// @route   POST /api/rooms/add
// @access  Private/Admin
const addRoom = async (req, res) => {
    try {
        const { roomNumber, roomType, price, capacity, floor, status } = req.body;

        // Validation
        if (!roomNumber || !roomType || !price || !capacity || !floor) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
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
            price,
            capacity,
            floor,
            status: status || 'Available'
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
        const updateData = req.body; // updateData might contain 'floor' too


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

module.exports = {
    getRooms,
    addRoom,
    updateRoom,
    deleteRoom
};
