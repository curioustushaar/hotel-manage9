const express = require('express');
const router = express.Router();
const { getServices, addService, updateService, deleteService } = require('../controllers/complimentaryServiceController');

router.get('/list', getServices);
router.post('/add', addService);
router.put('/update/:id', updateService);
router.delete('/delete/:id', deleteService);

module.exports = router;
