const express = require('express');
const router = express.Router();
const {
    getRooms,
    getRoomById,
    addRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms
} = require('../controllers/roomController');

// Routes
router.get('/list', getRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoomById);
router.post('/add', addRoom);
router.put('/update/:id', updateRoom);
router.patch('/status/:id', async (req, res) => {
    const { status } = req.body;
    const Room = require('../models/roomModel');
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.delete('/delete/:id', deleteRoom);

module.exports = router;
