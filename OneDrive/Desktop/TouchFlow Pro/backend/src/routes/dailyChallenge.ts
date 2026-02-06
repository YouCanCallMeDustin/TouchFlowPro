import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/daily-challenge/today
// Get today's challenge
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let challenge = await prisma.dailyChallenge.findUnique({
            where: { date: today }
        });

        if (!challenge) {
            // Generate a new challenge for today
            const challenges = [
                {
                    type: 'speed',
                    content: 'The quick brown fox jumps over the lazy dog.',
                    targetWPM: 60,
                    xpReward: 150
                },
                {
                    type: 'accuracy',
                    content: 'Programming requires precision and attention to detail.',
                    targetAccuracy: 98,
                    xpReward: 150
                },
                {
                    type: 'endurance',
                    content: 'Practice makes perfect. Consistency is key to improvement.',
                    targetTime: 120, // 2 minutes
                    xpReward: 200
                }
            ];

            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

            challenge = await prisma.dailyChallenge.create({
                data: {
                    date: today,
                    ...randomChallenge
                }
            });
        }

        res.json({
            id: challenge.id,
            date: challenge.date,
            type: challenge.type,
            content: challenge.content,
            target: {
                wpm: challenge.targetWPM,
                accuracy: challenge.targetAccuracy,
                time: challenge.targetTime
            },
            xpReward: challenge.xpReward,
            completed: false // TODO: Track per-user completion
        });
    } catch (error) {
        console.error('Get daily challenge error:', error);
        res.status(500).json({ error: 'Failed to fetch daily challenge' });
    }
});

// POST /api/daily-challenge/complete
// Mark challenge as completed
router.post('/complete', async (req, res) => {
    try {
        const { userId, challengeId, metrics } = req.body;

        // TODO: Store completion in a separate table
        // For now, just award XP

        const challenge = await prisma.dailyChallenge.findUnique({
            where: { id: challengeId }
        });

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Check if challenge requirements met
        let completed = false;
        if (challenge.type === 'speed' && metrics.wpm >= (challenge.targetWPM || 0)) {
            completed = true;
        } else if (challenge.type === 'accuracy' && metrics.accuracy >= (challenge.targetAccuracy || 0)) {
            completed = true;
        } else if (challenge.type === 'endurance' && metrics.time >= (challenge.targetTime || 0)) {
            completed = true;
        }

        if (completed) {
            // Award XP
            const progress = await prisma.userProgress.findUnique({
                where: { userId }
            });

            if (progress) {
                await prisma.userProgress.update({
                    where: { userId },
                    data: {
                        xp: { increment: challenge.xpReward }
                    }
                });
            }

            res.json({ success: true, xpEarned: challenge.xpReward });
        } else {
            res.json({ success: false, message: 'Challenge requirements not met' });
        }
    } catch (error) {
        console.error('Complete challenge error:', error);
        res.status(500).json({ error: 'Failed to complete challenge' });
    }
});

export default router;
