import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import { refreshUser } from "./refresh.service";

export const refreshToken = asyncHandler ( 
    async (
        req: Request,
        res: Response
    ) => {
        const { refreshToken } = req.body;
        const response = await refreshUser(refreshToken);

        return res.status(200).json(response);
    }
);