import { prisma } from "../../config/prisma";

export const healthCheck = async () => {
    return {
        status: "UP",
        service: "AUTH_SERVICE",
        version: "1.1.0",
        timestamp: new Date().toISOString(),
    };
};

export const getDatabaseStatus = async () => {
    await prisma.$queryRaw`SELECT 1`;
};