// ── Accuracy Assassin: Seeded PRNG ──
// Mulberry32 — simple, fast, deterministic 32-bit PRNG

export function createRng(seed: string): () => number {
    let h = hashString(seed);
    return () => {
        h |= 0;
        h = (h + 0x6d2b79f5) | 0;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Simple string → 32-bit integer hash (djb2) */
function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return hash;
}

/** Pick a random element from an array using the RNG */
export function pick<T>(arr: readonly T[], rng: () => number): T {
    return arr[Math.floor(rng() * arr.length)];
}

/** Shuffle an array in-place using Fisher-Yates with the RNG */
export function shuffle<T>(arr: T[], rng: () => number): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/** Generate a default seed from current timestamp */
export function defaultSeed(): string {
    return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
