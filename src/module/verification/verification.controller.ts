import { Request, Response } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler";

import { verify } from "./verification.service";

export const verifyEmailController = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        const { userId, token } = req.query;

        const response = await verify(
            userId as string,
            token as string
        );

        return res.status(200).json(response);
    }
);