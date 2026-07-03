import { prisma } from "../../config/prisma";

import crypto from "crypto";

import { AppError } from "../../utils/AppError";

import { generateAccessToken, generateRefreshToken, saveRefreshToken, verifyRefreshToken } from "../../utils/tokens";

import bcrypt from "bcrypt";

export const createUser = async (
    name: string,
    email: string,
    password: string
) => {
    const emailExists = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (emailExists) {
        throw new AppError("User Already Exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }, select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    const accessToken = generateAccessToken(user.id, user.role);

    return {
        user,
        accessToken
    };
};

export const loginUser = async (
    email: string,
    password: string
) => {
    const user = await prisma.user.findUnique({
        where:{
            email
        }, select: {
            id: true,
            name: true,
            password: true,
            email: true,
            role: true
        }
    });

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
        hashedToken
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

    const session = await prisma.refreshToken.findUnique({
        where: {
            jti: decoded.jti
        }
    });

    if (!session) {
        throw new AppError("Unauthorized", 401);
    }

    const isMatch = await bcrypt.compare(refreshToken, session.hashedToken);

    if (!isMatch) {
        throw new AppError("Unauthorized", 401);
    }

    await prisma.refreshToken.delete({
        where: {
            jti: decoded.jti
        }
    });
};