import express, { Request, Response } from 'express';
import prisma from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z, ZodError } from 'zod';

const router = express.Router();

const createCertificateSchema = z.object({
    wpm: z.number().int().min(0).max(300),
    accuracy: z.number().int().min(0).max(100),
    type: z.string().default('1 Minute'),
});

// GET /api/certificates - Get user's certificate history
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user!.id;

        const certificates = await prisma.certificate.findMany({
            where: { userId },
            orderBy: { testDate: 'desc' }
        });

        res.json(certificates);
    } catch (error) {
        console.error('Failed to fetch certificates:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

// POST /api/certificates - Save a new certificate
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        console.log('[Certificates] Received POST request:', req.body);
        const userId = (req as AuthRequest).user!.id;
        const { wpm, accuracy, type } = createCertificateSchema.parse(req.body);

        const certificate = await prisma.certificate.create({
            data: {
                userId,
                wpm,
                accuracy,
                type
            }
        });

        console.log('[Certificates] Saved certificate:', certificate.id);
        res.json(certificate);
    } catch (error) {
        if (error instanceof ZodError) {
            console.error('[Certificates] Validation error:', error.issues);
            return res.status(400).json({ error: error.issues });
        }
        console.error('Failed to create certificate:', error);
        res.status(500).json({ error: 'Failed to create certificate' });
    }
});

export default router;
