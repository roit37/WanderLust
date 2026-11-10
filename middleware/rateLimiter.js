const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many login or registration attempts. Please try again after 15 minutes."
});

module.exports = {
    generalLimiter,
    authLimiter
};
