const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure Brevo API
if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not defined');
}

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (to, subject, html, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempting to send email to: ${to} (attempt ${attempt}/${retries})`);
            console.log('Using Brevo API with key:', process.env.BREVO_API_KEY ? 'Set' : 'Not set');

            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = html;
            sendSmtpEmail.sender = {
                name: process.env.BREVO_FROM_NAME,
                email: process.env.EMAIL_FROM
            };
            sendSmtpEmail.to = [{ email: to }];

            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

            console.log('Email sent successfully via Brevo API:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error(`Email sending failed (attempt ${attempt}/${retries}):`, error.message);

            if (attempt === retries) {
                console.error('All retry attempts failed');
                return { success: false, error: error.message };
            }

            // Wait before retrying (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
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
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
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
