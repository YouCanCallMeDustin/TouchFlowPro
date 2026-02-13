import React, { useState, useEffect } from 'react';
import type { AnalyticsData, ProgressEntry } from '@shared/analytics';
import { Card, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { StatTile } from './ui/StatTile';
import { apiFetch } from '../utils/api';
import { SectionTitle } from './ui/SectionTitle';

interface AnalyticsProps {
    userId: string;
    onClose: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ userId, onClose }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        // Fetch analytics data from backend
        const fetchData = async () => {
            try {
                const [analyticsRes, sessionsRes] = await Promise.all([
                    apiFetch(`/api/analytics/${userId}`),
                    apiFetch(`/api/analytics/${userId}/sessions?limit=20`)
                ]);

                const analyticsData = await analyticsRes.json();
                const sessionsData = await sessionsRes.json();

                setAnalytics(analyticsData);
                setSessions(sessionsData.sessions || []);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            }
        };
        fetchData();
    }, [userId]);

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<any | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleViewSession = async (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setLoadingDetails(true);
        try {
            const res = await apiFetch(`/api/analytics/session/${sessionId}`);
            const data = await res.json();
            setSessionDetails(data);
        } catch (err) {
            console.error('Failed to fetch session details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeSessionModal = () => {
        setSelectedSessionId(null);
        setSessionDetails(null);
    };

    if (!analytics) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 text-center h-96">
                <div className="text-4xl mb-4 animate-bounce">📊</div>
                <p className="text-text-muted font-medium">Loading your progress...</p>
            </Card>
        );
    }

    // Filter progress history by time range
    const getFilteredHistory = (): ProgressEntry[] => {
        const now = Date.now();
        const ranges = {
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            all: Infinity
        };
        const cutoff = now - ranges[timeRange];
        return analytics.progressHistory.filter(entry => entry.timestamp >= cutoff);
    };

    const filteredHistory = getFilteredHistory();

    // Calculate WPM trend
    const wpmTrend = filteredHistory.map(entry => ({
        date: new Date(entry.timestamp).toLocaleDateString(),
        wpm: entry.wpm
    }));

    // Get top 5 weak keys
    const weakKeysArray = Object.entries(analytics.weakKeys)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Calculate improvement
    const firstWPM = filteredHistory[0]?.wpm || 0;
    const lastWPM = filteredHistory[filteredHistory.length - 1]?.wpm || 0;
    const improvement = lastWPM - firstWPM;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-6 py-8 relative">
            {/* Header */}
            <div className="flex justify-between items-center bg-surface p-6 rounded-3xl border border-border shadow-sm">
                <SectionTitle
                    title="📊 Your Progress"
                    subtitle="Track your typing journey and celebrate your improvements!"
                    className="mb-0"
                />
                <Button variant="ghost" onClick={onClose} size="sm">
                    Close
                </Button>
            </div>

            {/* Time Range Selector */}
            <div className="flex justify-center md:justify-start gap-2">
                {(['week', 'month', 'all'] as const).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`
                            px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all
                            ${timeRange === range
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-surface text-text-muted border border-border hover:bg-surface-2 hover:text-text-main'}
                        `}
                    >
                        {range === 'all' ? 'All Time' : `Last ${range}`}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatTile
                    icon="🎯"
                    value={analytics.totalLessonsCompleted}
                    label="Lessons"
                    color="primary"
                />
                <StatTile
                    icon="⚡"
                    value={analytics.averageWPM}
                    label="Avg WPM"
                    color="secondary"
                />
                <StatTile
                    icon="🏆"
                    value={analytics.bestWPM}
                    label="Best WPM"
                    color="accent"
                />
                <StatTile
                    icon="🔥"
                    value={analytics.currentStreak}
                    label="Streak"
                />
                <StatTile
                    icon="✅"
                    value={`${analytics.averageAccuracy}%`}
                    label="Avg Acc"
                    color="secondary"
                />

                <Card className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="text-3xl mb-2">
                        {improvement > 0 ? '📈' : improvement < 0 ? '📉' : '➡️'}
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${improvement > 0 ? 'text-secondary' : improvement < 0 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                        {improvement > 0 ? '+' : ''}{improvement}
                    </div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
                        Improvement
                    </div>
                </Card>
            </div>

            {/* WPM Progress Chart */}
            <Card className="p-8">
                <CardTitle className="mb-6">WPM Progress Over Time</CardTitle>
                <div className="flex items-end gap-2 h-64 p-4 border-b border-border border-l bg-surface-2/20 rounded-lg">
                    {wpmTrend.length > 0 ? wpmTrend.map((entry, index) => {
                        const maxWPM = Math.max(...wpmTrend.map(e => e.wpm));
                        const height = (entry.wpm / maxWPM) * 100;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                                {/* Tooltip */}
                                <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                                    {entry.date}: {entry.wpm} WPM
                                </div>

                                <div className="w-full relative flex items-end h-full">
                                    <div
                                        className="w-full bg-gradient-to-t from-secondary to-primary rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                                        style={{ height: `${height}%`, minHeight: '4px' }}
                                    />
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                            No data available for this time range
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Weak Keys Analysis */}
                <Card className="p-8">
                    <CardTitle className="mb-2">🎯 Keys to Practice</CardTitle>
                    <p className="text-text-muted mb-6 text-sm">
                        Focus on these keys during your next session.
                    </p>
                    {weakKeysArray.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {weakKeysArray.map(([key, count]) => {
                                const maxErrors = weakKeysArray[0][1];
                                const percentage = (count / maxErrors) * 100;

                                return (
                                    <div key={key}>
                                        <div className="flex justify-between mb-2 text-sm font-semibold">
                                            <span className="font-mono bg-red-500/10 text-red-500 px-3 py-1 rounded-md">
                                                {key}
                                            </span>
                                            <span className="text-text-muted">
                                                {count} errors
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-500 to-orange-400"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-text-muted text-center py-8">
                            Great job! No significant weak points detected.
                        </p>
                    )}
                </Card>

                {/* Recent Activity */}
                <Card className="p-8">
                    <CardTitle className="mb-6">📝 Recent Activity</CardTitle>
                    <div className="flex flex-col gap-3">
                        {filteredHistory.slice(-5).reverse().map((entry, index) => (
                            <div
                                key={index}
                                className={`
                                    flex justify-between items-center p-4 rounded-xl border-l-4 transition-colors
                                    ${entry.passed
                                        ? 'bg-green-500/5 border-green-500 hover:bg-green-500/10'
                                        : 'bg-red-500/5 border-red-500 hover:bg-red-500/10'}
                                `}
                            >
                                <div>
                                    <div className="font-bold text-text-main mb-1">
                                        {entry.lessonTitle}
                                    </div>
                                    <div className="text-xs text-text-muted">
                                        {new Date(entry.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex gap-6 items-center">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-primary">
                                            {entry.wpm}
                                        </div>
                                        <div className="text-[10px] text-text-muted uppercase font-bold">WPM</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-xl font-bold ${entry.passed ? 'text-secondary' : 'text-red-500'}`}>
                                            {entry.accuracy}%
                                        </div>
                                        <div className="text-[10px] text-text-muted uppercase font-bold">ACC</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Session History Table */}
            <Card className="p-8 col-span-full">
                <CardTitle className="mb-6">📜 Session History</CardTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-black uppercase tracking-widest text-text-muted border-b border-border">
                                <th className="p-4">Date</th>
                                <th className="p-4">Mode</th>
                                <th className="p-4">WPM</th>
                                <th className="p-4">Accuracy</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length > 0 ? sessions.map((session) => (
                                <tr key={session.id} className="border-b border-border/50 hover:bg-surface-2/30 transition-colors">
                                    <td className="p-4 text-sm font-medium">
                                        {new Date(session.timestamp).toLocaleDateString()}
                                        <span className="text-xs text-text-muted ml-2">
                                            {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-black uppercase tracking-wider text-text-muted">
                                        {session.mode || 'Drill'}
                                    </td>
                                    <td className="p-4 font-bold text-primary">
                                        {Math.round(session.netWPM)}
                                    </td>
                                    <td className={`p-4 font-bold ${session.accuracy >= 95 ? 'text-secondary' : 'text-orange-500'}`}>
                                        {Math.round(session.accuracy)}%
                                    </td>
                                    <td className="p-4 text-sm text-text-muted">
                                        {Math.round((session.durationMs || 0) / 1000)}s
                                    </td>
                                    <td className="p-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewSession(session.id)}
                                            className="text-primary hover:bg-primary/10"
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-text-muted">
                                        No recent sessions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Session Detail Modal */}
            {selectedSessionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeSessionModal}>
                    <div className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Session Details</h3>
                            <Button variant="ghost" size="sm" onClick={closeSessionModal}>✕</Button>
                        </div>

                        {loadingDetails ? (
                            <div className="p-12 text-center text-text-muted">Loading details...</div>
                        ) : sessionDetails ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-surface-2/50 p-4 rounded-lg text-center">
                                        <div className="text-xs text-text-muted uppercase font-bold">WPM</div>
                                        <div className="text-2xl font-bold text-primary">{Math.round(sessionDetails.netWPM)}</div>
                                    </div>
                                    <div className="bg-surface-2/50 p-4 rounded-lg text-center">
                                        <div className="text-xs text-text-muted uppercase font-bold">Accuracy</div>
                                        <div className={`text-2xl font-bold ${sessionDetails.accuracy >= 95 ? 'text-secondary' : 'text-orange-500'}`}>
                                            {Math.round(sessionDetails.accuracy)}%
                                        </div>
                                    </div>
                                    <div className="bg-surface-2/50 p-4 rounded-lg text-center">
                                        <div className="text-xs text-text-muted uppercase font-bold">Mode</div>
                                        <div className="text-lg font-bold capitalize">{sessionDetails.mode || 'Drill'}</div>
                                    </div>
                                    <div className="bg-surface-2/50 p-4 rounded-lg text-center">
                                        <div className="text-xs text-text-muted uppercase font-bold">Duration</div>
                                        <div className="text-lg font-bold">{Math.round((sessionDetails.durationMs || 0) / 1000)}s</div>
                                    </div>
                                </div>

                                {sessionDetails.fatigueScore !== null && (
                                    <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg">
                                        <h4 className="font-bold text-orange-500 mb-2">Fatigue Analysis</h4>
                                        <div className="flex justify-between items-center">
                                            <span>Fatigue Score: {sessionDetails.fatigueScore}</span>
                                            {sessionDetails.fatigueFlags && (
                                                <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                                                    {sessionDetails.fatigueFlags}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {sessionDetails.rawLog ? (
                                    <div className="bg-surface-2/30 p-4 rounded-lg border border-border border-dashed text-center">
                                        <p className="text-sm text-text-muted mb-2">Replay Data Available</p>
                                        <div className="text-xs text-text-muted">
                                            {Array.isArray(sessionDetails.rawLog) ? sessionDetails.rawLog.length : 'Unknown'} keystrokes recorded.
                                            (Replay visualization coming soon)
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-text-muted text-sm italic">
                                        No raw keystroke data available for this session.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-red-500 text-center">Failed to load details.</div>
                        )}
                    </div>
                </div>
            )}

            export default Analytics;
