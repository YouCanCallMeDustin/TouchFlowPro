import type { StateCreator } from 'zustand';
import type { GameStore } from '../store';
import type { HighScoreEntry } from '../../types';

const STORAGE_KEY = 'spell-rush-high-scores';
const MAX_SCORES = 10;

export interface StorageSlice {
    highScores: HighScoreEntry[];
    loadHighScores: () => void;
    saveScore: (entry: Omit<HighScoreEntry, 'id'>) => void;
    clearScores: () => void;
}

export const createStorageSlice: StateCreator<GameStore, [], [], StorageSlice> = (set, get) => ({
    highScores: [],

    loadHighScores: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                set({ highScores: parsed });
            }
        } catch (e) {
            console.error('Failed to load high scores:', e);
        }
    },

    saveScore: (entry) => {
        const { highScores } = get();

        const newEntry: HighScoreEntry = {
            ...entry,
            id: crypto.randomUUID()
        };

        // Add new score, sort desc, take top N
        const updatedScores = [...highScores, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SCORES);

        set({ highScores: updatedScores });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    },

    clearScores: () => {
        set({ highScores: [] });
        localStorage.removeItem(STORAGE_KEY);
    }
});
