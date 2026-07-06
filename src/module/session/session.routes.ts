import express from "express";

import { getSessionController, deleteSessionByIdController, deleteAllSessionsController } from "./session.controller";

import { verifyToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.get("/", verifyToken, getSessionController);
router.delete("/all", verifyToken, deleteAllSessionsController);
router.delete("/:id", verifyToken, deleteSessionByIdController);

export default router;