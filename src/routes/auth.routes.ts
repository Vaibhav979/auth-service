import express from "express";

import {
    registerController,
    loginController,
    logoutController
} from "../module/auth/auth.controller";

import { verifyToken } from "../middleware/auth.middleware";

import { refreshToken } from "../module/refreshToken/refresh.controller";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/refresh", refreshToken);

router.post("/logout", verifyToken, logoutController);

export default router;