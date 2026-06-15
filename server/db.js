const { Pool } = require('pg');
const logger = require('./logger');

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

let pool = null;
let useMemoryDB = false;

if (DB_CONNECTION_STRING) {
    logger.info('[DB] Initializing PostgreSQL Pool...');
    pool = new Pool({
        connectionString: DB_CONNECTION_STRING,
        ssl: DB_CONNECTION_STRING.includes('neon.tech') ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
        logger.error('[DB] Unexpected error on idle client', err);
    });
} else {
    logger.warn('[DB] No DB_CONNECTION_STRING provided. Running in memory mode.');
    useMemoryDB = true;
}

module.exports = {
    pool,
    useMemoryDB,
    query: (text, params) => {
        if (!pool) {
            throw new Error('Database pool not initialized');
        }
        return pool.query(text, params);
    },
    sql: async (strings, ...values) => {
        if (!pool) {
            throw new Error('Database pool not initialized');
        }
        let query = strings[0];
        for (let i = 0; i < values.length; i++) {
            query += `$${i + 1}${strings[i + 1]}`;
        }
        const result = await pool.query(query, values);
        return result.rows;
    }
};
