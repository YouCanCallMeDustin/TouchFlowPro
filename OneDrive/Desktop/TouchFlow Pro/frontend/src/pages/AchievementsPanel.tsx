import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

const AchievementsPanel: React.FC<AchievementsProps> = ({ userId }) => {
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
            <div>
                <h1 className="text-4xl font-heading font-black text-text-main">🏆 Achievements</h1>
                <p className="text-text-muted mt-2">
                    {earned.length} of {available.length} badges earned
                </p>
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

export default AchievementsPanel;
