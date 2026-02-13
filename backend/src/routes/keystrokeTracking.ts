import { Router } from 'express';
import prisma from '../lib/db';
import { keystrokeRecordSchema } from '../lib/validation';

const router = Router();

// POST /api/keystroke-tracking/record
// Record keystroke data for a session
router.post('/record', async (req, res, next) => {
    try {
        const { sessionId, keystrokes, liveMetrics } = keystrokeRecordSchema.parse(req.body);

        const sessionDetails = await prisma.sessionDetails.create({
            data: {
                sessionId,
                keystrokes: JSON.stringify(keystrokes),
                liveMetrics: JSON.stringify(liveMetrics)
            }
        });

        res.json(sessionDetails);
    } catch (error) {
        next(error);
    }
});

// GET /api/keystroke-tracking/stats/:userId
// Get per-key statistics for user
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const keyStats = await prisma.keyStats.findMany({
            where: { userId },
            orderBy: { lastPracticed: 'desc' }
        });

        // Calculate accuracy for each key
        const stats = keyStats.map(stat => ({
            key: stat.key,
            totalAttempts: stat.attempts,
            correctAttempts: stat.correct,
            accuracy: stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0,
            averageSpeed: stat.avgSpeed
        }));

        res.json(stats);
    } catch (error) {
        console.error('Get key stats error:', error);
        res.status(500).json({ error: 'Failed to fetch key statistics' });
    }
});

// POST /api/keystroke-tracking/update-key-stats
// Update key statistics after practice
router.post('/update-key-stats', async (req, res) => {
    try {
        const { userId, keyStats } = req.body;

        // Update or create key stats for each key
        const updates = keyStats.map(async (stat: any) => {
            return prisma.keyStats.upsert({
                where: {
                    userId_key: {
                        userId,
                        key: stat.key
                    }
                },
                update: {
                    attempts: { increment: stat.totalAttempts },
                    correct: { increment: stat.correctAttempts },
                    avgSpeed: stat.averageSpeed
                },
                create: {
                    userId,
                    key: stat.key,
                    attempts: stat.totalAttempts,
                    correct: stat.correctAttempts,
                    avgSpeed: stat.averageSpeed
                }
            });
        });

        await Promise.all(updates);

        res.json({ success: true });
    } catch (error) {
        console.error('Update key stats error:', error);
        res.status(500).json({ error: 'Failed to update key statistics' });
    }
});

// GET /api/keystroke-tracking/trouble-keys/:userId
// Get keys that need practice (low accuracy)
router.get('/trouble-keys/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const threshold = parseInt(req.query.threshold as string) || 85;

        const keyStats = await prisma.keyStats.findMany({
            where: {
                userId,
                attempts: { gte: 3 } // At least 3 attempts
            }
        });

        // Filter keys below threshold
        const troubleKeys = keyStats
            .filter(stat => {
                const accuracy = (stat.correct / stat.attempts) * 100;
                return accuracy < threshold;
            })
            .map(stat => ({
                key: stat.key,
                accuracy: (stat.correct / stat.attempts) * 100,
                attempts: stat.attempts
            }))
            .sort((a, b) => a.accuracy - b.accuracy); // Worst first

        res.json(troubleKeys);
    } catch (error) {
        console.error('Get trouble keys error:', error);
        res.status(500).json({ error: 'Failed to fetch trouble keys' });
    }
});

// GET /api/keystroke-tracking/sequences/:userId
// Get slowest sequences for user
router.get('/sequences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const type = req.query.type as string || 'bigram';
        const limit = parseInt(req.query.limit as string) || 10;

        const sequences = await prisma.sequenceStats.findMany({
            where: { userId, type },
            orderBy: { avgSpeed: 'desc' }, // Slowest first
            take: limit
        });

        res.json(sequences);
    } catch (error) {
        console.error('Get sequence stats error:', error);
        res.status(500).json({ error: 'Failed to fetch sequence statistics' });
    }
});

// POST /api/keystroke-tracking/update-sequence-stats
// Update bigram/trigram stats
router.post('/update-sequence-stats', async (req, res) => {
    try {
        const { userId, sequences } = req.body;

        const updates = sequences.map(async (s: any) => {
            return prisma.sequenceStats.upsert({
                where: {
                    userId_sequence: {
                        userId,
                        sequence: s.sequence
                    }
                },
                update: {
                    attempts: { increment: 1 },
                    avgSpeed: s.speed // simplified moving average or just last
                },
                create: {
                    userId,
                    sequence: s.sequence,
                    type: s.type,
                    attempts: 1,
                    avgSpeed: s.speed
                }
            });
        });

        await Promise.all(updates);

        res.json({ success: true });
    } catch (error) {
        console.error('Update sequence stats error:', error);
        res.status(500).json({ error: 'Failed to update sequence statistics' });
    }
});

export default router;
