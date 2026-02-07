import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Award } from 'lucide-react';

interface AchievementsProps {
    userId: string;
}

interface Achievement {
    id: string;
    userId: string;
    badgeType: string;
    earnedAt: Date;
    metadata?: string;
}

interface AvailableAchievement {
    type: string;
    name: string;
    description: string;
    icon: string;
}

export const AchievementsPanel: React.FC<AchievementsProps> = ({ userId }) => {
    // ...

    const [earned, setEarned] = useState<Achievement[]>([]);
    const [available, setAvailable] = useState<AvailableAchievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, [userId]);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const [earnedRes, availableRes] = await Promise.all([
                fetch(`/api/achievements/${userId}`),
                fetch(`/api/achievements/list/available`)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-bold text-primary-blue">Loading Achievements...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            {/* Header */}
            <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mb-8">
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

            {/* Progress Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-text-main">Overall Progress</span>
                    <span className="font-black text-primary-blue">
                        {Math.round((earned.length / available.length) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(earned.length / available.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {available.map((achievement) => {
                    const earned = isEarned(achievement.type);
                    const earnedDate = getEarnedDate(achievement.type);

                    return (
                        <div
                            key={achievement.type}
                            className={`relative rounded-3xl p-8 border-2 transition-all ${earned
                                ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg hover:shadow-xl hover:-translate-y-1'
                                : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                                }`}
                        >
                            {/* Badge Icon */}
                            <div
                                className={`text-6xl mb-4 ${earned ? 'opacity-100 scale-100' : 'opacity-30 grayscale'
                                    } transition-all`}
                            >
                                {achievement.icon}
                            </div>

                            {/* Badge Name */}
                            <h3 className="text-xl font-black text-text-main mb-2">
                                {achievement.name}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-text-muted mb-4">
                                {achievement.description}
                            </p>

                            {/* Earned Badge */}
                            {earned && earnedDate && (
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                                    <span className="text-xs font-bold text-emerald-600">✓ Earned</span>
                                    <span className="text-xs text-text-muted">
                                        {format(earnedDate, 'MMM d, yyyy')}
                                    </span>
                                </div>
                            )}

                            {/* Locked Overlay */}
                            {!earned && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white text-sm">
                                        🔒
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Fun Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-2xl font-black mb-4">🎉 Your Trophy Collection</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-4xl font-black mb-1">{earned.length}</div>
                        <div className="text-sm opacity-90">Badges Earned</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black mb-1">{available.length - earned.length}</div>
                        <div className="text-sm opacity-90">To Unlock</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black mb-1">
                            {earned.length > 0 ? Math.round((earned.length / available.length) * 100) : 0}%
                        </div>
                        <div className="text-sm opacity-90">Completion</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black mb-1">
                            {earned.length === available.length ? '👑' : '🎯'}
                        </div>
                        <div className="text-sm opacity-90">
                            {earned.length === available.length ? 'Completionist!' : 'Keep Going!'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


