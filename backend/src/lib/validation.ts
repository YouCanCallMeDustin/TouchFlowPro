import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required")
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional()
});

export const drillResultSchema = z.object({
    drillId: z.string(),
    wpm: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    timeTaken: z.number().min(0),
    errors: z.record(z.string(), z.number()).optional() // Key: char code/index, Value: count
});

// Shared Metrics Schema
export const typingMetricsSchema = z.object({
    grossWPM: z.number().min(0),
    netWPM: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    durationMs: z.number().min(0),
    charsTyped: z.number().optional(),
    errors: z.number().optional(),
    errorMap: z.record(z.string(), z.number()).optional()
});

// Drills
export const completeDrillSchema = z.object({
    userId: z.string(),
    metrics: typingMetricsSchema
});

// Keystroke Tracking
export const keystrokeRecordSchema = z.object({
    sessionId: z.string(),
    keystrokes: z.array(z.any()),
    liveMetrics: z.any()
});

// Progress
export const assessmentSchema = z.object({
    userId: z.string(),
    metrics: typingMetricsSchema
});

export const completeLessonSchema = z.object({
    metrics: typingMetricsSchema,
    lesson: z.any()
});
