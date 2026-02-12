export type TileType = 'normal' | 'rare' | 'magic';

export interface Tile {
    id: string; // unique ID for React keys
    letter: string;
    type: TileType;
    x: number;
    y: number;
    bonus?: number; // e.g. from magic words or rare letters
}

export interface Enemy {
    id: string;
    currentHp: number;
    maxHp: number;
    attackTimer: number; // Seconds until attack
    attackInterval: number; // Max seconds for timer
    damage: number;
}

export interface Player {
    currentHp: number;
    maxHp: number;
}

export interface CombatStats {
    combo: number;
    score: number;
    survivalTime: number; // Seconds survived
    enemyLevel: number; // For scaling
    maxCombo: number;
    wordsFound: number;
}

export interface GameState {
    grid: Tile[][];
    player: Player;
    enemy: Enemy | null;
    stats: CombatStats;
    isGameOver: boolean;
    selectedTiles: Tile[]; // For drag selection
    lastWord: string | null; // For UI feedback
    lastDamage: number | null; // For UI feedback
    isShaking: boolean;
    lastInteractionTime: number;
    hintPath: Tile[] | null;
}

export interface HighScoreEntry {
    id: string;
    name: string;
    score: number;
    date: number;
    maxCombo: number;
    wordsFound: number;
    survivalTime: number;
}
