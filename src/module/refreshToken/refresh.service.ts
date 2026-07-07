import { AppError } from "../../shared/utils/AppError";

import { verifyRefreshToken } from "../../shared/utils/tokens";

import { generateAccessToken, generateRefreshToken, saveRefreshToken } from "../../shared/utils/tokens";

import * as sessionRepo from "../session/session.repo";

import * as userRepo from "../user/user.repo";

import crypto from "crypto";

import bcrypt from "bcrypt";

export const refreshUser = async (
    refreshToken: string,
    ipAddress: string,
    userAgent: string | null 
) => {
    if (!refreshToken) {
        throw new AppError("Unauthenticated", 401);
    }
    const decoded = verifyRefreshToken(refreshToken);

    const session = await sessionRepo.find(decoded.jti);

    if (!session) {
        throw new AppError("Unauthenticated", 401);
    }

    if (session.expiresAt < new Date()) {
        throw new AppError("Unauthenticated", 401);
    }

    const user = await userRepo.findById(decoded.id);

    if (!user) {
        throw new AppError("Unauthenticated", 401);
    }

    await sessionRepo.deleteSession(decoded.jti);

    const jti = crypto.randomUUID();

    const newRefreshToken = generateRefreshToken(user.id, jti);

    const hashedToken = await bcrypt.hash(newRefreshToken, 10);

    await saveRefreshToken(user.id, hashedToken, jti, ipAddress, userAgent);

    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    return {
        accessToken, 
        refreshToken: newRefreshToken
    }
};