
import express from 'express';
import prisma from '../lib/db';
import { z } from 'zod';
import { generateDailyPlan, TrainingTrack } from '../../../shared/trainingPlan';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculateFatigue } from '../../../shared/fatigue';
import { detectPlateau } from '../../../shared/plateau';

const router = express.Router();
router.use(authenticateToken);

const createPlanSchema = z.object({
    track: z.enum(['MEDICAL', 'LEGAL', 'OPS', 'CODE', 'CUSTOM']),
    goalWpm: z.number().min(20).max(200),
    goalAccuracy: z.number().min(80).max(100),
    minutesPerDay: z.number().min(5).max(120).default(20),
    durationWeeks: z.number().min(1).max(12).default(4)
});

// GET /api/plans/active
// Get the user's current active plan
router.get('/active', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const plan = await prisma.trainingPlan.findFirst({
            where: {
                userId,
                status: 'ACTIVE'
            },
            include: {
                days: {
                    where: { date: new Date().toISOString().split('T')[0] } // Check for today's entry
                }
            }
        });
        res.json(plan);
    } catch (error) {
        console.error('Failed to get active plan:', error);
        res.status(500).json({ error: 'Failed to fetch active plan' });
    }
});

// POST /api/plans
// Create a new training plan
router.post('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const body = createPlanSchema.parse(req.body);

        // Archive any existing active plan
        await prisma.trainingPlan.updateMany({
            where: { userId, status: 'ACTIVE' },
            data: { status: 'ARCHIVED' }
        });

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (body.durationWeeks * 7));

        const plan = await prisma.trainingPlan.create({
            data: {
                userId,
                track: body.track,
                goalWpm: body.goalWpm,
                goalAccuracy: body.goalAccuracy,
                minutesPerDay: body.minutesPerDay,
                endDate
            }
        });

        res.json(plan);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        console.error('Failed to create plan:', error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// GET /api/plans/active/today
// Get today's scheduled training, generating it if needed
router.get('/active/today', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Get Active Plan
        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' },
            include: { days: { where: { date: new Date(todayStr) } } }
        });

        if (!plan) {
            return res.status(404).json({ error: 'No active training plan' });
        }

        // 2. Check if today already exists
        let today = await prisma.trainingDay.findFirst({
            where: {
                planId: plan.id,
                date: new Date(todayStr) // Prisma DateTime mapping handles this usually, but might skip time part or need range
            }
        });

        // Prisma date comparison can be tricky with DateTime. Let's rely on finding by range or string if we store string. 
        // Schema says DateTime. We should probably query by range or store as YYYY-MM-DD string? 
        // Schema has `date DateTime`. Let's assume we store set to midnight UTC.

        // Actually, let's just query by range to be safe
        if (!today) {
            const startOfDay = new Date(todayStr);
            const endOfDay = new Date(todayStr);
            endOfDay.setHours(23, 59, 59, 999);

            today = await prisma.trainingDay.findFirst({
                where: {
                    planId: plan.id,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });
        }

        if (today) {
            return res.json({
                ...today,
                items: JSON.parse(today.itemsJson) // expand items
            });
        }

        // 3. Generate New Day
        // Gather inputs
        const [userProgress, fatigueData, recentSessions, spacedItems] = await Promise.all([
            prisma.userProgress.findUnique({ where: { userId } }),
            prisma.drillResult.findMany({
                where: { userId, timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                select: { fatigueScore: true }
            }),
            prisma.drillResult.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                take: 10
            }),
            prisma.spacedItem.count({
                where: { userId, nextReview: { lte: new Date() } }
            })
        ]);

        const avgFatigue = fatigueData.length > 0
            ? fatigueData.reduce((acc, cur) => acc + (cur.fatigueScore || 0), 0) / fatigueData.length
            : 0;

        // Plateau detection
        let plateauSignal: string | null = null;
        if (recentSessions.length >= 5) {
            const history = recentSessions.map(s => ({
                timestamp: s.timestamp,
                wpm: s.netWPM,
                accuracy: s.accuracy,
                fatigueScore: s.fatigueScore || undefined
            }));
            const plateauResult = detectPlateau(history);
            if (plateauResult.plateau) {
                plateauSignal = plateauResult.signal;
            }
        }

        const generated = generateDailyPlan({
            track: plan.track as TrainingTrack,
            goalWpm: plan.goalWpm,
            currentWpm: userProgress?.averageWPM || 0,
            currentAccuracy: userProgress?.averageAccuracy || 100,
            fatigueScore: avgFatigue,
            plateauSignal,
            spacedItemsCount: spacedItems,
            minutesPerDay: plan.minutesPerDay
        });

        // Save to DB
        const newDay = await prisma.trainingDay.create({
            data: {
                planId: plan.id,
                date: new Date(todayStr),
                itemsJson: JSON.stringify(generated.items),
                status: 'PLANNED'
            }
        });

        res.json({
            ...newDay,
            items: generated.items
        });

    } catch (error) {
        console.error('Failed to generate today\'s plan:', error);
        res.status(500).json({ error: 'Failed to generate plan' });
    }
});

// POST /api/plans/active/today/complete
// Mark today's plan as completed
router.post('/active/today/complete', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const todayStr = new Date().toISOString().split('T')[0];

        // Find active plan
        const plan = await prisma.trainingPlan.findFirst({
            where: { userId, status: 'ACTIVE' }
        });

        if (!plan) return res.status(404).json({ error: 'No active plan' });

        const startOfDay = new Date(todayStr);
        const endOfDay = new Date(todayStr);
        endOfDay.setHours(23, 59, 59, 999);

        // Find today's TrainingDay entry
        const today = await prisma.trainingDay.findFirst({
            where: {
                planId: plan.id,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        if (!today) {
            return res.status(404).json({ error: 'No plan found for today' });
        }

        const updated = await prisma.trainingDay.update({
            where: { id: today.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        res.json(updated);

    } catch (error) {
        console.error('Failed to complete plan:', error);
        res.status(500).json({ error: 'Failed to complete plan' });
    }
});

export default router;
