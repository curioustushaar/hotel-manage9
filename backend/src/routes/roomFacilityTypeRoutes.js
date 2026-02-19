const express = require('express');
const router = express.Router();
const {
    getRoomFacilityTypes,
    addRoomFacilityType,
    updateRoomFacilityType,
    deleteRoomFacilityType
} = require('../controllers/roomFacilityTypeController');

router.get('/list', getRoomFacilityTypes);
router.post('/add', addRoomFacilityType);
router.put('/update/:id', updateRoomFacilityType);
router.delete('/delete/:id', deleteRoomFacilityType);

module.exports = router;
