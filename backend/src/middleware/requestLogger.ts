import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    // 1. Attach Correlation ID
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    req.headers['x-correlation-id'] = correlationId;
    (req as any).requestId = correlationId; // Attach to request object for internal use
    res.setHeader('x-request-id', correlationId); // Standard header name
    res.setHeader('x-correlation-id', correlationId); // Legacy support

    // 2. Log Start
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] [${correlationId}] ${req.method} ${req.url}`);

    // 3. Log Finish (on cleanup)
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] [${correlationId}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });

    next();
};
