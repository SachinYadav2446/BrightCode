const nodemailer = require('nodemailer');

async function testSmtp() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'codebrightlim@gmail.com',
            pass: 'zttr lklz roix fhsr'
        }
    });

    try {
        await transporter.sendMail({
            from: '"CodeBright" <codebrightlim@gmail.com>',
            to: 'codebrightlim@gmail.com',
            subject: 'Test Email',
            text: 'This is a test email from CodeBright.'
        });
        console.log("Email sent successfully!");
    } catch (e) {
        console.error("Failed to send email:", e.message);
    }
}

testSmtp();
