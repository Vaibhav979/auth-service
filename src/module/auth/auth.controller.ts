import { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';

import { registerSchema, loginSchema } from '../../validator/auth.validator';

import { createUser, loginUser, logoutUser } from './auth.service';

export const registerController = asyncHandler (
    async (
        req: Request,
        res: Response,
    ) => {
        const { name, email, password } = registerSchema.parse(req.body);

        const result = await createUser(name, email, password);

        return res.status(201).json(
            result
        );
    }
);

export const loginController = asyncHandler (
    async (
        req: Request,
        res: Response
    ) => {
        const { email, password } = loginSchema.parse(req.body);

        const result = await loginUser(email, password);

        return res.status(200).json(
            result
        );
    }
);

export const logoutController = asyncHandler (
    async (
        req: Request,
        res: Response
    ) => {
        const { refreshToken } = req.body;

        await logoutUser(refreshToken);

        return res.status(200).json({
            "message": "logged out successfully"
        });
    }
);
