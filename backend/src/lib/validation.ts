import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const startDrillSchema = z.object({
    drillType: z.string(),
    difficulty: z.string().optional()
});

const typingMetricsSchema = z.object({
    grossWPM: z.number(),
    netWPM: z.number(),
    accuracy: z.number(),
    durationMs: z.number().or(z.undefined()).optional(),
    errorMap: z.record(z.string(), z.number()).optional(),
    wpm: z.number().optional(), // detailed compat check
    duration: z.number().optional() // detailed compat check
}).transform(data => ({
    ...data,
    netWPM: data.netWPM ?? data.wpm,
    durationMs: data.durationMs ?? data.duration
}));

export const completeDrillSchema = z.object({
    id: z.string().optional(), // sometimes passed in body?
    userId: z.string(),
    metrics: typingMetricsSchema,
    keystrokes: z.array(z.any()).optional(),
    idempotencyKey: z.string().optional()
});

export const completeLessonSchema = z.object({
    metrics: typingMetricsSchema,
    lesson: z.any() // Allow full lesson object pass-through
});

export const assessmentSchema = z.object({
    userId: z.string(),
    metrics: typingMetricsSchema
});

export const keystrokeRecordSchema = z.object({
    sessionId: z.string(),
    keystrokes: z.array(z.any()),
    liveMetrics: z.array(z.any()).optional()
});

export const updatePreferencesSchema = z.object({
    theme: z.string().optional(),
    soundEnabled: z.boolean().optional(),
    keyboardLayout: z.string().optional()
});
