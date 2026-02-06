import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition';
import AnimatedStatCard from '../components/AnimatedStatCard';

interface DashboardProps {
    userId: string;
    onNavigate: (stage: string) => void;
    userEmail?: string;
    userName?: string | null;
}

interface TodayStats {
    drillsToday: number;
    avgWPM: number;
    practiceTimeMinutes: number;
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: string | null;
}

interface Achievement {
    id: string;
    badgeType: string;
    earnedAt: string;
}

interface WeekActivity {
    day: string;
    count: number;
}

const ACHIEVEMENT_INFO: Record<string, { name: string; icon: string; description: string }> = {
    'first_drill': { name: 'First Steps', icon: '🎯', description: 'Complete your first drill' },
    'week_warrior': { name: 'Week Warrior', icon: '🔥', description: '7 consecutive days' },
    '100_wpm_club': { name: '100 WPM Club', icon: '⚡', description: 'Achieve 100+ WPM' },
    'precision_pro': { name: 'Precision Pro', icon: '🎯', description: '98%+ accuracy' },
    'marathon_runner': { name: 'Marathon Runner', icon: '🏃', description: 'Complete 50 drills' },
    'early_bird': { name: 'Early Bird', icon: '🌅', description: 'Practice before 9 AM' },
    'night_owl': { name: 'Night Owl', icon: '🦉', description: 'Practice after 10 PM' },
    'perfect_week': { name: 'Perfect Week', icon: '💎', description: '7 days, 95%+ accuracy' },
    'speed_demon': { name: 'Speed Demon', icon: '🚀', description: '120+ WPM achieved' },
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

const Dashboard: React.FC<DashboardProps> = ({ userId, onNavigate, userEmail, userName: propUserName }) => {
    const [todayStats, setTodayStats] = useState<TodayStats>({ drillsToday: 0, avgWPM: 0, practiceTimeMinutes: 0 });
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
    const [weekActivity, setWeekActivity] = useState<WeekActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // Extract username from email or use fallback
    const displayName = propUserName || (userEmail
        ? userEmail.includes('@')
            ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)
            : 'User'
        : 'User');

    useEffect(() => {
        fetchDashboardData();
    }, [userId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [summaryRes, streakRes, achievementsRes, trendsRes] = await Promise.all([
                fetch(`/api/analytics/${userId}/summary`),
                fetch(`/api/streaks/${userId}`),
                fetch(`/api/achievements/${userId}`),
                fetch(`/api/analytics/${userId}/trends?days=7`)
            ]);

            const summaryData = await summaryRes.json();
            const streakData = await streakRes.json();
            const achievementsData = await achievementsRes.json();
            const trendsData = await trendsRes.json();

            // Calculate today's stats (filter from summary or recent results)
            // For now, using placeholder logic - would need to filter by today's date
            setTodayStats({
                drillsToday: 0, // Would calculate from results today
                avgWPM: summaryData.averageWPM || 0,
                practiceTimeMinutes: Math.round(summaryData.totalPracticeTime || 0)
            });

            setStreak(streakData);

            // Get most recent 3 achievements
            if (achievementsData.earned) {
                const recent = achievementsData.earned
                    .sort((a: Achievement, b: Achievement) =>
                        new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
                    )
                    .slice(0, 3);
                setRecentAchievements(recent);
            }

            // Format week activity data
            if (trendsData.trends) {
                const formatted = trendsData.trends.map((day: any) => ({
                    day: format(new Date(day.date), 'EEE'),
                    count: day.drillCount
                }));
                setWeekActivity(formatted);
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStreakStatus = () => {
        if (!streak) return { text: 'Start practicing!', color: 'text-gray-500', icon: '📚' };

        if (streak.currentStreak === 0) {
            return { text: 'Start a new streak!', color: 'text-gray-500', icon: '🚀' };
        }

        if (streak.currentStreak >= 7) {
            return { text: 'On fire!', color: 'text-orange-500', icon: '🔥' };
        }

        return { text: 'Keep it up!', color: 'text-green-500', icon: '✅' };
    };

    const streakStatus = getStreakStatus();
    const nextMilestone = streak ? Math.ceil((streak.currentStreak + 1) / 10) * 10 : 10;
    const streakProgress = streak ? (streak.currentStreak / nextMilestone) * 100 : 0;

    if (loading) {
        return (
            <PageTransition>
                <div className="max-w-6xl mx-auto p-6 space-y-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 bg-gray-200 rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-32 bg-gray-200 rounded-2xl" />
                            <div className="h-32 bg-gray-200 rounded-2xl" />
                            <div className="h-32 bg-gray-200 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-lg border border-blue-100"
                >
                    <h1 className="text-3xl sm:text-4xl font-black mb-2">
                        👋 {getGreeting()}, <span className="text-black">{displayName}</span>!
                    </h1>
                    {streak && streak.currentStreak > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-orange-500">
                                🔥 {streak.currentStreak}-day streak
                            </span>
                            <span className={`text-sm font-semibold ${streakStatus.color}`}>
                                {streakStatus.icon} {streakStatus.text}
                            </span>
                        </div>
                    ) : (
                        <p className="text-lg text-text-muted">Ready to start your typing mastery journey?</p>
                    )}
                </motion.div>

                {/* Today's Stats */}
                <div>
                    <h2 className="text-2xl font-bold text-text-main mb-4">📊 Today's Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AnimatedStatCard
                            title="Drills Completed"
                            value={todayStats.drillsToday}
                            icon="🎯"
                            color="bg-blue-50 border-blue-200"
                            delay={0}
                        />
                        <AnimatedStatCard
                            title="Average WPM"
                            value={todayStats.avgWPM}
                            icon="⚡"
                            color="bg-cyan-50 border-cyan-200"
                            suffix=" WPM"
                            decimals={1}
                            delay={0.1}
                        />
                        <AnimatedStatCard
                            title="Practice Time"
                            value={todayStats.practiceTimeMinutes}
                            icon="⏱️"
                            color="bg-purple-50 border-purple-200"
                            suffix=" min"
                            delay={0.2}
                        />
                    </div>
                </div>

                {/* Streak Tracker */}
                {streak && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
                    >
                        <h2 className="text-2xl font-bold text-text-main mb-4">🔥 Your Streak</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-5xl font-black text-orange-500 mb-2">
                                    {streak.currentStreak} days
                                </div>
                                <p className="text-sm text-text-muted">Current Streak</p>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-text-main mb-2">
                                    👑 {streak.longestStreak} days
                                </div>
                                <p className="text-sm text-text-muted">Personal Best</p>
                            </div>
                        </div>

                        {/* Progress to next milestone */}
                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-text-main">Next milestone: {nextMilestone} days</span>
                                <span className="text-text-muted">{streak.currentStreak}/{nextMilestone}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${streakProgress}%` }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Recent Achievements */}
                {recentAchievements.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-text-main">🏆 Recent Achievements</h2>
                            <button
                                onClick={() => onNavigate('achievements')}
                                className="text-sm font-semibold text-brand-blue hover:text-brand-magenta transition-colors"
                            >
                                View all →
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {recentAchievements.map((achievement, index) => {
                                const info = ACHIEVEMENT_INFO[achievement.badgeType];
                                if (!info) return null;

                                return (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 text-center"
                                    >
                                        <div className="text-4xl mb-2">{info.icon}</div>
                                        <div className="font-bold text-text-main text-sm">{info.name}</div>
                                        <div className="text-xs text-text-muted mt-1">
                                            {format(new Date(achievement.earnedAt), 'MMM d')}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
                >
                    <h2 className="text-2xl font-bold text-text-main mb-4">⚡ Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <button
                            onClick={() => onNavigate('curriculum')}
                            className="bg-white border-2 border-black text-black px-6 py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <span>📚</span>
                            <span>Continue Learning</span>
                        </button>
                        <button
                            onClick={() => onNavigate('custom_drills')}
                            className="bg-white border-2 border-black text-black px-6 py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <span>✏️</span>
                            <span>Custom Drill</span>
                        </button>
                        <button
                            onClick={() => onNavigate('analytics')}
                            className="bg-white border-2 border-black text-black px-6 py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <span>📈</span>
                            <span>Analytics</span>
                        </button>
                        <button
                            onClick={() => onNavigate('goals')}
                            className="bg-white border-2 border-black text-black px-6 py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <span>🎯</span>
                            <span>Track Goals</span>
                        </button>
                        <button
                            onClick={() => onNavigate('bible_practice')}
                            className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-300 text-purple-900 px-6 py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 hover:from-purple-100 hover:to-blue-100 transition-all flex items-center justify-center gap-2"
                        >
                            <span>📖</span>
                            <span>Bible Practice</span>
                        </button>
                    </div>
                </motion.div>

                {/* Weekly Activity */}
                {weekActivity.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
                    >
                        <h2 className="text-2xl font-bold text-text-main mb-4">📅 This Week's Activity</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weekActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="day" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#8B5CF6"
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
};

export default Dashboard;
