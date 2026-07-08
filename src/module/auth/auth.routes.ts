import express from "express";

import { authLimiter } from "../../middleware/rateLimit.middleware";

import {
    registerController,
    loginController,
    logoutController
} from "./auth.controller";

import { verifyToken } from "../../middleware/auth.middleware";

import { refreshToken } from "../refreshToken/refresh.controller";

const router = express.Router();

router.post("/register", authLimiter, registerController);

router.post("/login", authLimiter, loginController);

router.post("/refresh", authLimiter, refreshToken);

router.post("/logout", verifyToken, logoutController);

export default router;