import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            const res = await fetch('/api/leaderboard/top?limit=10');
            const leaderboardData = await res.json();
            setData(leaderboardData);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const res = await fetch(`/api/leaderboard/rank/${userId}`);
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

    const getRankColor = (index: number) => {
        if (index === 0) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
        if (index === 1) return 'text-slate-400 bg-slate-50 border-slate-200';
        if (index === 2) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-slate-500 bg-white border-slate-100';
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-text-main">🏆 Global Leaderboard</h1>
                    <p className="text-text-muted">Compete with the best typists around the world</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center p-1 bg-slate-100 rounded-2xl max-w-md mx-auto">
                    {(['speed', 'accuracy', 'streaks'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab
                                    ? 'bg-white text-primary-blue shadow-sm scale-100'
                                    : 'text-text-muted hover:text-text-main scale-95'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex text-xs font-bold text-text-muted uppercase tracking-widest">
                        <div className="w-16 text-center">Rank</div>
                        <div className="flex-1">Typist</div>
                        <div className="w-32 text-center">Level</div>
                        <div className="w-32 text-right">Score</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {getTabContent().map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className={`flex items-center p-4 transition-colors ${entry.userId === userId ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="w-16 flex justify-center">
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${getRankColor(index)}`}>
                                                {getRankIcon(index)}
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg shadow-inner overflow-hidden">
                                                {entry.photoUrl ? (
                                                    <img src={entry.photoUrl} alt={entry.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>👤</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-text-main flex items-center gap-2">
                                                    {entry.name}
                                                    {entry.userId === userId && (
                                                        <span className="bg-primary-blue text-white text-[10px] px-2 py-0.5 rounded-full uppercase">You</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-32 text-center text-sm font-semibold text-text-muted">
                                            Level {entry.level}
                                        </div>
                                        <div className="w-32 text-right font-black text-primary-blue">
                                            {getMetricLabel(entry)}
                                        </div>
                                    </div>
                                ))}

                                {getTabContent().length === 0 && (
                                    <div className="p-20 text-center text-text-muted">
                                        No data available for this category yet.
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Local Rank Card */}
                {userRank && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-primary-blue to-blue-800 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">Your Standings</h3>
                            <p className="text-blue-100/80 text-sm">See how you compare to the community</p>
                        </div>
                        <div className="flex gap-4 sm:gap-12">
                            <div className="text-center space-y-1">
                                <div className="text-3xl font-black">#{userRank.speedRank}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">Speed</div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-3xl font-black">#{userRank.accuracyRank}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">Accuracy</div>
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-3xl font-black">#{userRank.streakRank}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">Streak</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
};

export default Leaderboard;
