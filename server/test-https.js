const https = require('https');

console.log('Testing HTTPS connection to Neon...');

const options = {
  hostname: 'ep-patient-glade-aq0d9eg-pooler.c.us-east-1.aws.neon.tech',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('✅ HTTPS connection successful!');
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('❌ HTTPS error:', error);
  console.error('Error code:', error.code);
});

req.setTimeout(10000, () => {
  console.error('❌ HTTPS request timed out after 10 seconds');
  req.destroy();
});

req.end();
