import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from './state/store';
import { Grid } from './components/Grid';
import { HUD } from './components/HUD';
import { GameOverModal } from './components/GameOverModal';

const Game: React.FC = () => {
    const { tick } = useGameStore();
    const lastTimeRef = useRef<number>(0);
    const requestRef = useRef<number | null>(null);

    // Initialization
    useEffect(() => {
        // Generate initial grid and spawn enemy
        useGameStore.getState().generateNewGrid();
        useGameStore.getState().initCombat();

        // Keyboard Listener
        const handleKeyDown = (e: KeyboardEvent) => {
            const state = useGameStore.getState();
            if (state.isGameOver) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                state.submitWord();
                // Play sound?
            } else if (e.key === 'Backspace') {
                e.preventDefault(); // prevent browser back
                state.handleBackspace();
            } else if (e.key === ' ') {
                e.preventDefault(); // prevent scroll
                state.shuffleGrid();
            } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
                // If CTRL/ALT/META is pressed, ignore?
                if (e.ctrlKey || e.altKey || e.metaKey) return;
                state.handleKeyboardInput(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Game Loop
    const loop = (time: number) => {
        if (lastTimeRef.current !== 0) {
            const dt = (time - lastTimeRef.current) / 1000;
            tick(dt);
        }
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [tick]); // Tick dependence is stable if from zustand? 
    // Actually tick is stable from useGameStore. 
    // But safer to just depend on empty array and get tick inside? 
    // The 'tick' function identity might change if store is recreated? 
    // useGameStore structure is constant.

    // Old Game Over Screen removed. Using Modal instead.

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-4 font-sans select-none overflow-hidden text-slate-200">
            {/* Background Ambient Glow & Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <GameOverModal />

            <motion.div
                className="z-10 w-full max-w-2xl flex flex-col items-center gap-8"
                animate={useGameStore((s) => s.isShaking) ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.3 } } : {}}
            >
                <HUD />
                <Grid />
            </motion.div>
        </div>
    );
};

export default Game;
