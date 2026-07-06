import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export const getSession = async (
    userId: string
) => {
    const session = await prisma.refreshToken.findMany({
        where: {
            userId
        },
        select: {
            id: true,
            userAgent: true,
            createdAt: true,
            expiresAt: true
        }
    });

    return session;
};

export const deleteSessionById = async (
    id: string
) => {
    const session = await prisma.refreshToken.findUnique({
        where: { id }
    });

    if (!session) {
        throw new AppError("Session not found", 404);
    }
    
    await prisma.refreshToken.delete({
        where: {
            id
        }
    });
}

export const deleteAllSessions = async (
    userId: string
) => {
    await prisma.refreshToken.deleteMany({
        where: {
            userId
        }
    });
}