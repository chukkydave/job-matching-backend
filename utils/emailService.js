const nodemailer = require('nodemailer');

// For development, we'll use a simple console logger
// In production, you'd configure with real SMTP settings
const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// For development, we'll just log emails to console
const sendEmail = async (to, subject, html) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('\n=== EMAIL SENT ===');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${html}`);
            console.log('==================\n');
            return { success: true };
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@instollarjobs.com',
            to,
            subject,
            html
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

const sendVerificationEmail = async (email, verificationCode) => {
    const subject = 'Verify your Instollar Jobs account';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #002620; padding: 20px; text-align: center;">
                <h1 style="color: #EFFE3D; margin: 0;">Instollar Jobs</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #002620;">Verify Your Email Address</h2>
                <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
                <div style="background-color: #002620; color: #EFFE3D; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    ${verificationCode}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div style="background-color: #002620; padding: 20px; text-align: center; color: #EFFE3D;">
                <p style="margin: 0;">© 2025 Instollar Jobs. All rights reserved.</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html);
};

const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Reset your Instollar Jobs password';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #002620; padding: 20px; text-align: center;">
                <h1 style="color: #EFFE3D; margin: 0;">Instollar Jobs</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #002620;">Reset Your Password</h2>
                <p>You requested to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #002620; color: #EFFE3D; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div style="background-color: #002620; padding: 20px; text-align: center; color: #EFFE3D;">
                <p style="margin: 0;">© 2025 Instollar Jobs. All rights reserved.</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html);
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};
