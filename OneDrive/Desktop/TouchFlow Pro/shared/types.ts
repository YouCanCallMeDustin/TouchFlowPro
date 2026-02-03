export interface KeystrokeEvent {
    keyCode: string;
    key: string;
    eventType: 'keydown' | 'keyup';
    timestamp: number;
}

export interface TypingMetrics {
    grossWPM: number;
    netWPM: number;
    accuracy: number;
    charsTyped: number;
    errors: number;
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
