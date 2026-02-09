import { Router } from 'express';
import prisma from '../lib/db';

const router = Router();

// GET /api/history/:userId - Get paginated session history
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = '1', limit = '20', sortBy = 'timestamp', order = 'desc' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [results, totalCount] = await Promise.all([
            prisma.drillResult.findMany({
                where: { userId },
                orderBy: {
                    [sortBy as string]: order as 'asc' | 'desc'
                },
                skip,
                take: limitNum
            }),
            prisma.drillResult.count({ where: { userId } })
        ]);

        res.json({
            results,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalCount,
                hasMore: skip + results.length < totalCount
            }
        });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// GET /api/history/:userId/export - Export progress as CSV
router.get('/:userId/export', async (req, res) => {
    try {
        const { userId } = req.params;

        const results = await prisma.drillResult.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' }
        });

        // Generate CSV
        const csvHeader = 'Date,Time,Drill ID,Gross WPM,Net WPM,Accuracy,Duration (s),Errors\n';
        const csvRows = results.map(r => {
            const date = new Date(r.timestamp);
            return `${date.toLocaleDateString()},${date.toLocaleTimeString()},"${r.drillId}",${r.grossWPM},${r.netWPM},${r.accuracy},${Math.round(r.durationMs / 1000)},${Math.round(r.grossWPM - r.netWPM)}`;
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=touchflow-pro-history-${userId}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export history' });
    }
});

export default router;
