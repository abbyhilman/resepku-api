// src/controllers/users.controller.js

const pool = require('../config/database');

/**
 * Get all users
 * GET /api/v1/users
 */
async function getAllUsers(req, res) {
    const client = await pool.connect();

    try {
        const {
            limit = 10,
            offset = 0
        } = req.query;

        // Get users (exclude password_hash for security)
        const query = `
            SELECT 
                user_id,
                email,
                full_name,
                created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const result = await client.query(query, [parseInt(limit), parseInt(offset)]);

        // Get total count
        const countResult = await client.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                total: totalUsers,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < totalUsers
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Delete user by ID
 * DELETE /api/v1/users/:id
 */
async function deleteUser(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        // Check if user exists
        const checkResult = await client.query(
            'SELECT user_id, email FROM users WHERE user_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = checkResult.rows[0];

        await client.query('BEGIN');

        // Delete related data first (foreign key constraints)
        // Delete user's reviews
        await client.query('DELETE FROM reviews WHERE user_id = $1', [id]);

        // Delete user's saved recipes
        await client.query('DELETE FROM saved_recipes WHERE user_id = $1', [id]);

        // Delete the user
        await client.query('DELETE FROM users WHERE user_id = $1', [id]);

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: {
                user_id: user.user_id,
                email: user.email
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    } finally {
        client.release();
    }
}

module.exports = {
    getAllUsers,
    deleteUser
};
