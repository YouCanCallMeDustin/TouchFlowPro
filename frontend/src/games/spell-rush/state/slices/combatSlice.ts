import type { StateCreator } from 'zustand';
import type { GameStore } from '../store';
import type { Enemy, Player, CombatStats } from '../../types';
import { INITIAL_PLAYER_HP, INITIAL_ENEMY_HP, BASE_ATTACK_INTERVAL, SCALING_INTERVAL_S } from '../../data/constants';

export interface CombatSlice {
    player: Player;
    enemy: Enemy | null;
    stats: CombatStats;

    initCombat: () => void;
    damageEnemy: (amount: number) => void;
    damagePlayer: (amount: number) => void;
    healPlayer: (amount: number) => void;
    incrementSurvivalTime: (dt: number) => void;
    spawnEnemy: (levelOffset?: number) => void;
}

export const createCombatSlice: StateCreator<GameStore, [], [], CombatSlice> = (set, get) => ({
    player: { currentHp: INITIAL_PLAYER_HP, maxHp: INITIAL_PLAYER_HP },
    enemy: null,
    stats: { combo: 0, score: 0, survivalTime: 0, enemyLevel: 1, maxCombo: 0, wordsFound: 0 },

    initCombat: () => {
        set({
            player: { currentHp: INITIAL_PLAYER_HP, maxHp: INITIAL_PLAYER_HP },
            stats: { combo: 0, score: 0, survivalTime: 0, enemyLevel: 1, maxCombo: 0, wordsFound: 0 }
        });
        get().spawnEnemy(0);
    },

    spawnEnemy: (levelOffset = 0) => {
        const level = get().stats.enemyLevel + levelOffset;
        const maxHp = INITIAL_ENEMY_HP + (level * 20);

        // Attack interval reduces by 0.3s every level (30s), min 2.5s
        // Level 1 = 6s. Level 2 = 5.7s. 
        const speedUp = (level - 1) * 0.3;
        const attackInterval = Math.max(2.5, BASE_ATTACK_INTERVAL - speedUp);

        const newEnemy: Enemy = {
            id: crypto.randomUUID(),
            maxHp,
            currentHp: maxHp,
            attackTimer: attackInterval,
            attackInterval,
            damage: 10 + Math.floor(level * 1.5)
        };

        set({ enemy: newEnemy });
    },

    damageEnemy: (amount) => {
        set((state) => {
            if (!state.enemy) return {};
            const newHp = state.enemy.currentHp - amount;

            if (newHp <= 0) {
                // Enemy dead
                // Increment Score?
                // Spawn new enemy immediately
                // We need to call spawnEnemy, but we can't easily do async side effects inside the setter 
                // unless we use get() outside.
                // Zustand setter can return partial state.
                // We'll handle the spawn in the next tick or immediately after.
                return { enemy: null };
            }

            return { enemy: { ...state.enemy, currentHp: newHp } };
        });

        if (!get().enemy) {
            // Enemy died
            const stats = get().stats;
            set({ stats: { ...stats, score: stats.score + (stats.enemyLevel * 100) } });
            get().spawnEnemy(0); // Same level? Or does killing enemy increase level? 
            // Requirement: "Every 30 seconds survived: Enemy max HP +20..."
            // So killing enemy doesn't increase level, TIME does.
        }
    },

    damagePlayer: (amount) => {
        set((state) => {
            const newHp = state.player.currentHp - amount;
            return {
                player: { ...state.player, currentHp: newHp },
                isGameOver: newHp <= 0
            };
        });
    },

    healPlayer: (amount) => {
        set((state) => {
            const newHp = Math.min(state.player.maxHp, state.player.currentHp + amount);
            return { player: { ...state.player, currentHp: newHp } };
        });
    },

    incrementSurvivalTime: (dt) => {
        set((state) => {
            const newTime = state.stats.survivalTime + dt;
            // Check for leveling up
            // const oldLevel = Math.floor(state.stats.survivalTime / SCALING_INTERVAL_S) + 1;
            const newLevel = Math.floor(newTime / SCALING_INTERVAL_S) + 1;

            const updatedStats = { ...state.stats, survivalTime: newTime, enemyLevel: newLevel };

            // Use a flag or check if we need to update enemy stats? 
            // Enemy stats update on SPAWN, but existing enemy?
            // "Enemy max HP +20" applies to NEW enemies usually, but maybe current too?
            // "Attack timer -0.3 seconds" logic is in spawn.
            // Requirement: "Below 30% HP -> attack every 4 seconds" is dynamic.

            return { stats: updatedStats };
        });
    }
});
