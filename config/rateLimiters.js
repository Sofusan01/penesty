// config/rateLimiters.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 15, // Limit each IP to 15 requests per minute
    message: "ทำรายการมากเกินไป กรุณารอสักครู่ (Too many login attempts, please try again after a minute)",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        console.log(`\x1b[31m[BLOCKED]\x1b[0m Too many login attempts from IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "API Rate limit exceeded"
});

module.exports = {
    loginLimiter,
    apiLimiter
};
