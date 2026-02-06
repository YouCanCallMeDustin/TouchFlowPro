import { Router } from 'express';
import { TypingEngine } from '@shared/typingEngine';
import type { KeystrokeEvent } from '@shared/types';
import prisma from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/baseline/:id/complete', async (req, res) => {
    const { id: drillId } = req.params;
    const { keystrokes, expectedText, userId } = req.body;

    if (!keystrokes || !expectedText) {
        return res.status(400).json({ error: 'Missing keystrokes or expectedText' });
    }

    const metrics = TypingEngine.calculateMetrics(keystrokes as KeystrokeEvent[], expectedText);

    try {
        // Ensure user exists (if anonymous assessment allowed, we might need to create temp user or handle differently)
        // Assuming userId provided:
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    assignedLevel: 'Beginner',
                    unlockedLevels: 'Beginner',
                    currentLessonId: null,
                    createdAt: new Date(),
                    email: `temp_${userId}@example.com`
                }
            });
        }

        // Save as DrillResult
        await prisma.drillResult.create({
            data: {
                userId,
                drillId, // 'baseline' or similar
                grossWPM: metrics.grossWPM,
                netWPM: metrics.netWPM,
                accuracy: metrics.accuracy,
                durationMs: metrics.durationMs || 0,
                timestamp: new Date()
            }
        });

        res.status(201).json({
            message: 'Assessment completed and stored',
            metrics
        });
    } catch (error) {
        console.error('Assessment save error:', error);
        res.status(500).json({ error: 'Failed to save assessment' });
    }
});

export default router;
