import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import ProFeatureLock from '../components/ProFeatureLock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import PageTransition from '../components/PageTransition';
import AnimatedStatCard from '../components/AnimatedStatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { KeyHeatmap } from '../components/KeyHeatmap';
import { ErrorAnalysis } from '../components/ErrorAnalysis';
import { FingerHeatmap } from '../components/FingerHeatmap';
import { SequenceAnalysis } from '../components/SequenceAnalysis';
import {
    BarChart2,
    TrendingUp,
    Target,
    Rocket,
    Zap,
    Award,
    AlertCircle,
    Clock,
    Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AbstractMesh = () => (
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
);

interface MetricsSummary {
    totalDrills: number;
    averageWPM: number;
    highestWPM: number;
    totalPracticeTime: number;
    averageAccuracy: number;
    currentStreak: number;
}

interface PerformanceTrend {
    date: string;
    avgWPM: number;
    avgAccuracy: number;
}

const AnalyticsDashboard: React.FC = () => {
    const { user, token } = useAuth();
    const [days, setDays] = useState(30);
    const [summary, setSummary] = useState<MetricsSummary | null>(null);
    const [trends, setTrends] = useState<PerformanceTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userId = user?.id;

    useEffect(() => {
        const fetchData = async () => {
            if (!userId || !token) return;

            try {
                setLoading(true);
                setError(null);
                const headers = { 'Authorization': `Bearer ${token}` };

                const [trendsRes, summaryRes] = await Promise.all([
                    fetch(`/api/analytics/${userId}/trends?days=${days}`, { headers }),
                    fetch(`/api/analytics/${userId}/summary`, { headers })
                ]);

                if (trendsRes.ok && summaryRes.ok) {
                    const trendsData = await trendsRes.json();
                    const summaryData = await summaryRes.json();

                    setTrends(trendsData.trends || []);
                    setSummary(summaryData);
                } else {
                    setError('Unable to retrieve performance data.');
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                setError('A network error occurred while loading your insights.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, token, days]);

    if (loading) return <LoadingSkeleton />;

    if (error || !summary || !userId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <div className="p-6 rounded-full bg-rose-500/10 text-rose-500">
                    <AlertCircle size={48} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-text-main mb-2">Insights Unavailable</h2>
                    <p className="text-text-muted max-w-md mx-auto">
                        {error || "We couldn't find any practice data for your account. Start a few drills to see your performance metrics here!"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">

                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-end pr-2">
                        <div className="flex bg-slate-500/5 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
                            {[
                                { label: 'Today', value: 1 },
                                { label: '7 Day', value: 7 },
                                { label: '30 Day', value: 30 },
                                { label: 'All Time', value: 0 }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setDays(opt.value)}
                                    className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${days === opt.value ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-text-muted hover:text-text-main font-bold'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Card
                        variant="glass"
                        className="relative overflow-hidden group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border-white/10 p-8 sm:p-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative z-10 w-full md:w-2/3">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <BarChart2 size={18} className="text-primary" />
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Performance Analytics</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                                Insights & Analysis
                            </h1>
                            <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                                Deep dive into your performance <span className="text-primary font-black uppercase tracking-wider">Metric Trends</span>. Analyze velocity curves and accuracy heatmaps.
                            </p>
                        </div>

                        <AbstractMesh />
                    </Card>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatedStatCard
                        title="Total Drills"
                        value={summary.totalDrills || 0}
                        icon={<Target size={20} />}
                        delay={0}
                    />
                    <AnimatedStatCard
                        title="Average Speed"
                        value={Math.round(summary.averageWPM || 0)}
                        suffix=" WPM"
                        icon={<Zap size={20} />}
                        delay={0.1}
                    />
                    <AnimatedStatCard
                        title="Peak Velocity"
                        value={Math.round(summary.highestWPM || 0)}
                        suffix=" WPM"
                        icon={<Rocket size={20} />}
                        delay={0.2}
                    />
                    <AnimatedStatCard
                        title="Avg Accuracy"
                        value={Number((summary.averageAccuracy || 0).toFixed(1))}
                        suffix="%"
                        decimals={1}
                        icon={<Award size={20} />}
                        delay={0.3}
                    />
                </div>

                {/* Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* WPM Trend Chart */}
                    <Card
                        className="p-8 lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 className="text-xl font-black text-text-main mb-8 flex items-center gap-3">
                            <TrendingUp size={20} className="text-primary" />
                            Velocity Progression
                        </h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends} margin={{ top: 40, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="currentColor"
                                        opacity={0.4}
                                        fontSize={10}
                                        tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        opacity={0.4}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-card)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '16px',
                                            padding: '12px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgWPM"
                                        stroke="var(--primary)"
                                        strokeWidth={4}
                                        dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, stroke: 'var(--primary)', strokeWidth: 4, fill: '#fff' }}
                                        label={{
                                            position: 'top',
                                            fill: 'var(--text-main)',
                                            fontSize: 10,
                                            fontWeight: 900,
                                            offset: 15,
                                            formatter: (val: any) => val > 0 ? Math.round(val) : ''
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Stats Summary */}
                    <Card
                        className="p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <h2 className="text-xl font-black text-text-main mb-8 flex items-center gap-3">
                            <Clock size={20} className="text-primary" />
                            Activity Pulse
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-text-main/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Target className="text-primary opacity-60" size={16} />
                                    <span className="text-sm font-black text-text-muted">Total Sessions</span>
                                </div>
                                <span className="text-xl font-black text-text-main">{summary.totalDrills || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-text-main/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Clock className="text-primary opacity-60" size={16} />
                                    <span className="text-sm font-black text-text-muted">Practice Time</span>
                                </div>
                                <span className="text-xl font-black text-text-main">{summary.totalPracticeTime || 0}m</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-text-main/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Flame className="text-primary opacity-60" size={16} />
                                    <span className="text-sm font-black text-text-muted">Current Streak</span>
                                </div>
                                <span className="text-xl font-black text-text-main">{summary.currentStreak || 0} Days</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Heatmaps & Diagnostics */}
                <div className="space-y-8">
                    <KeyHeatmap userId={userId} />

                    <ProFeatureLock title="Finger Heatmap">
                        <FingerHeatmap userId={userId} />
                    </ProFeatureLock>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ProFeatureLock title="Sequence Analysis">
                            <SequenceAnalysis userId={userId} />
                        </ProFeatureLock>
                        <ProFeatureLock title="Error Analysis">
                            <ErrorAnalysis userId={userId} />
                        </ProFeatureLock>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default AnalyticsDashboard;
