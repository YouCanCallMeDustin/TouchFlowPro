import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Zap,
    Target,
    Clock,
    Flame,
    Trophy,
    TrendingUp,
    History,
    Activity,
    ArrowUpRight,
    Award,
    Edit3
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition';
import AnimatedStatCard from '../components/AnimatedStatCard';
import { LevelProgressBar } from '../components/LevelProgressBar';
import { RecommendationsWidget } from '../components/RecommendationsWidget';

interface DashboardProps {
    userId: string;
    onNavigate: (stage: string) => void;
    userEmail?: string;
    userName?: string | null;
    onStartCustomSession?: (content: string, title: string) => void;
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
    name: string;
    description: string;
    icon: string;
    category: string;
}

interface WeekActivity {
    day: string;
    count: number;
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

const Dashboard: React.FC<DashboardProps> = ({ userId, onNavigate, userEmail, userName: propUserName, onStartCustomSession }) => {
    const [todayStats, setTodayStats] = useState<TodayStats>({ drillsToday: 0, avgWPM: 0, practiceTimeMinutes: 0 });
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
    const [weekActivity, setWeekActivity] = useState<WeekActivity[]>([]);
    const [loading, setLoading] = useState(true);

    const displayName = propUserName || (userEmail
        ? userEmail.includes('@')
            ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)
            : 'Professional'
        : 'Professional');

    useEffect(() => {
        // Check for Stripe Session ID in URL (post-checkout)
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get('session_id');

        if (sessionId) {
            verifySubscription(sessionId);
        } else {
            fetchDashboardData();
        }
    }, [userId]);

    const verifySubscription = async (sessionId: string) => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/subscriptions/verify-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tfp_token')}`
                },
                body: JSON.stringify({ sessionId })
            });

            if (response.ok) {
                // Clear the query param
                window.history.replaceState({}, document.title, window.location.pathname);
                // Refresh data
                fetchDashboardData();
            } else {
                console.error('Subscription verification failed');
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error verifying subscription:', error);
            fetchDashboardData();
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
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

            setTodayStats({
                drillsToday: 0,
                avgWPM: summaryData.averageWPM || 0,
                practiceTimeMinutes: Math.round(summaryData.totalPracticeTime || 0)
            });

            setStreak(streakData);

            if (achievementsData.achievements) {
                const recent = achievementsData.achievements
                    .sort((a: Achievement, b: Achievement) =>
                        new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
                    )
                    .slice(0, 3);
                setRecentAchievements(recent);
            }

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 20 }
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[70vh]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_var(--primary)]" />
                    </div>
                    <span className="text-text-muted font-black uppercase tracking-[0.4em] text-[10px]">Loading Dashboard</span>
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto p-4 sm:p-10 space-y-16"
            >
                {/* Hero section */}
                <motion.div variants={itemVariants} className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Activity size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Platform Ready</span>
                        </div>
                        <h1 className="text-6xl mb-4 tracking-tight leading-[1.1]">
                            <span className="text-text-muted block mb-2">{getGreeting()},</span>
                            <span className="text-gradient drop-shadow-sm">{displayName}.</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-xl font-medium leading-relaxed opacity-70">
                            Your skills are improving.
                            <span className="text-text-main font-bold"> Skill Assessment </span> is recommended for top speed.
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
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div variants={itemVariants}>
                            <LevelProgressBar userId={userId} />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <RecommendationsWidget
                                userId={userId}
                                onStartPractice={onStartCustomSession || (() => onNavigate('adaptive_practice'))}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="flex items-center gap-4 text-2xl tracking-tighter">
                                    Activity Overview
                                </h2>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Live Metrics</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <AnimatedStatCard
                                    title="Drills Done"
                                    value={todayStats.drillsToday}
                                    icon={<Target size={20} />}
                                    delay={0}
                                />
                                <AnimatedStatCard
                                    title="Velocity"
                                    value={todayStats.avgWPM}
                                    icon={<Zap size={20} />}
                                    suffix=" WPM"
                                    decimals={1}
                                    delay={0.1}
                                />
                                <AnimatedStatCard
                                    title="Engagement"
                                    value={todayStats.practiceTimeMinutes}
                                    icon={<Clock size={20} />}
                                    suffix=" min"
                                    delay={0.2}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="card p-8 border border-white/5">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted">Daily Drill Volume</h3>
                                <TrendingUp size={16} className="text-secondary opacity-50" />
                            </div>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weekActivity} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)', letterSpacing: '0.1em' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)', opacity: 0.3 }}
                                            width={30}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                backdropFilter: 'blur(16px)',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                                padding: '16px',
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em'
                                            }}
                                            formatter={(value: any) => [`${value} DRILLS`, 'COMPLETED']}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[8, 8, 8, 8]}
                                            animationDuration={1500}
                                            label={{
                                                position: 'top',
                                                fill: 'var(--text-main)',
                                                fontSize: 10,
                                                fontWeight: 900,
                                                formatter: (val: any) => val > 0 ? val : ''
                                            }}
                                        >
                                            {weekActivity.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-12">
                        {streak && (
                            <motion.div variants={itemVariants} className="card relative overflow-hidden group border border-orange-500/10 dark:border-orange-500/5 bg-gradient-to-br from-orange-500/[0.02] to-transparent">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                                    <Flame size={80} strokeWidth={1} />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Flame size={14} className="text-orange-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted">Streak Consistency</h3>
                                </div>
                                <div className="text-[6xl] font-black mb-2 tracking-tighter">
                                    {streak.currentStreak} <span className="text-xl font-bold opacity-30 tracking-normal">Days</span>
                                </div>
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-10 opacity-60">Longest Streak: {streak.longestStreak}</div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40">
                                        <span>Next Milestone</span>
                                        <span>{Math.ceil((streak.currentStreak + 1) / 5) * 5} Days</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(streak.currentStreak % 5) * 20}%` }}
                                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants} className="card border border-white/5">
                            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted">Recent Milestones</h3>
                                <button
                                    onClick={() => onNavigate('achievements')}
                                    className="text-[9px] font-black text-primary px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors uppercase tracking-widest"
                                >
                                    Milestones
                                </button>
                            </div>
                            <div className="space-y-3">
                                {recentAchievements.length > 0 ? recentAchievements.map((achievement) => {
                                    return (
                                        <div key={achievement.id} className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                                            <div className="p-2 rounded-xl bg-white/5 text-2xl group-hover:scale-110 transition-transform">
                                                {achievement.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-bold text-text-main truncate uppercase tracking-tight">{achievement.name}</div>
                                                <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1 opacity-40">{format(new Date(achievement.earnedAt), 'MMM d, yyyy')}</div>
                                            </div>
                                            <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-10 transition-opacity" />
                                        </div>
                                    );
                                }) : (
                                    <div className="py-10 text-center opacity-30 select-none">
                                        <div className="relative inline-block mb-4">
                                            <Award size={40} strokeWidth={1} />
                                            <div className="absolute inset-0 blur-lg bg-primary/20" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Unlock Milestones</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted px-4">Quick Access</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'practice', label: 'Practice', icon: Target },
                                    { id: 'bible_practice', label: 'History', icon: History },
                                    { id: 'analytics', label: 'Stats', icon: TrendingUp },
                                    { id: 'custom_drills', label: 'Custom Drills', icon: Edit3 }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all text-center group relative overflow-hidden flex flex-col items-center justify-center gap-3"
                                    >
                                        <item.icon size={24} className="text-text-muted group-hover:text-primary group-hover:scale-125 transition-all duration-500" strokeWidth={1.5} />
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-text-main transition-colors">{item.label}</div>
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
};

export default Dashboard;
