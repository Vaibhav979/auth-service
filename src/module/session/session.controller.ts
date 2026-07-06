import { Request, Response } from "express";

import { AuthRequest } from '../../types/auth-request';

import { asyncHandler } from '../../utils/asyncHandler';

import { getSession, deleteSessionById, deleteAllSessions } from './session.service';

export const getSessionController = asyncHandler (
    async (
        req: AuthRequest,
        res: Response
    ) => {
        const session = await getSession(req.user.id);

        return res.status(200).json(
            session
        );
    }
);

export const deleteSessionByIdController = asyncHandler (
    async (
        req: AuthRequest,
        res: Response
    ) => {
        let id = req.params.id as string | undefined;
        if (!id) {
            return res.status(400).json("Invalid session id");
        }

        await deleteSessionById(id);

        return res.status(200).json(
            "Session deleted!!"
        );
    }
);

export const deleteAllSessionsController = asyncHandler (
    async (
        req: AuthRequest,
        res: Response
    ) => {
        await deleteAllSessions(req.user.id);

        return res.status(200).json(
            "All sessions deleted!!"
        );
    }
)