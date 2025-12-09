// src/config/migrations.js

const pool = require('./database');

/**
 * Initialize database tables
 * Creates all tables with proper foreign key relationships
 */
async function initializeDatabase() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🔄 Starting database migration...');

        // 1. Create Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // 2. Create Recipes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS recipes (
                recipe_id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                prep_time_min INTEGER,
                average_rating DECIMAL(3, 2) DEFAULT 0.00,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add image_url column if it doesn't exist (for existing tables)
        await client.query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE recipes ADD COLUMN image_url TEXT;
                EXCEPTION
                    WHEN duplicate_column THEN RAISE NOTICE 'column image_url already exists in recipes.';
                END;
            END $$;
        `);
        console.log('✅ Recipes table created/updated');

        // 3. Create Ingredients table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ingredients (
                ingredient_id SERIAL PRIMARY KEY,
                recipe_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                quantity VARCHAR(100),
                unit VARCHAR(50),
                FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Ingredients table created');

        // 4. Create Steps table
        await client.query(`
            CREATE TABLE IF NOT EXISTS steps (
                step_id SERIAL PRIMARY KEY,
                recipe_id INTEGER NOT NULL,
                step_number INTEGER NOT NULL,
                instruction TEXT NOT NULL,
                FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Steps table created');

        // 5. Create Reviews table
        await client.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                review_id SERIAL PRIMARY KEY,
                recipe_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Reviews table created');

        // 6. Create SavedRecipes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS saved_recipes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                recipe_id INTEGER NOT NULL,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
                UNIQUE(user_id, recipe_id)
            )
        `);
        console.log('✅ SavedRecipes table created');

        // Create indexes for better query performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(average_rating);
            CREATE INDEX IF NOT EXISTS idx_recipes_prep_time ON recipes(prep_time_min);
            CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients(recipe_id);
            CREATE INDEX IF NOT EXISTS idx_steps_recipe ON steps(recipe_id);
            CREATE INDEX IF NOT EXISTS idx_reviews_recipe ON reviews(recipe_id);
            CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
            CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_recipes(user_id);
        `);
        console.log('✅ Indexes created');

        await client.query('COMMIT');
        console.log('✅ Database migration completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { initializeDatabase };
