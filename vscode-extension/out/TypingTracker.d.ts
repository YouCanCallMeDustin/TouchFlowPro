export interface TypingMetrics {
    wpm: number;
    accuracy: number;
    totalKeystrokes: number;
    backspaces: number;
    sessionDurationSeconds: number;
    isPaused: boolean;
}
export declare class TypingTracker {
    private totalKeystrokes;
    private backspaces;
    private startTime;
    private lastKeystrokeTime;
    private accumulatedTimeSeconds;
    private isPaused;
    private idleTimeoutMs;
    private idleTimer;
    constructor(idleTimeoutSeconds?: number);
    handleKeystroke(isBackspace?: boolean): void;
    updateConfiguration(idleTimeoutSeconds: number): void;
    private resumeSession;
    private resetIdleTimer;
    private pauseSession;
    private activeDurationMs;
    private currentBurstStart;
    start(): void;
    reset(): void;
    private resume;
    handleActivity(isBackspace: boolean): void;
    private pause;
    getMetrics(): TypingMetrics;
}
