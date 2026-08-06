import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';

import { AppError } from '../shared/utils/AppError';

import { logger } from "../shared/logger/logger";

export const errorhandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    logger.error(
        {
            err,
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        },
        "Unhandled error"
    );

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation Error",
            errors:
                err.issues.map(
                    issue => ({
                        field:
                            issue.path.join("."),

                        message:
                            issue.message
                    })
                )
        });
    }

    const statusCode = err instanceof AppError ? err.statusCode : 500;

    return res.status(statusCode).json({
        message: err.message || "Internal Server Error"
    });
};