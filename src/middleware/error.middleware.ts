import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';

import { AppError } from '../utils/AppError';

export const errorhandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
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