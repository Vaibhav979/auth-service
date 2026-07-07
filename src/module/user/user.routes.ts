import express from "express";

import { Role } from "@prisma/client";

import { verifyToken } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/rbac.middleware";

import { getAllUsersController } from "./users.controller";

const router = express.Router();

router.get("/me", verifyToken, (req: any, res) => {
    res.json(req.user);
});

router.get(
    "/users",
    verifyToken,
    authorize(Role.ADMIN),
    getAllUsersController
);

export default router;