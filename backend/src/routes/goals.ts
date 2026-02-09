import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/goals/:userId - List user goals
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const goals = await prisma.userGoal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ goals });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/goals/:userId - Create new goal
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { goalType, targetValue, deadline } = req.body;

        if (!goalType || !targetValue) {
            return res.status(400).json({ error: 'Goal type and target value are required' });
        }

        const goal = await prisma.userGoal.create({
            data: {
                userId,
                goalType,
                targetValue,
                deadline: deadline ? new Date(deadline) : null,
                currentValue: 0,
                completed: false
            }
        });

        res.status(201).json(goal);
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// PUT /api/goals/:goalId - Update goal progress
router.put('/:goalId', async (req, res) => {
    try {
        const { goalId } = req.params;
        const { currentValue, completed } = req.body;

        const goal = await prisma.userGoal.update({
            where: { id: goalId },
            data: {
                currentValue: currentValue !== undefined ? currentValue : undefined,
                completed: completed !== undefined ? completed : undefined
            }
        });

        res.json(goal);
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// DELETE /api/goals/:goalId - Delete goal
router.delete('/:goalId', async (req, res) => {
    try {
        const { goalId } = req.params;

        await prisma.userGoal.delete({
            where: { id: goalId }
        });

        res.json({ success: true, message: 'Goal deleted' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

export default router;
