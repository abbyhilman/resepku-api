// src/controllers/search.controller.js

const pool = require('../config/database');

/**
 * Search recipes by keyword
 * GET /api/v1/search?q=keyword
 * Searches in recipe title, description, and ingredient names
 */
async function searchRecipes(req, res) {
    const client = await pool.connect();

    try {
        const { q } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query (q) is required'
            });
        }

        const searchTerm = `%${q.trim()}%`;

        // Search across recipes and ingredients using ILIKE (case-insensitive)
        const query = `
            SELECT DISTINCT r.*
            FROM recipes r
            LEFT JOIN ingredients i ON r.recipe_id = i.recipe_id
            WHERE 
                r.title ILIKE $1 
                OR r.description ILIKE $1 
                OR i.name ILIKE $1
            ORDER BY r.average_rating DESC, r.created_at DESC
        `;

        const result = await client.query(query, [searchTerm]);

        res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length,
            query: q
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message
        });
    } finally {
        client.release();
    }
}

module.exports = {
    searchRecipes
};
