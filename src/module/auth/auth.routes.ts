import express from "express";

import { authLimiter } from "../../middleware/rateLimit.middleware";

import {
    registerController,
    loginController,
    logoutController,
    forgetPasswordController,
    resetPasswordController,
} from "./auth.controller";

import { verifyToken } from "../../middleware/auth.middleware";

import { refreshToken } from "../refreshToken/refresh.controller";

import { verifyEmailController } from "../verification/verification.controller";

const router = express.Router();

router.post("/register", authLimiter, registerController);

router.post("/login", authLimiter, loginController);

router.post("/refresh", authLimiter, refreshToken);

router.post("/logout", verifyToken, logoutController);

router.get(
    "/verify-email",
    verifyEmailController
);

router.post("/forget-password", authLimiter, forgetPasswordController);

router.post("/reset-password", authLimiter, resetPasswordController);

export default router;