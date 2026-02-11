// ── Accuracy Assassin: Configuration Constants ──

import type { DifficultyPreset } from './types';

/** Duration of each round in milliseconds */
export const ROUND_DURATION_MS = 15_000;

/** Countdown ticks before round starts */
export const COUNTDOWN_TICKS = 3;

/** Delay between countdown ticks in ms */
export const COUNTDOWN_INTERVAL_MS = 900;

/** How often the HUD snapshot updates (ms) — ~12fps */
export const HUD_UPDATE_INTERVAL_MS = 80;

/** Minimum chars in a generated prompt */
export const MIN_PROMPT_LENGTH = 20;

/** Maximum chars in a generated prompt */
export const MAX_PROMPT_LENGTH = 60;

/** Difficulty level config */
export const DIFFICULTY_LEVELS = {
    1: { name: 'Common Words', multiplier: 1.0 },
    2: { name: 'Longer Words', multiplier: 1.2 },
    3: { name: 'Capitalization', multiplier: 1.5 },
    4: { name: 'Punctuation', multiplier: 1.8 },
    5: { name: 'Numbers', multiplier: 2.2 },
    6: { name: 'Symbols', multiplier: 2.8 },
} as const;

/** Starting difficulty per preset */
export const PRESET_START_LEVEL: Record<DifficultyPreset, number> = {
    easy: 1,
    normal: 1,
    hard: 3,
};

/** How many flawless rounds before difficulty ramps (per preset) */
export const PRESET_RAMP_EVERY: Record<DifficultyPreset, number> = {
    easy: 2,
    normal: 1,
    hard: 1,
};

/** Max difficulty level */
export const MAX_DIFFICULTY_LEVEL = 6;

/**
 * Score formula:
 * score = streak * avgNetWPM * difficultyMultiplier
 */
export function calculateScore(
    streak: number,
    avgNetWPM: number,
    difficultyLevel: number,
): number {
    const level = Math.min(difficultyLevel, MAX_DIFFICULTY_LEVEL) as keyof typeof DIFFICULTY_LEVELS;
    const multiplier = DIFFICULTY_LEVELS[level]?.multiplier ?? 1;
    return Math.round(streak * avgNetWPM * multiplier);
}

/** localStorage key for analytics runs */
export const ANALYTICS_STORAGE_KEY = 'aa_runs_v1';

/** Max runs to keep in localStorage */
export const MAX_STORED_RUNS = 50;
