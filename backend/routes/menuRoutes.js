const express = require('express');
const router = express.Router();
const {
    getMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemById,
    toggleMenuItemStatus
} = require('../controllers/menuController');

// Routes
router.get('/list', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/add', addMenuItem);
router.put('/update/:id', updateMenuItem);
router.delete('/delete/:id', deleteMenuItem);
router.patch('/toggle-status/:id', toggleMenuItemStatus);

module.exports = router;
