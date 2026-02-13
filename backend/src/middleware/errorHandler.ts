import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Standard Error Interface
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-correlation-id'];
    console.error(`[${correlationId}] Error:`, err);

    // 1. Handle Zod Validation Errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: err.issues
            }
        });
        return;
    }

    // 2. Handle Known API Errors
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';

    res.status(statusCode).json({
        error: {
            code,
            message,
            details: err.details
        }
    });
};
