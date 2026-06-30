import express from "express";

import {
    registerController,
    loginController,
    logoutController
} from "../module/auth/auth.controller";

import { verifyToken } from "../middleware/auth.middleware";

import { refreshToken } from "../module/auth/refresh.controller";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/refresh", verifyToken, refreshToken);

router.post("/logout", verifyToken, logoutController);

export default router;