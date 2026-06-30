import { AppError } from "../../utils/AppError";

import { prisma } from "../../config/prisma";

import { verifyRefreshToken } from "../../utils/tokens";

import { generateAccessToken } from "../../utils/tokens";

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

    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    return {
        accessToken, 
        refreshToken 
    }
};