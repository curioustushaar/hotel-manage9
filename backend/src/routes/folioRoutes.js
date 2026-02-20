const express = require('express');
const router = express.Router();
const folioController = require('../controllers/folioController');

router.get('/reservation/:reservationId', folioController.getFolioByReservation);
router.post('/add-charge', folioController.addExtraCharge);
router.post('/add-payment', folioController.addPayment);
router.post('/apply-discount', folioController.applyDiscount);

module.exports = router;
