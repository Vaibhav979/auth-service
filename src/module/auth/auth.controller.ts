import { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';

import { registerSchema, loginSchema, forgetPasswordSchema } from './auth.schema';

import { createUser, loginUser, logoutUser, forgetPassword, resetPassword } from './auth.service';

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

        const userAgent = req.headers["user-agent"] ?? null;

        const result = await loginUser(email, password, req.ip!, userAgent);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7*24*60*60*1000
        });

        return res.status(200).json({
            user: result.user,
            accessToken: result.accessToken
        });
    }
);

export const logoutController = asyncHandler (
    async (
        req: Request,
        res: Response
    ) => {
        const refreshToken = req.cookies.refreshToken;

        await logoutUser(refreshToken);

        res.clearCookie("refreshToken");

        return res.status(200).json({
            "message": "logged out successfully"
        });
    }
);

export const forgetPasswordController = asyncHandler (
    async (
        req: Request,
        res: Response
    ) => {
        const { email } = forgetPasswordSchema.parse(req.body);

        const message = await forgetPassword(email);

        res.status(200).json(message);
    }
);

export const resetPasswordController = asyncHandler (
    async (
        req: Request,
        res: Response
    ) => {
        const { userId, token } = req.query;

        const { newPassword } = req.body;

        const message = await resetPassword(
            userId as string,
            token as string,
            newPassword
        );

        res.status(200).json(message);
    }
);