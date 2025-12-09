// src/middleware/rateLimiter.middleware.js

const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for all API endpoints
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip successful requests (only count failed requests)
    skipSuccessfulRequests: false,
    // Skip failed requests
    skipFailedRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP to prevent brute force attacks
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/register requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Only apply to failed login attempts would be ideal, but we'll apply to all for security
    skipSuccessfulRequests: false,
});

/**
 * Moderate rate limiter for write operations (POST, PUT, DELETE)
 * 20 requests per 15 minutes per IP
 */
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 write requests per windowMs
    message: {
        success: false,
        message: 'Too many write requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    writeLimiter
};
