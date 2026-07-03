import { AppError } from "../../utils/AppError";

import { prisma } from "../../config/prisma";

import { verifyRefreshToken } from "../../utils/tokens";

import { generateAccessToken, generateRefreshToken, saveRefreshToken } from "../../utils/tokens";

import crypto from "crypto";

import bcrypt from "bcrypt";

export const refreshUser = async (
    refreshToken: string
) => {
    if (!refreshToken) {
        throw new AppError("Unauthenticated", 401);
    }
    const decoded = verifyRefreshToken(refreshToken);

    const session = await prisma.refreshToken.findUnique({
        where: {
            jti: decoded.jti
        }
    });

    if (!session) {
        throw new AppError("Unauthenticated", 401);
    }

    if (session.expiresAt < new Date()) {
        throw new AppError("Unauthenticated", 401);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id
        }
    });

    if (!user) {
        throw new AppError("Unauthenticated", 401);
    }

    await prisma.refreshToken.delete({
        where: {
            jti: decoded.jti
        }
    });

    const jti = crypto.randomUUID();

    const newRefreshToken = generateRefreshToken(user.id, jti);

    const hashedToken = await bcrypt.hash(newRefreshToken, 10);

    saveRefreshToken(user.id, hashedToken, jti);

    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    return {
        accessToken, 
        refreshToken: newRefreshToken
    }
};