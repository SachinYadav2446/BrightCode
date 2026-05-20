require('dotenv').config();
const { Client } = require('pg');
const dns = require('dns');

console.log('Testing plain pg connection to Neon...');
console.log('Connection string:', process.env.DB_CONNECTION_STRING?.replace(/:([^:@]+)@/, ':***@'));

// First, resolve the hostname to check DNS
const hostname = 'ep-patient-glade-aq0d9eg-pooler.c.us-east-1.aws.neon.tech';
console.log('\nResolving DNS for:', hostname);
dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('❌ DNS lookup failed:', err);
  } else {
    console.log('✅ DNS resolved:', address, 'Family:', family);
  }
  
  // Now try to connect
  console.log('\nCreating client...');
  const client = new Client({
    connectionString: process.env.DB_CONNECTION_STRING,
    connectionTimeoutMillis: 120000, // 2 minute timeout
    query_timeout: 120000,
    statement_timeout: 120000,
    keepAlive: true,
    ssl: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  });
  
  console.log('Attempting to connect...');
  client.connect((err) => {
    if (err) {
      console.error('\n❌ Connection error:', err);
      console.error('Error name:', err.name);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Stack:', err.stack);
      process.exit(1);
    }
    
    console.log('\n✅ Connected to Neon!');
    
    client.query('SELECT NOW() as current_time, version() as pg_version', (err, res) => {
      if (err) {
        console.error('\n❌ Query error:', err);
      } else {
        console.log('\n✅ Query result:', res.rows);
      }
      
      client.end();
    });
  });
});

