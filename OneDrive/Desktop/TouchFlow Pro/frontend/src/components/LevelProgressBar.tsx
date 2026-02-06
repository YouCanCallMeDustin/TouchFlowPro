import React, { useEffect, useState } from 'react';

interface UserLevel {
    level: number;
    levelName: string;
    nextLevelRequirements: {
        wpm: number;
        accuracy: number;
    };
    progress: number;
}

interface Props {
    userId: string;
}

export const LevelProgressBar: React.FC<Props> = ({ userId }) => {
    const [levelInfo, setLevelInfo] = useState<UserLevel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLevelInfo();
    }, [userId]);

    const fetchLevelInfo = async () => {
        try {
            const response = await fetch(`/api/recommendations/${userId}/level`);
            const data = await response.json();
            setLevelInfo(data);
        } catch (error) {
            console.error('Failed to fetch level info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !levelInfo) {
        return (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    const getLevelColor = (level: number): string => {
        if (level <= 3) return 'from-blue-500 to-blue-600';
        if (level <= 6) return 'from-purple-500 to-purple-600';
        if (level <= 9) return 'from-orange-500 to-orange-600';
        return 'from-yellow-500 to-yellow-600';
    };

    const getLevelEmoji = (level: number): string => {
        if (level <= 3) return '🌱';
        if (level <= 6) return '🔥';
        if (level <= 9) return '⚡';
        return '👑';
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getLevelColor(levelInfo.level)} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                        {getLevelEmoji(levelInfo.level)}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Level</div>
                        <div className="text-2xl font-heading font-black text-slate-900">
                            {levelInfo.levelName} <span className="text-slate-400">Lv.{levelInfo.level}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Progress</div>
                    <div className="text-2xl font-heading font-black text-primary-blue">
                        {Math.round(levelInfo.progress)}%
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                        className={`h-full bg-gradient-to-r ${getLevelColor(levelInfo.level)} transition-all duration-500 ease-out shadow-lg`}
                        style={{ width: `${levelInfo.progress}%` }}
                    >
                        <div className="w-full h-full bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Next Level Requirements */}
            {levelInfo.level < 10 && (
                <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">Next Level:</span>
                            <span className="font-black text-primary-blue">{levelInfo.nextLevelRequirements.wpm} WPM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">•</span>
                            <span className="font-black text-secondary-teal">{levelInfo.nextLevelRequirements.accuracy}% Accuracy</span>
                        </div>
                    </div>
                </div>
            )}

            {levelInfo.level === 10 && (
                <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-full">
                        <span className="text-2xl">👑</span>
                        <span className="font-black text-orange-700 uppercase tracking-wider text-sm">Maximum Level Achieved!</span>
                    </div>
                </div>
            )}
        </div>
    );
};
