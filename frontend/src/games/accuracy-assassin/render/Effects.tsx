// ── Accuracy Assassin: Visual Effects Layer ──

import { useRef, useCallback } from 'react';

interface UseEffectsOptions {
    reduceMotion: boolean;
}

export function useGameEffects({ reduceMotion }: UseEffectsOptions) {
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const screenShake = useCallback(() => {
        if (reduceMotion || !containerRef.current) return;
        const el = containerRef.current;
        el.style.animation = 'none';
        // Force reflow
        void el.offsetHeight;
        el.style.animation = 'aa-shake 0.4s ease-out';
    }, [reduceMotion]);

    const deathFlash = useCallback(() => {
        if (!overlayRef.current) return;
        const overlay = overlayRef.current;

        if (reduceMotion) {
            // Simple red border flash instead
            overlay.style.boxShadow = 'inset 0 0 60px rgba(255,0,0,0.4)';
            setTimeout(() => { overlay.style.boxShadow = 'none'; }, 600);
            return;
        }

        overlay.style.backgroundColor = 'rgba(255, 20, 20, 0.35)';
        overlay.style.opacity = '1';
        overlay.style.transition = 'none';

        requestAnimationFrame(() => {
            overlay.style.transition = 'opacity 0.5s ease-out, background-color 0.5s ease-out';
            overlay.style.backgroundColor = 'rgba(255, 20, 20, 0)';
            overlay.style.opacity = '0';
        });
    }, [reduceMotion]);

    const glitchOverlay = useCallback(() => {
        if (reduceMotion || !overlayRef.current) return;
        const overlay = overlayRef.current;
        overlay.classList.add('aa-glitch');
        setTimeout(() => overlay.classList.remove('aa-glitch'), 300);
    }, [reduceMotion]);

    const triggerDeath = useCallback(() => {
        screenShake();
        deathFlash();
        glitchOverlay();
    }, [screenShake, deathFlash, glitchOverlay]);

    return {
        containerRef,
        overlayRef,
        screenShake,
        deathFlash,
        glitchOverlay,
        triggerDeath,
    };
}

/** Get background intensity class based on streak */
export function getIntensityClass(streak: number): string {
    if (streak >= 8) return 'aa-intensity-5';
    if (streak >= 6) return 'aa-intensity-4';
    if (streak >= 4) return 'aa-intensity-3';
    if (streak >= 2) return 'aa-intensity-2';
    if (streak >= 1) return 'aa-intensity-1';
    return '';
}
