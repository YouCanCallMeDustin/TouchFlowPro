import { TypingMetrics, KeystrokeEvent } from './types';

export interface FatigueAnalysis {
    score: number; // 0-100
    flags: string[];
    onsetSecond?: number;
}

/**
 * Calculates a fatigue score based on typing metrics and keystroke data.
 * 
 * FATIGUE FORMULA V1:
 * 1. Accuracy Penalty:
 *    - < 90%: +10
 *    - < 85%: +25
 *    - < 80%: +50
 * 2. Consistency Penalty (if keystrokes available):
 *    - High variance in inter-key latency suggests mental fatigue.
 * 3. Duration Penalty:
 *    - Long sessions (>3 min) without breaks increase base fatigue.
 */
export function calculateFatigue(
    metrics: TypingMetrics,
    keystrokes: KeystrokeEvent[] = []
): FatigueAnalysis {
    let score = 0;
    const flags: string[] = [];

    // --- 1. Accuracy Analysis ---
    if (metrics.accuracy < 80) {
        score += 50;
        flags.push('CRITICAL_ACCURACY_DROP');
    } else if (metrics.accuracy < 85) {
        score += 25;
        flags.push('HIGH_ACCURACY_DROP');
    } else if (metrics.accuracy < 92) {
        score += 10;
        flags.push('MODERATE_ACCURACY_DROP');
    }

    // --- 2. Duration Analysis ---
    // Drills longer than 3 minutes (180000ms) induce fatigue
    if (metrics.durationMs > 180000) {
        score += 15;
        flags.push('LONG_SESSION_FATIGUE');
    }

    // --- 3. Consistency/Rhythm Analysis (if keystrokes exist) ---
    if (keystrokes.length > 10) {
        const intervals: number[] = [];
        for (let i = 1; i < keystrokes.length; i++) {
            // Filter out extremely long pauses (breaks) > 2s
            const diff = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
            if (diff < 2000) {
                intervals.push(diff);
            }
        }

        if (intervals.length > 5) {
            const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
            const stdDev = Math.sqrt(variance);

            // Coefficient of Variation (CV) = stdDev / mean
            // CV > 0.5 implies very erratic typing (rhythm breakdown)
            const cv = stdDev / mean;

            if (cv > 0.6) {
                score += 30;
                flags.push('ERRATIC_RHYTHM');
            } else if (cv > 0.4) {
                score += 15;
                flags.push('UNSTABLE_RHYTHM');
            }
        }
    }

    // Cap score at 100
    return {
        score: Math.min(100, score),
        flags,
        onsetSecond: 0 // Placeholder for V2 (timeline analysis)
    };
}
