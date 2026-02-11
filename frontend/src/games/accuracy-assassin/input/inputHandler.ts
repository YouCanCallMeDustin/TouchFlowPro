// ── Accuracy Assassin: Input Handler ──
// Low-level keyboard input handler — no React in the hot path

import type { GameEngine } from '../engine/gameEngine';

export interface InputHandlerOptions {
    engine: GameEngine;
    onRestart: () => void;
    onStartRequest: () => void;
    onContinueToResults: () => void;
}

const IGNORED_KEYS = new Set([
    'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock',
    'Escape', 'Tab', 'ContextMenu', 'PrintScreen', 'Pause',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
]);

/**
 * Creates and attaches a global keydown handler.
 * Returns a cleanup function to remove it.
 */
export function attachInputHandler(opts: InputHandlerOptions): () => void {
    const { engine, onRestart, onStartRequest, onContinueToResults } = opts;

    // Track held keys to avoid key-repeat issues
    const heldKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
        // Block paste
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            e.preventDefault();
            return;
        }

        // Ignore modifier combos (except Shift for typing capitals)
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        // Ignore non-character keys
        if (IGNORED_KEYS.has(e.key)) return;

        const phase = engine.getPhase();

        // R to restart — works in any phase
        if (e.key === 'r' || e.key === 'R') {
            if (phase !== 'playing') {
                e.preventDefault();
                onRestart();
                return;
            }
            // During playing, 'r' and 'R' are valid typed chars — fall through
        }

        // Enter to start (in idle) or continue (in dead)
        if (e.key === 'Enter') {
            e.preventDefault();
            if (phase === 'idle') {
                onStartRequest();
            } else if (phase === 'dead') {
                onContinueToResults();
            }
            return;
        }

        // Space to continue from dead to results
        if (e.key === ' ' && phase === 'dead') {
            e.preventDefault();
            onContinueToResults();
            return;
        }

        // Handle backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            engine.handleBackspace();
            return;
        }

        // During playing phase — handle typed character
        if (phase === 'playing') {
            // Prevent key repeat from firing multiple times
            if (heldKeys.has(e.key) && e.repeat) {
                e.preventDefault();
                return;
            }
            heldKeys.add(e.key);

            // Only process printable single characters
            if (e.key.length === 1) {
                e.preventDefault();
                engine.handleChar(e.key);
            }
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        heldKeys.delete(e.key);
    };

    // Block paste via clipboard API too
    const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('paste', handlePaste, { capture: true });

    return () => {
        window.removeEventListener('keydown', handleKeyDown, { capture: true });
        window.removeEventListener('keyup', handleKeyUp, { capture: true });
        window.removeEventListener('paste', handlePaste, { capture: true });
        heldKeys.clear();
    };
}
