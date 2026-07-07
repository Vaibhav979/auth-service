import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "../shared/types/auth-request";
import { AppError } from "../shared/utils/AppError";

export const authorize = (...allowedRoles: Role[]) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user } = req as AuthRequest;
    if (!allowedRoles.includes(user.role)) {
        throw new AppError (
            "Forbidden",
            403
        );
    }

    next();
};
