const express = require('express');
const router = express.Router();
const { getExtraCharges, addExtraCharge, updateExtraCharge, deleteExtraCharge } = require('../controllers/extraChargeController');

router.get('/list', getExtraCharges);
router.post('/add', addExtraCharge);
router.put('/update/:id', updateExtraCharge);
router.delete('/delete/:id', deleteExtraCharge);

module.exports = router;
