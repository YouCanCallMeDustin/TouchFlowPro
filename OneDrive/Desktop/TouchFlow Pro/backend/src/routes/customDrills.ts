import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/custom-drills/:userId - List user's custom drills
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const drills = await prisma.customDrill.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ drills });
    } catch (error) {
        console.error('Get custom drills error:', error);
        res.status(500).json({ error: 'Failed to fetch custom drills' });
    }
});

// POST /api/custom-drills/:userId - Create new custom drill
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, content, difficulty } = req.body;

        if (!title || !content || !difficulty) {
            return res.status(400).json({ error: 'Title, content, and difficulty are required' });
        }

        const drill = await prisma.customDrill.create({
            data: {
                userId,
                title,
                content,
                difficulty,
                timesUsed: 0
            }
        });

        res.status(201).json(drill);
    } catch (error) {
        console.error('Create custom drill error:', error);
        res.status(500).json({ error: 'Failed to create custom drill' });
    }
});

// PUT /api/custom-drills/:drillId - Update custom drill
router.put('/:drillId', async (req, res) => {
    try {
        const { drillId } = req.params;
        const { title, content, difficulty } = req.body;

        const drill = await prisma.customDrill.update({
            where: { id: drillId },
            data: {
                title,
                content,
                difficulty
            }
        });

        res.json(drill);
    } catch (error) {
        console.error('Update custom drill error:', error);
        res.status(500).json({ error: 'Failed to update custom drill' });
    }
});

// DELETE /api/custom-drills/:drillId - Delete custom drill
router.delete('/:drillId', async (req, res) => {
    try {
        const { drillId } = req.params;

        await prisma.customDrill.delete({
            where: { id: drillId }
        });

        res.json({ success: true, message: 'Custom drill deleted' });
    } catch (error) {
        console.error('Delete custom drill error:', error);
        res.status(500).json({ error: 'Failed to delete custom drill' });
    }
});

// POST /api/custom-drills/:drillId/use - Increment usage count
router.post('/:drillId/use', async (req, res) => {
    try {
        const { drillId } = req.params;

        const drill = await prisma.customDrill.update({
            where: { id: drillId },
            data: {
                timesUsed: {
                    increment: 1
                }
            }
        });

        res.json(drill);
    } catch (error) {
        console.error('Use custom drill error:', error);
        res.status(500).json({ error: 'Failed to record drill usage' });
    }
});

export default router;
