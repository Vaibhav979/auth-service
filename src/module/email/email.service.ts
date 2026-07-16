import { transporter } from "../../shared/utils/email";

export const sendVerificationEmail = async (
    email: string,
    userId: string,
    token: string
) => {

    const verificationLink =
        `http://localhost:5000/auth/verify-email?userId=${userId}&token=${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,

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