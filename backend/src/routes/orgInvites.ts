import express, { Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

const acceptInviteSchema = z.object({
    token: z.string()
});

// POST /api/org-invites/accept
router.post('/accept', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { token } = acceptInviteSchema.parse(req.body);

        // 1) Find Invite
        const invite = await prisma.orgInvite.findUnique({
            where: { token },
            include: { org: true }
        });

        if (!invite) {
            return res.status(404).json({ error: { code: 'INVITE_INVALID', message: 'Invite token is invalid.' } });
        }
        if (invite.expiresAt < new Date()) {
            return res.status(400).json({ error: { code: 'INVITE_EXPIRED', message: 'Invite has expired.' } });
        }
        if (invite.acceptedAt) {
            return res.status(400).json({ error: { code: 'INVITE_USED', message: 'Invite has already been used.' } });
        }

        // 2) Already a member?
        const existingMember = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId: invite.orgId, userId } }
        });

        if (existingMember) {
            return res.json({ message: 'Already a member', org: invite.org });
        }

        // 3) Phase 10: Seat limit check (double-check)
        const [memberCount, targetOrg] = await Promise.all([
            prisma.orgMember.count({ where: { orgId: invite.orgId } }),
            prisma.organization.findUnique({
                where: { id: invite.orgId },
                select: { seatLimit: true }
            })
        ]);

        if (targetOrg && memberCount >= targetOrg.seatLimit) {
            return res.status(403).json({
                error: { code: 'SEAT_LIMIT_REACHED', message: 'Seat limit reached. Upgrade your plan to add more members.' }
            });
        }

        // 4) Accept (atomic)
        await prisma.$transaction([
            prisma.orgMember.create({
                data: {
                    orgId: invite.orgId,
                    userId,
                    role: invite.role
                }
            }),
            prisma.orgInvite.update({
                where: { id: invite.id },
                data: { acceptedAt: new Date() }
            })
        ]);

        return res.json({ message: 'Joined organization', org: invite.org });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: { code: 'BAD_REQUEST', message: JSON.stringify(error.errors) }
            });
        }
        console.error('Failed to accept invite:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to accept invite' } });
    }
});

export default router;
