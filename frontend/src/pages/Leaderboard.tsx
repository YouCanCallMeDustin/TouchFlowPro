import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { apiFetch } from '../utils/api';
import PageTransition from '../components/PageTransition';

interface LeaderboardEntry {
    userId: string;
    name: string;
    photoUrl?: string;
    level: number;
    wpm: number;
    accuracy: number;
    streak: number;
}

interface LeaderboardData {
    speed: LeaderboardEntry[];
    accuracy: LeaderboardEntry[];
    streaks: LeaderboardEntry[];
}

interface UserRank {
    speedRank: number;
    accuracyRank: number;
    streakRank: number;
    percentile: number;
    totalUsers: number;
}

const Leaderboard: React.FC<{ userId: string }> = ({ userId }) => {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [userRank, setUserRank] = useState<UserRank | null>(null);
    const [activeTab, setActiveTab] = useState<'speed' | 'accuracy' | 'streaks'>('speed');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        fetchUserRank();
    }, [userId]);

    const fetchLeaderboard = async () => {
        try {
            const response = await apiFetch('/api/leaderboard/top?limit=10');
            const leaderboardData = await response.json();
            setData(leaderboardData);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const res = await apiFetch(`/api/leaderboard/rank/${userId}`);
            const rankData = await res.json();
            setUserRank(rankData);
        } catch (error) {
            console.error('Failed to fetch user rank:', error);
        }
    };

    const getTabContent = () => {
        if (!data) return [];
        return data[activeTab];
    };

    const getMetricLabel = (entry: LeaderboardEntry) => {
        if (activeTab === 'speed') return `${entry.wpm.toFixed(1)} WPM`;
        if (activeTab === 'accuracy') return `${entry.accuracy.toFixed(1)}%`;
        return `${entry.streak} days`;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fetching Ranks</span>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-12">
                <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mb-12">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Trophy size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Hall of Fame</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            Global Leaderboard
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                            See how you measure up against the <span className="text-primary font-black uppercase tracking-wider">Fastest Typists</span> in the TouchFlow ecosystem.
                        </p>
                    </div>

                    {/* Decorative Abstract Mesh */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden hidden md:block">
                        <svg width="400" height="400" viewBox="0 0 400 400" className="translate-x-20 -translate-y-20 animate-[spin_60s_linear_infinite]">
                            <defs>
                                <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--secondary)" />
                                </linearGradient>
                            </defs>
                            <path d="M 0,200 Q 100,100 200,200 T 400,200" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,100 Q 100,0 200,100 T 400,100" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,300 Q 100,200 200,300 T 400,300" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                        </svg>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center">
                    <div className="inline-flex p-1.5 bg-slate-500/5 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/20 rounded-2xl shadow-xl">
                        {(['speed', 'accuracy', 'streaks'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                    : 'text-text-muted hover:text-text-main'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="card border-none overflow-hidden p-0 bg-transparent shadow-none">
                    <div className="grid gap-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-3"
                            >
                                {getTabContent().map((entry, index) => (
                                    <motion.div
                                        key={entry.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center p-4 rounded-2xl border transition-all duration-300 ${entry.userId === userId
                                            ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5'
                                            : 'bg-white/40 dark:bg-slate-800/40 border-white/20 hover:bg-white/60 dark:hover:bg-slate-800/60'
                                            }`}
                                    >
                                        <div className="w-12 flex justify-center">
                                            {index < 3 ? (
                                                <span className="text-2xl">{['🥇', '🥈', '🥉'][index]}</span>
                                            ) : (
                                                <span className="text-xs font-black text-text-muted">#{index + 1}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden border-2 border-white/50 dark:border-white/10 shadow-inner">
                                                {entry.photoUrl ? (
                                                    <img src={entry.photoUrl} alt={entry.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black flex items-center gap-2">
                                                    {entry.name || 'Anonymous Typist'}
                                                    {entry.userId === userId && (
                                                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-primary text-white font-black uppercase tracking-tighter">YOU</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-bold text-text-muted">Level {entry.level}</div>
                                            </div>
                                        </div>

                                        <div className="text-right pr-4">
                                            <div className="text-base font-black text-primary">{getMetricLabel(entry)}</div>
                                            <div className="text-[9px] font-black uppercase tracking-tighter text-text-muted opacity-60">SCORE</div>
                                        </div>
                                    </motion.div>
                                ))}

                                {getTabContent().length === 0 && (
                                    <div className="card text-center py-20">
                                        <div className="text-4xl mb-4">🏆</div>
                                        <h3 className="text-lg font-black mb-2">The arena is empty</h3>
                                        <p className="text-text-muted">Be the first to claim a spot on the leaderboard!</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Local Rank Summary */}
                {userRank && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="text-center md:text-left space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Your Performance</span>
                                <h3 className="text-3xl font-black">Community Standing</h3>
                                <p className="text-slate-400 text-sm font-medium">
                                    {userRank.totalUsers <= 1
                                        ? "Setting the standard for all others to follow."
                                        : `Outperforming ${userRank.percentile}% of your peers this week.`
                                    }
                                </p>
                            </div>

                            <div className="flex gap-8 sm:gap-16">
                                <div className="text-center group">
                                    <div className="text-4xl font-black mb-1 group-hover:text-primary transition-colors">#{userRank.speedRank}</div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Speed</div>
                                </div>
                                <div className="text-center group">
                                    <div className="text-4xl font-black mb-1 group-hover:text-secondary transition-colors">#{userRank.accuracyRank}</div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Accuracy</div>
                                </div>
                                <div className="text-center group">
                                    <div className="text-4xl font-black mb-1 group-hover:text-orange-500 transition-colors">#{userRank.streakRank}</div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Streak</div>
                                </div>
                            </div>
                        </div>

                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -ml-32 -mb-32" />
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
};

export default Leaderboard;
