const express = require('express');
const router = express.Router();
const {
    getReservationTypes,
    addReservationType,
    updateReservationType,
    deleteReservationType
} = require('../controllers/reservationTypeController');

router.get('/list', getReservationTypes);
router.post('/add', addReservationType);
router.put('/update/:id', updateReservationType);
router.delete('/delete/:id', deleteReservationType);

module.exports = router;
