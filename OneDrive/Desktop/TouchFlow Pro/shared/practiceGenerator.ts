import type { Drill } from './drillLibrary';

/**
 * Generates practice variations for a drill based on its category and content
 */
export class PracticeGenerator {
    /**
     * Get a random practice variation for a lesson
     */
    static getRandomPractice(drill: Drill): string {
        if (drill.practiceVariations && drill.practiceVariations.length > 0) {
            const randomIndex = Math.floor(Math.random() * drill.practiceVariations.length);
            return drill.practiceVariations[randomIndex];
        }

        // Fallback to original content if no variations exist
        return drill.content;
    }

    /**
     * Generate practice variations based on drill category
     * This is a helper for creating variations programmatically
     */
    static generateVariations(baseContent: string, category: string, count: number = 10): string[] {
        const variations: string[] = [];
        const words = baseContent.split(' ');

        for (let i = 0; i < count; i++) {
            // Shuffle and recombine words for variety
            const shuffled = this.shuffleArray([...words]);
            variations.push(shuffled.join(' '));
        }

        return variations;
    }

    private static shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
