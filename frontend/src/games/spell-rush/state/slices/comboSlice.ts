import type { StateCreator } from 'zustand';
import type { GameStore } from '../store';
import { COMBO_DECAY_MS } from '../../data/constants';

export interface ComboSlice {
    comboTimer: number; // MS remaining

    addCombo: () => void;
    resetCombo: () => void;
    tickCombo: (dt: number) => void;
}

export const createComboSlice: StateCreator<GameStore, [], [], ComboSlice> = (set, get) => ({
    comboTimer: 0,

    addCombo: () => {
        set((state) => {
            const newCombo = state.stats.combo + 1;
            const newMax = Math.max(state.stats.maxCombo || 0, newCombo);
            return {
                stats: { ...state.stats, combo: newCombo, maxCombo: newMax },
                comboTimer: COMBO_DECAY_MS
            };
        });
    },

    resetCombo: () => {
        set((state) => ({
            stats: { ...state.stats, combo: 0 },
            comboTimer: 0
        }));
    },

    tickCombo: (dt: number) => {
        const { comboTimer, stats } = get();
        if (comboTimer > 0) {
            const newTimer = Math.max(0, comboTimer - (dt * 1000));
            set({ comboTimer: newTimer });

            if (newTimer <= 0 && stats.combo > 0) {
                get().resetCombo();
            }
        }
    }
});
