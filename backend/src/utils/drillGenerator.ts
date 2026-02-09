// Word bank for generating personalized drills
const WORD_BANK: Record<string, string[]> = {
    // Common words by key
    'a': ['about', 'after', 'again', 'all', 'also', 'always', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'away'],
    'b': ['be', 'because', 'been', 'before', 'best', 'better', 'big', 'but', 'by', 'about', 'number', 'remember'],
    'c': ['call', 'came', 'can', 'come', 'could', 'each', 'place', 'such', 'which', 'because', 'school', 'change'],
    'd': ['day', 'did', 'do', 'does', 'down', 'and', 'good', 'had', 'hand', 'made', 'need', 'old', 'said', 'should'],
    'e': ['each', 'even', 'every', 'be', 'because', 'been', 'before', 'best', 'better', 'between', 'these', 'where'],
    'f': ['far', 'few', 'find', 'first', 'for', 'found', 'from', 'if', 'off', 'after', 'before', 'different'],
    'g': ['get', 'give', 'go', 'good', 'got', 'great', 'again', 'big', 'long', 'thing', 'through', 'together'],
    'h': ['had', 'hand', 'has', 'have', 'he', 'help', 'her', 'here', 'high', 'him', 'his', 'home', 'how', 'the', 'that'],
    'i': ['I', 'if', 'in', 'into', 'is', 'it', 'its', 'did', 'find', 'first', 'give', 'his', 'this', 'which', 'will'],
    'j': ['just', 'jump', 'job'],
    'k': ['keep', 'kind', 'know', 'like', 'make', 'take', 'think', 'work'],
    'l': ['last', 'left', 'let', 'like', 'line', 'little', 'live', 'long', 'look', 'all', 'also', 'call', 'tell'],
    'm': ['made', 'make', 'man', 'many', 'may', 'me', 'mean', 'men', 'more', 'most', 'much', 'must', 'my', 'am', 'come'],
    'n': ['name', 'need', 'never', 'new', 'next', 'no', 'not', 'now', 'number', 'an', 'and', 'any', 'can', 'in', 'on'],
    'o': ['of', 'off', 'old', 'on', 'one', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 'do', 'for', 'go', 'to'],
    'p': ['part', 'people', 'place', 'put', 'help', 'up'],
    'q': ['question', 'quick', 'quite'],
    'r': ['read', 'right', 'are', 'far', 'for', 'from', 'great', 'here', 'or', 'our', 'over', 'very', 'where'],
    's': ['said', 'same', 'saw', 'say', 'see', 'seem', 'she', 'should', 'show', 'small', 'so', 'some', 'still', 'such'],
    't': ['take', 'tell', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'think'],
    'u': ['under', 'up', 'us', 'use', 'used', 'but', 'just', 'must', 'out', 'our', 'put', 'you', 'your'],
    'v': ['very', 'even', 'every', 'give', 'have', 'live', 'over'],
    'w': ['want', 'was', 'way', 'we', 'well', 'went', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'will'],
    'x': ['next', 'example', 'extra'],
    'y': ['year', 'yes', 'yet', 'you', 'your', 'any', 'by', 'day', 'every', 'may', 'my', 'only', 'they', 'very', 'way'],
    'z': ['zero', 'zone']
};

// Common key combinations for practice
const KEY_COMBINATIONS: Record<string, string[]> = {
    'a': ['as', 'at', 'an', 'all', 'and', 'are', 'was', 'has', 'had', 'can', 'man', 'say'],
    'b': ['be', 'by', 'but', 'big', 'best', 'able', 'about'],
    'c': ['can', 'come', 'call', 'each', 'such', 'place'],
    'd': ['do', 'did', 'day', 'and', 'had', 'made', 'need'],
    'e': ['be', 'he', 'we', 'me', 'see', 'the', 'here', 'were', 'these'],
    'f': ['for', 'if', 'of', 'off', 'from', 'first', 'after'],
    'g': ['go', 'get', 'big', 'long', 'great', 'again'],
    'h': ['he', 'has', 'had', 'his', 'her', 'how', 'the', 'that', 'this'],
    'i': ['is', 'it', 'in', 'if', 'his', 'will', 'this', 'which'],
    'j': ['just', 'jump'],
    'k': ['keep', 'kind', 'know', 'like', 'make', 'take'],
    'l': ['let', 'like', 'long', 'look', 'all', 'will', 'tell'],
    'm': ['me', 'my', 'man', 'may', 'make', 'more', 'most', 'much', 'must'],
    'n': ['no', 'not', 'now', 'new', 'an', 'and', 'in', 'on', 'can'],
    'o': ['of', 'on', 'or', 'to', 'do', 'go', 'so', 'no', 'for', 'you'],
    'p': ['up', 'put', 'part', 'place', 'people'],
    'q': ['question', 'quick', 'quite'],
    'r': ['are', 'or', 'for', 'from', 'here', 'there', 'very', 'great'],
    's': ['is', 'as', 'so', 'see', 'say', 'she', 'same', 'such', 'still'],
    't': ['to', 'it', 'at', 'the', 'that', 'this', 'take', 'tell', 'than'],
    'u': ['us', 'up', 'use', 'but', 'just', 'must', 'you', 'your'],
    'v': ['very', 'have', 'give', 'even', 'every'],
    'w': ['we', 'was', 'way', 'will', 'what', 'when', 'where', 'which', 'who'],
    'x': ['next', 'extra'],
    'y': ['you', 'yes', 'yet', 'your', 'any', 'by', 'day', 'may', 'my'],
    'z': ['zero']
};

interface PersonalizedDrillOptions {
    troubleKeys: string[];
    length?: number; // Target character count
    difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Generate a personalized drill targeting specific trouble keys
 */
export function generatePersonalizedDrill(options: PersonalizedDrillOptions): string {
    const { troubleKeys, length = 200, difficulty = 'medium' } = options;

    if (troubleKeys.length === 0) {
        return 'the quick brown fox jumps over the lazy dog';
    }

    const drillParts: string[] = [];
    let currentLength = 0;
    const targetLength = length;

    // 1. Isolated key practice (20% of drill)
    const isolatedPractice: string[] = [];
    troubleKeys.forEach(key => {
        isolatedPractice.push(`${key}${key}${key}`);
    });
    const isolatedText = isolatedPractice.join(' ') + ' ';
    drillParts.push(isolatedText);
    currentLength += isolatedText.length;

    // 2. Key combinations (30% of drill)
    const combinationsPractice: string[] = [];
    troubleKeys.forEach(key => {
        const combos = KEY_COMBINATIONS[key.toLowerCase()] || [key];
        const selectedCombos = selectRandom(combos, Math.min(3, combos.length));
        combinationsPractice.push(...selectedCombos);
    });
    const combosText = combinationsPractice.join(' ') + ' ';
    drillParts.push(combosText);
    currentLength += combosText.length;

    // 3. Words containing trouble keys (50% of drill)
    const wordsPractice: string[] = [];
    const remainingLength = targetLength - currentLength;

    while (currentLength < targetLength) {
        // Select words containing trouble keys
        const wordsWithTroubleKeys: string[] = [];

        troubleKeys.forEach(key => {
            const words = WORD_BANK[key.toLowerCase()] || [];
            if (words.length > 0) {
                wordsWithTroubleKeys.push(...words);
            }
        });

        if (wordsWithTroubleKeys.length === 0) break;

        const word = selectRandom(wordsWithTroubleKeys, 1)[0];
        wordsPractice.push(word);
        currentLength += word.length + 1; // +1 for space
    }

    drillParts.push(wordsPractice.join(' '));

    // Combine all parts
    let finalDrill = drillParts.join('');

    // Adjust difficulty
    if (difficulty === 'easy') {
        // Add more repetition
        finalDrill = finalDrill.split(' ').map(word => `${word} ${word}`).join(' ');
    } else if (difficulty === 'hard') {
        // Add punctuation and capitalization
        finalDrill = addPunctuationAndCapitalization(finalDrill);
    }

    // Trim to target length
    if (finalDrill.length > targetLength) {
        finalDrill = finalDrill.substring(0, targetLength).trim();
        // Remove incomplete word at end
        const lastSpace = finalDrill.lastIndexOf(' ');
        if (lastSpace > 0) {
            finalDrill = finalDrill.substring(0, lastSpace);
        }
    }

    return finalDrill;
}

/**
 * Calculate trouble key density in text
 */
export function calculateTroubleKeyDensity(text: string, troubleKeys: string[]): number {
    if (troubleKeys.length === 0 || text.length === 0) return 0;

    let troubleKeyCount = 0;
    const lowerText = text.toLowerCase();

    troubleKeys.forEach(key => {
        const regex = new RegExp(key.toLowerCase(), 'g');
        const matches = lowerText.match(regex);
        if (matches) {
            troubleKeyCount += matches.length;
        }
    });

    return (troubleKeyCount / text.length) * 100;
}

/**
 * Select random items from array
 */
function selectRandom<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * Add punctuation and capitalization for harder drills
 */
function addPunctuationAndCapitalization(text: string): string {
    const words = text.split(' ');
    const sentences: string[] = [];
    let currentSentence: string[] = [];

    words.forEach((word, index) => {
        currentSentence.push(word);

        // End sentence every 5-8 words
        if (currentSentence.length >= 5 && Math.random() > 0.5) {
            const sentence = currentSentence.join(' ');
            // Capitalize first letter
            const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
            // Add punctuation
            const punctuation = Math.random() > 0.7 ? '!' : '.';
            sentences.push(capitalized + punctuation);
            currentSentence = [];
        }
    });

    // Add remaining words
    if (currentSentence.length > 0) {
        const sentence = currentSentence.join(' ');
        const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        sentences.push(capitalized + '.');
    }

    return sentences.join(' ');
}

/**
 * Generate key combinations for practice
 */
export function generateCombinations(key: string): string[] {
    return KEY_COMBINATIONS[key.toLowerCase()] || [key];
}

/**
 * Select words containing specific keys
 */
export function selectWordsWithKeys(keys: string[], count: number): string[] {
    const allWords: string[] = [];

    keys.forEach(key => {
        const words = WORD_BANK[key.toLowerCase()] || [];
        allWords.push(...words);
    });

    // Remove duplicates
    const uniqueWords = Array.from(new Set(allWords));

    return selectRandom(uniqueWords, Math.min(count, uniqueWords.length));
}

/**
 * Generate a practice drill based on a specific goal
 */
export function generatePracticeDrill(type: 'speed' | 'accuracy' | 'consistency'): string {
    const allWords = Array.from(new Set(Object.values(WORD_BANK).flat()));
    let selectedWords: string[] = [];

    if (type === 'speed') {
        // Filter for shorter, common words for flow
        const shortWords = allWords.filter(w => w.length <= 5);
        selectedWords = selectRandom(shortWords, 30);
    } else if (type === 'accuracy') {
        // Filter for longer, more complex words
        const longWords = allWords.filter(w => w.length > 5);
        selectedWords = selectRandom(longWords, 20);
    } else {
        // Consistency: Mix of simple and complex
        selectedWords = selectRandom(allWords, 25);
    }

    // Join with spaces
    let drill = selectedWords.join(' ');

    // For accuracy, maybe utilize the punctuation helper
    if (type === 'accuracy') {
        drill = addPunctuationAndCapitalization(drill);
    }

    return drill;
}
