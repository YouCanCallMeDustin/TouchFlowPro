// ── Accuracy Assassin: Game Engine (Pure TS State Machine) ──

import type {
    GamePhase, GameSettings, GameSnapshot, RoundData,
    RunSummary, DeathInfo, KeystrokeLog,
} from './types';
import {
    ROUND_DURATION_MS, COUNTDOWN_TICKS, COUNTDOWN_INTERVAL_MS,
    PRESET_START_LEVEL, PRESET_RAMP_EVERY, MAX_DIFFICULTY_LEVEL,
    calculateScore,
} from './config';
import { createRng, defaultSeed } from './rng';
import { generatePrompt } from './promptGenerator';

export class GameEngine {
    // ── State ──
    private phase: GamePhase = 'idle';
    private settings: GameSettings;
    private seed: string;
    private rng: () => number;

    // Round
    private round: RoundData | null = null;
    private roundStartTime = 0;
    private roundTimerId: number | null = null;

    // Countdown
    private countdownValue = 0;
    private countdownTimerId: number | null = null;

    // Scoring / streak
    private streak = 0;
    private difficultyLevel = 1;
    private allWPMs: number[] = [];
    private totalCharsTyped = 0;
    private totalCorrectChars = 0;
    private runStartTime = 0;

    // Death
    private deathInfo: DeathInfo | null = null;

    // Keystroke log
    private keystrokeLogs: KeystrokeLog[] = [];
    private lastKeystrokeTime = 0;

    // Callbacks
    private onPhaseChange: ((phase: GamePhase) => void) | null = null;
    private onDeath: (() => void) | null = null;
    private onRoundClear: (() => void) | null = null;
    private onCountdownTick: ((val: number) => void) | null = null;

    constructor(settings: GameSettings) {
        this.settings = { ...settings };
        this.seed = settings.seed || defaultSeed();
        this.rng = createRng(this.seed);
    }

    // ── Public API ──

    setCallbacks(cbs: {
        onPhaseChange?: (phase: GamePhase) => void;
        onDeath?: () => void;
        onRoundClear?: () => void;
        onCountdownTick?: (val: number) => void;
    }) {
        this.onPhaseChange = cbs.onPhaseChange ?? null;
        this.onDeath = cbs.onDeath ?? null;
        this.onRoundClear = cbs.onRoundClear ?? null;
        this.onCountdownTick = cbs.onCountdownTick ?? null;
    }

    start() {
        this.reset();
        this.runStartTime = performance.now();
        this.setPhase('countdown');
        this.startCountdown();
    }

    restart() {
        this.cleanup();
        this.seed = defaultSeed();
        this.rng = createRng(this.seed);
        this.start();
    }

    /** Process a typed character. Returns true if correct, false = death. */
    handleChar(char: string): boolean {
        if (this.phase !== 'playing' || !this.round) return false;

        const expected = this.round.prompt[this.round.cursorIndex];
        const now = performance.now();
        const interval = this.lastKeystrokeTime > 0 ? now - this.lastKeystrokeTime : 0;
        const correct = char === expected;

        // Log keystroke
        this.keystrokeLogs.push({
            timestamp: now,
            expectedChar: expected,
            typedChar: char,
            correct,
            roundNumber: this.round.roundNumber,
            promptIndex: this.round.cursorIndex,
            interKeyInterval: interval,
        });

        this.lastKeystrokeTime = now;
        this.totalCharsTyped++;

        if (!correct) {
            this.die(expected, char);
            return false;
        }

        this.totalCorrectChars++;
        this.round.correctChars++;
        this.round.typed += char;
        this.round.cursorIndex++;

        // Check if prompt completed
        if (this.round.cursorIndex >= this.round.prompt.length) {
            this.completeRound();
        }

        return true;
    }

    /** Handle backspace if enabled. Returns true if handled. */
    handleBackspace(): boolean {
        if (!this.settings.backspaceEnabled) return false;
        if (this.phase !== 'playing' || !this.round) return false;
        if (this.round.cursorIndex <= 0) return false;

        this.round.cursorIndex--;
        this.round.typed = this.round.typed.slice(0, -1);
        return true;
    }

    /** Get an immutable snapshot for the UI */
    getSnapshot(): GameSnapshot {
        const now = performance.now();
        const timeRemaining = this.round
            ? Math.max(0, ROUND_DURATION_MS - (now - this.roundStartTime))
            : 0;

        const elapsed = this.round
            ? (now - this.round.startTime) / 1000
            : 0;
        const charsTyped = this.round?.correctChars ?? 0;
        const grossWPM = elapsed > 0 ? (charsTyped / 5) / (elapsed / 60) : 0;

        return {
            phase: this.phase,
            round: this.round ? { ...this.round } : null,
            countdownValue: this.countdownValue,
            timeRemaining,
            streak: this.streak,
            grossWPM: Math.round(grossWPM),
            netWPM: Math.round(grossWPM), // no errors in arcade (death on first error)
            accuracy: this.totalCharsTyped > 0
                ? Math.round((this.totalCorrectChars / this.totalCharsTyped) * 100)
                : 100,
            difficultyLevel: this.difficultyLevel,
            comboMeter: Math.min(1, this.streak / 10),
            totalCharsTyped: this.totalCharsTyped,
            totalCorrectChars: this.totalCorrectChars,
            score: calculateScore(
                this.streak,
                this.getAvgWPM(),
                this.difficultyLevel,
            ),
        };
    }

    /** Get the final run summary */
    getRunSummary(): RunSummary {
        const avgWPM = this.getAvgWPM();
        return {
            seed: this.seed,
            streak: this.streak,
            avgGrossWPM: avgWPM,
            avgNetWPM: avgWPM,
            accuracy: this.totalCharsTyped > 0
                ? Math.round((this.totalCorrectChars / this.totalCharsTyped) * 100)
                : 100,
            difficultyLevelReached: this.difficultyLevel,
            roundsCleared: this.streak,
            score: calculateScore(this.streak, avgWPM, this.difficultyLevel),
            totalCharsTyped: this.totalCharsTyped,
            totalCorrectChars: this.totalCorrectChars,
            deathInfo: this.deathInfo,
            timestamp: Date.now(),
            durationMs: performance.now() - this.runStartTime,
        };
    }

    getKeystrokeLogs(): KeystrokeLog[] {
        return [...this.keystrokeLogs];
    }

    getPhase(): GamePhase {
        return this.phase;
    }

    goToResults() {
        if (this.phase === 'dead') {
            this.setPhase('results');
        }
    }

    cleanup() {
        if (this.roundTimerId !== null) {
            clearTimeout(this.roundTimerId);
            this.roundTimerId = null;
        }
        if (this.countdownTimerId !== null) {
            clearInterval(this.countdownTimerId);
            this.countdownTimerId = null;
        }
    }

    // ── Internal ──

    private reset() {
        this.cleanup();
        this.phase = 'idle';
        this.round = null;
        this.streak = 0;
        this.difficultyLevel = PRESET_START_LEVEL[this.settings.difficulty];
        this.allWPMs = [];
        this.totalCharsTyped = 0;
        this.totalCorrectChars = 0;
        this.deathInfo = null;
        this.keystrokeLogs = [];
        this.lastKeystrokeTime = 0;
        this.countdownValue = 0;
    }

    private setPhase(phase: GamePhase) {
        this.phase = phase;
        this.onPhaseChange?.(phase);
    }

    private startCountdown() {
        this.countdownValue = COUNTDOWN_TICKS;
        this.onCountdownTick?.(this.countdownValue);

        this.countdownTimerId = window.setInterval(() => {
            this.countdownValue--;
            this.onCountdownTick?.(this.countdownValue);

            if (this.countdownValue <= 0) {
                clearInterval(this.countdownTimerId!);
                this.countdownTimerId = null;
                this.startRound();
            }
        }, COUNTDOWN_INTERVAL_MS);
    }

    private startRound() {
        const prompt = generatePrompt(this.difficultyLevel, this.rng);
        this.round = {
            roundNumber: this.streak + 1,
            prompt,
            difficultyLevel: this.difficultyLevel,
            startTime: performance.now(),
            typed: '',
            cursorIndex: 0,
            correctChars: 0,
        };
        this.roundStartTime = performance.now();
        this.lastKeystrokeTime = 0;
        this.setPhase('playing');

        // Round timer — death on timeout
        this.roundTimerId = window.setTimeout(() => {
            this.die(this.round!.prompt[this.round!.cursorIndex] ?? '?', '⏰');
        }, ROUND_DURATION_MS);
    }

    private completeRound() {
        if (this.roundTimerId !== null) {
            clearTimeout(this.roundTimerId);
            this.roundTimerId = null;
        }

        // Calculate WPM for this round
        const elapsed = (performance.now() - this.round!.startTime) / 1000;
        const wpm = elapsed > 0 ? (this.round!.correctChars / 5) / (elapsed / 60) : 0;
        this.allWPMs.push(wpm);

        this.streak++;

        // Ramp difficulty
        const rampEvery = PRESET_RAMP_EVERY[this.settings.difficulty];
        if (this.streak % rampEvery === 0 && this.difficultyLevel < MAX_DIFFICULTY_LEVEL) {
            this.difficultyLevel++;
        }

        this.onRoundClear?.();

        // Brief pause then next round
        setTimeout(() => {
            if (this.phase === 'playing') {
                this.startRound();
            }
        }, 800);
    }

    private die(expected: string, typed: string) {
        this.cleanup();

        // Find word index
        let wordIndex = 0;
        if (this.round) {
            const textBefore = this.round.prompt.slice(0, this.round.cursorIndex);
            wordIndex = textBefore.split(' ').length - 1;
        }

        this.deathInfo = {
            expectedChar: expected,
            typedChar: typed,
            promptIndex: this.round?.cursorIndex ?? 0,
            wordIndex,
            prompt: this.round?.prompt ?? '',
            round: this.round?.roundNumber ?? 0,
        };

        // Record final WPM for the incomplete round
        if (this.round && this.round.correctChars > 0) {
            const elapsed = (performance.now() - this.round.startTime) / 1000;
            const wpm = elapsed > 0 ? (this.round.correctChars / 5) / (elapsed / 60) : 0;
            this.allWPMs.push(wpm);
        }

        this.setPhase('dead');
        this.onDeath?.();
    }

    private getAvgWPM(): number {
        if (this.allWPMs.length === 0) return 0;
        const sum = this.allWPMs.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.allWPMs.length);
    }
}
