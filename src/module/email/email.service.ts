import { transporter } from "../../shared/utils/email";

export const sendEmail = async ({
    to,
    subject,
    html
}: {
    to: string;
    subject: string;
    html: string;
}) => {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
};

export const sendVerificationEmail = (
    email: string,
    userId: string,
    token: string
) => {

    const verificationLink =
        `http://localhost:5000/auth/verify-email?userId=${userId}&token=${token}`;

    return sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
            <h2>Welcome!</h2>

            <p>Please verify your email.</p>

            <a href="${verificationLink}">
                Verify Email
            </a>
        `
    });
};

export const sendPasswordResetEmail = (
    email: string,
    userId: string,
    token: string
) => {

    const resetLink =
        `http://localhost:5000/auth/reset-password?userId=${userId}&token=${token}`;

    return sendEmail({
        to: email,
        subject: "Reset your password",
        html: `
            <h2>Reset your password</h2>

            <p>Click the link below to reset your password.</p>

            <a href="${resetLink}">
                Reset Password
            </a>

            <p>This link expires in 15 minutes.</p>

            <p>If you didn't request this, you can safely ignore this email.</p>
        `
    });
};