import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "../types/auth-request";
import { AppError } from "../utils/AppError";

export const authorize = (...allowedRoles: Role[]) => (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!allowedRoles.includes(req.user.role)) {
        throw new AppError (
            "Forbidden",
            403
        );
    }

    next();
};
