import { Request, Response } from "express";

import * as healthService from "./health.service";

import { asyncHandler } from '../../shared/utils/asyncHandler';

export const getHealthStatus = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        const health = await healthService.healthCheck();

        return res.status(200).json(
            health
        );
    }
);

export const getDatabaseStatus = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {
        try {

            await healthService.getDatabaseStatus();

            return res.status(200).json({
                status: "READY",
                service: "AUTH_SERVICE",
                database: "UP",
                timestamp: new Date().toISOString()
            });

        } catch {

            return res.status(503).json({
                status: "NOT_READY",
                service: "AUTH_SERVICE",
                database: "DOWN",
                timestamp: new Date().toISOString()
            });

        }
    }
)
