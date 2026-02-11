// ── Accuracy Assassin: Prompt Generator ──

import { pick } from './rng';
import { MIN_PROMPT_LENGTH, MAX_PROMPT_LENGTH } from './config';
import {
    COMMON_WORDS,
    LONGER_WORDS,
    PUNCTUATION,
    NUMBER_STRINGS,
    SYMBOL_CHARS,
} from '../data/wordBank';

/**
 * Generate a typing prompt for a given difficulty level using a seeded RNG.
 *
 * L1: common words
 * L2: longer words
 * L3: capitalization
 * L4: punctuation
 * L5: numbers mixed in
 * L6: symbols mixed in
 */
export function generatePrompt(level: number, rng: () => number): string {
    const words: string[] = [];
    let length = 0;
    const target = MIN_PROMPT_LENGTH + Math.floor(rng() * (MAX_PROMPT_LENGTH - MIN_PROMPT_LENGTH));

    while (length < target) {
        const word = pickWord(level, rng);
        words.push(word);
        length += word.length + 1; // +1 for space
    }

    return words.join(' ');
}

function pickWord(level: number, rng: () => number): string {
    // Base word selection
    let word: string;
    if (level >= 2 && rng() > 0.4) {
        word = pick(LONGER_WORDS, rng);
    } else {
        word = pick(COMMON_WORDS, rng);
    }

    // L3+: Capitalize some words
    if (level >= 3 && rng() > 0.65) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    // L4+: Add punctuation after some words
    if (level >= 4 && rng() > 0.75) {
        word = word + pick(PUNCTUATION, rng);
    }

    // L5+: Sometimes replace word with a number
    if (level >= 5 && rng() > 0.8) {
        word = pick(NUMBER_STRINGS, rng);
    }

    // L6+: Sometimes insert symbol chars
    if (level >= 6 && rng() > 0.75) {
        const sym = pick(SYMBOL_CHARS, rng);
        if (rng() > 0.5) {
            word = sym + word;
        } else {
            word = word + sym;
        }
    }

    return word;
}
