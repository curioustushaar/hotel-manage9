const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/top-selling', reportsController.getTopSellingItems);

module.exports = router;
