// ── Accuracy Assassin: DOM-based Prompt Renderer ──
// Uses refs for zero-React-render keystroke feedback

import { useRef, useEffect, useCallback } from 'react';

interface PromptRendererProps {
    prompt: string;
    cursorIndex: number;
    isPlaying: boolean;
    reduceMotion: boolean;
}

/**
 * High-performance prompt display.
 * Each character is a pre-rendered span. On keystroke, only class names are mutated via DOM API.
 */
export function PromptRenderer({ prompt, cursorIndex, isPlaying, reduceMotion }: PromptRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const spansRef = useRef<HTMLSpanElement[]>([]);

    // Build spans once when prompt changes
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = '';
        spansRef.current = [];

        for (let i = 0; i < prompt.length; i++) {
            const span = document.createElement('span');
            span.textContent = prompt[i] === ' ' ? '\u00A0' : prompt[i];
            span.className = 'aa-char aa-char--upcoming';
            span.dataset.index = String(i);
            container.appendChild(span);
            spansRef.current.push(span);
        }
    }, [prompt]);

    // Update character states imperatively (no React re-render)
    const updateChars = useCallback((cursor: number) => {
        const spans = spansRef.current;
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            if (i < cursor) {
                span.className = 'aa-char aa-char--correct';
            } else if (i === cursor) {
                span.className = reduceMotion
                    ? 'aa-char aa-char--active'
                    : 'aa-char aa-char--active aa-char--pulse';
            } else {
                span.className = 'aa-char aa-char--upcoming';
            }
        }
    }, [reduceMotion]);

    // Run update on cursor change
    useEffect(() => {
        if (isPlaying) {
            updateChars(cursorIndex);
        }
    }, [cursorIndex, isPlaying, updateChars]);

    return (
        <div
            ref={containerRef}
            className="aa-prompt font-mono text-2xl sm:text-3xl leading-relaxed tracking-wide select-none break-words max-w-3xl"
            aria-label="Typing prompt"
            role="textbox"
            aria-readonly
        />
    );
}
