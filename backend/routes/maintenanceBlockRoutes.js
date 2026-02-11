const express = require('express');
const router = express.Router();
const { getMaintenanceBlocks, addMaintenanceBlock, updateMaintenanceBlock, deleteMaintenanceBlock } = require('../controllers/maintenanceBlockController');

router.get('/list', getMaintenanceBlocks);
router.post('/add', addMaintenanceBlock);
router.put('/update/:id', updateMaintenanceBlock);
router.delete('/delete/:id', deleteMaintenanceBlock);

module.exports = router;
