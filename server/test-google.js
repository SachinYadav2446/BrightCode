const https = require('https');

console.log('Testing HTTPS connection to Google...');

const options = {
  hostname: 'google.com',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('✅ HTTPS connection to Google successful!');
  console.log('Status code:', res.statusCode);
  
  res.resume();
});

req.on('error', (error) => {
  console.error('❌ HTTPS error to Google:', error);
});

req.setTimeout(10000, () => {
  console.error('❌ Google request timed out');
  req.destroy();
});

req.end();
