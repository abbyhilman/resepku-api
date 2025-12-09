// src/controllers/saved.controller.js

const pool = require('../config/database');

/**
 * Save a recipe to favorites
 * POST /api/v1/users/saved
 * Protected route - requires authentication
 */
async function saveRecipe(req, res) {
    const client = await pool.connect();

    try {
        const { recipe_id } = req.body;
        const user_id = req.user.user_id; // From authMiddleware

        // Validate input
        if (!recipe_id) {
            return res.status(400).json({
                success: false,
                message: 'recipe_id is required'
            });
        }

        // Check if recipe exists
        const recipeCheck = await client.query(
            'SELECT recipe_id FROM recipes WHERE recipe_id = $1',
            [recipe_id]
        );

        if (recipeCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check if already saved (prevent duplicates)
        const existingCheck = await client.query(
            'SELECT id FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipe_id]
        );

        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Recipe already saved'
            });
        }

        // Save recipe
        const result = await client.query(
            'INSERT INTO saved_recipes (user_id, recipe_id) VALUES ($1, $2) RETURNING *',
            [user_id, recipe_id]
        );

        res.status(201).json({
            success: true,
            message: 'Recipe saved successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Save recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save recipe',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Remove a recipe from favorites
 * DELETE /api/v1/users/saved/:id
 * Protected route - requires authentication
 */
async function unsaveRecipe(req, res) {
    const client = await pool.connect();

    try {
        const { id: recipe_id } = req.params;
        const user_id = req.user.user_id; // From authMiddleware

        // Delete saved recipe
        const result = await client.query(
            'DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2 RETURNING *',
            [user_id, recipe_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Saved recipe not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Recipe removed from favorites'
        });

    } catch (error) {
        console.error('Unsave recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove recipe',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Get all saved recipes for the authenticated user
 * GET /api/v1/users/saved
 * Protected route - requires authentication
 */
async function getSavedRecipes(req, res) {
    const client = await pool.connect();

    try {
        const user_id = req.user.user_id; // From authMiddleware

        // Get saved recipes with recipe details
        const result = await client.query(
            `SELECT 
                sr.id,
                sr.saved_at,
                r.*
            FROM saved_recipes sr
            JOIN recipes r ON sr.recipe_id = r.recipe_id
            WHERE sr.user_id = $1
            ORDER BY sr.saved_at DESC`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Get saved recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved recipes',
            error: error.message
        });
    } finally {
        client.release();
    }
}

module.exports = {
    saveRecipe,
    unsaveRecipe,
    getSavedRecipes
};
