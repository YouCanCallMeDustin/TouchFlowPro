import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Trophy, Award, Zap, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WPMCalculator: React.FC = () => {
    const [wpm, setWpm] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    const wpmValue = parseInt(wpm) || 0;

    const stats = useMemo(() => {
        if (wpmValue <= 0) return null;

        let percentile = 0;
        let label = '';
        let color = '';
        let icon = BarChart3;

        if (wpmValue < 20) {
            percentile = Math.max(5, Math.floor(wpmValue * 1.5));
            label = 'Beginner';
            color = 'text-slate-400';
            icon = Activity;
        } else if (wpmValue < 40) {
            percentile = 10 + Math.floor((wpmValue - 20) * 2);
            label = 'Developing';
            color = 'text-blue-400';
            icon = Zap;
        } else if (wpmValue < 60) {
            percentile = 50 + Math.floor((wpmValue - 40) * 1.5);
            label = 'Above Average';
            color = 'text-green-400';
            icon = Award;
        } else if (wpmValue < 80) {
            percentile = 80 + Math.floor((wpmValue - 60) * 0.75);
            label = 'Professional';
            color = 'text-purple-400';
            icon = Trophy;
        } else if (wpmValue < 100) {
            percentile = 95 + Math.floor((wpmValue - 80) * 0.2);
            label = 'High Performance';
            color = 'text-orange-400';
            icon = Zap;
        } else {
            percentile = Math.min(99.9, 99 + (wpmValue - 100) * 0.05);
            label = 'Elite / Top 1%';
            color = 'text-yellow-400';
            icon = Award;
        }

        return { percentile, label, color, icon };
    }, [wpmValue]);

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 my-16 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
                            Compare Your Speed
                        </h3>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest opacity-60">
                            Enter your WPM to see your global percentile ranking.
                        </p>
                    </div>

                    <div className="relative">
                        <input
                            type="number"
                            value={wpm}
                            onChange={(e) => setWpm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="WPM"
                            className="bg-bg-main border-2 border-white/10 rounded-2xl px-6 py-4 w-32 md:w-40 text-2xl font-black text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/10"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                            <Activity size={20} className="text-white" />
                        </div>
                        
                        <AnimatePresence>
                            {isFocused && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-black uppercase text-white px-3 py-1 rounded-full whitespace-nowrap"
                                >
                                    Enter Current Speed
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="min-h-[160px] flex items-center justify-center border-t border-white/5 pt-8">
                    {stats ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full text-center"
                        >
                            <div className="flex flex-col items-center gap-2 mb-6">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${stats.color} mb-2`}>
                                    Level: {stats.label}
                                </span>
                                <div className="text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-none">
                                    Top {100 - stats.percentile < 1 ? '< 1%' : `${(100 - stats.percentile).toFixed(0)}%`}
                                </div>
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">
                                    You are faster than {stats.percentile}% of typists globe-wide.
                                </span>
                            </div>

                            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10 max-w-xl mx-auto">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.percentile}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative"
                                >
                                    <div className="absolute top-0 right-0 w-4 h-full bg-white/20 blur-sm" />
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center opacity-40 italic font-medium py-8">
                            Enter your words per minute to calculate results...
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/free-typing-test"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors flex items-center gap-2"
                    >
                        Don't know your speed? <ArrowRight size={14} className="text-blue-500" />
                    </Link>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};
