import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Award } from 'lucide-react';
import { apiFetch } from '../utils/api';
import PageTransition from '../components/PageTransition';

interface AchievementsProps {
    userId: string;
}

interface Achievement {
    id: string;
    userId: string;
    badgeType: string;
    earnedAt: Date;
    name: string;
    description: string;
    icon: string;
    category: string;
}

interface AvailableAchievement {
    type: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

export const AchievementsPanel: React.FC<AchievementsProps> = ({ userId }) => {
    const [earned, setEarned] = useState<Achievement[]>([]);
    const [available, setAvailable] = useState<AvailableAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const categories = ['All', 'Velocity', 'Precision', 'Endurance', 'Consistency', 'Mastery', 'Special Ops'];

    useEffect(() => {
        fetchAchievements();
    }, [userId]);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const [earnedRes, availableRes] = await Promise.all([
                apiFetch(`/api/achievements/${userId}`),
                apiFetch('/api/achievements/list/available')
            ]);

            const earnedData = await earnedRes.json();
            const availableData = await availableRes.json();

            setEarned(earnedData.achievements || []);
            setAvailable(availableData.achievements || []);
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const isEarned = (badgeType: string) => {
        return earned.some(a => a.badgeType === badgeType);
    };

    const getEarnedDate = (badgeType: string) => {
        const achievement = earned.find(a => a.badgeType === badgeType);
        return achievement ? new Date(achievement.earnedAt) : null;
    };

    const filteredAchievements = activeCategory === 'All'
        ? available
        : available.filter(a => a.category === activeCategory);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_var(--primary)]" />
                </div>
                <span className="text-text-muted font-black uppercase tracking-[0.4em] text-[10px]">Assembling Hall of Valor</span>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto p-4 sm:p-10 space-y-12">
                {/* Header */}
                <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Award size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Hall of Valor</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            Achievements
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                            Track your milestones. You have earned <span className="text-primary font-black uppercase tracking-wider">{earned.length} of {available.length}</span> available badges.
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

                {/* Category Filter */}
                <div className="flex flex-wrap gap-3 pb-2 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-3 rounded-2xl text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === cat
                                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-main hover:scale-105'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="card border border-white/10 p-8 bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Mastery Progress</span>
                        <span className="font-black text-primary text-xl">
                            {Math.round((earned.length / available.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-[gradient_4s_linear_infinite] h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(earned.length / available.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAchievements.map((achievement) => {
                        const earned_status = isEarned(achievement.type);
                        const earnedDate = getEarnedDate(achievement.type);

                        return (
                            <div
                                key={achievement.type}
                                className={`relative rounded-[2.5rem] p-10 border transition-all duration-700 overflow-hidden group ${earned_status
                                        ? 'bg-gradient-to-br from-primary/[0.08] to-secondary/[0.08] border-primary/30 shadow-2xl shadow-primary/10 hover:scale-[1.03]'
                                        : 'bg-white/[0.02] border-white/5 opacity-30 hover:opacity-100 hover:border-white/20'
                                    }`}
                            >
                                {/* Decorative Background Icon */}
                                <div className="absolute -right-8 -bottom-8 opacity-[0.02] text-[160px] grayscale select-none pointer-events-none group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-1000">
                                    {achievement.icon}
                                </div>

                                {/* Badge Icon */}
                                <div className="relative mb-8">
                                    <div
                                        className={`text-6xl ${earned_status ? 'opacity-100 drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]' : 'opacity-20 grayscale'
                                            } transition-all duration-1000 group-hover:scale-110`}
                                    >
                                        {achievement.icon}
                                    </div>
                                    {!earned_status && (
                                        <div className="absolute top-0 right-0 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[10px] border border-white/20 backdrop-blur-md">
                                            🔒
                                        </div>
                                    )}
                                </div>

                                {/* Category Tag */}
                                <div className="mb-6">
                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-text-muted/60">
                                        {achievement.category}
                                    </span>
                                </div>

                                {/* Badge Name */}
                                <h3 className="text-xl font-black text-text-main mb-3 tracking-tight uppercase leading-tight group-hover:text-primary transition-colors">
                                    {achievement.name}
                                </h3>

                                {/* Description */}
                                <p className="text-[12px] font-bold text-text-muted/50 uppercase tracking-widest leading-relaxed">
                                    {achievement.description}
                                </p>

                                {/* Earned Badge */}
                                {earned_status && earnedDate && (
                                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-1">
                                        <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Intel Confirmed</div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">
                                            {format(earnedDate, 'MM.dd.yyyy')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Stat Section */}
                <div className="relative overflow-hidden card bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 p-10 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12">
                        <div className="space-y-3">
                            <div className="text-6xl font-black tracking-tighter">{earned.length}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Badges Unlocked</div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-6xl font-black tracking-tighter">{available.length - earned.length}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Target Remaining</div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-6xl font-black tracking-tighter">
                                {earned.length > 0 ? Math.round((earned.length / available.length) * 100) : 0}%
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">System Synchronized</div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-6xl font-black tracking-tighter">
                                {earned.length === available.length ? '100' : Math.min(100, earned.length + 5)}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Mastery Index</div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
