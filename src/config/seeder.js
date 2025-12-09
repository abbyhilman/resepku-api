// src/config/seeder.js

const pool = require('./database');
const bcrypt = require('bcrypt');

/**
 * Seed database with sample data for testing
 */
async function seedDatabase() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🌱 Starting database seeding...');

        // Check if data already exists
        const userCheck = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCheck.rows[0].count) > 0) {
            console.log('⚠️  Database already has data. Skipping seeding.');
            await client.query('ROLLBACK');
            return;
        }

        // 1. Create sample users
        const password_hash = await bcrypt.hash('password123', 10);

        const userResult = await client.query(`
            INSERT INTO users (email, password_hash, full_name) VALUES
            ('john@example.com', $1, 'John Doe'),
            ('jane@example.com', $1, 'Jane Smith'),
            ('chef@example.com', $1, 'Chef Gordon')
            RETURNING user_id
        `, [password_hash]);

        console.log('✅ Sample users created');

        // 2. Create sample recipes
        const recipeResult = await client.query(`
            INSERT INTO recipes (title, description, prep_time_min, average_rating, image_url) VALUES
            ('Nasi Goreng Spesial', 'Nasi goreng dengan bumbu rahasia dan telur mata sapi', 20, 4.5, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Nasi-Goreng.jpg/800px-Nasi-Goreng.jpg'),
            ('Soto Ayam', 'Soto ayam kuah kuning dengan bumbu rempah', 45, 4.8, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Soto_Ayam_home-made.JPG/800px-Soto_Ayam_home-made.JPG'),
            ('Rendang Daging', 'Rendang daging sapi khas Padang yang lezat', 120, 5.0, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Rendang_daging_sapi.jpg/800px-Rendang_daging_sapi.jpg'),
            ('Gado-Gado', 'Salad sayuran dengan saus kacang khas Indonesia', 30, 4.2, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gado_gado.jpg/800px-Gado_gado.jpg'),
            ('Sate Ayam', 'Sate ayam dengan bumbu kacang gurih manis', 40, 4.6, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Sate_ayam.jpg/800px-Sate_ayam.jpg'),
            ('Mie Goreng Jawa', 'Mie goreng pedas manis khas Jawa dengan sayuran segar dan telur', 25, 4.7, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Mi_goreng.JPG/800px-Mi_goreng.JPG'),
            ('Ayam Bakar Madu', 'Ayam bakar dengan olesan madu dan bumbu rempah yang gurih manis', 50, 4.9, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Ayam_bakar.jpg/800px-Ayam_bakar.jpg'),
            ('Es Cendol', 'Minuman segar cendol pandan dengan santan dan gula merah', 15, 4.4, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cendol_penang.jpg/800px-Cendol_penang.jpg'),
            ('Bakso Kuah', 'Bakso daging sapi dengan kuah kaldu gurih dan mie', 60, 4.8, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Bakso_mi_bihun.jpg/800px-Bakso_mi_bihun.jpg')
            RETURNING recipe_id
        `);

        const recipeIds = recipeResult.rows.map(r => r.recipe_id);
        console.log('✅ Sample recipes created');

        // 3. Create ingredients for first recipe (Nasi Goreng)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Nasi putih', '3', 'piring'),
            ($1, 'Bawang putih', '3', 'siung'),
            ($1, 'Bawang merah', '5', 'siung'),
            ($1, 'Kecap manis', '2', 'sdm'),
            ($1, 'Telur', '2', 'butir'),
            ($1, 'Ayam suwir', '100', 'gram')
        `, [recipeIds[0]]);

        // Ingredients for Soto Ayam
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Ayam', '500', 'gram'),
            ($1, 'Kunyit', '2', 'cm'),
            ($1, 'Jahe', '3', 'cm'),
            ($1, 'Serai', '2', 'batang'),
            ($1, 'Daun jeruk', '3', 'lembar'),
            ($1, 'Bawang goreng', '3', 'sdm')
        `, [recipeIds[1]]);

        // Ingredients for Rendang Daging (index 2)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Daging sapi', '1', 'kg'),
            ($1, 'Santan kental', '500', 'ml'),
            ($1, 'Cabai merah', '15', 'buah'),
            ($1, 'Bawang merah', '10', 'siung'),
            ($1, 'Bawang putih', '5', 'siung'),
            ($1, 'Lengkuas', '3', 'cm'),
            ($1, 'Serai', '2', 'batang'),
            ($1, 'Daun jeruk', '5', 'lembar')
        `, [recipeIds[2]]);

        // Ingredients for Gado-Gado (index 3)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Kacang tanah goreng', '200', 'gram'),
            ($1, 'Tahu goreng', '200', 'gram'),
            ($1, 'Tempe goreng', '200', 'gram'),
            ($1, 'Tauge', '100', 'gram'),
            ($1, 'Kol', '150', 'gram'),
            ($1, 'Kentang rebus', '2', 'buah'),
            ($1, 'Telur rebus', '2', 'butir'),
            ($1, 'Timun', '1', 'buah')
        `, [recipeIds[3]]);

        // Ingredients for Sate Ayam (index 4)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Daging ayam paha', '500', 'gram'),
            ($1, 'Kacang tanah goreng', '200', 'gram'),
            ($1, 'Kecap manis', '4', 'sdm'),
            ($1, 'Bawang merah', '5', 'siung'),
            ($1, 'Bawang putih', '3', 'siung'),
            ($1, 'Cabai rawit', '5', 'buah'),
            ($1, 'Tusuk sate', '20', 'batang')
        `, [recipeIds[4]]);

        // Ingredients for Mie Goreng Jawa (index 5)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Mie telur', '200', 'gram'),
            ($1, 'Kol', '100', 'gram'),
            ($1, 'Sawi hijau', '50', 'gram'),
            ($1, 'Telur', '2', 'butir'),
            ($1, 'Kecap manis', '3', 'sdm'),
            ($1, 'Bawang putih', '4', 'siung'),
            ($1, 'Cabai rawit', '5', 'buah')
        `, [recipeIds[5]]);

        // Ingredients for Ayam Bakar Madu (index 6)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Ayam', '1', 'ekor'),
            ($1, 'Madu', '4', 'sdm'),
            ($1, 'Kecap manis', '3', 'sdm'),
            ($1, 'Bawang putih', '5', 'siung'),
            ($1, 'Jahe', '3', 'cm'),
            ($1, 'Jeruk nipis', '2', 'buah'),
            ($1, 'Mentega', '2', 'sdm')
        `, [recipeIds[6]]);

        // Ingredients for Es Cendol (index 7)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Tepung beras', '100', 'gram'),
            ($1, 'Air pandan', '500', 'ml'),
            ($1, 'Santan kental', '400', 'ml'),
            ($1, 'Gula merah', '200', 'gram'),
            ($1, 'Es batu', '300', 'gram'),
            ($1, 'Garam', '1/4', 'sdt')
        `, [recipeIds[7]]);

        // Ingredients for Bakso Kuah (index 8)
        await client.query(`
            INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
            ($1, 'Daging sapi giling', '500', 'gram'),
            ($1, 'Tepung tapioka', '100', 'gram'),
            ($1, 'Bawang putih', '6', 'siung'),
            ($1, 'Merica bubuk', '1', 'sdt'),
            ($1, 'Mie kuning', '200', 'gram'),
            ($1, 'Seledri', '2', 'batang'),
            ($1, 'Kaldu sapi', '1500', 'ml')
        `, [recipeIds[8]]);

        console.log('✅ Sample ingredients created');

        // 4. Create steps for first recipe (Nasi Goreng)
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Panaskan minyak, tumis bawang putih dan bawang merah hingga harum'),
            ($1, 2, 'Masukkan ayam suwir, aduk hingga matang'),
            ($1, 3, 'Tambahkan nasi putih, aduk rata'),
            ($1, 4, 'Tuang kecap manis, garam, dan merica secukupnya'),
            ($1, 5, 'Buat lubang di tengah, masak telur orak-arik'),
            ($1, 6, 'Aduk semua bahan hingga rata, sajikan hangat')
        `, [recipeIds[0]]);

        // Steps for Soto Ayam
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Rebus ayam hingga matang, angkat dan suwir'),
            ($1, 2, 'Haluskan bumbu: kunyit, jahe, bawang putih, bawang merah'),
            ($1, 3, 'Tumis bumbu halus hingga harum'),
            ($1, 4, 'Masukkan bumbu tumis ke dalam kaldu ayam'),
            ($1, 5, 'Tambahkan serai dan daun jeruk, masak hingga mendidih'),
            ($1, 6, 'Sajikan dengan ayam suwir, taburan bawang goreng, dan pelengkap')
        `, [recipeIds[1]]);

        // Steps for Rendang Daging
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Potong daging sapi bentuk dadu besar, sisihkan'),
            ($1, 2, 'Haluskan cabai, bawang merah, bawang putih, dan lengkuas'),
            ($1, 3, 'Tumis bumbu halus dengan serai dan daun jeruk hingga harum'),
            ($1, 4, 'Masukkan daging, aduk hingga berubah warna'),
            ($1, 5, 'Tuang santan, masak dengan api kecil sambil diaduk'),
            ($1, 6, 'Masak hingga santan mengering dan bumbu meresap, sekitar 2-3 jam')
        `, [recipeIds[2]]);

        // Steps for Gado-Gado
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Rebus sayuran (tauge, kol, kentang) hingga matang, tiriskan'),
            ($1, 2, 'Potong-potong tahu, tempe, telur, dan timun'),
            ($1, 3, 'Haluskan kacang tanah, cabai, bawang, dan garam'),
            ($1, 4, 'Tambahkan air asam jawa dan gula merah, aduk rata'),
            ($1, 5, 'Tata sayuran dan lauk di piring'),
            ($1, 6, 'Siram dengan saus kacang, sajikan dengan kerupuk')
        `, [recipeIds[3]]);

        // Steps for Sate Ayam
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Potong daging ayam dadu kecil, tusuk dengan tusuk sate'),
            ($1, 2, 'Marinasi dengan kecap manis dan garam minimal 30 menit'),
            ($1, 3, 'Haluskan kacang tanah, bawang, cabai untuk bumbu kacang'),
            ($1, 4, 'Tambahkan kecap manis dan air ke bumbu kacang'),
            ($1, 5, 'Bakar sate di atas bara api sambil dibolak-balik'),
            ($1, 6, 'Sajikan sate dengan bumbu kacang dan lontong')
        `, [recipeIds[4]]);

        // Steps for Mie Goreng Jawa
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Rebus mie hingga matang, tiriskan dan beri sedikit minyak'),
            ($1, 2, 'Tumis bawang putih dan cabai hingga harum'),
            ($1, 3, 'Masukkan kol dan sawi, aduk hingga layu'),
            ($1, 4, 'Tambahkan mie, kecap manis, dan garam'),
            ($1, 5, 'Buat telur orak-arik di sisi wajan'),
            ($1, 6, 'Aduk semua bahan hingga rata, sajikan panas')
        `, [recipeIds[5]]);

        // Steps for Ayam Bakar Madu
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Haluskan bawang putih dan jahe, campur dengan kecap dan madu'),
            ($1, 2, 'Lumuri ayam dengan bumbu, marinasi minimal 1 jam'),
            ($1, 3, 'Panggang ayam di atas bara api sedang'),
            ($1, 4, 'Olesi dengan sisa bumbu madu selama memanggang'),
            ($1, 5, 'Balik ayam secara berkala hingga matang merata'),
            ($1, 6, 'Sajikan dengan sambal dan lalapan')
        `, [recipeIds[6]]);

        // Steps for Es Cendol
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Campur tepung beras dengan air pandan, aduk rata'),
            ($1, 2, 'Masak adonan hingga mengental sambil diaduk'),
            ($1, 3, 'Cetak adonan melalui saringan ke air es'),
            ($1, 4, 'Masak santan dengan sedikit garam'),
            ($1, 5, 'Iris gula merah atau cairkan sebagai sirup'),
            ($1, 6, 'Sajikan cendol dengan santan, gula merah, dan es batu')
        `, [recipeIds[7]]);

        // Steps for Bakso Kuah
        await client.query(`
            INSERT INTO steps (recipe_id, step_number, instruction) VALUES
            ($1, 1, 'Haluskan bawang putih, campur dengan daging giling'),
            ($1, 2, 'Tambahkan tepung tapioka dan merica, uleni hingga kalis'),
            ($1, 3, 'Bentuk adonan menjadi bola-bola bakso'),
            ($1, 4, 'Rebus bakso dalam air mendidih hingga mengapung'),
            ($1, 5, 'Siapkan kuah kaldu dengan bumbu'),
            ($1, 6, 'Sajikan bakso dengan mie, kuah, dan taburan seledri')
        `, [recipeIds[8]]);

        console.log('✅ Sample steps created');

        // 5. Create sample reviews
        await client.query(`
            INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES
            ($1, $2, 5, 'Enak banget! Resep favorit keluarga'),
            ($1, $3, 4, 'Mudah dibuat dan rasanya mantap'),
            ($4, $2, 5, 'Rendang terenak yang pernah saya buat!'),
            ($5, $3, 4, 'Sate ayamnya juara, bumbu kacangnya pas')
        `, [recipeIds[0], userResult.rows[0].user_id, userResult.rows[1].user_id, recipeIds[2], recipeIds[3]]);

        console.log('✅ Sample reviews created');

        // 6. Update average ratings (already set in INSERT, but this shows the calculation)
        await client.query(`
            UPDATE recipes r
            SET average_rating = (
                SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
                FROM reviews
                WHERE recipe_id = r.recipe_id
            )
        `);

        // 7. Create sample saved recipes
        await client.query(`
            INSERT INTO saved_recipes (user_id, recipe_id) VALUES
            ($1, $2),
            ($1, $3),
            ($4, $2)
        `, [userResult.rows[0].user_id, recipeIds[0], recipeIds[1], userResult.rows[1].user_id]);

        console.log('✅ Sample saved recipes created');

        await client.query('COMMIT');
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📝 Sample credentials:');
        console.log('   Email: john@example.com');
        console.log('   Email: jane@example.com');
        console.log('   Email: chef@example.com');
        console.log('   Password: password123\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database seeding failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run seeder if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Seeding complete, exiting...');
            process.exit(0);
        })
        .catch(error => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };
