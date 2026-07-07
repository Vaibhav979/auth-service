import jwt from "jsonwebtoken";

import { env } from "../../config/env";

import { RefreshTokenPayload } from '../types/jwt';

import * as sessionRepo from "../../module/session/session.repo";

export const generateAccessToken = (
    id: string,
    role: string
) => {
    return jwt.sign(
        { id, role },
        env.JWT_SECRET,
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
        env.REFRESH_TOKEN_SECRET,
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
        env.REFRESH_TOKEN_SECRET!
    ) as RefreshTokenPayload;
}

export const saveRefreshToken = async (
    userId: string,
    jti: string,
    token: string,
    ipAddress: string,
    userAgent: string | null
) => {
    return sessionRepo.save(
        userId,
        jti,
        token,
        ipAddress,
        userAgent
    );
};