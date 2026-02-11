const express = require('express');
const router = express.Router();
const {
    getBedTypes,
    addBedType,
    updateBedType,
    deleteBedType
} = require('../controllers/bedTypeController');

router.get('/list', getBedTypes);
router.post('/add', addBedType);
router.put('/update/:id', updateBedType);
router.delete('/delete/:id', deleteBedType);

module.exports = router;
