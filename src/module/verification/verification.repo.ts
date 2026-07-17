import { prisma } from "../../config/prisma";

export const saveVerificationToken = async (
    userId: string,
    hashedToken: string
) => {
    return prisma.verificationToken.create({
        data: {
            userId,
            hashedToken,
            expiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )
        }
    });
};

export const verifyToken = async (
    userId: string
) => {
    return prisma.verificationToken.findUnique({
        where: {
            userId
        }
    });
};

export const deleteToken = async (
    userId: string
) => {
    return prisma.verificationToken.delete({
        where: {
            userId
        }
    });
};

export const findToken = async(
    userId: string
) => {
    return prisma.verificationToken.findUnique({
        where: {
            userId
        }
    });
};