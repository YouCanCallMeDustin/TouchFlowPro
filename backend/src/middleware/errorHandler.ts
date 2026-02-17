import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    console.error(`[GlobalErrorHandler] ${req.method} ${req.path} - Status ${status}:`, err);

    res.status(status).json({
        error: {
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
};

export default errorHandler;
