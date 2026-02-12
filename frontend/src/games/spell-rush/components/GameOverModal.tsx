import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../state/store';
import { RotateCcw, Trophy, Clock, Zap } from 'lucide-react';
import { HighScoreBoard } from './HighScoreBoard';

export const GameOverModal: React.FC = () => {
    const { stats, isGameOver, saveScore } = useGameStore();

    React.useEffect(() => {
        if (isGameOver) {
            saveScore({
                score: stats.score,
                date: Date.now(),
                maxCombo: stats.maxCombo,
                wordsFound: stats.wordsFound,
                survivalTime: stats.survivalTime
            });
        }
    }, [isGameOver]);

    if (!isGameOver) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            >
                <div className="flex gap-8 items-start justify-center w-full max-w-5xl">

                    {/* High Score Board (Left Panel) */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 bg-slate-900/50 border border-white/5 rounded-3xl p-6 h-full min-h-[400px]"
                    >
                        <div className="flex items-center gap-2 mb-4 text-yellow-400">
                            <Trophy size={20} />
                            <h3 className="text-xl font-bold uppercase tracking-wider">High Scores</h3>
                        </div>
                        <HighScoreBoard />
                    </motion.div>

                    {/* Main Stats (Center Panel) */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                    >
                        {/* Top Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                        <div className="text-center mb-8">
                            <h2 className="text-5xl font-black italic text-white tracking-tighter mb-2 drop-shadow-lg">
                                GAME OVER
                            </h2>
                            <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">
                                System Failure Imminent
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                <Trophy className="text-yellow-500 mb-2" size={24} />
                                <div className="text-3xl font-black text-white">{stats.score}</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Score</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                <Clock className="text-blue-500 mb-2" size={24} />
                                <div className="text-3xl font-black text-white">{Math.floor(stats.survivalTime)}s</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Survival Time</div>
                            </div>
                            <div className="col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between px-8">
                                <div className="flex items-center gap-3">
                                    <Zap className="text-purple-500" size={24} />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Best Combo</div>
                                        <div className="text-2xl font-black text-purple-200">{stats.maxCombo}x</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Words Found</div>
                                    <div className="text-2xl font-black text-white">{stats.wordsFound}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()} // Quick way to go back/reset if no router
                                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-white/5 transition-all uppercase tracking-wider text-xs"
                            >
                                Abort
                            </button>
                            <button
                                onClick={() => {
                                    useGameStore.getState().initCombat();
                                    useGameStore.getState().generateNewGrid();
                                    useGameStore.setState({ isGameOver: false });
                                }}
                                className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} /> Retry Mission
                            </button>
                        </div>

                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
