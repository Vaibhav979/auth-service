import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma"; 

import { RefreshTokenPayload } from '../types/jwt';

export const generateAccessToken = (
    id: string,
    role: string
) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "15m"
        }
    );
};

export const generateRefreshToken = (
    id: string,
    jti: string
) => {
    return jwt.sign(
        {
            id,
            jti
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: "7d"
        }
    );
};

export const verifyRefreshToken = (
    refreshToken: string
) => {
    return jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
    ) as RefreshTokenPayload;
}

export const saveRefreshToken = async (
    userId: string,
    jti: string,
    token: string
) => {
    return prisma.refreshToken.create({
        data: {
            hashedToken: token,
            userId,
            jti,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        }
    });
};