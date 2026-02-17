import { TypingEngine } from './shared/typingEngine';
import { KeystrokeEvent } from './shared/types';

function runTest() {
    console.log("Starting TypingEngine Accuracy Verification...\n");

    const expectedText = "the quick brown fox";

    // Test 1: Perfect typing
    const perfectKeystrokes: KeystrokeEvent[] = expectedText.split('').map((char, i) => ({
        keyCode: `Key${char.toUpperCase()}`,
        key: char,
        eventType: 'keydown',
        timestamp: Date.now() + (i * 100)
    }));

    const perfectMetrics = TypingEngine.calculateMetrics(perfectKeystrokes, expectedText);
    console.log("Test 1: Perfect Typing");
    console.log(`Accuracy: ${perfectMetrics.accuracy}% (Expected: 100%)`);
    console.log(`Total Mistakes: ${perfectMetrics.totalMistakes} (Expected: 0)`);
    console.log(`Errors (Uncorrected): ${perfectMetrics.errors} (Expected: 0)`);
    console.log("");

    // Test 2: One mistake, fixed
    // User types 't', 'h', 'a', backspace, 'e' ...
    const fixedKeystrokes: KeystrokeEvent[] = [
        { key: 't', eventType: 'keydown' as const, timestamp: Date.now(), keyCode: 'KeyT' },
        { key: 'h', eventType: 'keydown' as const, timestamp: Date.now() + 100, keyCode: 'KeyH' },
        { key: 'a', eventType: 'keydown' as const, timestamp: Date.now() + 200, keyCode: 'KeyA' }, // Mistake
        { key: 'Backspace', eventType: 'keydown' as const, timestamp: Date.now() + 300, keyCode: 'Backspace' },
        { key: 'e', eventType: 'keydown' as const, timestamp: Date.now() + 400, keyCode: 'KeyE' },
        ...expectedText.slice(3).split('').map((char, i) => ({
            key: char,
            eventType: 'keydown',
            timestamp: Date.now() + 500 + (i * 100),
            keyCode: `Key${char.toUpperCase()}`
        }))
    ];

    const fixedMetrics = TypingEngine.calculateMetrics(fixedKeystrokes, expectedText);
    console.log("Test 2: One Mistake Fixed");
    // 20 intended chars + 1 extra wrong char = 21 total chars added
    // (20 / 20) * 100 = 100% or (19/20)? No, it's (Fixed Chars / Total Chars)
    // Formula: (charsAdded - totalMistakes) / charsAdded
    // charsAdded = 20 (t, h, a, e, " quick...") -> Wait, 20 characters total typed?
    // t, h, a, e, space, q, u, i, c, k, space, b, r, o, w, n, space, f, o, x = 20
    // totalMistakes = 1 (a)
    // accuracy = (20 - 1) / 20 = 95%
    console.log(`Accuracy: ${fixedMetrics.accuracy}% (Expected: ~95%)`);
    console.log(`Total Mistakes: ${fixedMetrics.totalMistakes} (Expected: 1)`);
    console.log(`Errors (Uncorrected): ${fixedMetrics.errors} (Expected: 0)`);
    console.log("");

    // Test 3: Missing character (mis-alignment test), fixed later
    // User types 'th', skips 'e', types ' quick'
    // Buffer: "th quick..."
    // Then backspaces everything back to 'th' and types 'e quick...'
    const alignmentKeystrokes: KeystrokeEvent[] = [
        { key: 't', eventType: 'keydown' as const, timestamp: Date.now(), keyCode: 'KeyT' },
        { key: 'h', eventType: 'keydown' as const, timestamp: Date.now() + 100, keyCode: 'KeyH' },
        { key: ' ', eventType: 'keydown' as const, timestamp: Date.now() + 200, keyCode: 'Space' }, // Mistake: skipped 'e'
        { key: 'q', eventType: 'keydown' as const, timestamp: Date.now() + 300, keyCode: 'KeyQ' }, // Mistake: 'q' instead of 'e'
        { key: 'Backspace', eventType: 'keydown' as const, timestamp: Date.now() + 400, keyCode: 'Backspace' },
        { key: 'Backspace', eventType: 'keydown' as const, timestamp: Date.now() + 500, keyCode: 'Backspace' },
        { key: 'e', eventType: 'keydown' as const, timestamp: Date.now() + 600, keyCode: 'KeyE' },
        ...expectedText.slice(3).split('').map((char, i) => ({
            key: char,
            eventType: 'keydown',
            timestamp: Date.now() + 700 + (i * 100),
            keyCode: `Key${char.toUpperCase()}`
        }))
    ];

    const alignmentMetrics = TypingEngine.calculateMetrics(alignmentKeystrokes, expectedText);
    console.log("Test 3: Missing Char (Alignment Recovery)");
    // Mistakes: ' ' (instead of 'e'), 'q' (instead of ' ')
    // totalMistakes = 2
    // total chars added = 22? (t, h, space, q, e, space, q, u, i, c, k, space, b, r, o, w, n, space, f, o, x) -> 21?
    // Let's see: original text is 19 chars? 
    // "the quick brown fox" -> 3+1+5+1+5+1+3 = 19
    // charsAdded = 19 (correct) + 2 (wrong) = 21
    // Accuracy = (21 - 2) / 21 = 90.5%
    console.log(`Accuracy: ${alignmentMetrics.accuracy}% (Expected: ~90.5%)`);
    console.log(`Total Mistakes: ${alignmentMetrics.totalMistakes} (Expected: 2)`);
    console.log("");
}

runTest();
