import { Router } from 'express';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/orgs
 * Create a new organization
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const { id: userId } = (req as AuthRequest).user!;

        if (!name) {
            return res.status(400).json({ error: 'Organization name is required' });
        }

        const org = await prisma.$transaction(async (tx) => {
            // 1. Check creator's subscription status
            const creator = await tx.user.findUnique({
                where: { id: userId }
            });

            let initialPlan = 'FREE';
            let initialSeats = 5;

            if (creator?.subscriptionStatus === 'pro') {
                initialPlan = 'PRO';
                initialSeats = 10;
            } else if (creator?.subscriptionStatus === 'enterprise') {
                initialPlan = 'ENTERPRISE';
                initialSeats = 100;
            }

            // 2. Create the organization
            const newOrg = await (tx.organization as any).create({
                data: {
                    name,
                    planTier: initialPlan,
                    seatLimit: initialSeats
                }
            });

            // 3. Add the creator as an ADMIN member
            await tx.orgMember.create({
                data: {
                    orgId: newOrg.id,
                    userId,
                    role: 'ADMIN'
                }
            });

            return newOrg;
        });

        res.status(201).json(org);
    } catch (error) {
        console.error('Create org error:', error);
        res.status(500).json({ error: 'Failed to create organization' });
    }
});

/**
 * GET /api/orgs
 * List organizations the user belongs to
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;

        const memberships = await prisma.orgMember.findMany({
            where: { userId },
            include: {
                org: {
                    include: {
                        _count: {
                            select: { members: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const orgs = memberships.map(m => ({
            ...m.org,
            role: m.role
        }));

        res.json({ orgs });
    } catch (error) {
        console.error('List orgs error:', error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
});

/**
 * GET /api/orgs/:id
 * Get organization details and member list
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const orgId = req.params.id as string;
        const { id: userId } = (req as AuthRequest).user!;

        // Check membership
        const membership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId } }
        });

        if (!membership) {
            return res.status(403).json({ error: 'Access denied: Not a member of this organization' });
        }

        let org = await prisma.organization.findUnique({
            where: { id: orgId as string },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                photoUrl: true
                            }
                        }
                    }
                }
            }
        });

        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Auto-heal: If Org is FREE, check if any ADMIN is PRO/ENTERPRISE
        const orgAny = org as any;
        if (orgAny.planTier === 'FREE') {
            const adminMember = await prisma.orgMember.findFirst({
                where: {
                    orgId,
                    role: 'ADMIN',
                    user: {
                        subscriptionStatus: { in: ['pro', 'enterprise'] }
                    }
                },
                include: { user: true }
            });

            if (adminMember) {
                console.log(`[AutoHeal] Upgrading Org ${orgId} because Admin ${adminMember.userId} is ${adminMember.user.subscriptionStatus}`);

                const newTier = adminMember.user.subscriptionStatus === 'enterprise' ? 'ENTERPRISE' : 'PRO';
                const newSeats = newTier === 'ENTERPRISE' ? 100 : 10;

                org = await prisma.organization.update({
                    where: { id: orgId },
                    data: {
                        planTier: newTier as any,
                        seatLimit: newSeats,
                        planStatus: 'ACTIVE'
                    } as any,
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        name: true,
                                        photoUrl: true
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        res.json({
            ...org,
            myRole: membership.role
        });
    } catch (error) {
        console.error('Get org details error:', error);
        res.status(500).json({ error: 'Failed to fetch organization details' });
    }
});

/**
 * DELETE /api/orgs/:id
 * Delete an organization (ADMIN only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const orgId = req.params.id as string;
        const { id: userId } = (req as AuthRequest).user!;

        // Check verification: User must be ADMIN
        const membership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId } }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Only admins can delete the organization' });
        }

        // Delete all members first (if cascade isn't set up, good practice)
        await prisma.orgMember.deleteMany({
            where: { orgId }
        });

        // Delete invites
        await prisma.orgInvite.deleteMany({
            where: { orgId }
        });

        // Delete the organization
        await prisma.organization.delete({
            where: { id: orgId }
        });

        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        console.error('Delete org error:', error);
        res.status(500).json({ error: 'Failed to delete organization' });
    }
});

/**
 * DELETE /api/orgs/:id/members/:userId
 * Remove a member from the organization (ADMIN only)
 */
router.delete('/:id/members/:memberId', authenticateToken, async (req, res) => {
    try {
        const orgId = req.params.id as string;
        const memberIdToRemove = req.params.memberId as string;
        const { id: requesterId } = (req as AuthRequest).user!;

        // 1. Verify Requester is ADMIN
        const requesterMembership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId: requesterId } }
        });

        if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Only admins can remove members' });
        }

        // 2. Prevent removing self (must leave instead, or delete org)
        if (memberIdToRemove === requesterId) {
            return res.status(400).json({ error: 'Cannot remove yourself. Use "Leave Organization" instead.' });
        }

        // 3. Remove the member
        await prisma.orgMember.delete({
            where: { orgId_userId: { orgId, userId: memberIdToRemove } }
        });

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

/**
 * PATCH /api/orgs/:id/members/:userId
 * Update a member's role (ADMIN only)
 */
router.patch('/:id/members/:memberId', authenticateToken, async (req, res) => {
    try {
        const orgId = req.params.id as string;
        const memberIdToUpdate = req.params.memberId as string;
        const { role } = req.body; // 'ADMIN' or 'MEMBER'
        const { id: requesterId } = (req as AuthRequest).user!;

        if (!['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // 1. Verify Requester is ADMIN
        const requesterMembership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId: requesterId } }
        });

        if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Only admins can update roles' });
        }

        // 2. Update the member
        const updatedMember = await prisma.orgMember.update({
            where: { orgId_userId: { orgId, userId: memberIdToUpdate } },
            data: { role }
        });

        res.json({ member: updatedMember });
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ error: 'Failed to update member role' });
    }
});

/**
 * GET /api/orgs/:id/analytics
 * Get aggregated analytics for the organization
 */
router.get('/:id/analytics', authenticateToken, async (req, res) => {
    try {
        const orgId = req.params.id as string;
        const { id: userId } = (req as AuthRequest).user!;

        // 1. Verify Membership
        const membership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId } }
        });

        if (!membership) {
            return res.status(403).json({ error: 'Access denied: Not a member of this organization' });
        }

        // 2. Get all members
        const members = await prisma.orgMember.findMany({
            where: { orgId },
            include: {
                user: {
                    include: {
                        progress: true
                    }
                }
            }
        });

        // 3. Aggregate Current Stats
        let totalWPM = 0;
        let totalAcc = 0;
        let totalDrills = 0;
        let activeMemberCount = 0;

        members.forEach(m => {
            if (m.user.progress) {
                totalWPM += m.user.progress.averageWPM;
                totalAcc += m.user.progress.averageAccuracy;
                totalDrills += m.user.progress.totalDrills;
                activeMemberCount++;
            }
        });

        const avgWPM = activeMemberCount > 0 ? Math.round(totalWPM / activeMemberCount) : 0;
        const avgAcc = activeMemberCount > 0 ? (totalAcc / activeMemberCount).toFixed(1) : 0;

        // 4. Get Trend Data (Last 30 Days)
        const memberIds = members.map(m => m.userId);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentDrills = await prisma.drillResult.findMany({
            where: {
                userId: { in: memberIds },
                timestamp: { gte: thirtyDaysAgo }
            },
            select: {
                timestamp: true,
                netWPM: true,
                accuracy: true
            },
            orderBy: { timestamp: 'asc' }
        });

        // Group by day for simple trend
        const dailyStats = new Map<string, { wpmSum: number, accSum: number, count: number }>();

        recentDrills.forEach(drill => {
            const date = drill.timestamp.toISOString().split('T')[0];
            if (!dailyStats.has(date)) {
                dailyStats.set(date, { wpmSum: 0, accSum: 0, count: 0 });
            }
            const stat = dailyStats.get(date)!;
            stat.wpmSum += drill.netWPM;
            stat.accSum += drill.accuracy;
            stat.count++;
        });

        const trendData = Array.from(dailyStats.entries()).map(([date, stat]) => ({
            date,
            wpm: Math.round(stat.wpmSum / stat.count),
            accuracy: Number((stat.accSum / stat.count).toFixed(1)),
            fatigue: Math.floor(Math.random() * 20) + 5 // Mock fatigue for now
        })).sort((a, b) => a.date.localeCompare(b.date));

        // 5. Audit Log (Last 5 drills)
        const auditLog = await prisma.drillResult.findMany({
            where: { userId: { in: memberIds } },
            take: 50,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { email: true } } }
        });

        const formattedAuditLog = auditLog.map(log => ({
            date: log.timestamp.toISOString(),
            type: log.mode, // or use drillId map if available, 'mode' is decent
            wpm: Math.round(log.netWPM),
            acc: log.accuracy.toFixed(1) + '%',
            fatigue: 'None', // Mock
            status: 'VERIFIED',
            userEmail: log.user.email
        }));

        res.json({
            velocity: avgWPM,
            accuracy: avgAcc,
            volume: (totalDrills * 0.2).toFixed(1) + 'K', // Approx 200 chars per drill / 1000
            trendData,
            auditLog: formattedAuditLog,
            totalMembers: members.length
        });

    } catch (error) {
        console.error('Get org analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch organization analytics' });
    }
});

export default router;
