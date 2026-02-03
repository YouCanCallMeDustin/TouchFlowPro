import type { KeystrokeEvent, TypingMetrics } from './types';

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

        // Net WPM is Gross - (Uncorrected Errors / Time)
        const netWPM = Math.max(0, grossWPM - (currentErrors / minutes));

        // Accuracy is (Corrected Chars in Buffer / Total Chars in Buffer)
        const accuracy = buffer.length > 0 ? ((buffer.length - currentErrors) / buffer.length) * 100 : 0;

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
}
