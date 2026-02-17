export interface KeystrokeEvent {
    keyCode: string;
    key: string;
    eventType: 'keydown' | 'keyup';
    timestamp: number;
    expectedKey?: string;
}

export interface TypingMetrics {
    grossWPM: number;
    netWPM: number;
    accuracy: number;
    charsTyped: number;
    errors: number;
    totalMistakes: number;
    durationMs: number;
    errorMap: Record<string, number>;
}

export interface DrillResult {
    drillId: string;
    userId: string;
    metrics: TypingMetrics;
    keystrokes: KeystrokeEvent[];
    completedAt: Date;
}

// ===== PHASE 0: Enhanced Tracking =====

export interface EnhancedKeystrokeEvent extends KeystrokeEvent {
    expectedKey: string;
    correct: boolean;
    finger: number; // 0-9 (left pinky to right pinky)
    timeSinceLastKey: number;
}

export interface LiveMetrics {
    currentWPM: number;
    currentAccuracy: number;
    keystrokesPerMinute: number;
    averageKeyDelay: number;
    timeElapsed: number;
}

export interface PerKeyStats {
    key: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    averageSpeed: number; // ms per keystroke
}

export interface SessionInsights {
    totalTime: number;
    wordsTyped: number;
    averageWPM: number;
    peakWPM: number;
    averageAccuracy: number;
    keysMastered: string[];
    troubleKeys: string[];
    improvement: {
        wpmChange: number;
        accuracyChange: number;
    };
}

export interface AdaptiveDifficulty {
    currentLevel: number;
    weakKeys: string[];
    recommendedDrills: string[];
    nextUnlock: string;
    progressToNextLevel: number; // 0-100
}

export interface UserLevel {
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    totalXP: number;
}

export interface DailyChallenge {
    id: string;
    date: Date;
    type: 'speed' | 'accuracy' | 'endurance';
    content: string;
    target: {
        wpm?: number;
        accuracy?: number;
        time?: number;
    };
    xpReward: number;
    completed: boolean;
}

export interface Certificate {
    id: string;
    userId: string;
    type: string;
    wpm: number;
    accuracy: number;
    testDate: Date;
    certificateUrl?: string;
}

export interface SequenceStat {
    sequence: string;
    type: 'bigram' | 'trigram';
    speed: number; // ms delay
}
