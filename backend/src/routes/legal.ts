import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

export async function calculateLegalTerminologyRisk(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const weakTerms = await prisma.legalWeakTerm.findMany({
        where: {
            userId,
            mistakeCount: { gte: 3 },
            lastMistypedAt: { gte: thirtyDaysAgo }
        }
    });

    if (weakTerms.length === 0) return 0;

    let totalScore = 0;
    for (const term of weakTerms) {
        let termImpact = 5 + ((term.mistakeCount - 3) * 2);
        totalScore += termImpact;
    }

    return Math.min(100, Math.round(totalScore));
}

// GET /api/legal/risk/:userId
router.get('/risk/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing userId parameter' } });
        }

        const score = await calculateLegalTerminologyRisk(userId);
        res.json({ score });
    } catch (error) {
        console.error('Error fetching legal risk:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate risk score' } });
    }
});

export default router;
