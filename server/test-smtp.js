require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

console.log('Testing SMTP connection...');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configured***' : 'NOT SET');

transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ SMTP Connection Failed:', error);
    } else {
        console.log('✅ SMTP Server is ready to send emails');
        
        // Send a test email
        const mailOptions = {
            from: '"CodeBright Test" <brightcodelim@gmail.com>',
            to: process.env.SMTP_USER, // Send to yourself
            subject: 'SMTP Test - Connection Successful',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #ef4444;">✅ SMTP Configuration Test</h2>
                    <p>This is a test email to verify your SMTP configuration is working correctly.</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('❌ Failed to send test email:', err);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
            }
            process.exit(0);
        });
    }
});
