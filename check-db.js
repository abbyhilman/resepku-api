// Check database contents
require('dotenv').config({ path: '.env.supabase' });
const pool = require('./src/config/database');

async function checkDatabase() {
    try {
        console.log('📊 Checking database...\n');

        // Check users
        const users = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log('Users:', users.rows[0].count);

        // Check recipes
        const recipes = await pool.query('SELECT COUNT(*) as count FROM recipes');
        console.log('Recipes:', recipes.rows[0].count);

        // Check ingredients
        const ingredients = await pool.query('SELECT COUNT(*) as count FROM ingredients');
        console.log('Ingredients:', ingredients.rows[0].count);

        // List some recipes
        const recipeList = await pool.query('SELECT recipe_id, title FROM recipes LIMIT 5');
        console.log('\nRecipes:', recipeList.rows);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
