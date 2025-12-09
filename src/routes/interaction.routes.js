// src/routes/interaction.routes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createReview, getReviews } = require('../controllers/reviews.controller');
const { saveRecipe, unsaveRecipe, getSavedRecipes } = require('../controllers/saved.controller');
const { writeLimiter } = require('../middleware/rateLimiter.middleware');
const { validateReview, validateRecipeId, validateSaveRecipe } = require('../middleware/sanitization.middleware');

// Review routes
// POST /api/v1/recipes/:id/reviews - Create review (protected)
router.post('/recipes/:id/reviews', authMiddleware, writeLimiter, validateReview, createReview);

// GET /api/v1/recipes/:id/reviews - Get reviews for a recipe
router.get('/recipes/:id/reviews', validateRecipeId, getReviews);

// Saved recipes routes
// GET /api/v1/users/saved - Get all saved recipes (protected)
router.get('/users/saved', authMiddleware, getSavedRecipes);

// POST /api/v1/users/saved - Save a recipe (protected)
router.post('/users/saved', authMiddleware, writeLimiter, validateSaveRecipe, saveRecipe);

// DELETE /api/v1/users/saved/:id - Remove saved recipe (protected)
router.delete('/users/saved/:id', authMiddleware, writeLimiter, validateRecipeId, unsaveRecipe);

module.exports = router;
