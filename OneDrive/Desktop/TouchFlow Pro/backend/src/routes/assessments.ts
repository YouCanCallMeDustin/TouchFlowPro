import { Router } from 'express';
import { TypingEngine } from '@shared/typingEngine';
import type { KeystrokeEvent } from '@shared/types';

const router = Router();

// In-memory storage for demonstration
const assessmentResults: any[] = [];

router.post('/baseline/:id/complete', (req, res) => {
    const { id } = req.params;
    const { keystrokes, expectedText, userId } = req.body;

    if (!keystrokes || !expectedText) {
        return res.status(400).json({ error: 'Missing keystrokes or expectedText' });
    }

    const metrics = TypingEngine.calculateMetrics(keystrokes as KeystrokeEvent[], expectedText);

    const result = {
        assessmentId: id,
        userId,
        metrics,
        keystrokes: keystrokes.slice(0, 100), // Store first 100 for sample
        completedAt: new Date()
    };

    assessmentResults.push(result);

    res.status(201).json({
        message: 'Assessment completed and stored',
        metrics
    });
});

export default router;
