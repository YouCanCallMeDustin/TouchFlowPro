// ── Accuracy Assassin: Core Types ──

export type GamePhase = 'idle' | 'countdown' | 'playing' | 'dead' | 'results';

export type DifficultyPreset = 'easy' | 'normal' | 'hard';

export interface GameSettings {
    muted: boolean;
    reduceMotion: boolean;
    difficulty: DifficultyPreset;
    backspaceEnabled: boolean;
    seed?: string;
}

export interface RoundData {
    roundNumber: number;
    prompt: string;
    difficultyLevel: number; // 1-6
    startTime: number;
    typed: string;
    cursorIndex: number;
    correctChars: number;
}

export interface GameSnapshot {
    phase: GamePhase;
    round: RoundData | null;
    countdownValue: number; // 3, 2, 1, 0 (GO)
    timeRemaining: number; // ms remaining in current round
    streak: number;        // consecutive flawless rounds
    grossWPM: number;
    netWPM: number;
    accuracy: number;
    difficultyLevel: number;
    comboMeter: number;     // 0-1 fill
    totalCharsTyped: number;
    totalCorrectChars: number;
    score: number;
}

export interface DeathInfo {
    expectedChar: string;
    typedChar: string;
    promptIndex: number;
    wordIndex: number;
    prompt: string;
    round: number;
}

export interface RunSummary {
    seed: string;
    streak: number;
    avgGrossWPM: number;
    avgNetWPM: number;
    accuracy: number;
    difficultyLevelReached: number;
    roundsCleared: number;
    score: number;
    totalCharsTyped: number;
    totalCorrectChars: number;
    deathInfo: DeathInfo | null;
    timestamp: number;
    durationMs: number;
}

export interface KeystrokeLog {
    timestamp: number;       // performance.now()
    expectedChar: string;
    typedChar: string;
    correct: boolean;
    roundNumber: number;
    promptIndex: number;
    interKeyInterval: number; // ms since last keystroke
}

export interface AnalyticsRun {
    version: number;
    seed: string;
    keystrokes: KeystrokeLog[];
    summary: RunSummary;
}
