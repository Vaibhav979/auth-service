import { prisma } from "../../config/prisma";

export const findToken = async (
    userId: string
) => {
    return prisma.passwordResetToken.findUnique({
        where: {
            userId
        }
    });
}

export const deleteToken = async (
    userId: string
) => {
    return prisma.passwordResetToken.deleteMany({
        where: {
            userId
        }
    });
}

export const saveResetToken = (
    userId: string,
    hashedToken: string
) => {
    return prisma.passwordResetToken.create({
        data: {
            userId,
            hashedToken,
            expiresAt: new Date(
                Date.now() + 15 * 60 * 1000 // 15 minutes
            )
        }
    });
};