
import express from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

const acceptInviteSchema = z.object({
    token: z.string()
});

// POST /api/org-invites/accept
router.post('/accept', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { token } = acceptInviteSchema.parse(req.body);

        // 1. Find Invite
        const invite = await prisma.orgInvite.findUnique({
            where: { token },
            include: { org: true }
        });

        if (!invite) return res.status(404).json({ error: 'INVITE_INVALID' });
        if (invite.expiresAt < new Date()) return res.status(400).json({ error: 'INVITE_EXPIRED' });
        if (invite.acceptedAt) return res.status(400).json({ error: 'INVITE_USED' });

        // 2. Check if already member
        const existingMember = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId: invite.orgId, userId } }
        });

        if (existingMember) {
            return res.json({ message: 'Already a member', org: invite.org });
        }

        // Phase 10: Check Seat Limits before joining
        // (Double check in case limits changed or race condition)
        const memberCount = await prisma.orgMember.count({ where: { orgId: invite.orgId } });
        // Fetch fresh org details for limit
        const targetOrg = await prisma.organization.findUnique({ where: { id: invite.orgId }, select: { seatLimit: true } });

        if (targetOrg && memberCount >= targetOrg.seatLimit) {
            return res.status(403).json({ error: 'SEAT_LIMIT_REACHED' });
        }

        // 3. Accept Transaction
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

        res.json({ message: 'Joined organization', org: invite.org });

    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: (error as any).errors });
        console.error('Failed to accept invite:', error);
        res.status(500).json({ error: 'Failed to accept invite' });
    }
});

export default router;
