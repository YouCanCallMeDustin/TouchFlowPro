import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        console.log('[AuthMiddleware] No token provided in header:', authHeader);
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.error('[AuthMiddleware] Verification failed:', err.message);
            // FALLBACK CHECK: Try verifying with the old default secret just in case
            const legacySecret = 'super_secret_jwt_key_dev_only';
            try {
                const user = jwt.verify(token, legacySecret);
                console.log('[AuthMiddleware] RECOVERED validation using legacy secret');
                (req as AuthRequest).user = user as any;
                return next();
            } catch (legacyErr) {
                return res.status(403).json({
                    error: `Invalid token: ${err.message}`, // Return original error
                    debug: `Secret len: ${JWT_SECRET.length}, Token len: ${token.length}`
                });
            }
        }
        console.log('[AuthMiddleware] Token verified for user:', user.id);
        (req as AuthRequest).user = user;
        next();
    });
};
