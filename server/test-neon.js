require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

console.log('Testing Neon connection...');
console.log('Connection string:', process.env.DB_CONNECTION_STRING?.replace(/:([^:@]+)@/, ':***@'));

// Test 1: Using neon() HTTP function with fetch options
console.log('\n--- Test 1: neon() HTTP ---');
const test1 = async () => {
  try {
    console.log('Test 1: Creating sql function with fetchTimeout...');
    const sql = neon(process.env.DB_CONNECTION_STRING, {
      fetchOptions: {
        signal: AbortSignal.timeout(30000)
      }
    });
    console.log('Test 1: Running SELECT NOW()...');
    const result = await sql`SELECT NOW()`;
    console.log('✅ neon() success:', result);
  } catch (err) {
    console.error('❌ neon() error:', err);
    console.error('Stack:', err.stack);
  }
};

// Run test
test1().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});


