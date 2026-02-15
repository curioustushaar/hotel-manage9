const express = require('express');
const router = express.Router();
const {
    getAllPricing,
    getPricingByRoomType,
    updatePricing,
    getCalculatedPrice
} = require('../controllers/pricingController');

router.get('/all', getAllPricing);
router.get('/calculate/:roomType', getCalculatedPrice);
router.get('/:roomType', getPricingByRoomType);
router.post('/update', updatePricing);
router.put('/:roomType', updatePricing);

module.exports = router;
