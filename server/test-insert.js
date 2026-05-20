require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DB_CONNECTION_STRING.replace('channel_binding=require', '') });

async function run() {
  try {
    await pool.query("ALTER TABLE notes ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;");
    await pool.query("ALTER TABLE folders ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;");
    console.log("Defaults added!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
