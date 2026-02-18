const express = require('express');
const router = express.Router();
const { getBusinessSources, addBusinessSource, updateBusinessSource, deleteBusinessSource } = require('../controllers/businessSourceController');

router.get('/list', getBusinessSources);
router.post('/add', addBusinessSource);
router.put('/update/:id', updateBusinessSource);
router.delete('/delete/:id', deleteBusinessSource);

module.exports = router;
