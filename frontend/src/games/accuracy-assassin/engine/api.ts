// ── Accuracy Assassin: Backend API Stubs ──
// These are no-op stubs for V1. All data stays local.
// See README.md for how to wire these to the Express + Prisma backend.

import type { RunSummary } from './types';

export interface LeaderboardEntry {
    userId: string;
    username: string;
    score: number;
    streak: number;
    avgNetWPM: number;
    difficultyLevel: number;
    timestamp: number;
}

/**
 * Submit a run score to the backend leaderboard.
 *
 * To wire to backend:
 * 1. POST to `/api/games/accuracy-assassin/scores`
 * 2. Body: `{ userId, runSummary }`
 * 3. Backend validates and inserts into `GameScore` Prisma model
 * 4. Returns `{ success: boolean, rank: number }`
 */
export async function submitScore(_runSummary: RunSummary): Promise<{ success: boolean; rank?: number }> {
    // No-op for V1
    console.log('[AccuracyAssassin] submitScore stub called — backend not wired yet');
    return { success: false };
}

/**
 * Fetch the leaderboard for a given game mode.
 *
 * To wire to backend:
 * 1. GET `/api/games/accuracy-assassin/leaderboard?mode={mode}&limit=50`
 * 2. Backend queries `GameScore` model ordered by score DESC
 * 3. Returns `LeaderboardEntry[]`
 */
export async function fetchLeaderboard(_mode: string): Promise<LeaderboardEntry[]> {
    // No-op for V1
    console.log('[AccuracyAssassin] fetchLeaderboard stub called — backend not wired yet');
    return [];
}
