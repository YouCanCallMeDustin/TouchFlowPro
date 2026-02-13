import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireOrgRole } from '../middleware/orgAuth';

const router = Router();
router.use(authenticateToken);

// Schemas
const createOrgSchema = z.object({
    name: z.string().min(2).max(50)
});

const createInviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'MANAGER', 'MEMBER'])
});

// GET /api/orgs/mine
// Returns list of orgs with user role
router.get('/mine', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const memberships = await prisma.orgMember.findMany({
            where: { userId },
            include: { org: true }
        });
        res.json(memberships); // Returns { role, org: {...} }[]
    } catch (error) {
        console.error('Failed to fetch user orgs:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } }); // Updated error format
    }
});

// POST /api/orgs
// Creates org and creates OrgMember for creator as OWNER
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id; // Changed from userId to id based on snippet
        const { name } = createOrgSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: { name }
            });
            await tx.orgMember.create({
                data: {
                    orgId: org.id,
                    userId,
                    role: 'OWNER'
                }
            });
            return org;
        });

        res.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: (error as any).errors } }); // Updated error format
        console.error('Failed to create org:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } }); // Updated error format
    }
});

// GET /api/orgs/:orgId
// Returns org details + member list (limited fields)
router.get('/:orgId', authenticateToken, requireOrgRole(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']), async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };

        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, photoUrl: true }
                        }
                    }
                }
            }
        });

        if (!org) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Org not found' } }); // Updated error format
        res.json(org);
    } catch (error) {
        console.error('Failed to fetch org details:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } }); // Updated error format
    }
});

// POST /api/orgs/:orgId/invites
// Generates token (secure random), expires in 7 days
router.post('/:orgId/invites', authenticateToken, requireOrgRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };
        const { email, role } = createInviteSchema.parse(req.body);

        // Check if user is already a member
        // Check for active membership
        const existingMember = await prisma.orgMember.findFirst({
            where: { orgId, user: { email } }
        });

        if (existingMember) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'User is already a member' } });

        // Check if invite already exists
        const existingInvite = await prisma.orgInvite.findFirst({
            where: { orgId, email, expiresAt: { gt: new Date() }, acceptedAt: null }
        });

        if (existingInvite) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invite already pending' } });

        // Phase 10: Check Seat Limits
        const [memberCount, inviteCount, org] = await Promise.all([
            prisma.orgMember.count({ where: { orgId } }),
            prisma.orgInvite.count({ where: { orgId, expiresAt: { gt: new Date() }, acceptedAt: null } }),
            prisma.organization.findUnique({ where: { id: orgId }, select: { seatLimit: true } })
        ]) as any;

        if (!org) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Org not found' } });

        if (memberCount + inviteCount >= org.seatLimit) {
            return res.status(403).json({ error: { code: 'SEAT_LIMIT_REACHED', message: `Seat limit reached (${org.seatLimit}). Upgrade your plan to add more members.` } });
        }

        // Generate Token
        const token = require('crypto').randomBytes(32).toString('hex'); // Changed to require('crypto')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const invite = await prisma.orgInvite.create({
            data: {
                orgId,
                email,
                role,
                token,
                expiresAt
            }
        });

        res.json({
            token: invite.token,
            expiresAt: invite.expiresAt,
            inviteLinkHint: `/orgs/accept/${invite.token}`
        });

    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: (error as any).errors } }); // Updated error format
        console.error('Failed to create invite:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } }); // Updated error format
    }
});

// GET /api/orgs/:orgId/invites
// Returns list of invites for an org
router.get('/:orgId/invites', authenticateToken, requireOrgRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };
        const invites = await prisma.orgInvite.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invites);
    } catch (error) {
        console.error('Failed to fetch org invites:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// DELETE /api/orgs/:orgId/invites/:inviteId
// Revokes an invite
router.delete('/:orgId/invites/:inviteId', authenticateToken, requireOrgRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { orgId, inviteId } = req.params as { orgId: string; inviteId: string };
        await prisma.orgInvite.deleteMany({
            where: { id: inviteId, orgId }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to revoke invite:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// DELETE /api/orgs/:orgId/members/:memberId
// Removes a member from the organization
router.delete('/:orgId/members/:memberId', authenticateToken, requireOrgRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { orgId, memberId } = req.params as { orgId: string; memberId: string };
        const currentUserMember = (req as any).orgMember; // orgMember is set by requireOrgRole

        // Prevent self-removal via this route (use /leave instead)
        if (memberId === req.user!.id) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Use /leave to remove yourself' } });
        }

        const targetMember = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId: memberId } }
        });

        if (!targetMember) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Member not found' } });
        }

        // Owners cannot be removed
        if (targetMember.role === 'OWNER') {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Cannot remove the Organization Owner' } });
        }

        // Admins can only remove Managers and Members
        if (currentUserMember.role === 'ADMIN' && targetMember.role === 'ADMIN') {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admins cannot remove other Admins' } });
        }

        await prisma.orgMember.delete({
            where: { orgId_userId: { orgId, userId: memberId } }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to remove member:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// POST /api/orgs/:orgId/leave
// Allows a user to leave an organization
router.post('/:orgId/leave', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };
        const userId = req.user!.id;

        const membership = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId } }
        });

        if (!membership) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not a member' } });
        }

        if (membership.role === 'OWNER') {
            // Check if there are other owners
            const otherOwner = await prisma.orgMember.findFirst({
                where: { orgId, role: 'OWNER', userId: { not: userId } }
            });
            if (!otherOwner) {
                return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Owner cannot leave without transferring ownership' } });
            }
        }

        await prisma.orgMember.delete({
            where: { orgId_userId: { orgId, userId } }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to leave org:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// POST /api/orgs/:orgId/transfer-ownership
// Transfers ownership of the organization to another member
router.post('/:orgId/transfer-ownership', authenticateToken, requireOrgRole(['OWNER']), async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };
        const schema = z.object({ newOwnerUserId: z.string() });
        const { newOwnerUserId } = schema.parse(req.body);

        const targetMember = await prisma.orgMember.findUnique({
            where: { orgId_userId: { orgId, userId: newOwnerUserId } }
        });

        if (!targetMember) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target user is not a member' } });
        }

        await prisma.$transaction([
            prisma.orgMember.update({
                where: { orgId_userId: { orgId, userId: req.user!.id } },
                data: { role: 'ADMIN' } // Downgrade current owner to Admin
            }),
            prisma.orgMember.update({
                where: { orgId_userId: { orgId, userId: newOwnerUserId } },
                data: { role: 'OWNER' } // Upgrade target to Owner
            })
        ]);

        res.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: (error as any).errors } });
        console.error('Failed to transfer ownership:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// GET /api/orgs/:orgId/dashboard
// Returns aggregate metrics for last 7 and 30 days
router.get('/:orgId/dashboard', authenticateToken, requireOrgRole(['OWNER', 'ADMIN', 'MANAGER']), async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };

        // Aggregate Metrics
        // 1. Get Member IDs
        const members = await prisma.orgMember.findMany({
            where: { orgId },
            select: { userId: true }
        });
        const memberIds = members.map(m => m.userId);

        if (memberIds.length === 0) {
            return res.json({
                memberCount: 0,
                sessions7d: 0,
                sessions30d: 0,
                avgWpm7d: 0,
                avgAccuracy7d: 0,
                avgFatigue7d: 0,
                planAdherence7d: 0,
                fatigueRiskCount7d: 0,
                plateauCount7d: 0
            });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Heavy Aggregation
        const [stats7d, stats30d] = await Promise.all([
            prisma.drillResult.aggregate({
                where: {
                    userId: { in: memberIds },
                    timestamp: { gte: sevenDaysAgo }
                },
                _count: { id: true },
                _avg: { netWPM: true, accuracy: true, fatigueScore: true }
            }),
            prisma.drillResult.aggregate({
                where: {
                    userId: { in: memberIds },
                    timestamp: { gte: thirtyDaysAgo }
                },
                _count: { id: true }
            })
        ]);

        // --- COACHING METRICS CALCULATION (SIMPLIFIED for Phase 8) ---
        // 1. Fatigue Risk: Count members with avg fatigue > 80 in last 7 days
        // Note: SQLite doesn't support easy "GROUP BY having avg" in prisma aggregate comfortably without raw query.
        // We will fetch recent sessions for relevant calculation to avoid complex raw queries.
        // Limit to last 500 sessions total for the org for quick analysis to respect "SafeToAutoRun" and performance.

        const recentSessions = await prisma.drillResult.findMany({
            where: {
                userId: { in: memberIds },
                timestamp: { gte: sevenDaysAgo }
            },
            select: { userId: true, fatigueScore: true, netWPM: true, timestamp: true },
            take: 500 // Cap for performance
        });

        // Calculate member-level stats in memory
        const memberStats = new Map<string, { totalFatigue: number, count: number, sessions: any[] }>();
        recentSessions.forEach(s => {
            if (!memberStats.has(s.userId)) memberStats.set(s.userId, { totalFatigue: 0, count: 0, sessions: [] });
            const entry = memberStats.get(s.userId)!;
            if (s.fatigueScore !== null) { // Ensure fatigueScore is not null
                entry.totalFatigue += s.fatigueScore;
                entry.count++;
            }
            entry.sessions.push(s);
        });

        let fatigueRiskCount7d = 0;
        let plateauCount7d = 0;

        memberStats.forEach((stats, uid) => {
            // Fatigue Risk
            const avgFatigue = stats.count > 0 ? stats.totalFatigue / stats.count : 0;
            if (avgFatigue > 80) fatigueRiskCount7d++;

            // Plateau Logic: Check if recent 5 sessions avg WPM <= prev 5 sessions avg WPM
            // Require at least 10 sessions to determine plateau
            if (stats.sessions.length >= 10) {
                const sorted = stats.sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Newest first
                const recent5 = sorted.slice(0, 5);
                const prev5 = sorted.slice(5, 10);

                const avgRecent = recent5.reduce((acc: number, curr: any) => acc + (curr.netWPM || 0), 0) / 5;
                const avgPrev = prev5.reduce((acc: number, curr: any) => acc + (curr.netWPM || 0), 0) / 5;

                // If improvement is less than 1% or negative, consider plateaued
                if (avgRecent <= avgPrev * 1.01) {
                    plateauCount7d++;
                }
            }
        });

        // Plan Adherence (Mock/Placeholder until Training Plans are fully linked to Orgs)
        // Assume 85% for now as a baseline for the UI
        const planAdherence7d = 85;

        res.json({
            memberCount: memberIds.length,
            sessions7d: stats7d._count.id,
            sessions30d: stats30d._count.id,
            avgWpm7d: Math.round(stats7d._avg.netWPM || 0),
            avgAccuracy7d: Math.round(stats7d._avg.accuracy || 0),
            avgFatigue7d: Math.round(stats7d._avg.fatigueScore || 0),
            planAdherence7d,
            fatigueRiskCount7d,
            plateauCount7d
        });

    } catch (error) {
        console.error('Failed to fetch org dashboard:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// Helper: Get Org Report Data
async function getOrgReportData(orgId: string, days: number) {
    // 1. Fetch Org & Plan
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, name: true, planTier: true, seatLimit: true }
    }) as any;

    if (!org) throw new Error('Org not found');

    // 2. Fetch Members
    const members = await prisma.orgMember.findMany({
        where: { orgId },
        include: { user: { select: { id: true, name: true, email: true } } }
    });
    const memberIds = members.map(m => m.userId);

    // 3. Fetch Sessions (Drill Results)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await prisma.drillResult.findMany({
        where: {
            userId: { in: memberIds },
            timestamp: { gte: startDate }
        },
        select: { userId: true, netWPM: true, accuracy: true, fatigueScore: true, timestamp: true }
    });

    // 4. Aggregate Per Member
    const memberStats = new Map<string, {
        sessions: number,
        totalWpm: number,
        totalAcc: number,
        totalFatigue: number,
        fatigueCount: number,
        platformSessions: any[]
    }>();

    members.forEach(m => {
        memberStats.set(m.userId, {
            sessions: 0,
            totalWpm: 0,
            totalAcc: 0,
            totalFatigue: 0,
            fatigueCount: 0,
            platformSessions: []
        });
    });

    let orgTotalSessions = 0;
    let orgTotalWpm = 0;
    let orgTotalAcc = 0;
    let orgTotalFatigue = 0;
    let orgFatigueCount = 0;

    results.forEach(r => {
        const stats = memberStats.get(r.userId);
        if (stats) {
            stats.sessions++;
            stats.totalWpm += r.netWPM || 0;
            stats.totalAcc += r.accuracy || 0;
            if (r.fatigueScore !== null) {
                stats.totalFatigue += r.fatigueScore;
                stats.fatigueCount++;

                orgTotalFatigue += r.fatigueScore;
                orgFatigueCount++;
            }
            stats.platformSessions.push(r);

            orgTotalSessions++;
            orgTotalWpm += r.netWPM || 0;
            orgTotalAcc += r.accuracy || 0;
        }
    });

    // 5. Transform to Member Data
    let fatigueRiskCount = 0;
    let plateauCount = 0;

    const memberReport = members.map(m => {
        const stats = memberStats.get(m.userId)!;
        const avgWpm = stats.sessions > 0 ? Math.round(stats.totalWpm / stats.sessions) : 0;
        const avgAccuracy = stats.sessions > 0 ? Math.round(stats.totalAcc / stats.sessions) : 0;
        const avgFatigue = stats.fatigueCount > 0 ? Math.round(stats.totalFatigue / stats.fatigueCount) : 0;

        // Plateau Logic
        let isPlateau = false;
        if (stats.platformSessions.length >= 10) {
            const sorted = stats.platformSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            const recent5 = sorted.slice(0, 5);
            const prev5 = sorted.slice(5, 10);
            const avgRecent = recent5.reduce((acc: number, curr: any) => acc + (curr.netWPM || 0), 0) / 5;
            const avgPrev = prev5.reduce((acc: number, curr: any) => acc + (curr.netWPM || 0), 0) / 5;
            if (avgRecent <= avgPrev * 1.01) isPlateau = true;
        }

        if (avgFatigue > 80) fatigueRiskCount++;
        if (isPlateau) plateauCount++;

        return {
            userId: m.userId,
            name: m.user.name || 'Unknown',
            email: m.user.email,
            role: m.role,
            sessions: stats.sessions,
            avgWpm,
            avgAccuracy,
            avgFatigue,
            planAdherence: 85, // Mock
            plateauRisk: isPlateau ? 'YES' : 'NO'
        };
    });

    // Org Wide Aggregate
    const orgStats = {
        memberCount: members.length,
        activeMembers: memberReport.filter(m => m.sessions > 0).length,
        totalSessions: orgTotalSessions,
        avgWpm: orgTotalSessions > 0 ? Math.round(orgTotalWpm / orgTotalSessions) : 0,
        avgAccuracy: orgTotalSessions > 0 ? Math.round(orgTotalAcc / orgTotalSessions) : 0,
        avgFatigue: orgFatigueCount > 0 ? Math.round(orgTotalFatigue / orgFatigueCount) : 0,
        fatigueRiskCount,
        plateauCount,
        planAdherence: 85
    };

    return { org, memberReport, orgStats, startDate };
}

// GET /api/orgs/:orgId/reports/weekly
// Returns detailed weekly report for all members (JSON or CSV)
router.get('/:orgId/reports/weekly', authenticateToken, requireOrgRole(['OWNER', 'ADMIN', 'MANAGER']), async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };
        const days = parseInt(req.query.days as string) || 7;
        const format = req.query.format as string || 'json';
        const acceptHeader = req.headers.accept || '';

        if (![7, 14, 30].includes(days)) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Days must be 7, 14, or 30' } });
        }

        const isCsv = format === 'csv' || acceptHeader.includes('text/csv');

        // Fetch Data
        const { org, memberReport } = await getOrgReportData(orgId, days);

        // Check Plan
        if (!org || (org as any).planTier === 'FREE') {
            return res.status(403).json({ error: { code: 'PLAN_UPGRADE_REQUIRED', message: 'Enterprise Reports are available on Pro and Enterprise plans.' } });
        }

        // Output CSV or JSON
        if (isCsv) {
            const headers = ['User ID', 'Name', 'Email', 'Role', 'Sessions', 'Avg WPM', 'Avg Accuracy', 'Avg Fatigue', 'Plan Adherence %', 'Plateau Risk'];
            const rows = memberReport.map(r => [
                r.userId,
                `"${r.name}"`,
                r.email,
                r.role,
                r.sessions,
                r.avgWpm,
                r.avgAccuracy,
                r.avgFatigue,
                r.planAdherence,
                r.plateauRisk
            ].join(','));

            const csvString = [headers.join(','), ...rows].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="org_report_${orgId}_${days}d.csv"`);
            return res.send(csvString);
        }

        res.json({
            orgId,
            windowDays: days,
            generatedAt: new Date(),
            members: memberReport
        });

    } catch (error) {
        console.error('Failed to generate report:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
    }
});

// GET /api/orgs/:orgId/reports/weekly.pdf
// Downloads PDF report
router.get('/:orgId/reports/weekly.pdf', authenticateToken, requireOrgRole(['OWNER', 'ADMIN', 'MANAGER']), async (req: AuthRequest, res) => {
    try {
        const { orgId } = req.params as { orgId: string };
        const days = parseInt(req.query.days as string) || 7;

        if (![7, 14, 30].includes(days)) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Days must be 7, 14, or 30' } });
        }

        // Fetch Data
        const { org, memberReport, orgStats, startDate } = await getOrgReportData(orgId, days);

        if (!org || (org as any).planTier === 'FREE') {
            return res.status(403).json({ error: { code: 'PLAN_UPGRADE_REQUIRED', message: 'Enterprise Reports are available on Pro and Enterprise plans.' } });
        }

        // Generate PDF
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="org_report_${orgId}_${days}d.pdf"`);

        doc.pipe(res);

        // --- STYLING CONSTANTS ---
        const colors = {
            primary: '#111827',
            secondary: '#4B5563',
            accent: '#3B82F6',
            danger: '#EF4444',
            warning: '#F59E0B',
            success: '#10B981',
            lightGray: '#F3F4F6',
            border: '#E5E7EB'
        };

        // --- FOOTER HELPER ---
        let pageCount = 1;
        const addFooter = () => {
            const bottom = doc.page.height - 50;
            doc.save();
            doc.lineWidth(1).strokeColor(colors.border)
                .moveTo(50, bottom - 15).lineTo(550, bottom - 15).stroke();

            doc.fontSize(8).fillColor(colors.secondary).font('Helvetica')
                .text('Generated by TouchFlow Pro', 50, bottom);

            doc.text(`Page ${pageCount}`, 50, bottom, { align: 'right', width: 500 });
            doc.restore();
            pageCount++;
        };
        // Add footer to subsequent pages automatically
        doc.on('pageAdded', addFooter);

        // --- HEADER ---
        doc.y = 50;
        doc.fontSize(20).font('Helvetica-Bold').fillColor(colors.primary)
            .text('TouchFlow Pro – Weekly Performance Report');

        doc.moveDown(0.4);

        doc.fontSize(10).font('Helvetica').fillColor(colors.secondary)
            .text(`Generated: ${new Date().toLocaleString()}`, { align: 'left' });

        doc.moveDown(1.2);

        doc.fontSize(16).font('Helvetica-Bold').fillColor(colors.primary).text(org.name);

        doc.fontSize(10).font('Helvetica').fillColor(colors.secondary)
            .text(`${org.planTier} Plan • ${org.seatLimit} Seats • Last ${days} Days`);

        doc.moveDown(1.2);
        doc.lineWidth(1).strokeColor(colors.border).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.6);

        // --- KPI GRID ---
        const kpiStartY = doc.y;
        const rowHeight = 60;

        const drawKpi = (label: string, value: string | number, x: number, y: number, color: string = colors.primary) => {
            doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.secondary).text(label.toUpperCase(), x, y);
            doc.fontSize(18).font('Helvetica-Bold').fillColor(color).text(String(value), x, y + 15);
        };

        drawKpi('MEMBERS', orgStats.memberCount, 50, kpiStartY);
        drawKpi('SESSIONS', orgStats.totalSessions, 175, kpiStartY);
        drawKpi('AVG WPM', orgStats.avgWpm, 300, kpiStartY);
        drawKpi('AVG ACCURACY', `${orgStats.avgAccuracy}%`, 425, kpiStartY);

        const kpiRow2Y = kpiStartY + rowHeight;
        drawKpi('AVG FATIGUE', orgStats.avgFatigue || '-', 50, kpiRow2Y);
        drawKpi('PLAN ADHERENCE', `${orgStats.planAdherence}%`, 175, kpiRow2Y);
        drawKpi('FATIGUE RISKS', orgStats.fatigueRiskCount, 300, kpiRow2Y, orgStats.fatigueRiskCount > 0 ? colors.danger : colors.primary);
        drawKpi('PLATEAUS', orgStats.plateauCount, 425, kpiRow2Y, orgStats.plateauCount > 0 ? colors.warning : colors.primary);

        doc.y = kpiRow2Y + rowHeight + 10;

        // --- COACHING INSIGHTS ---
        doc.moveDown();
        doc.lineWidth(1).strokeColor(colors.border).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);

        doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.primary).text('Coaching Insights');
        doc.moveDown(0.8);

        const insights: string[] = [];
        if (orgStats.fatigueRiskCount > 0) insights.push(`${orgStats.fatigueRiskCount} members showing high fatigue signs (>80). Recommend recovery blocks.`);
        if (orgStats.plateauCount > 0) insights.push(`${orgStats.plateauCount} members have plateaued. Suggest accuracy-focused drills.`);

        const topPerformer = memberReport.slice().sort((a, b) => b.avgWpm - a.avgWpm)[0];
        if (topPerformer && topPerformer.sessions > 0) {
            insights.push(`Top Performer: ${topPerformer.name} (${topPerformer.avgWpm} WPM).`);
        }

        if (insights.length === 0) {
            insights.push('Team performance is stable this period.');
        }

        doc.fontSize(10).font('Helvetica').fillColor(colors.secondary);
        insights.forEach(insight => {
            doc.text(`•  ${insight}`, { indent: 10, align: 'left' });
            doc.moveDown(0.5);
        });

        doc.moveDown(1.5);

        // --- MEMBER TABLE ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.primary).text('Member Performance');
        doc.moveDown(0.8);

        // Table Layout
        const tY = doc.y;
        const colX = {
            name: 50,
            role: 170,
            sess: 250,
            wpm: 300,
            acc: 350,
            fat: 400,
            adh: 450,
            plat: 500
        };

        // Header Background
        doc.save();
        doc.rect(50, tY - 5, 500, 25).fillColor(colors.lightGray).fill();
        doc.restore();

        // Header Text
        doc.fillColor(colors.primary).fontSize(9).font('Helvetica-Bold');
        doc.text('NAME', colX.name, tY + 2);
        doc.text('ROLE', colX.role, tY + 2);
        doc.text('SESS', colX.sess, tY + 2, { width: 40, align: 'right' });
        doc.text('WPM', colX.wpm, tY + 2, { width: 40, align: 'right' });
        doc.text('ACC', colX.acc, tY + 2, { width: 40, align: 'right' });
        doc.text('FAT', colX.fat, tY + 2, { width: 40, align: 'right' });
        doc.text('ADH', colX.adh, tY + 2, { width: 40, align: 'right' });
        doc.text('PLAT', colX.plat, tY + 2, { width: 50, align: 'right' });

        doc.moveDown(2.5);

        // Draw Footer for Page 1
        addFooter();

        // Rows
        let isAlt = false;
        doc.font('Helvetica').fontSize(9);

        memberReport.forEach((m) => {
            // Check Page Break
            if (doc.y > 720) {
                doc.addPage();

                // Redraw Table Header
                const newY = 50; // Top margin
                doc.save();
                doc.rect(50, newY - 5, 500, 20).fillColor(colors.lightGray).fill();
                doc.restore();

                doc.fillColor(colors.primary).font('Helvetica-Bold');
                doc.text('NAME', colX.name, newY + 2);
                doc.text('ROLE', colX.role, newY + 2);
                doc.text('SESS', colX.sess, newY + 2, { width: 40, align: 'right' });
                doc.text('WPM', colX.wpm, newY + 2, { width: 40, align: 'right' });
                doc.text('ACC', colX.acc, newY + 2, { width: 40, align: 'right' });
                doc.text('FAT', colX.fat, newY + 2, { width: 40, align: 'right' });
                doc.text('ADH', colX.adh, newY + 2, { width: 40, align: 'right' });
                doc.text('PLAT', colX.plat, newY + 2, { width: 50, align: 'right' });

                doc.font('Helvetica').moveDown(2);
                isAlt = false;
            }

            const rowY = doc.y;

            // Alt Row Background
            if (isAlt) {
                doc.save();
                doc.rect(50, rowY - 4, 500, 16).fillColor('#FAFAFA').fill();
                doc.restore();
            }
            isAlt = !isAlt;

            doc.fillColor(colors.secondary);

            // Name
            doc.text(m.name, colX.name, rowY, { width: 110, ellipsis: true, lineBreak: false });
            // Role
            doc.text(m.role, colX.role, rowY, { width: 70, ellipsis: true });

            // Stats
            doc.text(m.sessions.toString(), colX.sess, rowY, { width: 40, align: 'right' });
            doc.text(m.avgWpm.toString(), colX.wpm, rowY, { width: 40, align: 'right' });
            doc.text(`${m.avgAccuracy}%`, colX.acc, rowY, { width: 40, align: 'right' });

            // Fatigue Color
            if (m.avgFatigue > 80) doc.fillColor(colors.danger);
            doc.text(m.avgFatigue.toString(), colX.fat, rowY, { width: 40, align: 'right' });
            doc.fillColor(colors.secondary);

            // Adherence
            doc.text(m.planAdherence || '-', colX.adh, rowY, { width: 40, align: 'right' });

            // Plateau
            if (m.plateauRisk === 'YES') {
                doc.fillColor(colors.warning).text('YES', colX.plat, rowY, { width: 50, align: 'right' });
            } else {
                doc.fillColor(colors.secondary).text('-', colX.plat, rowY, { width: 50, align: 'right' });
            }

            doc.moveDown(1.2);
        });

        doc.end();

    } catch (error) {
        console.error('Failed to generate PDF:', error);
        // Can't send JSON if headers already sent, but try
        if (!res.headersSent) {
            res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(error) } });
        }
    }
});

export default router;
