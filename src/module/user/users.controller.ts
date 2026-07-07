import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";

import { getAllUsers } from "./users.service"

export const getAllUsersController = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        const users = await getAllUsers();

        return res.status(200).json(
            users
        );
    }
)