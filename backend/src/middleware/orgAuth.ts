import { Response, NextFunction, Request } from 'express';
import prisma from '../lib/db';
import { AuthRequest } from './auth';

export const requireOrgRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthRequest;
            if (!authReq.user) {
                return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
            }

            const orgId = req.params.orgId as string;
            if (!orgId) {
                return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Organization ID is required' } });
            }

            const membership = await prisma.orgMember.findUnique({
                where: {
                    orgId_userId: {
                        orgId,
                        userId: authReq.user.id
                    }
                }
            });

            if (!membership) {
                return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not a member of this organization' } });
            }

            if (!allowedRoles.includes(membership.role)) {
                return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
            }

            // Attach membership to request for convenience if needed downstream
            (req as any).orgMember = membership;

            next();
        } catch (error) {
            console.error('Org Auth Error:', error);
            res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to verify organization permissions' } });
        }
    };
};
