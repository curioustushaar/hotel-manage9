const express = require('express');
const router = express.Router();
const { getSources, addSource, updateSource, deleteSource } = require('../controllers/bookingSourceController');

router.get('/list', getSources);
router.post('/add', addSource);
router.put('/update/:id', updateSource);
router.delete('/delete/:id', deleteSource);

module.exports = router;
