import { Request, Response, NextFunction } from "express";

import { Role } from "@prisma/client";

import jwt from "jsonwebtoken";

import { AppError } from '../utils/AppError';

import { AccessTokenPayload } from '../types/jwt';

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError("Unauthenticated", 401);
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new AppError("Unauthenticated", 401);
    }
    
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new AppError("JWT_SECRET missing", 500);
    }

    try {
        const decoded = jwt.verify(
            token,
            secret
        ) as AccessTokenPayload;

        const { id, role } = decoded;
        (req as Request & { user: { id: string; role: Role } }).user = { id, role };
        next();
    } catch (error) {
        throw new AppError("Unauthenticated", 401);
    }
};