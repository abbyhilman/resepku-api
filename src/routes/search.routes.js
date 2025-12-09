// src/routes/search.routes.js

const express = require('express');
const router = express.Router();
const { searchRecipes } = require('../controllers/search.controller');
const { validateSearch } = require('../middleware/sanitization.middleware');

// GET /api/v1/search?q=keyword - Search recipes
router.get('/', validateSearch, searchRecipes);

module.exports = router;
