const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// General API rate limiter
// Development: very relaxed (5000 req / 10 min)
// Production: strict (200 req / 10 min)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: isDev ? 5000 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again in 10 minutes'
    }
});

// Login route limiter - stricter to prevent brute force
// Development: relaxed (50 attempts / 15 min)
// Production: strict (10 attempts / 15 min)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 50 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    }
});

module.exports = { limiter, loginLimiter };
