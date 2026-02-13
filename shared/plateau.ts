export interface PlateauAnalysis {
    plateau: boolean;
    signal: 'NO_IMPROVEMENT' | 'REGRESSION' | 'INCONSISTENT' | 'FATIGUE_LIMITED' | 'ACCURACY_CEILING' | 'NONE';
    confidence: number; // 0-1
    explanation: string;
    suggestion: string;
}

interface SessionData {
    timestamp: Date;
    wpm: number;
    accuracy: number;
    fatigueScore?: number;
}

/**
 * Detects if a user has hit a plateau based on their recent session history.
 * 
 * LOGIC:
 * 1. Needs at least 15 sessions to detect.
 * 2. NO_IMPROVEMENT: WPM variance is low, trend is flat/negative over last 20 sessions.
 * 3. ACCURACY_CEILING: WPM is flat, but accuracy is consistently < 95% (user needs to slow down to speed up).
 * 4. FATIGUE_LIMITED: Progress is flat, but average fatigue score is high (user practicing while tired).
 */
export function detectPlateau(history: SessionData[]): PlateauAnalysis {
    // Need enough data
    if (history.length < 15) {
        return {
            plateau: false,
            signal: 'NONE',
            confidence: 0,
            explanation: 'Not enough recent sessions to analyze progress.',
            suggestion: 'Keep practicing to unlock insights.'
        };
    }

    const recent = history.slice(0, 20); // Look at last 20

    // Calculate trends
    const wpmValues = recent.map(s => s.wpm);
    const avgWPM = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;

    // Linear regression slope for WPM
    const slope = calculateSlope(wpmValues);

    const accuracyValues = recent.map(s => s.accuracy);
    const avgAccuracy = accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length;

    const fatigueValues = recent.map(s => s.fatigueScore || 0);
    const avgFatigue = fatigueValues.reduce((a, b) => a + b, 0) / fatigueValues.length;

    // RULE 1: Fatigue Limited
    if (Math.abs(slope) < 0.5 && avgFatigue > 40) {
        return {
            plateau: true,
            signal: 'FATIGUE_LIMITED',
            confidence: 0.8,
            explanation: 'Your progress is stalled because you are practicing while tired.',
            suggestion: 'Try shorter sessions or take breaks. Quality over quantity.'
        };
    }

    // RULE 2: Accuracy Ceiling (Trying to type too fast)
    if (Math.abs(slope) < 0.5 && avgAccuracy < 94) {
        return {
            plateau: true,
            signal: 'ACCURACY_CEILING',
            confidence: 0.85,
            explanation: 'You are trading accuracy for speed, which halts long-term growth.',
            suggestion: 'Slow down. Focus on hitting 98% accuracy to unlock faster speeds naturally.'
        };
    }

    // RULE 3: Hard Plateau (No Improvement)
    // Slope is flat (-0.2 to 0.2) over 20 sessions
    if (Math.abs(slope) < 0.2) {
        return {
            plateau: true,
            signal: 'NO_IMPROVEMENT',
            confidence: 0.7,
            explanation: 'Your speed has stabilized recently.',
            suggestion: 'Try "burst" drills or focusing on difficult keys to break through.'
        };
    }

    // RULE 4: Regression
    if (slope < -0.5) {
        return {
            plateau: true,
            signal: 'REGRESSION',
            confidence: 0.6,
            explanation: 'Your performance has dipped recently.',
            suggestion: 'Don\'t worry. Check your ergonomics and rest.'
        };
    }

    return {
        plateau: false,
        signal: 'NONE',
        confidence: 0,
        explanation: 'You are making steady progress.',
        suggestion: 'Keep up the momentum!'
    };
}

function calculateSlope(values: number[]): number {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
}
