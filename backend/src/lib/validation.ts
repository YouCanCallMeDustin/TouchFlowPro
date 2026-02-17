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

export const updateSettingsSchema = z.object({
    soundEnabled: z.boolean().optional(),
    reduceMotion: z.boolean().optional(),
    fontScale: z.enum(['SM', 'MD', 'LG']).optional(),
    autoPauseIdle: z.boolean().optional(),
    dailyGoalMinutes: z.number().min(5).max(1440).optional(),
    defaultFocus: z.enum(['BALANCED', 'SPEED', 'ACCURACY', 'ENDURANCE']).optional(),
    warmupSeconds: z.number().min(0).max(3600).optional(),
    reviewSeconds: z.number().min(0).max(3600).optional(),
    skillSeconds: z.number().min(0).max(3600).optional(),
    cooldownSeconds: z.number().min(0).max(3600).optional(),
    storeRawLogsPractice: z.boolean().optional(),
    storeRawLogsCurriculum: z.boolean().optional(),
});
