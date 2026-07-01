import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import { refreshUser } from "./refresh.service";

export const refreshToken = asyncHandler ( 
    async (
        req: Request,
        res: Response
    ) => {
        const refreshToken = req.cookies.refreshToken;
        const response = await refreshUser(refreshToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7*24*60*60*1000
        });

        return res.status(200).json({
            accessToken: response.accessToken
        });
    }
);