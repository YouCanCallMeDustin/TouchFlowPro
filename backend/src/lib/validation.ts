import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const keystrokeRecordSchema = z.object({
    sessionId: z.string(),
    keystrokes: z.array(z.any()),
    liveMetrics: z.record(z.string(), z.any()).optional(),
});

export const assessmentSchema = z.object({
    userId: z.string(),
    metrics: z.object({
        grossWPM: z.number(),
        netWPM: z.number(),
        accuracy: z.number(),
        durationMs: z.number(),
    }),
});

export const completeLessonSchema = z.object({
    lesson: z.any(),
    metrics: z.object({
        grossWPM: z.number(),
        netWPM: z.number(),
        accuracy: z.number(),
        durationMs: z.number(),
    }),
});

export const completeDrillSchema = z.object({
    userId: z.string(),
    metrics: z.object({
        grossWPM: z.number(),
        netWPM: z.number(),
        accuracy: z.number(),
        durationMs: z.number(),
    }),
    keystrokes: z.array(z.any()).optional(),
    idempotencyKey: z.string().optional(),
});
