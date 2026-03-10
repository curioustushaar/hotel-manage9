const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReservationReport } = require('../controllers/reservationReportController');

router.use(protect);
router.get('/', getReservationReport);

module.exports = router;
