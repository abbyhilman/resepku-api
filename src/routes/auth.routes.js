// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { validateRegister, validateLogin } = require('../middleware/sanitization.middleware');

// POST /api/v1/auth/register - Register new user
// Apply strict rate limiting and validation
router.post('/register', authLimiter, validateRegister, register);

// POST /api/v1/auth/login - Login user
// Apply strict rate limiting and validation
router.post('/login', authLimiter, validateLogin, login);

module.exports = router;
