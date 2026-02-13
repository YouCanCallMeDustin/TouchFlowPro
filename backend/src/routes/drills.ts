import { Router } from 'express';
import { drillLibrary } from '@shared/drillLibrary';
import { SpacedScheduler } from '@shared/scheduler';
import { calculateFatigue } from '@shared/fatigue';
import prisma from '../lib/db';
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
    // ...
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

        const { updatedItemCalc } = await prisma.$transaction(async (tx) => {
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

            return { updatedItemCalc };
        });

        res.json({
            message: 'Drill completed',
            nextReview: updatedItemCalc.nextReview,
            interval: updatedItemCalc.interval
        });
    } catch (error) {
        next(error);
    }
});

export default router;
