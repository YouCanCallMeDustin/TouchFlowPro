import React, { useState, useEffect } from 'react';
import type { AnalyticsData, ProgressEntry } from '@shared/analytics';

interface AnalyticsProps {
    userId: string;
    onClose: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ userId, onClose }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

    useEffect(() => {
        // Fetch analytics data from backend
        fetch(`/api/analytics/${userId}`)
            .then(res => res.json())
            .then(data => setAnalytics(data))
            .catch(err => console.error('Failed to fetch analytics:', err));
    }, [userId]);

    if (!analytics) {
        return (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                <p>Loading your progress...</p>
            </div>
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
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊 Your Progress</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Track your typing journey and celebrate your improvements!
                    </p>
                </div>
                <button className="btn-primary" onClick={onClose} style={{ background: '#666' }}>
                    Close
                </button>
            </div>

            {/* Time Range Selector */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                {(['week', 'month', 'all'] as const).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: timeRange === range ? '2px solid var(--primary-blue)' : '2px solid #ddd',
                            background: timeRange === range ? 'var(--primary-blue)' : 'white',
                            color: timeRange === range ? 'white' : 'var(--text-main)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {range === 'all' ? 'All Time' : `Last ${range}`}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        {analytics.totalLessonsCompleted}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Lessons Completed
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚡</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--secondary-teal)' }}>
                        {analytics.averageWPM}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Average WPM
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
                        {analytics.bestWPM}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Best WPM
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b' }}>
                        {analytics.currentStreak}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Day Streak
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--secondary-teal)' }}>
                        {analytics.averageAccuracy}%
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Average Accuracy
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                        {improvement > 0 ? '📈' : improvement < 0 ? '📉' : '➡️'}
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: improvement > 0 ? 'var(--secondary-teal)' : improvement < 0 ? '#ef4444' : '#6b7280'
                    }}>
                        {improvement > 0 ? '+' : ''}{improvement}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        WPM Improvement
                    </div>
                </div>
            </div>

            {/* WPM Progress Chart */}
            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>WPM Progress Over Time</h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                    height: '300px',
                    padding: '1rem',
                    borderBottom: '2px solid #e5e7eb',
                    borderLeft: '2px solid #e5e7eb'
                }}>
                    {wpmTrend.length > 0 ? wpmTrend.map((entry, index) => {
                        const maxWPM = Math.max(...wpmTrend.map(e => e.wpm));
                        const height = (entry.wpm / maxWPM) * 100;

                        return (
                            <div
                                key={index}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'var(--primary-blue)'
                                }}>
                                    {entry.wpm}
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${height}%`,
                                        background: 'linear-gradient(180deg, var(--primary-blue), var(--secondary-teal))',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.3s ease',
                                        minHeight: '20px'
                                    }}
                                    title={`${entry.date}: ${entry.wpm} WPM`}
                                />
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    transform: 'rotate(-45deg)',
                                    whiteSpace: 'nowrap',
                                    marginTop: '1rem'
                                }}>
                                    {entry.date}
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No data available for this time range
                        </div>
                    )}
                </div>
            </div>

            {/* Weak Keys Analysis */}
            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>🎯 Keys to Practice</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Focus on these keys to improve your accuracy
                </p>
                {weakKeysArray.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {weakKeysArray.map(([key, count]) => {
                            const maxErrors = weakKeysArray[0][1];
                            const percentage = (count / maxErrors) * 100;

                            return (
                                <div key={key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontWeight: '700',
                                            fontSize: '1.2rem',
                                            padding: '4px 12px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            borderRadius: '6px'
                                        }}>
                                            {key}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {count} errors
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '12px',
                                        background: 'rgba(0,0,0,0.05)',
                                        borderRadius: '6px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                        Great job! No significant weak points detected.
                    </p>
                )}
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>📝 Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredHistory.slice(-10).reverse().map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: entry.passed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                borderRadius: '8px',
                                borderLeft: `4px solid ${entry.passed ? 'var(--secondary-teal)' : '#ef4444'}`
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                    {entry.lessonTitle}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {new Date(entry.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                                        {entry.wpm}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WPM</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: entry.passed ? 'var(--secondary-teal)' : '#ef4444' }}>
                                        {entry.accuracy}%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Accuracy</div>
                                </div>
                                <div style={{ fontSize: '1.5rem' }}>
                                    {entry.passed ? '✅' : '❌'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
