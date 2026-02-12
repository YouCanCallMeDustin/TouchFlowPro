import { COMMON_WORDS } from '../data/words';
import { MAGIC_WORDS, MIN_WORD_LENGTH } from '../data/constants';
import expandedWords from '../data/dictionary.json';

class DictionarySystem {
    private wordSet: Set<string>;
    private prefixSet: Set<string>;

    constructor() {
        this.wordSet = new Set();
        this.prefixSet = new Set();
        this.initialize();
    }

    private initialize() {
        // Merge all sources
        const allWords = new Set([
            ...COMMON_WORDS,
            ...Array.from(MAGIC_WORDS),
            ...expandedWords
        ]);

        allWords.forEach(word => {
            if (word.length >= MIN_WORD_LENGTH) {
                this.addWord(word);
            }
        });
    }

    private addWord(word: string) {
        const upper = word.toUpperCase();
        this.wordSet.add(upper);

        // Add all prefixes
        for (let i = 1; i <= upper.length; i++) {
            this.prefixSet.add(upper.substring(0, i));
        }
    }

    isWord(text: string): boolean {
        return this.wordSet.has(text.toUpperCase());
    }

    isPrefix(text: string): boolean {
        return this.prefixSet.has(text.toUpperCase());
    }
}

export const dictionary = new DictionarySystem();
