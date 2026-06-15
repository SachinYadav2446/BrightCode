require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSmtp() {
    console.log("Testing SMTP connection with user:", process.env.SMTP_USER);
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("Error: SMTP_USER or SMTP_PASS not set in environment.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"CodeBright" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: 'Test Email from CodeBright',
            text: 'This is a test email from CodeBright verifying the new App Password.'
        });
        console.log("Email sent successfully! Message ID:", info.messageId);
    } catch (e) {
        console.error("Failed to send email:", e.message);
    }
}

testSmtp();
