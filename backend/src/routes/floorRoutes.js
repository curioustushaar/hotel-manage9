const express = require('express');
const router = express.Router();
const {
    getFloors,
    addFloor,
    updateFloor,
    deleteFloor
} = require('../controllers/floorController');

router.get('/list', getFloors);
router.post('/add', addFloor);
router.put('/update/:id', updateFloor);
router.delete('/delete/:id', deleteFloor);

module.exports = router;
