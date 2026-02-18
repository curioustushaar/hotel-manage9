const express = require('express');
const router = express.Router();
const {
    getMealTypes,
    addMealType,
    updateMealType,
    deleteMealType
} = require('../controllers/mealTypeController');

router.get('/list', getMealTypes);
router.post('/add', addMealType);
router.put('/update/:id', updateMealType);
router.delete('/delete/:id', deleteMealType);

module.exports = router;
