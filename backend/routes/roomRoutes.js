const express = require('express');
const router = express.Router();
const {
    getRooms,
    addRoom,
    updateRoom,
    deleteRoom
} = require('../controllers/roomController');

// Routes
router.get('/list', getRooms);
router.post('/add', addRoom);
router.put('/update/:id', updateRoom);
router.delete('/delete/:id', deleteRoom);

module.exports = router;
