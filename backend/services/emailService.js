const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'password'
    }
});

exports.sendNotification = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"HealthScan Notification" <noreply@healthscan.com>',
            to,
            subject,
            text
        });
        console.log(`Notification sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
