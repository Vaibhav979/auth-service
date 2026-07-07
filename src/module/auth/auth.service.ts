import crypto from "crypto";

import * as userRepo from "../user/user.repo";

import * as sessionRepo from "../session/session.repo";

import { AppError } from "../../shared/utils/AppError";

import { generateAccessToken, generateRefreshToken, saveRefreshToken, verifyRefreshToken } from "../../shared/utils/tokens";

import bcrypt from "bcrypt";

export const createUser = async (
    name: string,
    email: string,
    password: string
) => {
    const emailExists = await userRepo.find(email);

    if (emailExists) {
        throw new AppError("User Already Exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.create(name, email, hashedPassword);

    const accessToken = generateAccessToken(user.id, user.role);

    return {
        user,
        accessToken
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
            "User does not exists",
            404
        );
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError(
            "Invalid Credentials",
            401
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
};