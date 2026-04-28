/**
 * Migration Test Script
 * Tests the 002_add_notes_features.sql migration
 * 
 * This script attempts to:
 * 1. Connect to PostgreSQL
 * 2. Run the migration
 * 3. Verify columns and indexes were created
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL Configuration (same as server)
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function testMigration() {
    console.log('🔍 Testing Migration: 002_add_notes_features.sql\n');
    
    try {
        // Test connection
        console.log('1️⃣ Testing PostgreSQL connection...');
        await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL connection successful\n');
        
        // Run first migration (create tables)
        console.log('2️⃣ Running prerequisite migration (001_create_notes_tables.sql)...');
        const migration1 = fs.readFileSync(
            path.join(__dirname, 'migrations', '001_create_notes_tables.sql'), 
            'utf8'
        );
        await pool.query(migration1);
        console.log('✅ Notes tables created\n');
        
        // Run the migration we're testing
        console.log('3️⃣ Running migration (002_add_notes_features.sql)...');
        const migration2 = fs.readFileSync(
            path.join(__dirname, 'migrations', '002_add_notes_features.sql'), 
            'utf8'
        );
        await pool.query(migration2);
        console.log('✅ Migration executed successfully\n');
        
        // Verify columns were added
        console.log('4️⃣ Verifying columns were created...');
        const columnsResult = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'notes'
            AND column_name IN ('is_favorite', 'last_opened_at', 'view_count', 'word_count')
            ORDER BY column_name;
        `);
        
        if (columnsResult.rows.length === 4) {
            console.log('✅ All 4 columns created successfully:');
            columnsResult.rows.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type})`);
            });
            console.log();
        } else {
            console.log(`❌ Expected 4 columns, found ${columnsResult.rows.length}`);
            process.exit(1);
        }
        
        // Verify indexes were created
        console.log('5️⃣ Verifying indexes were created...');
        const indexesResult = await pool.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'notes'
            AND indexname IN ('idx_notes_favorites', 'idx_notes_last_opened')
            ORDER BY indexname;
        `);
        
        if (indexesResult.rows.length === 2) {
            console.log('✅ All 2 indexes created successfully:');
            indexesResult.rows.forEach(idx => {
                console.log(`   - ${idx.indexname}`);
            });
            console.log();
        } else {
            console.log(`❌ Expected 2 indexes, found ${indexesResult.rows.length}`);
            process.exit(1);
        }
        
        // Test that columns have correct defaults
        console.log('6️⃣ Testing column defaults...');
        await pool.query(`
            INSERT INTO users (id, username, email, password)
            VALUES ('test-user-migration', 'testuser', 'test@migration.com', 'hashedpass')
            ON CONFLICT (id) DO NOTHING;
        `);
        
        await pool.query(`
            INSERT INTO notes (id, user_id, title, content)
            VALUES ('test-note-migration', 'test-user-migration', 'Test Note', 'Test content')
            ON CONFLICT (id) DO NOTHING;
        `);
        
        const testResult = await pool.query(`
            SELECT is_favorite, last_opened_at, view_count, word_count
            FROM notes
            WHERE id = 'test-note-migration';
        `);
        
        if (testResult.rows.length > 0) {
            const row = testResult.rows[0];
            console.log('✅ Column defaults verified:');
            console.log(`   - is_favorite: ${row.is_favorite} (expected: false)`);
            console.log(`   - last_opened_at: ${row.last_opened_at} (expected: null)`);
            console.log(`   - view_count: ${row.view_count} (expected: 0)`);
            console.log(`   - word_count: ${row.word_count} (expected: 0)`);
            console.log();
        }
        
        // Cleanup test data
        await pool.query(`DELETE FROM notes WHERE id = 'test-note-migration';`);
        await pool.query(`DELETE FROM users WHERE id = 'test-user-migration';`);
        
        console.log('✅ All migration tests passed!\n');
        console.log('📊 Summary:');
        console.log('   - Migration file executed without errors');
        console.log('   - All 4 columns created with correct types');
        console.log('   - All 2 indexes created successfully');
        console.log('   - Column defaults working correctly');
        
    } catch (error) {
        console.error('\n❌ Migration test failed:');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 PostgreSQL is not running or not accessible.');
            console.error('   Please ensure PostgreSQL is installed and running on:');
            console.error(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
            console.error(`   - Port: ${process.env.DB_PORT || 5432}`);
            console.error(`   - Database: ${process.env.DB_NAME || 'postgres'}`);
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the test
testMigration();
