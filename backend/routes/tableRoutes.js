const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.get('/list', tableController.getAllTables);
router.post('/add', tableController.createTable);
router.post('/:tableId/reserve', tableController.addReservation);
router.delete('/:tableId/reserve/:reservationId', tableController.cancelReservation);
router.patch('/:tableId/status', tableController.updateTableStatus);

module.exports = router;
