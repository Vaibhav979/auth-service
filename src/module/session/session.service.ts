import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/utils/AppError";

import * as sessionRepo from "./session.repo";

export const getSession = async (
    userId: string
) => {
    const session = await sessionRepo.findAll(userId);

    return session;
};

export const deleteSessionById = async (
    id: string
) => {
    const session = await sessionRepo.findById(id);

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    await sessionRepo.deleteSessionById(id);
}

export const deleteAllSessions = async (
    userId: string
) => {
    await sessionRepo.deleteAllSessions(userId);
}