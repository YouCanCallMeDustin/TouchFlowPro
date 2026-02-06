import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import AnimatedStatCard from '../components/AnimatedStatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface AnalyticsProps {
    userId: string;
}

interface TrendData {
    date: string;
    avgWPM: number;
    avgAccuracy: number;
    drillCount: number;
}

interface SummaryStats {
    totalDrills: number;
    averageWPM: number;
    averageAccuracy: number;
    highestWPM: number;
    totalPracticeTime: number;
    recentImprovement: number;
    currentStreak: number;
    longestStreak: number;
}

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ userId }) => {
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [summary, setSummary] = useState<SummaryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [userId, days]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const [trendsRes, summaryRes] = await Promise.all([
                fetch(`/api/analytics/${userId}/trends?days=${days}`),
                fetch(`/api/analytics/${userId}/summary`)
            ]);

            const trendsData = await trendsRes.json();
            const summaryData = await summaryRes.json();

            setTrends(trendsData.trends || []);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <h1 className="text-4xl font-heading font-black text-text-main">📊 Performance Analytics</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDays(7)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 ${days === 7 ? 'bg-primary-blue text-white shadow-lg' : 'bg-white text-text-muted border border-slate-200 hover:border-primary-blue'}`}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setDays(30)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 ${days === 30 ? 'bg-primary-blue text-white shadow-lg' : 'bg-white text-text-muted border border-slate-200 hover:border-primary-blue'}`}
                        >
                            30 Days
                        </button>
                        <button
                            onClick={() => setDays(90)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 ${days === 90 ? 'bg-primary-blue text-white shadow-lg' : 'bg-white text-text-muted border border-slate-200 hover:border-primary-blue'}`}
                        >
                            90 Days
                        </button>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AnimatedStatCard
                            title="Total Drills"
                            value={summary.totalDrills}
                            icon="🎯"
                            color="bg-blue-50 border-blue-200"
                            delay={0}
                        />
                        <AnimatedStatCard
                            title="Average WPM"
                            value={summary.averageWPM}
                            icon="⚡"
                            color="bg-teal-50 border-teal-200"
                            suffix=" WPM"
                            decimals={1}
                            delay={0.1}
                        />
                        <AnimatedStatCard
                            title="Average Accuracy"
                            value={summary.averageAccuracy}
                            icon="🎯"
                            color="bg-green-50 border-green-200"
                            suffix="%"
                            decimals={1}
                            delay={0.2}
                        />
                        <AnimatedStatCard
                            title="Best WPM"
                            value={summary.highestWPM}
                            icon="🚀"
                            color="bg-orange-50 border-orange-200"
                            suffix=" WPM"
                            delay={0.3}
                        />
                        <AnimatedStatCard
                            title="Practice Time"
                            value={summary.totalPracticeTime}
                            icon="⏱️"
                            color="bg-purple-50 border-purple-200"
                            suffix=" min"
                            delay={0.4}
                        />
                        <AnimatedStatCard
                            title="Improvement"
                            value={summary.recentImprovement}
                            icon={summary.recentImprovement >= 0 ? "📈" : "📉"}
                            color={summary.recentImprovement >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}
                            suffix="%"
                            decimals={1}
                            delay={0.5}
                        />
                        <AnimatedStatCard
                            title="Current Streak"
                            value={summary.currentStreak}
                            icon="🔥"
                            color="bg-orange-50 border-orange-200"
                            suffix=" days"
                            delay={0.6}
                        />
                        <AnimatedStatCard
                            title="Longest Streak"
                            value={summary.longestStreak}
                            icon="👑"
                            color="bg-yellow-50 border-yellow-200"
                            suffix=" days"
                            delay={0.7}
                        />
                    </div>
                )}

                {/* WPM Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100"
                >
                    <h2 className="text-2xl font-bold text-text-main mb-6">📈 WPM Progress</h2>
                    {trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    stroke="#64748b"
                                />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '12px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="avgWPM"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    name="Average WPM"
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-text-muted py-12">
                            No data available for selected period
                        </div>
                    )}
                </motion.div>

                {/* Accuracy Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100"
                >
                    <h2 className="text-2xl font-bold text-text-main mb-6">🎯 Accuracy Trend</h2>
                    {trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    stroke="#64748b"
                                />
                                <YAxis stroke="#64748b" domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '12px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="avgAccuracy"
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    name="Average Accuracy (%)"
                                    dot={{ fill: '#14b8a6', r: 4 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-text-muted py-12">
                            No data available for selected period
                        </div>
                    )}
                </motion.div>

                {/* Practice Frequency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100"
                >
                    <h2 className="text-2xl font-bold text-text-main mb-6">📅 Practice Frequency</h2>
                    {trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    stroke="#64748b"
                                />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '12px'
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="drillCount"
                                    fill="#8b5cf6"
                                    name="Drills Completed"
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-text-muted py-12">
                            No data available for selected period
                        </div>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default AnalyticsDashboard;
