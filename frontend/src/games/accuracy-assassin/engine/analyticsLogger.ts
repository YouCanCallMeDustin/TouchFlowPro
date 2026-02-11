// ── Accuracy Assassin: Analytics Logger ──

import type { AnalyticsRun, RunSummary, KeystrokeLog } from './types';
import { ANALYTICS_STORAGE_KEY, MAX_STORED_RUNS } from './config';

/** Save a completed run to localStorage */
export function saveRun(summary: RunSummary, keystrokes: KeystrokeLog[]): void {
    try {
        const run: AnalyticsRun = {
            version: 1,
            seed: summary.seed,
            keystrokes,
            summary,
        };

        const existing = loadAllRuns();
        existing.push(run);

        // Trim to max
        while (existing.length > MAX_STORED_RUNS) {
            existing.shift();
        }

        localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
        console.warn('[AccuracyAssassin] Failed to save analytics run:', e);
    }
}

/** Load all stored runs */
export function loadAllRuns(): AnalyticsRun[] {
    try {
        const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as AnalyticsRun[];
    } catch {
        return [];
    }
}

/** Get the most recent run */
export function getLastRun(): AnalyticsRun | null {
    const runs = loadAllRuns();
    return runs.length > 0 ? runs[runs.length - 1] : null;
}

/** Export the last run as a downloadable JSON blob */
export function exportLastRunJSON(): void {
    const run = getLastRun();
    if (!run) return;

    const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accuracy-assassin-run-${run.summary.timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
