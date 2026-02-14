import { z } from 'zod';

export const createPlanSchema = z.object({
    track: z.enum(['MEDICAL', 'LEGAL', 'OPS', 'CODE']),
    goalWpm: z.number().min(10).max(200),
    goalAccuracy: z.number().min(0).max(100).default(98),
    minutesPerDay: z.number().min(5).max(120).default(20),
    durationWeeks: z.number().min(1).max(52).default(4)
});

export const completeItemSchema = z.object({
    planItemId: z.string().optional() // If present, toggle item. If missing, complete day.
});
