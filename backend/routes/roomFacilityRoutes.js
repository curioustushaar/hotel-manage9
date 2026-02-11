const express = require('express');
const router = express.Router();
const {
    getFacilities,
    addFacility,
    updateFacility,
    deleteFacility
} = require('../controllers/roomFacilityController');

router.get('/list', getFacilities);
router.post('/add', addFacility);
router.put('/update/:id', updateFacility);
router.delete('/delete/:id', deleteFacility);

module.exports = router;
