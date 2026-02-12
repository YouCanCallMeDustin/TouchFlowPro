import React from 'react';
import { useGameStore } from '../state/store';
import { motion, AnimatePresence } from 'framer-motion';
import { EnemyAvatar } from './EnemyAvatar';
import { SHUFFLE_COOLDOWN_MS } from '../data/constants';

export const HUD: React.FC = () => {
    const { player, stats, selectedTiles, lastWord, lastDamage } = useGameStore();

    // Calculate current word preview
    const currentWord = selectedTiles.map((t) => t.letter).join('');

    return (
        <div className="w-full max-w-2xl px-4 flex flex-col gap-2 pointer-events-none z-20 sticky top-0">
            {/* HEADER: Enemy & Stats */}
            <div className="flex justify-between items-start pt-2">

                {/* Enemy Avatar (Left) */}
                <div className="relative pointer-events-auto">
                    <EnemyAvatar />
                </div>

                {/* Center: Floating Feedback & Timer */}
                <div className="flex-1 flex flex-col items-center mt-4">
                    {/* Survival Time */}
                    <div className="bg-slate-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs text-blue-300 font-mono mb-2">
                        {Math.floor(stats.survivalTime).toString().padStart(3, '0')}s
                    </div>

                    <div className="h-8 flex items-center justify-center">
                        <AnimatePresence mode="popLayout">
                            {lastWord && (
                                <motion.div
                                    key={lastWord + lastDamage} // Re-animate on change
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="text-center flex gap-2 items-center bg-slate-800/80 px-4 py-1 rounded-xl border border-white/10"
                                >
                                    <span className="text-yellow-400 font-bold text-lg">{lastWord}</span>
                                    <span className="text-red-500 font-extrabold text-xl">-{lastDamage}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Score & Combo */}
                <div className="text-right pointer-events-auto">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Score</div>
                    <div className="text-2xl font-black text-white">{stats.score.toLocaleString()}</div>
                    {stats.combo > 1 && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="text-purple-400 font-black italic text-xl mt-1"
                        >
                            {stats.combo}x COMBO
                        </motion.div>
                    )}
                </div>
            </div>

            {/* FOOTER AREA (Above Grid): Current Word & Player HP */}
            <div className="flex justify-between items-end mt-2">

                {/* Player HP */}
                <div className="w-32">
                    <div className="text-[10px] uppercase tracking-widest text-green-500 font-bold mb-1">Shields</div>
                    <div className="h-4 bg-slate-900/80 rounded-full overflow-hidden border border-white/10 relative">
                        <motion.div
                            className="h-full bg-green-500"
                            animate={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Shuffle Button */}
                <div className="pointer-events-auto">
                    <ShuffleButton />
                </div>

                {/* CURRENT WORD DISPLAY - BIG & BRIGHT */}
                <div className="flex-1 text-right h-12 flex items-end justify-end">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentWord || 'placeholder'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                                text-3xl md:text-5xl font-black italic tracking-tighter drop-shadow-lg
                                ${currentWord ? 'text-yellow-400' : 'text-slate-700'}
                            `}
                        >
                            {currentWord || 'TYPE...'}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Extracted Shuffle Button
// Extracted Shuffle Button
const ShuffleButton: React.FC = () => {
    const { shuffleGrid, lastShuffleTime } = useGameStore();
    // We need to trigger re-renders to update the progress bar.
    // Since lastShuffleTime is in store, component will re-render when it changes.
    // Ideally we'd use a local ticker for smoothness, but for now simple check is fine.

    // To update the progress bar smoothly, we need a local re-render loop or just accept it updates on store changes/other interactions.
    // Let's just use a simple check for disabled state.

    // Actually, let's force a re-render every second or so? No, that's heavy.
    // Let's just calculate it.

    const now = Date.now();
    const timeSince = now - lastShuffleTime;
    const isReady = timeSince >= SHUFFLE_COOLDOWN_MS;

    return (
        <button
            onClick={() => shuffleGrid()}
            disabled={!isReady}
            className={`
                px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/5 transition-all
                ${isReady
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer'
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                }
            `}
        >
            Shuffle
        </button>
    );
};
