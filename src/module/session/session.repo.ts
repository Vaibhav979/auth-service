import { prisma } from "../../config/prisma";

export const save = async (userId: string, jti: string, hashedToken: string, ipAddress: string, userAgent: string | null) => {
    return prisma.session.create({
        data: {
            hashedToken: hashedToken,
            userId,
            jti,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            ipAddress,
            userAgent
        }
    });
};

export const find = async (jti: string) => {
    return prisma.session.findUnique({
        where: {
            jti: jti
        }
    });
};

export const findById = async (id: string) => {
    return prisma.session.findUnique({
        where: {
            id: id
        }
    });
};

export const findAll = async (userId: string) => {
    return prisma.session.findMany({
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
};

export const deleteSession = async (jti: string) => {
    return prisma.session.delete({
        where: {
            jti: jti
        }
    });
};

export const deleteSessionById = async (id: string) => {
    prisma.session.delete({
        where: {
            id
        }
    });
};

export const deleteAllSessions = async (userId: string) => {
    return prisma.session.deleteMany({
        where: {
            userId
        }
    });
};