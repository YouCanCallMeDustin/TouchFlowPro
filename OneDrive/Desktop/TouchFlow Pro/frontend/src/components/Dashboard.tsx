import React, { useState, useEffect } from 'react';
import type { TypingMetrics } from '@shared/types';
import type { Drill } from '@shared/drillLibrary';

interface DashboardProps {
    metrics: TypingMetrics | null;
    onStartDrill: (drill: Drill) => void;
    onStartAssessment: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, onStartDrill, onStartAssessment }) => {
    const [drills, setDrills] = useState<Drill[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Intermediate' | 'Professional'>('Beginner');

    useEffect(() => {
        // Fetch drills from backend
        fetch(`/api/drills/difficulty/${selectedDifficulty}`)
            .then(res => res.json())
            .then(data => setDrills(data))
            .catch(err => console.error('Failed to fetch drills:', err));
    }, [selectedDifficulty]);

    return (
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Performance Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back. Here is your current typing trajectory.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={onStartAssessment}>New Assessment</button>
                </div>
            </div>

            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '3rem' }}>
                <div className="metric-item">
                    <span className="metric-label">Peak Net Speed</span>
                    <span className="metric-value">{metrics?.netWPM || 0}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--secondary-teal)', fontWeight: '600' }}>WPM</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Global Accuracy</span>
                    <span className="metric-value">{metrics?.accuracy || 0}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-orange)', fontWeight: '600' }}>%</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Total Keystrokes</span>
                    <span className="metric-value" style={{ fontSize: '2rem' }}>{metrics?.charsTyped || 0}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Captures</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Session Rank</span>
                    <span className="metric-value" style={{ fontSize: '2rem' }}>{(metrics?.netWPM || 0) > 80 ? 'Elite' : (metrics?.netWPM || 0) > 40 ? 'Pro' : 'Novice'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tier</span>
                </div>
            </div>

            {/* Drill Selection */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.8rem' }}>Training Drills</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['Beginner', 'Intermediate', 'Professional'] as const).map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedDifficulty(level)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: selectedDifficulty === level ? '2px solid var(--primary-blue)' : '1px solid #ddd',
                                    background: selectedDifficulty === level ? 'var(--primary-blue)' : 'white',
                                    color: selectedDifficulty === level ? 'white' : 'var(--text-main)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {drills.map(drill => (
                        <div
                            key={drill.id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                transition: 'all 0.2s',
                                border: '2px solid transparent',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{drill.title}</h4>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '3px 8px',
                                    background: 'var(--accent-orange)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '700'
                                }}>
                                    {drill.category}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0', lineHeight: '1.4', flex: 1 }}>
                                {drill.description}
                            </p>
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(0,0,0,0.02)',
                                borderRadius: '8px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {drill.content.substring(0, 50)}...
                            </div>
                            <button
                                className="btn-primary"
                                onClick={() => onStartDrill(drill)}
                                style={{ marginTop: '1rem', width: '100%' }}
                            >
                                Begin Drill
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
