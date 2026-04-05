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

/**
 * GET /api/org-invites
 * List pending invitations for an organization
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.query;
        const { id: userId } = (req as AuthRequest).user!;

        if (!orgId || typeof orgId !== 'string') {
            return res.status(400).json({ error: 'Organization ID required as a string' });
        }

        // 1. Verify membership and role
        const membership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId: orgId, userId } }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Only admins can view invitations' });
        }

        // 2. Fetch pending invites
        const invites = await prisma.orgInvite.findMany({
            where: {
                orgId: orgId as string,
                acceptedAt: null,
                expiresAt: { gte: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ invites });
    } catch (error) {
        console.error('List invites error:', error);
        res.status(500).json({ error: 'Failed to fetch invitations' });
    }
});

/**
 * DELETE /api/org-invites/:id
 * Cancel/Delete an invitation
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const inviteId = req.params.id as string;
        const { id: userId } = (req as AuthRequest).user!;

        const invite = await prisma.orgInvite.findUnique({
            where: { id: inviteId }
        });

        if (!invite) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        // Verify the requester is an ADMIN of the org
        const membership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId: invite.orgId, userId } }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Only admins can cancel invitations' });
        }

        await prisma.orgInvite.delete({
            where: { id: inviteId }
        });

        res.json({ message: 'Invitation cancelled' });
    } catch (error) {
        console.error('Delete invite error:', error);
        res.status(500).json({ error: 'Failed to cancel invitation' });
    }
});

export default router;
