const express = require('express');
const router = express.Router();
const {
    createVisitor,
    getVisitorsByReservation,
    exitVisitor,
    convertVisitor
} = require('../controllers/visitorController');

console.log('✅ Visitor Routes Loaded');

// POST /api/visitors
router.post('/', (req, res, next) => {
    console.log('➡️  POST /api/visitors Request Received');
    createVisitor(req, res, next);
});

// GET /api/visitors/reservation/:reservationId
router.get('/reservation/:reservationId', (req, res, next) => {
    console.log(`➡️  GET /api/visitors/reservation/${req.params.reservationId}`);
    getVisitorsByReservation(req, res, next);
});

// PUT /api/visitors/:id/exit
router.put('/:id/exit', (req, res, next) => {
    console.log(`➡️  PUT /api/visitors/${req.params.id}/exit`);
    exitVisitor(req, res, next);
});

// PUT /api/visitors/:id/convert
router.put('/:id/convert', (req, res, next) => {
    console.log(`➡️  PUT /api/visitors/${req.params.id}/convert`);
    convertVisitor(req, res, next);
});

module.exports = router;
