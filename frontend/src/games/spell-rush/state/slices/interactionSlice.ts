import type { StateCreator } from 'zustand';
import type { GameStore } from '../store';
import type { Tile } from '../../types';
import { MOVEMENT_COOLDOWN_MS, MAGIC_WORDS, RARE_LETTERS, MIN_WORD_LENGTH } from '../../data/constants';
import { dictionary } from '../../engine/dictionary';
import { GridEngine } from '../../engine/grid';

export interface InteractionSlice {
    selectedTiles: Tile[];
    lastSwapTime: number;

    startDrag: (tile: Tile) => void;
    continueDrag: (tile: Tile) => void;
    endDrag: () => void;
    swapTiles: (tile1: Tile, tile2: Tile) => void;
    clearSelection: () => void;
    submitWord: () => void;
    handleKeyboardInput: (char: string) => void;
    handleBackspace: () => void;
}

export const createInteractionSlice: StateCreator<GameStore, [], [], InteractionSlice> = (set, get) => ({
    selectedTiles: [],
    lastSwapTime: 0,

    startDrag: (tile) => {
        set({ selectedTiles: [tile], lastInteractionTime: Date.now(), hintPath: null });
    },

    continueDrag: (tile) => {
        const { selectedTiles } = get();
        // Check if tile is already selected (backtrack)
        const index = selectedTiles.findIndex(t => t.id === tile.id);

        if (index !== -1) {
            // If it's the second to last one, we are backtracking, so remove the last one
            if (index === selectedTiles.length - 2) {
                set({ selectedTiles: selectedTiles.slice(0, index + 1), lastInteractionTime: Date.now(), hintPath: null });
            }
            return;
        }

        // Check adjacency
        const lastTile = selectedTiles[selectedTiles.length - 1];
        if (!lastTile) return;

        const dx = Math.abs(tile.x - lastTile.x);
        const dy = Math.abs(tile.y - lastTile.y);

        // Orthogonal + Diagonal neighbors (Chebyshev distance === 1)
        // dx <= 1 && dy <= 1 && !(dx===0 && dy===0)
        // Since we already checked if it's the same tile (backtrack), 
        // we just need to check adjacency.
        if (dx <= 1 && dy <= 1) {
            set({ selectedTiles: [...selectedTiles, tile], lastInteractionTime: Date.now(), hintPath: null });
        }
    },

    endDrag: () => {
        // Auto-submit or just clear?
        // Usually user releases mouse to submit.
        get().submitWord();
    },

    clearSelection: () => {
        set({ selectedTiles: [] });
    },

    swapTiles: (t1, t2) => {
        const now = Date.now();
        if (now - get().lastSwapTime < MOVEMENT_COOLDOWN_MS) return;

        const { grid } = get();

        // Check adjacency
        const dx = Math.abs(t1.x - t2.x);
        const dy = Math.abs(t1.y - t2.y);
        if (dx + dy !== 1) return;

        // Perform swap in grid
        const newGrid = grid.map(row => [...row]);

        // Update x,y of tiles
        const tile1Params = { ...t1, x: t2.x, y: t2.y };
        const tile2Params = { ...t2, x: t1.x, y: t1.y };

        newGrid[t1.y][t1.x] = tile2Params;
        newGrid[t2.y][t2.x] = tile1Params;

        set({ grid: newGrid, lastSwapTime: now, lastInteractionTime: now, hintPath: null });
    },

    submitWord: () => {
        const state = get();
        const { selectedTiles } = state;

        if (selectedTiles.length < MIN_WORD_LENGTH) {
            state.clearSelection();
            return;
        }

        const word = selectedTiles.map(t => t.letter).join('');

        if (!dictionary.isWord(word)) {
            // Provide visual feedback? for now just clear
            state.clearSelection();
            return;
        }

        // Calculate Damage
        const wordLength = word.length;
        let damage = wordLength * 10;

        // Combo
        damage += state.stats.combo * 3;

        // Rare Letters
        let rareBonus = 0;
        selectedTiles.forEach(t => {
            if (RARE_LETTERS.has(t.letter)) rareBonus += 20;
        });
        damage += rareBonus;

        // Magic Word
        let magicBonus = 0;
        if (MAGIC_WORDS.has(word)) {
            magicBonus = 25;
        }
        damage += magicBonus;

        // Apply
        state.damageEnemy(damage);
        state.addCombo();

        // Update Stats
        set((s) => ({
            stats: {
                ...s.stats,
                wordsFound: (s.stats.wordsFound || 0) + 1
            }
        }));

        // High Damage Shake
        if (damage >= 40) {
            set({ isShaking: true });
            setTimeout(() => set({ isShaking: false }), 300);
        }

        // UI Feedback
        set({ lastWord: word, lastDamage: damage, lastInteractionTime: Date.now(), hintPath: null });

        // Replace tiles
        state.replaceTiles(selectedTiles.map(t => t.id));

        state.clearSelection();
    },

    handleKeyboardInput: (char: string) => {
        const state = get();
        const { selectedTiles, grid } = state;
        const currentWord = selectedTiles.map(t => t.letter).join('');
        const nextWord = currentWord + char.toUpperCase();

        const paths = GridEngine.findAllPathsForWord(grid, nextWord);

        if (paths.length > 0) {
            let bestPath = paths[0];
            let maxScore = -1;

            for (const path of paths) {
                const score = GridEngine.calculatePathScore(path);
                if (score > maxScore) {
                    maxScore = score;
                    bestPath = path;
                }
            }
            set({ selectedTiles: bestPath, lastInteractionTime: Date.now(), hintPath: null });
        }
    },

    handleBackspace: () => {
        const { selectedTiles } = get();
        if (selectedTiles.length > 0) {
            set({ selectedTiles: selectedTiles.slice(0, -1), lastInteractionTime: Date.now(), hintPath: null });
        }
    }
});
