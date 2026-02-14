import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: {
                message: 'Validation Error',
                code: 'VALIDATION_ERROR',
                details: (err as any).errors || (err as any).issues
            }
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: {
                message: 'Unauthorized',
                code: 'UNAUTHORIZED'
            }
        });
    }

    res.status(500).json({
        error: {
            message: 'Internal Server Error',
            code: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
    });
};
