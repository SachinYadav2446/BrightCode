require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

console.log('Testing simple Neon connection...');
console.log('DB_CONNECTION_STRING exists:', !!process.env.DB_CONNECTION_STRING);

async function test() {
  try {
    console.log('Creating sql function...');
    const sql = neon(process.env.DB_CONNECTION_STRING);
    
    console.log('Running SELECT NOW()...');
    const result = await sql`SELECT NOW()`;
    
    console.log('✅ SUCCESS! Result:', result);
  } catch (err) {
    console.error('❌ ERROR:', err);
    console.error('Stack:', err.stack);
  }
}

test();
