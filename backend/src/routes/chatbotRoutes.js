const express = require('express');
const router = express.Router();
const { chatWithAdvika } = require('../controllers/chatbotController');

// POST /api/chatbot/chat
router.post('/chat', chatWithAdvika);

module.exports = router;
