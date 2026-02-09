export interface SpacedItem {
    id: string;
    interval: number; // in days
    repetition: number;
    efactor: number;
    nextReview: Date;
}

export class SpacedScheduler {
    /**
     * Simplified SM-2 Algorithm
     * quality: 0-5 (0: total failure, 5: perfect)
     */
    static review(item: SpacedItem, quality: number): SpacedItem {
        let { interval, repetition, efactor } = item;

        if (quality >= 3) {
            if (repetition === 0) {
                interval = 1;
            } else if (repetition === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * efactor);
            }
            repetition += 1;
        } else {
            repetition = 0;
            interval = 1;
        }

        efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (efactor < 1.3) efactor = 1.3;

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return {
            ...item,
            interval,
            repetition,
            efactor,
            nextReview
        };
    }

    static calculateQuality(accuracy: number, netWPM: number, targetWPM: number): number {
        // Basic mapping: 
        // Accuracy > 98% and WPM > Target -> 5
        // Accuracy > 95% -> 4
        // Accuracy > 90% -> 3
        // Accuracy > 80% -> 2
        // Accuracy < 80% -> 1

        if (accuracy < 80) return 1;
        if (accuracy < 85) return 2;
        if (accuracy < 90) return 3;
        if (accuracy < 95) return 4;
        return 5;
    }
}
