import type { StateCreator } from 'zustand';
import type { GameStore } from '../store';
import type { Tile } from '../../types';
import { GridEngine, getRandomLetter, getTileType } from '../../engine/grid';
import { GRID_SIZE, SHUFFLE_COOLDOWN_MS } from '../../data/constants';

export interface GridSlice {
    grid: Tile[][];
    lastShuffleTime: number;
    generateNewGrid: () => void;
    setGrid: (grid: Tile[][]) => void;
    replaceTiles: (tilesToRemove: string[]) => void;
    shuffleGrid: () => void;
}

export const createGridSlice: StateCreator<GameStore, [], [], GridSlice> = (set, get) => ({
    grid: [],
    lastShuffleTime: 0,

    generateNewGrid: () => {
        const newGrid = GridEngine.generateGrid();
        set({ grid: newGrid });
    },

    setGrid: (grid) => set({ grid }),

    replaceTiles: (tilesToRemoveIds) => {
        const state = get();
        const { grid } = state;
        const idsToRemove = new Set(tilesToRemoveIds);

        const newGrid: Tile[][] = Array(GRID_SIZE).fill(null).map(() => []);

        for (let x = 0; x < GRID_SIZE; x++) {
            const newCol: Tile[] = [];

            // 1. Keep surviving tiles
            for (let y = 0; y < GRID_SIZE; y++) {
                const tile = grid[y][x];
                if (!idsToRemove.has(tile.id)) {
                    newCol.push(tile);
                }
            }

            // 2. Pad top with new tiles
            // Current newCol has [Top...Bottom] relative order of surviving tiles
            // We need to add new tiles at the START (Top) to fill checks
            const needed = GRID_SIZE - newCol.length;

            const newTiles: Tile[] = [];
            for (let i = 0; i < needed; i++) {
                const letter = getRandomLetter();
                newTiles.push({
                    id: crypto.randomUUID(),
                    letter,
                    type: getTileType(letter),
                    x,
                    y: 0 // placeholder, will be updated below
                });
            }

            // Combine: [NewTiles, SurvivingTiles]
            // The first tile in this array is at y=0 (Top)
            const fullCol = [...newTiles, ...newCol];

            // Assign to newGrid and update Y
            for (let y = 0; y < GRID_SIZE; y++) {
                // Ensure newGrid[y] is initialized as an array
                if (!newGrid[y]) {
                    newGrid[y] = [];
                }
                newGrid[y][x] = { ...fullCol[y], x, y };
            }
        }

        set({ grid: newGrid });
    },

    shuffleGrid: () => {
        const state = get();
        const now = Date.now();
        // Check cooldown? Or just let them spam it? 
        // Plan said "cooldown".
        // We need lastShuffleTime in state.
        if (state.lastShuffleTime && now - state.lastShuffleTime < SHUFFLE_COOLDOWN_MS) return;
        // I need to import SHUFFLE_COOLDOWN_MS. 
        // I will trust the import is present or I will add it.
        // Actually I need to add lastShuffleTime to interface and state first.

        const newGrid = GridEngine.generateGrid();
        set({ grid: newGrid, lastShuffleTime: now, lastInteractionTime: now, hintPath: null });
    }
});
