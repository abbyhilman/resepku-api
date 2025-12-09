// src/routes/recipes.routes.js

const express = require('express');
const router = express.Router();
const { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } = require('../controllers/recipes.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { writeLimiter } = require('../middleware/rateLimiter.middleware');
const { validateRecipeQuery, validateRecipeId, validateCreateRecipe, validateUpdateRecipe } = require('../middleware/sanitization.middleware');

// GET /api/v1/recipes - Get all recipes with pagination and filtering
router.get('/', validateRecipeQuery, getRecipes);

// GET /api/v1/recipes/:id - Get single recipe with details
router.get('/:id', validateRecipeId, getRecipeById);

// POST /api/v1/recipes - Create new recipe (protected, requires authentication)
router.post('/', authMiddleware, writeLimiter, validateCreateRecipe, createRecipe);

// PUT /api/v1/recipes/:id - Update recipe (protected, requires authentication)
router.put('/:id', authMiddleware, writeLimiter, validateRecipeId, validateUpdateRecipe, updateRecipe);

// DELETE /api/v1/recipes/:id - Delete recipe (protected, requires authentication)
router.delete('/:id', authMiddleware, writeLimiter, validateRecipeId, deleteRecipe);

module.exports = router;
