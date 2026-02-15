import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { drillLibrary } from '@shared/drillLibrary';
import { SpacedScheduler } from '@shared/scheduler';
import { calculateFatigue } from '@shared/fatigue';
import prisma from '../lib/db';
import { Achievement } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { completeDrillSchema } from '../lib/validation';

const router = Router();

// GET all drills
router.get('/', (req, res) => {
    res.json(drillLibrary);
});

// GET drills by difficulty
router.get('/difficulty/:level', (req, res) => {
    const level = req.params.level;
    const filtered = drillLibrary.filter(drill =>
        drill.difficulty.toLowerCase() === level.toLowerCase()
    );
    res.json(filtered);
});

// GET completed drills for user
router.get('/completed', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id: userId } = (req as AuthRequest).user!;
        const completed = await prisma.drillResult.findMany({
            where: { userId },
            select: { drillId: true },
            distinct: ['drillId']
        });
        res.json({ completedDrillIds: completed.map(c => c.drillId) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch completed drills' });
    }
});

// GET drill by ID
router.get('/:id', (req, res) => {
    const drill = drillLibrary.find(d => d.id === req.params.id);
    if (!drill) {
        return res.status(404).json({ error: 'Drill not found' });
    }
    res.json(drill);
});

// POST complete drill
router.post('/:id/complete', async (req, res, next) => {
    try {
        const { id: drillId } = req.params;
        const { metrics, userId } = completeDrillSchema.parse(req.body);
        const idempotencyKey = req.body.idempotencyKey;

        // Idempotency Check
        if (idempotencyKey) {
            const existing = await prisma.drillResult.findUnique({ where: { idempotencyKey } });
            if (existing) {
                return res.json({
                    message: 'Drill completed (cached)',
                    nextReview: new Date(),
                    interval: 0
                });
            }
        }

        // Ensure User exists
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    assignedLevel: 'Beginner',
                    unlockedLevels: 'Beginner',
                    currentLessonId: null,
                    createdAt: new Date(),
                    email: `placeholder_${userId}@example.com`
                }
            });
        }

        const keystrokes = (req.body.keystrokes || []) as any[];
        const fatigue = calculateFatigue(metrics, keystrokes);

        const { updatedItemCalc, newAchievement } = await prisma.$transaction(async (tx) => {
            // Save Result
            await tx.drillResult.create({
                data: {
                    userId,
                    drillId,
                    grossWPM: metrics.grossWPM,
                    netWPM: metrics.netWPM,
                    accuracy: metrics.accuracy,
                    durationMs: metrics.durationMs || 0,
                    timestamp: new Date(),
                    fatigueScore: fatigue.score,
                    fatigueFlags: JSON.stringify(fatigue.flags),
                    idempotencyKey: idempotencyKey || undefined
                }
            });

            // Check for Category Completion / Achievement
            let createdAchievement: Achievement | null = null;
            const currentDrill = drillLibrary.find(d => d.id === drillId);
            if (currentDrill) {
                // Get all drills in this category/difficulty
                const categoryDrills = drillLibrary.filter(d => d.difficulty === currentDrill.difficulty);
                const totalInCategory = categoryDrills.length;

                // Count user's completed drills in this category
                // We need to count distinct drillIds for this user where the drill is in this category
                const categoryDrillIds = categoryDrills.map(d => d.id);
                const userCompleted = await tx.drillResult.findMany({
                    where: {
                        userId,
                        drillId: { in: categoryDrillIds }
                    },
                    select: { drillId: true },
                    distinct: ['drillId']
                });

                if (userCompleted.length === totalInCategory) {
                    const badgeType = `MASTER_${currentDrill.difficulty.toUpperCase()}`;
                    // Check if already awarded
                    const existingBadge = await tx.achievement.findUnique({
                        where: { userId_badgeType: { userId, badgeType } }
                    });

                    if (!existingBadge) {
                        createdAchievement = await tx.achievement.create({
                            data: {
                                userId,
                                badgeType,
                                metadata: JSON.stringify({ category: currentDrill.difficulty, title: `${currentDrill.difficulty} Mastery` })
                            }
                        });
                    }
                }
            }

            // Get existing spaced item
            let spacedItem = await tx.spacedItem.findFirst({
                where: { userId, drillId }
            });

            const currentItem = spacedItem ? {
                id: spacedItem.drillId,
                interval: spacedItem.interval,
                repetition: spacedItem.repetition,
                efactor: spacedItem.efactor,
                nextReview: spacedItem.nextReview
            } : {
                id: drillId,
                interval: 0,
                repetition: 0,
                efactor: 2.5,
                nextReview: new Date()
            };

            const quality = SpacedScheduler.calculateQuality(metrics.accuracy, metrics.netWPM, 60);
            const updatedItemCalc = SpacedScheduler.review(currentItem, quality, fatigue.score);

            // Upsert SpacedItem
            if (spacedItem) {
                await tx.spacedItem.update({
                    where: { id: spacedItem.id },
                    data: {
                        interval: updatedItemCalc.interval,
                        repetition: updatedItemCalc.repetition,
                        efactor: updatedItemCalc.efactor,
                        nextReview: updatedItemCalc.nextReview
                    }
                });
            } else {
                await tx.spacedItem.create({
                    data: {
                        userId,
                        drillId,
                        interval: updatedItemCalc.interval,
                        repetition: updatedItemCalc.repetition,
                        efactor: updatedItemCalc.efactor,
                        nextReview: updatedItemCalc.nextReview
                    }
                });
            }

            return { updatedItemCalc, newAchievement: createdAchievement };
        });

        res.json({
            message: 'Drill completed',
            nextReview: updatedItemCalc.nextReview,
            interval: updatedItemCalc.interval,
            newAchievement
        });
    } catch (error) {
        next(error);
    }
});

export default router;
