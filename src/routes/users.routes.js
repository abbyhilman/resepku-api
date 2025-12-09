// src/routes/users.routes.js

const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/users.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { writeLimiter } = require('../middleware/rateLimiter.middleware');
const { validateUserId, validateUserQuery } = require('../middleware/sanitization.middleware');

// GET /api/v1/users - Get all users with pagination
router.get('/', validateUserQuery, getAllUsers);

// DELETE /api/v1/users/:id - Delete user by ID (protected, requires authentication)
router.delete('/:id', authMiddleware, writeLimiter, validateUserId, deleteUser);

module.exports = router;
