import { prisma } from "../../config/prisma";

import { AppError } from "../../utils/AppError";

import { generateAccessToken } from "../../utils/tokens";

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
            "Invalid Credentials",
            401
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

    const { password: _, ...safeUser } = user;

    return {
        user: safeUser,
        accessToken
    };
};