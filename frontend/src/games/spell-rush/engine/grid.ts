import { dictionary } from './dictionary';
import { GRID_SIZE, LETTER_DISTRIBUTION, RARE_LETTERS, MAX_WORD_LENGTH } from '../data/constants';
import type { Tile, TileType } from '../types';

// Flatten the distribution into a weighted array for easy picking
const letterPool: string[] = [];
Object.entries(LETTER_DISTRIBUTION).forEach(([letter, weight]) => {
    for (let i = 0; i < weight; i++) {
        letterPool.push(letter);
    }
});

export function getRandomLetter(): string {
    const index = Math.floor(Math.random() * letterPool.length);
    return letterPool[index];
}

export function getTileType(letter: string): TileType {
    if (RARE_LETTERS.has(letter)) return 'rare';
    return 'normal';
}

export class GridEngine {
    static generateGrid(): Tile[][] {
        let grid: Tile[][];
        let attempts = 0;

        do {
            grid = this.createRandomGrid();
            attempts++;
        } while (!this.hasAtLeastNWords(grid, 5) && attempts < 100);

        // If still invalid after 100 attempts, force repair
        if (!this.hasAtLeastNWords(grid, 5)) {
            grid = this.repairGrid(grid);
        }

        return grid;
    }

    private static createRandomGrid(): Tile[][] {
        const grid: Tile[][] = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            const row: Tile[] = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                const letter = getRandomLetter();
                row.push({
                    id: crypto.randomUUID(),
                    letter,
                    type: getTileType(letter),
                    x,
                    y
                });
            }
            grid.push(row);
        }
        return grid;
    }

    static repairGrid(grid: Tile[][]): Tile[][] {
        // Simple repair: Inject a known valid word 'SPELL' vertically or horizontally
        // In a real robust system, we might replace single tiles until valid.
        // For now, let's just regenerate a few specific slots to force vowels/consonants ratio
        // but the simplest fallback is to inject a couple of common words.

        // Let's inject "WORD" and "GAME" just to be safe if random gen failed 100 times (unlikely with this dictionary)
        this.injectWord(grid, "WORD", 0, 0, 'horizontal');
        this.injectWord(grid, "GAME", 2, 2, 'vertical');
        return grid;
    }

    private static injectWord(grid: Tile[][], word: string, startX: number, startY: number, dir: 'horizontal' | 'vertical') {
        for (let i = 0; i < word.length; i++) {
            const x = dir === 'horizontal' ? startX + i : startX;
            const y = dir === 'vertical' ? startY + i : startY;
            if (x < GRID_SIZE && y < GRID_SIZE) {
                grid[y][x].letter = word[i];
                grid[y][x].type = getTileType(word[i]);
            }
        }
    }

    // --- DFS Validation ---

    static hasAtLeastNWords(grid: Tile[][], n: number): boolean {
        const foundWords = new Set<string>();

        // Check every tile as a start node
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                this.dfs(grid, x, y, '', new Set(), foundWords, n);
                if (foundWords.size >= n) return true;
            }
        }
        return foundWords.size >= n;
    }

    private static dfs(
        grid: Tile[][],
        x: number,
        y: number,
        currentWord: string,
        visited: Set<string>,
        foundWords: Set<string>,
        targetCount: number
    ) {
        if (foundWords.size >= targetCount) return;

        // Boundary check
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

        const tile = grid[y][x];
        if (visited.has(tile.id)) return;

        const newWord = currentWord + tile.letter;

        // Pruning: if not a prefix, stop
        if (!dictionary.isPrefix(newWord)) return;

        // Check if it's a valid word
        if (newWord.length >= 3 && dictionary.isWord(newWord)) {
            foundWords.add(newWord);
        }

        if (newWord.length >= MAX_WORD_LENGTH) return;

        const newVisited = new Set(visited).add(tile.id);

        // Neighbors (Up, Down, Left, Right + Diagonals)
        const dirs = [
            [0, 1], [0, -1], [1, 0], [-1, 0], // Orthogonal
            [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal
        ];

        for (const [dx, dy] of dirs) {
            this.dfs(grid, x + dx, y + dy, newWord, newVisited, foundWords, targetCount);
        }
    }

    static getAllValidWords(grid: Tile[][]): Set<string> {
        const found = new Set<string>();
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                // Pass infinity as target to get all
                this.dfs(grid, x, y, '', new Set(), found, 9999);
            }
        }
        return found;
    }

    // --- Keyboard Pathfinding ---

    /**
     * Finds all valid paths (tile sequences) for a specific word.
     * Used for keyboard input where the user types "FIRE" and we need to find 
     * where "FIRE" exists on the grid.
     */
    static findAllPathsForWord(grid: Tile[][], word: string): Tile[][] {
        const paths: Tile[][] = [];
        const targetWord = word.toUpperCase();

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x].letter === targetWord[0]) {
                    this.findPathsRecursive(grid, x, y, targetWord, [], new Set(), paths);
                }
            }
        }
        return paths;
    }

    private static findPathsRecursive(
        grid: Tile[][],
        x: number,
        y: number,
        targetWord: string,
        currentPath: Tile[],
        visited: Set<string>,
        results: Tile[][]
    ) {
        // Boundary check
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

        const tile = grid[y][x];
        if (visited.has(tile.id)) return;

        // Check if letter matches expected char at current position
        const currentIndex = currentPath.length;
        if (tile.letter !== targetWord[currentIndex]) return;

        // match found, add to path
        const newPath = [...currentPath, tile];
        const newVisited = new Set(visited).add(tile.id);

        // Check if full word found
        if (newPath.length === targetWord.length) {
            results.push(newPath);
            return;
        }

        // Continue search neighbors
        const dirs = [
            [0, 1], [0, -1], [1, 0], [-1, 0], // Orthogonal
            [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal
        ];
        for (const [dx, dy] of dirs) {
            this.findPathsRecursive(grid, x + dx, y + dy, targetWord, newPath, newVisited, results);
        }
    }

    /**
     * Scores a path to determine which one to pick if multiple exist.
     * Prefers Rare letters and generally higher id (arbitrary stability).
     */
    static calculatePathScore(path: Tile[]): number {
        let score = 0;
        for (const tile of path) {
            if (tile.type === 'rare') score += 10;
            else score += 1;
        }
        return score;
    }
}
