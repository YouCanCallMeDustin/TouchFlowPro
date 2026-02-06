import React, { useEffect, useState } from 'react';

interface StreakTrackerProps {
    userId: string;
}

interface StreakData {
    id: string;
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: Date | null;
    streakProtections: number;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ userId }) => {
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStreak();
    }, [userId]);

    const fetchStreak = async () => {
        try {
            const response = await fetch(`/api/streaks/${userId}`);
            const data = await response.json();
            setStreak(data);
        } catch (error) {
            console.error('Failed to fetch streak:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !streak) {
        return null;
    }

    const isOnFire = streak.currentStreak >= 7;
    const isWarning = !streak.lastPracticeDate ||
        (new Date().getTime() - new Date(streak.lastPracticeDate).getTime()) > 24 * 60 * 60 * 1000;

    return (
        <div className={`rounded-3xl p-6 shadow-lg border-2 transition-all ${isOnFire
                ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
                : 'bg-white border-slate-200'
            }`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-text-main flex items-center gap-2">
                    <span className="text-3xl">{isOnFire ? '🔥' : '📅'}</span>
                    Daily Streak
                </h2>
                {streak.streakProtections > 0 && (
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                        {streak.streakProtections} 🛡️ Protection{streak.streakProtections > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="text-4xl font-black text-primary-blue mb-1">
                        {streak.currentStreak}
                    </div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Current Streak
                    </div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="text-4xl font-black text-purple-600 mb-1">
                        {streak.longestStreak}
                    </div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Best Streak
                    </div>
                </div>
            </div>

            {/* Motivational Message */}
            <div className={`p-4 rounded-xl text-center font-bold ${isOnFire
                    ? 'bg-orange-100 text-orange-700'
                    : isWarning
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                }`}>
                {isOnFire && `🔥 You're on fire! ${streak.currentStreak} days strong!`}
                {!isOnFire && !isWarning && `Keep it up! Practice today to build your streak.`}
                {!isOnFire && isWarning && `⚠️ Don't break your streak! Practice today.`}
            </div>

            {/* Streak Milestones */}
            <div className="mt-6 space-y-2">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                    Milestones
                </div>
                <StreakMilestone
                    label="Week Warrior"
                    target={7}
                    current={streak.currentStreak}
                    icon="🏅"
                />
                <StreakMilestone
                    label="Month Master"
                    target={30}
                    current={streak.currentStreak}
                    icon="🏆"
                />
                <StreakMilestone
                    label="Century Club"
                    target={100}
                    current={streak.currentStreak}
                    icon="👑"
                />
            </div>
        </div>
    );
};

interface MilestoneProps {
    label: string;
    target: number;
    current: number;
    icon: string;
}

const StreakMilestone: React.FC<MilestoneProps> = ({ label, target, current, icon }) => {
    const progress = Math.min((current / target) * 100, 100);
    const achieved = current >= target;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-text-main flex items-center gap-2">
                    <span className={achieved ? '' : 'grayscale opacity-50'}>{icon}</span>
                    {label}
                </span>
                <span className={`text-xs font-bold ${achieved ? 'text-emerald-600' : 'text-text-muted'}`}>
                    {achieved ? '✓ Achieved!' : `${current}/${target}`}
                </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${achieved ? 'bg-emerald-500' : 'bg-primary-blue'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default StreakTracker;
