// ── Accuracy Assassin: Death Screen ──

import { motion } from 'framer-motion';
import type { DeathInfo } from '../engine/types';

interface DeathScreenProps {
    deathInfo: DeathInfo;
    streak: number;
    score: number;
    sessionBestScore: number | null;
    reduceMotion: boolean;
    onContinue: () => void;
    onRetry: () => void;
}

export function DeathScreen({
    deathInfo, streak, score, sessionBestScore, reduceMotion, onContinue, onRetry,
}: DeathScreenProps) {
    const isTimeout = deathInfo.typedChar === '⏰';

    return (
        <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg mx-auto text-center"
        >
            {/* Impact */}
            <motion.div
                initial={reduceMotion ? {} : { scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 8, stiffness: 200 }}
                className="mb-6"
            >
                <div className="text-7xl mb-4">{isTimeout ? '⏰' : '💀'}</div>
                <h1 className="text-4xl sm:text-5xl font-heading font-black uppercase tracking-tighter text-red-400">
                    {isTimeout ? 'Time Up!' : 'Dead.'}
                </h1>
            </motion.div>

            {/* Mismatch Details */}
            <div className="card mb-6">
                {!isTimeout && (
                    <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Mismatch</p>
                        <div className="flex items-center justify-center gap-4 text-2xl font-mono">
                            <span className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                                {deathInfo.expectedChar === ' ' ? '␣' : deathInfo.expectedChar}
                            </span>
                            <span className="text-text-muted text-lg">≠</span>
                            <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                {deathInfo.typedChar === ' ' ? '␣' : deathInfo.typedChar}
                            </span>
                        </div>
                        <p className="text-[9px] text-text-muted mt-2 uppercase tracking-wider">
                            Expected "{deathInfo.expectedChar === ' ' ? 'space' : deathInfo.expectedChar}" but you typed "{deathInfo.typedChar === ' ' ? 'space' : deathInfo.typedChar}"
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted">Streak</p>
                        <p className="text-2xl font-heading font-black text-text-main">{streak}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted">Round</p>
                        <p className="text-2xl font-heading font-black text-text-main">{deathInfo.round}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted">Score</p>
                        <p className="text-2xl font-heading font-black text-primary">{score}</p>
                    </div>
                </div>

                {/* Session Best Banner */}
                {sessionBestScore !== null && sessionBestScore > score && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-400/70 mb-1">Session Best</p>
                        <p className="text-3xl font-heading font-black text-yellow-400">{sessionBestScore.toLocaleString()}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onRetry}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-red-500/20"
                >
                    Retry
                    <span className="block text-[8px] opacity-60 mt-0.5">Press R</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onContinue}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-text-main font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10"
                >
                    Results
                    <span className="block text-[8px] opacity-60 mt-0.5">Press Enter</span>
                </motion.button>
            </div>
        </motion.div>
    );
}
