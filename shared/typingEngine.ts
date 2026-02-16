import type { KeystrokeEvent, TypingMetrics, EnhancedKeystrokeEvent, LiveMetrics, PerKeyStats, SequenceStat } from './types';
import { getCorrectFinger } from './keyboardLayout';

export class TypingEngine {
    static calculateMetrics(
        keystrokes: KeystrokeEvent[],
        expectedText: string
    ): TypingMetrics {
        if (keystrokes.length === 0) {
            return { grossWPM: 0, netWPM: 0, accuracy: 0, charsTyped: 0, errors: 0, durationMs: 0, errorMap: {} };
        }

        const startTime = keystrokes[0].timestamp;
        const endTime = keystrokes[keystrokes.length - 1].timestamp;
        const durationMs = endTime - startTime;
        const minutes = durationMs / 60000 || 0.01;

        let totalPhysicalKeystrokes = 0;
        const buffer: string[] = [];
        const errorMap: Record<string, number> = {};

        // Simulate the visual buffer the user sees
        keystrokes.forEach(event => {
            if (event.eventType === 'keydown') {
                // Count every physical press as a "character typed" for Gross WPM
                // except potentially modifiers like Shift which usually don't count towards WPM
                // but backspaces definitely count as labor.
                if (event.key.length === 1 || event.key === 'Backspace') {
                    totalPhysicalKeystrokes++;
                }

                if (event.key.length === 1) {
                    buffer.push(event.key);
                } else if (event.key === 'Backspace') {
                    buffer.pop();
                }
            }
        });

        const expectedChars = expectedText.split('');
        let currentErrors = 0;

        // Calculate accuracy based on CURRENT state of the buffer
        for (let i = 0; i < buffer.length; i++) {
            if (i >= expectedChars.length || buffer[i] !== expectedChars[i]) {
                currentErrors++;
                const targetChar = expectedChars[i] || 'unknown';
                errorMap[targetChar] = (errorMap[targetChar] || 0) + 1;
            }
        }

        // Gross WPM is based on total effort (Total Physical Keystrokes / 5) / Time
        const grossWPM = (totalPhysicalKeystrokes / 5) / minutes;

        // Net WPM: (Correct Characters Typed / 5) / Minutes
        // This is more standard and less punishing than Gross - (Errors/Min) for short bursts
        const correctChars = buffer.length - currentErrors;
        const netWPM = (correctChars / 5) / minutes;

        // Accuracy is (Corrected Chars in Buffer / Total Chars in Buffer)
        const accuracy = buffer.length > 0 ? (correctChars / buffer.length) * 100 : 0;

        return {
            grossWPM: Math.round(grossWPM * 10) / 10,
            netWPM: Math.round(netWPM * 10) / 10,
            accuracy: Math.round(accuracy * 10) / 10,
            charsTyped: totalPhysicalKeystrokes,
            errors: currentErrors,
            durationMs,
            errorMap
        };
    }

    // ===== PHASE 0: Enhanced Functions =====

    /**
     * Calculate live metrics during typing (for real-time display)
     * Uses a rolling window to provide smooth, current WPM
     */
    static calculateLiveMetrics(
        keystrokes: KeystrokeEvent[],
        expectedText: string,
        windowMs: number = 10000 // 10 second rolling window
    ): LiveMetrics {
        if (keystrokes.length === 0) {
            return {
                currentWPM: 0,
                currentAccuracy: 0,
                keystrokesPerMinute: 0,
                averageKeyDelay: 0,
                timeElapsed: 0
            };
        }

        const now = Date.now();
        const startTime = keystrokes[0].timestamp;
        const timeElapsed = now - startTime;

        // Get keystrokes in the rolling window
        const recentKeystrokes = keystrokes.filter(
            k => k.eventType === 'keydown' && (now - k.timestamp) <= windowMs
        );

        if (recentKeystrokes.length === 0) {
            return {
                currentWPM: 0,
                currentAccuracy: 100,
                keystrokesPerMinute: 0,
                averageKeyDelay: 0,
                timeElapsed
            };
        }

        // Calculate WPM for recent window
        const windowDuration = Math.min(windowMs, now - recentKeystrokes[0].timestamp);
        const minutes = windowDuration / 60000 || 0.01;
        const charsInWindow = recentKeystrokes.filter(k => k.key.length === 1).length;
        const currentWPM = (charsInWindow / 5) / minutes;

        // Calculate accuracy for entire session
        const buffer: string[] = [];
        keystrokes.forEach(event => {
            if (event.eventType === 'keydown') {
                if (event.key.length === 1) {
                    buffer.push(event.key);
                } else if (event.key === 'Backspace') {
                    buffer.pop();
                }
            }
        });

        const expectedChars = expectedText.split('');
        let errors = 0;
        for (let i = 0; i < buffer.length; i++) {
            if (i >= expectedChars.length || buffer[i] !== expectedChars[i]) {
                errors++;
            }
        }
        const currentAccuracy = buffer.length > 0 ? ((buffer.length - errors) / buffer.length) * 100 : 100;

        // Calculate keystroke rate
        const totalKeydowns = keystrokes.filter(k => k.eventType === 'keydown').length;
        const keystrokesPerMinute = (totalKeydowns / (timeElapsed / 60000)) || 0;

        // Calculate average delay between keystrokes
        const keydownEvents = keystrokes.filter(k => k.eventType === 'keydown');
        let totalDelay = 0;
        for (let i = 1; i < keydownEvents.length; i++) {
            totalDelay += keydownEvents[i].timestamp - keydownEvents[i - 1].timestamp;
        }
        const averageKeyDelay = keydownEvents.length > 1 ? totalDelay / (keydownEvents.length - 1) : 0;

        return {
            currentWPM: Math.round(currentWPM * 10) / 10,
            currentAccuracy: Math.round(currentAccuracy * 10) / 10,
            keystrokesPerMinute: Math.round(keystrokesPerMinute),
            averageKeyDelay: Math.round(averageKeyDelay),
            timeElapsed
        };
    }

    /**
     * Get per-key statistics from keystroke data
     */
    static getPerKeyStats(keystrokes: EnhancedKeystrokeEvent[]): Map<string, PerKeyStats> {
        const statsMap = new Map<string, PerKeyStats>();

        keystrokes.forEach(event => {
            if (event.eventType !== 'keydown') return;

            // Handle Normal Character Keys
            if (event.key.length === 1) {
                const key = event.expectedKey;
                const existing = statsMap.get(key) || {
                    key,
                    totalAttempts: 0,
                    correctAttempts: 0,
                    accuracy: 0,
                    averageSpeed: 0
                };

                existing.totalAttempts++;
                if (event.correct) {
                    existing.correctAttempts++;
                }

                existing.accuracy = (existing.correctAttempts / existing.totalAttempts) * 100;

                if (event.correct && event.timeSinceLastKey > 0) {
                    const currentAvg = existing.averageSpeed;
                    const count = existing.correctAttempts;
                    existing.averageSpeed = ((currentAvg * (count - 1)) + event.timeSinceLastKey) / count;
                }

                statsMap.set(key, existing);

                // Update SHIFT Stats if the expected key requires Shift
                const needsShift = /[A-Z!@#$%^&*()_+{}|:"<>?]/.test(event.expectedKey);
                if (needsShift) {
                    const shiftStats = statsMap.get('Shift') || {
                        key: 'Shift',
                        totalAttempts: 0,
                        correctAttempts: 0,
                        accuracy: 0,
                        averageSpeed: 0
                    };

                    shiftStats.totalAttempts++;
                    if (event.correct) {
                        shiftStats.correctAttempts++;
                    }

                    shiftStats.accuracy = (shiftStats.correctAttempts / shiftStats.totalAttempts) * 100;

                    // Speed for shift can be derived from the character it produced
                    if (event.correct && event.timeSinceLastKey > 0) {
                        const currentAvg = shiftStats.averageSpeed;
                        const count = shiftStats.correctAttempts;
                        shiftStats.averageSpeed = ((currentAvg * (count - 1)) + event.timeSinceLastKey) / count;
                    }
                    statsMap.set('Shift', shiftStats);
                }
            }
        });

        return statsMap;
    }

    /**
     * Identify keys that need practice (low accuracy)
     */
    static identifyTroubleKeys(
        stats: Map<string, PerKeyStats>,
        accuracyThreshold: number = 85
    ): string[] {
        const troubleKeys: string[] = [];

        stats.forEach((stat, key) => {
            if (stat.totalAttempts >= 3 && stat.accuracy < accuracyThreshold) {
                troubleKeys.push(key);
            }
        });

        // Sort by accuracy (worst first)
        return troubleKeys.sort((a, b) => {
            const statA = stats.get(a)!;
            const statB = stats.get(b)!;
            return statA.accuracy - statB.accuracy;
        });
    }

    /**
     * Enhance basic keystroke events with additional data
     */
    static enhanceKeystrokeEvent(
        event: KeystrokeEvent,
        expectedKey: string,
        previousTimestamp: number = 0
    ): EnhancedKeystrokeEvent {
        const correct = event.key === expectedKey;
        const finger = getCorrectFinger(expectedKey);
        const timeSinceLastKey = previousTimestamp > 0 ? event.timestamp - previousTimestamp : 0;

        return {
            ...event,
            expectedKey,
            correct,
            finger,
            timeSinceLastKey
        };
    }

    /**
     * Calculate peak WPM from keystroke data
     */
    static calculatePeakWPM(
        keystrokes: KeystrokeEvent[],
        windowMs: number = 10000
    ): number {
        if (keystrokes.length < 10) return 0;

        let peakWPM = 0;

        // Slide the window through the keystrokes
        for (let i = 0; i < keystrokes.length; i++) {
            const windowStart = keystrokes[i].timestamp;
            const windowEnd = windowStart + windowMs;

            const keystrokesInWindow = keystrokes.filter(
                k => k.eventType === 'keydown' &&
                    k.timestamp >= windowStart &&
                    k.timestamp <= windowEnd &&
                    k.key.length === 1
            );

            if (keystrokesInWindow.length > 0) {
                const actualDuration = Math.min(windowMs, Date.now() - windowStart);
                const minutes = actualDuration / 60000 || 0.01;
                const wpm = (keystrokesInWindow.length / 5) / minutes;
                peakWPM = Math.max(peakWPM, wpm);
            }
        }

        return Math.round(peakWPM * 10) / 10;
    }
    /**
     * Calculate sequence statistics (bigrams and trigrams)
     */
    static calculateSequenceStats(keystrokes: KeystrokeEvent[]): SequenceStat[] {
        const stats: SequenceStat[] = [];
        const keydowns = keystrokes.filter(k => k.eventType === 'keydown' && k.key.length === 1);

        if (keydowns.length < 2) return stats;

        // Bigrams
        for (let i = 1; i < keydowns.length; i++) {
            const seq = (keydowns[i - 1].key + keydowns[i].key).toLowerCase();
            const delay = keydowns[i].timestamp - keydowns[i - 1].timestamp;

            // Only count if within reasonable threshold (e.g. 1.5s) to avoid idle time
            if (delay < 1500) {
                stats.push({
                    sequence: seq,
                    type: 'bigram',
                    speed: delay
                });
            }
        }

        // Trigrams
        for (let i = 2; i < keydowns.length; i++) {
            const seq = (keydowns[i - 2].key + keydowns[i - 1].key + keydowns[i].key).toLowerCase();
            const delay = keydowns[i].timestamp - keydowns[i - 2].timestamp;

            if (delay < 3000) {
                stats.push({
                    sequence: seq,
                    type: 'trigram',
                    speed: delay
                });
            }
        }

        return stats;
    }
}
