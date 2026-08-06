import crypto from "crypto";

import * as userRepo from "../user/user.repo";

import * as sessionRepo from "../session/session.repo";

import * as verificationRepo from "../verification/verification.repo";

import { AppError } from "../../shared/utils/AppError";

import { generateAccessToken, generateRefreshToken, saveRefreshToken, verifyRefreshToken } from "../../shared/utils/tokens";

import { generateSecureToken, hashSecureToken, compareSecureToken } from "../../shared/utils/verification";

import { sendVerificationEmail, sendPasswordResetEmail } from "../email/email.service";

import { hashPassword, verifyPassword } from "../../shared/utils/password";

import * as passwordResetRepo from "./password-reset.repo";

import bcrypt from "bcrypt";
import { logger } from "../../shared/logger/logger";

export const createUser = async (
    name: string,
    email: string,
    password: string
) => {
    const existingUser = await userRepo.find(email);

    if (existingUser) {
        if (existingUser.verified) {
            throw new AppError("User Already Exists", 409);
        } else {
            await verificationRepo.deleteToken(existingUser.id);

            const token = generateSecureToken();

            const hashed = await hashSecureToken(token);

            await verificationRepo.saveVerificationToken(
                existingUser.id,
                hashed
            );

            await sendVerificationEmail(email, existingUser.id, token);

            return {
                message: "Verification email sent"
            };
        }
    }

    const hashedPassword = await hashPassword(password);

    const user = await userRepo.create(name, email, hashedPassword);

    const verificationToken = generateSecureToken();

    const hashedToken = await hashSecureToken(verificationToken);

    await verificationRepo.saveVerificationToken(user.id, hashedToken);

    await sendVerificationEmail(email, user.id, verificationToken);

    return {
        user,
        message: "Registration successful. Please verify your email and login."
    };
};

export const loginUser = async (
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string | null
) => {
    const user = await userRepo.find(email);

    if (!user) {
        throw new AppError(
            "Invalid Credentials",
            401
        );
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
        throw new AppError(
            "Invalid Credentials",
            401
        );
    }

    if (!user.verified) {

        await verificationRepo.deleteToken(user.id);

        const verificationToken = generateSecureToken();

        const hashedToken = await hashSecureToken(verificationToken);

        await verificationRepo.saveVerificationToken(user.id, hashedToken);

        await sendVerificationEmail(email, user.id, verificationToken);

        throw new AppError(
            "Please verify your email. A new verification email has been sent.",
            403
        );
    }

    const accessToken = generateAccessToken(user.id, user.role);

    const jti = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user.id, jti);

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await saveRefreshToken(
        user.id,
        jti,
        hashedToken,
        ipAddress,
        userAgent
    );

    logger.info(
        {
            userId: user.id,
            email: user.email,
            ip: ipAddress
        },
        "User logged in"
    );

    const { password: _, ...safeUser } = user;

    return {
        user: safeUser,
        accessToken,
        refreshToken
    };
};

export const logoutUser = async (
    refreshToken: string
) => {

    const decoded = verifyRefreshToken(refreshToken);

    const session = await sessionRepo.find(decoded.jti);

    if (!session) {
        throw new AppError("Unauthorized", 401);
    }

    const isMatch = await bcrypt.compare(refreshToken, session.hashedToken);

    if (!isMatch) {
        throw new AppError("Unauthorized", 401);
    }

    await sessionRepo.deleteSession(decoded.jti);

    logger.info(
        {
            userId: decoded.id,
            jti: decoded.jti
        },
        "User logged out"
    );
};

export const forgetPassword = async (
    email: string
) => {
    const user = await userRepo.find(email);

    if (!user) {
        return {
            message: "If an account exists, a password reset email has been sent."
        }
    }

    await passwordResetRepo.deleteToken(user.id);

    const secureToken = generateSecureToken();

    const hashedToken = await hashSecureToken(secureToken);

    await passwordResetRepo.saveResetToken(user.id, hashedToken);

    await sendPasswordResetEmail(email, user.id, secureToken);

    return {
        message: "If an account exists, a password reset email has been sent."
    }
};

export const resetPassword = async (
    userId: string,
    token: string,
    newPassword: string
) => {
    const user = await userRepo.findById(userId);

    if (!user || !user.verified) {
        return {
            message: "If an account exists, a password reset email has been sent."
        }
    }

    const resetToken = await passwordResetRepo.findToken(userId);

    if (!resetToken) {
        throw new AppError("Invalid reset link.", 400);
    }

    if (resetToken.expiresAt < new Date()) {
        throw new AppError("Reset link has expired.", 400);
    }

    const isValid = await compareSecureToken(
        token,
        resetToken.hashedToken
    );

    if (!isValid) {
        throw new AppError("Invalid reset link.", 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await userRepo.updatePassword(
        userId,
        hashedPassword
    );

    logger.info(
        {
            userId
        },
        "Password reset successfully"
    );

    await passwordResetRepo.deleteToken(userId);

    await sessionRepo.deleteAllSessions(userId);

    return {
        message: "Password reset successful. Kindly login with new password."
    };
};