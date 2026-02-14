import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';
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
    TrendingUp,
    History,
    Activity,
    ArrowUpRight,
    Award,
    Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition';
import AnimatedStatCard from '../components/AnimatedStatCard';
import { LevelProgressBar } from '../components/LevelProgressBar';
import { RecommendationsWidget } from '../components/RecommendationsWidget';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const MotionCard = motion(Card);

interface DashboardProps {
    userId: string;
    onNavigate: (stage: string) => void;
    userEmail?: string;
    userName?: string | null;
    onStartCustomSession?: (content: string, title: string, duration?: number) => void;
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
    const [plateau, setPlateau] = useState<any>(null);
    const [activePlan, setActivePlan] = useState<any>(null);
    const [todaysPlan, setTodaysPlan] = useState<any>(null);
    const [showCreatePlan, setShowCreatePlan] = useState(false);
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
            const response = await apiFetch(`/api/subscriptions/verify-session`, {
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
            const [summaryRes, streakRes, achievementsRes, trendsRes, plateauRes, planRes] = await Promise.all([
                apiFetch(`/api/analytics/${userId}/summary`),
                apiFetch(`/api/streaks/${userId}`),
                apiFetch(`/api/achievements/${userId}`),
                apiFetch(`/api/analytics/${userId}/trends?days=7`),
                apiFetch(`/api/analytics/${userId}/insights/plateau`),
                apiFetch(`/api/plans/active`)
            ]);

            const summaryData = await summaryRes.json();
            const streakData = await streakRes.json();
            const achievementsData = await achievementsRes.json();
            const trendsData = await trendsRes.json();
            const plateauData = await plateauRes.json();

            if (planRes.ok) {
                const plan = await planRes.json();
                setActivePlan(plan);
                if (plan) {
                    // Fetch today's plan details if active plan exists
                    const todayRes = await apiFetch('/api/plans/active/today');
                    if (todayRes.ok) {
                        setTodaysPlan(await todayRes.json());
                    }
                }
            }

            setTodayStats({
                drillsToday: 0,
                avgWPM: summaryData.averageWPM || 0,
                practiceTimeMinutes: Math.round(summaryData.totalPracticeTime || 0)
            });

            setStreak(streakData);
            setPlateau(plateauData);

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

    const handleCreatePlan = async (track: string, goalWpm: number, minutes: number) => {
        try {
            const res = await apiFetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    track,
                    goalWpm,
                    goalAccuracy: 98,
                    minutesPerDay: minutes,
                    durationWeeks: 4
                })
            });
            if (res.ok) {
                const newPlan = await res.json();
                setActivePlan(newPlan);
                setShowCreatePlan(false);
                // Refresh today
                const todayRes = await apiFetch('/api/plans/active/today');
                if (todayRes.ok) setTodaysPlan(await todayRes.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCompleteDay = async () => {
        try {
            const res = await apiFetch('/api/plans/active/today/complete', { method: 'POST' });
            if (res.ok) {
                setTodaysPlan({ ...todaysPlan, status: 'COMPLETED' });
            }
        } catch (e) {
            console.error(e);
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
                <MotionCard variants={itemVariants} className="relative overflow-hidden group min-h-[220px] flex items-center bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 p-0">
                    <div className="relative z-10 w-full md:w-2/3 p-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center border border-[var(--primary)]/30">
                                <Activity size={18} className="text-[var(--primary)]" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">Platform Ready</span>
                        </div>
                        <h1 className="text-6xl mb-4 tracking-tight leading-[1.1]">
                            <span className="text-[var(--text-muted)] block mb-2">{getGreeting()},</span>
                            <span className="text-gradient drop-shadow-sm">{displayName}.</span>
                        </h1>
                        <p className="text-xl text-[var(--text-muted)] max-w-xl font-medium leading-relaxed opacity-70">
                            Your skills are improving.
                            <span className="text-[var(--text)] font-bold"> Skill Assessment </span> is recommended for top speed.
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
                </MotionCard>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Training Plan Section - NEW */}
                        <motion.div variants={itemVariants}>
                            {!activePlan ? (
                                <Card className="p-8 bg-surface-2/30 border-dashed border-2 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                                        <Target size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">No Active Training Plan</h3>
                                        <p className="text-text-muted max-w-md mx-auto mt-2">
                                            Get a personalized daily schedule based on your professional track and goals.
                                        </p>
                                    </div>
                                    <Button onClick={() => setShowCreatePlan(true)}>Create Training Plan</Button>

                                    {showCreatePlan && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowCreatePlan(false)}>
                                            <div className="bg-surface border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                                                <h3 className="text-xl font-bold border-b border-border pb-2">Create Plan</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-bold mb-1">Professional Track</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {['MEDICAL', 'LEGAL', 'OPS', 'CODE'].map(t => (
                                                                <button
                                                                    key={t}
                                                                    onClick={() => handleCreatePlan(t, 60, 20)} // Simplified for demo
                                                                    className="p-3 rounded-lg border border-border hover:bg-primary/10 hover:border-primary transition-colors text-sm font-bold"
                                                                >
                                                                    {t}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-text-muted">
                                                        * Defaulting to 4 weeks, 20 mins/day, 98% acc goal for this demo.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ) : (
                                <Card className="p-0 overflow-hidden border-primary/20 bg-surface-2/10">
                                    <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-border flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                                                {activePlan.track} Track • Day {Math.max(1, Math.ceil((new Date().getTime() - new Date(activePlan.createdAt).getTime()) / (1000 * 60 * 60 * 24)))}
                                            </div>
                                            <h3 className="text-2xl font-bold">Today's Training</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{todaysPlan?.estimatedMinutes || 20}m</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Est. Time</div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {todaysPlan?.items && todaysPlan.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
                                                <div className="p-3 rounded-lg bg-surface-2">
                                                    {item.type === 'WARMUP' && <Flame size={18} />}
                                                    {item.type === 'REVIEW' && <History size={18} />}
                                                    {item.type === 'SKILL' && <Zap size={18} />}
                                                    {item.type === 'COOLDOWN' && <Clock size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h4 className="font-bold">{item.title}</h4>
                                                        <span className="text-xs font-bold bg-surface-2 px-2 py-1 rounded">{item.minutes}m</span>
                                                    </div>
                                                    {item.reason && (
                                                        <p className="text-xs text-text-muted mt-1">
                                                            {item.reason.join(' • ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        // Always use custom session to ensure content is passed
                                                        if (item.content) {
                                                            onStartCustomSession?.(item.content, item.title, item.minutes);
                                                        } else {
                                                            const mode = item.mode || 'practice';
                                                            onNavigate(mode === 'drill' ? 'adaptive_practice' : 'practice');
                                                        }
                                                    }}
                                                >
                                                    Start
                                                </Button>
                                            </div>
                                        ))}

                                        {(!todaysPlan || !todaysPlan.items || todaysPlan.items.length === 0) && (
                                            <div className="text-center p-8 text-text-muted">
                                                Generating plan...
                                            </div>
                                        )}

                                        {todaysPlan && todaysPlan.status !== 'COMPLETED' && (
                                            <Button className="w-full mt-4" variant="secondary" onClick={handleCompleteDay}>
                                                Mark Day Complete
                                            </Button>
                                        )}
                                        {todaysPlan && todaysPlan.status === 'COMPLETED' && (
                                            <div className="w-full mt-4 p-3 bg-green-500/10 text-green-500 text-center font-bold rounded-xl border border-green-500/20">
                                                Day Completed! 🎉
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <LevelProgressBar userId={userId} />
                        </motion.div>

                        {plateau && plateau.plateau && (
                            <motion.div variants={itemVariants}>
                                <Card className="bg-orange-500/5 border-orange-500/20">
                                    <div className="flex items-start gap-4 p-6">
                                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                                            <Activity size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-orange-500">Plateau Detected</h3>
                                                <span className="text-xs font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                                    {plateau.signal.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-muted mb-3">
                                                {plateau.explanation}
                                            </p>
                                            <div className="text-sm font-medium text-text bg-surface-2/50 p-3 rounded-lg border border-border">
                                                💡 Tip: {plateau.suggestion}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

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

                        <MotionCard variants={itemVariants} className="p-8">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--muted)]">Daily Drill Volume</h3>
                                <TrendingUp size={16} className="text-[var(--secondary)] opacity-50" />
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
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
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
                                            cursor={{ fill: 'var(--surface-2)' }}
                                            contentStyle={{
                                                backgroundColor: 'var(--bg-card)',
                                                backdropFilter: 'blur(16px)',
                                                borderRadius: '16px',
                                                border: '1px solid var(--border)',
                                                boxShadow: 'var(--shadow-lg)',
                                                padding: '16px',
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                color: 'var(--text)'
                                            }}
                                            formatter={(value: any) => [`${value} DRILLS`, 'COMPLETED']}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[8, 8, 8, 8]}
                                            animationDuration={1500}
                                            label={{
                                                position: 'top',
                                                fill: 'var(--text)',
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
                        </MotionCard>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-12">
                        {streak && (
                            <MotionCard variants={itemVariants} className="relative overflow-hidden group border-orange-500/10 dark:border-orange-500/5 bg-gradient-to-br from-orange-500/[0.02] to-transparent">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                                    <Flame size={80} strokeWidth={1} />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Flame size={14} className="text-orange-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Streak Consistency</h3>
                                </div>
                                <div className="text-[6xl] font-black mb-2 tracking-tighter">
                                    {streak.currentStreak} <span className="text-xl font-bold opacity-30 tracking-normal">Days</span>
                                </div>
                                <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-10 opacity-60">Longest Streak: {streak.longestStreak}</div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--muted)] opacity-40">
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
                            </MotionCard>
                        )}

                        <MotionCard variants={itemVariants}>
                            <div className="flex justify-between items-center mb-8 border-b border-[var(--border)] pb-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Recent Milestones</h3>
                                <Button
                                    onClick={() => onNavigate('achievements')}
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[9px] uppercase tracking-widest bg-[var(--primary)]/5 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                                >
                                    Milestones
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {recentAchievements.length > 0 ? recentAchievements.map((achievement) => {
                                    return (
                                        <div key={achievement.id} className="flex items-center gap-5 p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] group hover:border-[var(--primary)]/20 transition-all">
                                            <div className="p-2 rounded-xl bg-[var(--bg)] text-2xl group-hover:scale-110 transition-transform">
                                                {achievement.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-bold text-[var(--text)] truncate uppercase tracking-tight">{achievement.name}</div>
                                                <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1 opacity-40">{format(new Date(achievement.earnedAt), 'MMM d, yyyy')}</div>
                                            </div>
                                            <ArrowUpRight size={14} className="text-[var(--muted)] opacity-0 group-hover:opacity-10 transition-opacity" />
                                        </div>
                                    );
                                }) : (
                                    <div className="py-10 text-center opacity-30 select-none">
                                        <div className="relative inline-block mb-4">
                                            <Award size={40} strokeWidth={1} />
                                            <div className="absolute inset-0 blur-lg bg-[var(--primary)]/20" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Unlock Milestones</p>
                                    </div>
                                )}
                            </div>
                        </MotionCard>

                        <motion.div variants={itemVariants} className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted)] px-4">Quick Access</h3>
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
                                        className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/20 transition-all text-center group relative overflow-hidden flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md"
                                    >
                                        <item.icon size={24} className="text-[var(--muted)] group-hover:text-[var(--primary)] group-hover:scale-125 transition-all duration-500" strokeWidth={1.5} />
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">{item.label}</div>
                                        <div className="absolute inset-0 bg-[var(--primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
