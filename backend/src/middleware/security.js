const rateLimit = require('express-rate-limit');

// Rate limiting middleware to prevent brute force attacks
// Limits each IP to 100 requests per 10 minutes
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again in 10 minutes'
});

// Additional stricter limiter for login routes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 100, // relaxed for development testing
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

module.exports = { limiter, loginLimiter };
