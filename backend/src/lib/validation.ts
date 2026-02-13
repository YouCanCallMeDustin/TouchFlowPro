import { z } from 'zod';

export const startDrillSchema = z.object({
    drillType: z.string(),
    difficulty: z.string().optional()
});

export const completeDrillSchema = z.object({
    drillId: z.string(),
    wpm: z.number(),
    accuracy: z.number(),
    duration: z.number()
});

export const updatePreferencesSchema = z.object({
    theme: z.string().optional(),
    soundEnabled: z.boolean().optional(),
    keyboardLayout: z.string().optional()
});

export const completeLessonSchema = z.object({
    lessonId: z.string(),
    metrics: z.object({
        wpm: z.number(),
        accuracy: z.number(),
        duration: z.number()
    })
});
