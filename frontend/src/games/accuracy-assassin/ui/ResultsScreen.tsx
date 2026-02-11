// ── Accuracy Assassin: Results Screen ──

import { motion } from 'framer-motion';
import type { RunSummary } from '../engine/types';
import { DIFFICULTY_LEVELS } from '../engine/config';
import { exportLastRunJSON } from '../engine/analyticsLogger';

interface ResultsScreenProps {
    summary: RunSummary;
    currentRunSummary: RunSummary | null;
    reduceMotion: boolean;
    onRetry: () => void;
    onBack: () => void;
}

export function ResultsScreen({ summary, currentRunSummary, reduceMotion, onRetry, onBack }: ResultsScreenProps) {
    const levelName = DIFFICULTY_LEVELS[summary.difficultyLevelReached as keyof typeof DIFFICULTY_LEVELS]?.name ?? '?';
    const isSessionBest = currentRunSummary != null && currentRunSummary.score < summary.score;

    const stats = [
        { label: 'Final Score', value: summary.score.toLocaleString(), big: true },
        { label: 'Rounds Cleared', value: String(summary.roundsCleared) },
        { label: 'Longest Streak', value: String(summary.streak) },
        { label: 'Avg WPM', value: String(summary.avgNetWPM) },
        { label: 'Accuracy', value: `${summary.accuracy}%` },
        { label: 'Max Difficulty', value: `L${summary.difficultyLevelReached} — ${levelName}` },
        { label: 'Chars Typed', value: String(summary.totalCharsTyped) },
        { label: 'Duration', value: `${(summary.durationMs / 1000).toFixed(1)}s` },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl mx-auto text-center"
        >
            <h1 className="text-4xl sm:text-5xl font-heading font-black uppercase tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {isSessionBest ? 'Session Best' : 'Run Complete'}
            </h1>
            {isSessionBest && (
                <p className="text-yellow-400 text-[10px] uppercase tracking-[0.3em] font-black mb-1">
                    ⭐ Showing your best run this session
                </p>
            )}
            <p className="text-text-muted text-xs uppercase tracking-[0.3em] font-bold mb-8">
                Accuracy Assassin — Arcade Mode
            </p>

            {/* Stats Grid */}
            <div className="card mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={stat.big ? 'col-span-2 sm:col-span-4' : ''}
                        >
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{stat.label}</p>
                            <p className={`font-heading font-black ${stat.big ? 'text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent' : 'text-xl text-text-main'
                                }`}>
                                {stat.value}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onRetry}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-orange-500/20"
                >
                    Play Again
                    <span className="block text-[8px] opacity-60 mt-0.5">Press R</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onBack}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-text-main font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10"
                >
                    Back to Games
                </motion.button>
            </div>

            {/* Dev Export */}
            <button
                onClick={exportLastRunJSON}
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted/40 hover:text-primary transition-colors"
            >
                🔧 Export Last Run JSON
            </button>
        </motion.div>
    );
}
