const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

const { loginLimiter } = require('../middleware/security');

router.post('/register', loginLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);

module.exports = router;
