import { create } from 'zustand';
import type { GameState } from '../types';
import { createGridSlice, type GridSlice } from './slices/gridSlice';
import { createCombatSlice, type CombatSlice } from './slices/combatSlice';
import { createInteractionSlice, type InteractionSlice } from './slices/interactionSlice';
import { createComboSlice, type ComboSlice } from './slices/comboSlice';
import { createStorageSlice, type StorageSlice } from './slices/storageSlice';
import { GridEngine } from '../engine/grid';
import { HINT_IDLE_MS } from '../data/constants';
import type { Tile } from '../types';

export type GameStore = GameState & GridSlice & CombatSlice & InteractionSlice & ComboSlice & StorageSlice & {
    tick: (dt: number) => void;
    lastInteractionTime: number;
    hintPath: Tile[] | null;
    triggerHint: () => void;
    isShaking: boolean;
};

export const useGameStore = create<GameStore>((set, get, ...a) => ({
    // Slices will initialize the state
    ...createGridSlice(set, get, ...a),
    ...createCombatSlice(set, get, ...a),
    ...createInteractionSlice(set, get, ...a),
    ...createComboSlice(set, get, ...a),
    ...createStorageSlice(set, get, ...a),

    isGameOver: false,
    lastWord: null,
    lastDamage: null,
    lastInteractionTime: Date.now(),
    hintPath: null,
    isShaking: false,

    triggerHint: () => {
        const { grid } = get();
        // 1. Get all words
        const words = GridEngine.getAllValidWords(grid);
        if (words.size === 0) return;

        // 2. Pick random word
        const wordArr = Array.from(words);
        const randomWord = wordArr[Math.floor(Math.random() * wordArr.length)];

        // 3. Find path
        const paths = GridEngine.findAllPathsForWord(grid, randomWord);
        if (paths.length > 0) {
            // Prefer path that uses normal tiles? or any. Just take first.
            set({ hintPath: paths[0] });
        }
    },

    tick: (dt: number) => {
        const state = get();
        if (state.isGameOver) return;

        // Hint Logic
        const now = Date.now();
        if (!state.hintPath && now - state.lastInteractionTime > HINT_IDLE_MS) {
            state.triggerHint();
        }

        // Update survival time & stats
        state.incrementSurvivalTime(dt);

        // Handle Enemy Attack
        if (state.enemy) {
            const enemy = state.enemy;
            let newTimer = enemy.attackTimer - dt;

            if (newTimer <= 0) {
                state.damagePlayer(enemy.damage);

                // Reset timer with rage logic
                let interval = enemy.attackInterval;
                if (enemy.currentHp < enemy.maxHp * 0.3) {
                    interval = Math.min(interval, 4.0);
                }
                newTimer = interval;
            }

            set((s) => ({ enemy: s.enemy ? { ...s.enemy, attackTimer: newTimer } : null }));
        }

        // Update Combo
        state.tickCombo(dt);
    }
}));
