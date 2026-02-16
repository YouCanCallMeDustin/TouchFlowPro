import { Router } from 'express';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/org-invites
 * Send an invitation to join an organization
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { orgId, email, role = 'MEMBER' } = req.body;
        const { id: userId } = (req as AuthRequest).user!;

        if (!orgId || !email) {
            return res.status(400).json({ error: 'Organization ID and email are required' });
        }

        // 1. Verify the sender is an ADMIN of the org
        const senderMembership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId } }
        });

        if (!senderMembership || senderMembership.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can invite members' });
        }

        // 2. Create the invitation
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invite = await prisma.orgInvite.create({
            data: {
                orgId,
                email,
                role,
                token,
                expiresAt
            }
        });

        // In a real app, we'd send an email here.
        // For now, return the token so the user can "accept" it manually for testing.
        res.status(201).json({
            message: 'Invitation sent',
            token: invite.token
        });
    } catch (error) {
        console.error('Create invite error:', error);
        res.status(500).json({ error: 'Failed to create invitation' });
    }
});

/**
 * POST /api/org-invites/accept
 * Accept an invitation
 */
router.post('/accept', authenticateToken, async (req, res) => {
    try {
        const { token } = req.body;
        const { id: userId, email: _userEmail } = (req as AuthRequest).user!;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // 1. Verify the invite
        const invite = await prisma.orgInvite.findUnique({
            where: { token },
            include: { org: true }
        });

        if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired invitation' });
        }

        // 2. Optional: Verify email matches (if we want to be strict)
        // if (invite.email !== userEmail) {
        //     return res.status(403).json({ error: 'This invitation was sent to a different email address' });
        // }

        // 3. Process acceptance in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Add member
            const member = await tx.orgMember.create({
                data: {
                    orgId: invite.orgId,
                    userId,
                    role: invite.role
                }
            });

            // Mark invite as accepted
            await tx.orgInvite.update({
                where: { id: invite.id },
                data: { acceptedAt: new Date() }
            });

            return member;
        });

        res.json({
            message: 'Invitation accepted',
            org: invite.org,
            membership: result
        });
    } catch (error) {
        console.error('Accept invite error:', error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
});

export default router;
