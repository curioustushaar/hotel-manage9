const MaintenanceBlock = require('../models/maintenanceBlockModel');
const Room = require('../models/roomModel');

// --- Helpers ---
const updateRoomStatus = async (roomNumber, newStatus) => {
    try {
        await Room.findOneAndUpdate({ roomNumber }, { status: newStatus });
    } catch (err) {
        console.error('Error updating room status:', err);
    }
};

// --- Controllers ---

const getMaintenanceBlocks = async (req, res) => {
    try {
        const blocks = await MaintenanceBlock.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blocks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addMaintenanceBlock = async (req, res) => {
    try {
        const { room, blockType, startDate, endDate, reason } = req.body;

        // Check if room exists
        const existingRoom = await Room.findOne({ roomNumber: room });
        if (!existingRoom) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Create Block
        const newBlock = await MaintenanceBlock.create({
            room,
            blockType,
            startDate,
            endDate,
            reason,
            status: 'Blocked' // Default start status
        });

        // Update Room Status to 'Under Maintenance'
        await updateRoomStatus(room, 'Under Maintenance');

        res.status(201).json({ success: true, data: newBlock });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateMaintenanceBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const originalBlock = await MaintenanceBlock.findById(id);
        if (!originalBlock) return res.status(404).json({ success: false, message: 'Block not found' });

        const updatedBlock = await MaintenanceBlock.findByIdAndUpdate(id, req.body, { new: true });

        // Status Logic:
        // If becoming Completed -> Room Available
        if (status === 'Completed' && originalBlock.status !== 'Completed') {
            await updateRoomStatus(updatedBlock.room, 'Available');
        }
        // If reactivating (Completed -> Blocked/In Progress) -> Room Under Maintenance
        else if (originalBlock.status === 'Completed' && (status === 'Blocked' || status === 'In Progress')) {
            await updateRoomStatus(updatedBlock.room, 'Under Maintenance');
        }

        res.status(200).json({ success: true, data: updatedBlock });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteMaintenanceBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const block = await MaintenanceBlock.findById(id);
        if (!block) return res.status(404).json({ success: false, message: 'Block not found' });

        // If deleting an active block, free the room
        if (block.status !== 'Completed') {
            await updateRoomStatus(block.room, 'Available');
        }

        await MaintenanceBlock.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMaintenanceBlocks, addMaintenanceBlock, updateMaintenanceBlock, deleteMaintenanceBlock };
