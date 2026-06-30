import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma"; 

import { JwtPayload } from '../types/jwt';

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
    id: string
) => {
    return jwt.sign(
        { id },
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
    ) as JwtPayload;
}

export const saveRefreshToken = async (
    userId: string,
    token: string
) => {
    return prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        }
    });
};