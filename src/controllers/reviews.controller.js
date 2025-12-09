// src/controllers/reviews.controller.js

const pool = require('../config/database');

/**
 * Create a new review for a recipe
 * POST /api/v1/recipes/:id/reviews
 * Protected route - requires authentication
 */
async function createReview(req, res) {
    const client = await pool.connect();

    try {
        const { id: recipe_id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.user.user_id; // From authMiddleware

        // Validate input
        if (!rating) {
            return res.status(400).json({
                success: false,
                message: 'Rating is required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
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

        await client.query('BEGIN');

        // Insert review
        const reviewResult = await client.query(
            'INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [recipe_id, user_id, rating, comment || null]
        );

        // Recalculate average rating for the recipe
        const avgResult = await client.query(
            'SELECT AVG(rating)::DECIMAL(3,2) as avg_rating FROM reviews WHERE recipe_id = $1',
            [recipe_id]
        );

        const newAvgRating = avgResult.rows[0].avg_rating;

        // Update recipe's average_rating
        await client.query(
            'UPDATE recipes SET average_rating = $1 WHERE recipe_id = $2',
            [newAvgRating, recipe_id]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: reviewResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Get all reviews for a recipe
 * GET /api/v1/recipes/:id/reviews
 */
async function getReviews(req, res) {
    const client = await pool.connect();

    try {
        const { id: recipe_id } = req.params;

        // Get reviews with user information
        const result = await client.query(
            `SELECT 
                r.review_id,
                r.rating,
                r.comment,
                r.created_at,
                u.user_id,
                u.full_name,
                u.email
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.recipe_id = $1
            ORDER BY r.created_at DESC`,
            [recipe_id]
        );

        res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    } finally {
        client.release();
    }
}

module.exports = {
    createReview,
    getReviews
};
