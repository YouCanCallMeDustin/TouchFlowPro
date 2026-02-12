export const GRID_SIZE = 6;
export const MIN_WORD_LENGTH = 3;
export const MAX_WORD_LENGTH = 8;

export const LETTER_DISTRIBUTION: Record<string, number> = {
    A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1, K: 1, L: 4, M: 2,
    N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1
};

export const MAGIC_WORDS = new Set([
    'ARCANE', 'VOID', 'STORM', 'MANA', 'IGNITE', 'RUNE', 'AETHER', 'EMBER'
]);

export const RARE_LETTERS = new Set(['Q', 'X', 'Z']);

export const MOVEMENT_COOLDOWN_MS = 300;
export const SHUFFLE_COOLDOWN_MS = 5000; // 5 seconds cooldown
export const HINT_IDLE_MS = 5000; // 5 seconds idle triggers hint
export const COMBO_DECAY_MS = 2000;

export const INITIAL_PLAYER_HP = 100;
export const INITIAL_ENEMY_HP = 100;
export const BASE_ATTACK_INTERVAL = 6;
export const MIN_ATTACK_INTERVAL = 2.5;

export const SCALING_INTERVAL_S = 30; // Scale every 30s
