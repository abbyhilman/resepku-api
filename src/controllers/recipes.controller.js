// src/controllers/recipes.controller.js

const pool = require('../config/database');

/**
 * Get list of recipes with pagination and filtering
 * GET /api/v1/recipes
 * Query params: limit, offset, prep_time_min, average_rating
 */
async function getRecipes(req, res) {
    const client = await pool.connect();

    try {
        const {
            limit,
            offset = 0,
            prep_time_min,
            average_rating
        } = req.query;

        // Build dynamic query
        let query = 'SELECT * FROM recipes WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        // Filter by prep_time_min (recipes with prep time <= value)
        if (prep_time_min) {
            query += ` AND prep_time_min <= $${paramIndex}`;
            params.push(parseInt(prep_time_min));
            paramIndex++;
        }

        // Filter by average_rating (recipes with rating >= value)
        if (average_rating) {
            query += ` AND average_rating >= $${paramIndex}`;
            params.push(parseFloat(average_rating));
            paramIndex++;
        }

        // Add ordering
        query += ' ORDER BY created_at DESC';

        // Only add LIMIT if provided
        if (limit) {
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(parseInt(limit), parseInt(offset));
        }

        // Execute query
        const result = await client.query(query, params);

        // Get total count for pagination metadata
        let countQuery = 'SELECT COUNT(*) FROM recipes WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (prep_time_min) {
            countQuery += ` AND prep_time_min <= $${countParamIndex}`;
            countParams.push(parseInt(prep_time_min));
            countParamIndex++;
        }

        if (average_rating) {
            countQuery += ` AND average_rating >= $${countParamIndex}`;
            countParams.push(parseFloat(average_rating));
        }

        const countResult = await client.query(countQuery, countParams);
        const totalRecipes = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                total: totalRecipes,
                limit: limit ? parseInt(limit) : null,
                offset: parseInt(offset),
                hasMore: limit ? parseInt(offset) + parseInt(limit) < totalRecipes : false
            }
        });

    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recipes',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Get single recipe with ingredients and steps
 * GET /api/v1/recipes/:id
 */
async function getRecipeById(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        // Get recipe details
        const recipeResult = await client.query(
            'SELECT * FROM recipes WHERE recipe_id = $1',
            [id]
        );

        if (recipeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const recipe = recipeResult.rows[0];

        // Get ingredients for this recipe
        const ingredientsResult = await client.query(
            'SELECT ingredient_id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY ingredient_id',
            [id]
        );

        // Get steps for this recipe
        const stepsResult = await client.query(
            'SELECT step_id, step_number, instruction FROM steps WHERE recipe_id = $1 ORDER BY step_number',
            [id]
        );

        // Combine all data
        const recipeWithDetails = {
            ...recipe,
            ingredients: ingredientsResult.rows,
            steps: stepsResult.rows
        };

        res.status(200).json({
            success: true,
            data: recipeWithDetails
        });

    } catch (error) {
        console.error('Get recipe by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recipe',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Create a new recipe with ingredients and steps
 * POST /api/v1/recipes
 */
async function createRecipe(req, res) {
    const client = await pool.connect();

    try {
        const { title, description, prep_time_min, image_url, ingredients, steps } = req.body;

        // Validate required fields
        if (!title || !description || !prep_time_min) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and prep_time_min are required'
            });
        }

        // Validate ingredients array
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one ingredient is required'
            });
        }

        // Validate steps array
        if (!steps || !Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one step is required'
            });
        }

        await client.query('BEGIN');

        // Insert recipe
        const recipeResult = await client.query(
            'INSERT INTO recipes (title, description, prep_time_min, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, prep_time_min, image_url || null]
        );

        const recipe = recipeResult.rows[0];
        const recipe_id = recipe.recipe_id;

        // Insert ingredients
        const insertedIngredients = [];
        for (const ingredient of ingredients) {
            const { name, quantity, unit } = ingredient;

            if (!name || !quantity || !unit) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Each ingredient must have name, quantity, and unit'
                });
            }

            const ingredientResult = await client.query(
                'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *',
                [recipe_id, name, quantity, unit]
            );
            insertedIngredients.push(ingredientResult.rows[0]);
        }

        // Insert steps
        const insertedSteps = [];
        for (let i = 0; i < steps.length; i++) {
            const { instruction } = steps[i];

            if (!instruction) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Each step must have an instruction'
                });
            }

            const stepResult = await client.query(
                'INSERT INTO steps (recipe_id, step_number, instruction) VALUES ($1, $2, $3) RETURNING *',
                [recipe_id, i + 1, instruction]
            );
            insertedSteps.push(stepResult.rows[0]);
        }

        await client.query('COMMIT');

        // Return complete recipe with ingredients and steps
        res.status(201).json({
            success: true,
            message: 'Recipe created successfully',
            data: {
                ...recipe,
                ingredients: insertedIngredients,
                steps: insertedSteps
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create recipe',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Update a recipe
 * PUT /api/v1/recipes/:id
 */
async function updateRecipe(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { title, description, prep_time_min, image_url, ingredients, steps } = req.body;

        // Check if recipe exists
        const checkResult = await client.query(
            'SELECT * FROM recipes WHERE recipe_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        await client.query('BEGIN');

        // Update main recipe fields
        // We construct the query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title) {
            updates.push(`title = $${paramIndex}`);
            values.push(title);
            paramIndex++;
        }
        if (description) {
            updates.push(`description = $${paramIndex}`);
            values.push(description);
            paramIndex++;
        }
        if (prep_time_min) {
            updates.push(`prep_time_min = $${paramIndex}`);
            values.push(prep_time_min);
            paramIndex++;
        }
        if (image_url !== undefined) { // Allow setting to null/empty
            updates.push(`image_url = $${paramIndex}`);
            values.push(image_url);
            paramIndex++;
        }

        if (updates.length > 0) {
            values.push(id);
            await client.query(
                `UPDATE recipes SET ${updates.join(', ')} WHERE recipe_id = $${paramIndex} RETURNING *`,
                values
            );
        }

        // If ingredients provided, REPLACE all ingredients
        if (ingredients && Array.isArray(ingredients)) {
            // Delete existing ingredients
            await client.query('DELETE FROM ingredients WHERE recipe_id = $1', [id]);

            // Insert new ingredients
            for (const ingredient of ingredients) {
                const { name, quantity, unit } = ingredient;
                if (!name || !quantity || !unit) {
                    throw new Error('Invalid ingredient data');
                }
                await client.query(
                    'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4)',
                    [id, name, quantity, unit]
                );
            }
        }

        // If steps provided, REPLACE all steps
        if (steps && Array.isArray(steps)) {
            // Delete existing steps
            await client.query('DELETE FROM steps WHERE recipe_id = $1', [id]);

            // Insert new steps
            for (let i = 0; i < steps.length; i++) {
                const { instruction } = steps[i];
                if (!instruction) {
                    throw new Error('Invalid step data');
                }
                await client.query(
                    'INSERT INTO steps (recipe_id, step_number, instruction) VALUES ($1, $2, $3)',
                    [id, i + 1, instruction]
                );
            }
        }

        await client.query('COMMIT');

        // Fetch updated recipe with details
        const updatedRecipe = await getRecipeDetails(client, id);

        res.status(200).json({
            success: true,
            message: 'Recipe updated successfully',
            data: updatedRecipe
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update recipe',
            error: error.message
        });
    } finally {
        client.release();
    }
}

/**
 * Delete a recipe
 * DELETE /api/v1/recipes/:id
 */
async function deleteRecipe(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        // Check if recipe exists
        const checkResult = await client.query(
            'SELECT recipe_id, title FROM recipes WHERE recipe_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const recipe = checkResult.rows[0];

        await client.query('BEGIN');

        // Delete related data (cascade is set in DB, but good to be explicit or let DB handle it)
        // With ON DELETE CASCADE in schema, deleting from recipes is enough
        await client.query('DELETE FROM recipes WHERE recipe_id = $1', [id]);

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Recipe deleted successfully',
            data: {
                recipe_id: recipe.recipe_id,
                title: recipe.title
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete recipe',
            error: error.message
        });
    } finally {
        client.release();
    }
}

// Helper function to get full recipe details
async function getRecipeDetails(client, id) {
    const recipeResult = await client.query('SELECT * FROM recipes WHERE recipe_id = $1', [id]);
    const ingredientsResult = await client.query(
        'SELECT ingredient_id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY ingredient_id',
        [id]
    );
    const stepsResult = await client.query(
        'SELECT step_id, step_number, instruction FROM steps WHERE recipe_id = $1 ORDER BY step_number',
        [id]
    );

    return {
        ...recipeResult.rows[0],
        ingredients: ingredientsResult.rows,
        steps: stepsResult.rows
    };
}

module.exports = {
    getRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
};
