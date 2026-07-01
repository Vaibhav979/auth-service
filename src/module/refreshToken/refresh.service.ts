import { AppError } from "../../utils/AppError";

import { prisma } from "../../config/prisma";

import { verifyRefreshToken } from "../../utils/tokens";

import { generateAccessToken, generateRefreshToken, saveRefreshToken } from "../../utils/tokens";

export const refreshUser = async (
    refreshToken: string
) => {
    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
        where: {
            token: refreshToken
        }
    });

    if (!storedToken) {
        throw new AppError("Unauthorized", 401);
    }

    if (storedToken.expiresAt < new Date()) {
        throw new AppError("Refresh token expired", 401);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id
        }
    });

    if (!user) {
        throw new AppError("Unauthorized", 401);
    }

    await prisma.refreshToken.delete({
        where: {
            token: refreshToken
        }
    });

    const newRefreshToken = generateRefreshToken(user.id);

    saveRefreshToken(user.id, newRefreshToken);

    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    return {
        accessToken, 
        refreshToken: newRefreshToken
    }
};