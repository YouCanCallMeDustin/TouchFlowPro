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

import { apiFetch } from '../../../utils/api';

/**
 * Submit a run score to the backend leaderboard.
 */
export async function submitScore(runSummary: RunSummary): Promise<{ success: boolean; rank?: number; isPersonalBest?: boolean }> {
    try {
        const response = await apiFetch(`/api/games/accuracy-assassin/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summary: runSummary })
        });

        if (response.ok) {
            const result = await response.json();
            return {
                success: true,
                rank: result.rank,
                isPersonalBest: result.isPersonalBest
            };
        }
        return { success: false };
    } catch (error) {
        console.error('[AccuracyAssassin] Failed to submit score:', error);
        return { success: false };
    }
}

/**
 * Fetch the leaderboard for a given game mode.
 */
export async function fetchLeaderboard(mode: string): Promise<LeaderboardEntry[]> {
    try {
        const response = await apiFetch(`/api/games/accuracy-assassin/leaderboard?mode=${mode}&limit=10`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('[AccuracyAssassin] Failed to fetch leaderboard:', error);
        return [];
    }
}
