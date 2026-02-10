import React, { useState, useEffect } from 'react';
import type { TypingMetrics } from '@shared/types';
import type { Drill } from '@shared/drillLibrary';
import { Card, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { apiFetch } from '../utils/api';
import { StatTile } from './ui/StatTile';
import { SectionTitle } from './ui/SectionTitle';
import { Badge } from './ui/Badge';

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
        apiFetch(`/api/drills/difficulty/${selectedDifficulty}`)
            .then(res => res.json())
            .then(data => setDrills(data))
            .catch(err => console.error('Failed to fetch drills:', err));
    }, [selectedDifficulty]);

    const sessionRank = (metrics?.netWPM || 0) > 80 ? 'Elite' : (metrics?.netWPM || 0) > 40 ? 'Pro' : 'Novice';

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 px-6 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <SectionTitle
                    title="Performance Dashboard"
                    subtitle="Welcome back. Here is your current typing trajectory."
                    className="mb-0"
                />
                <Button onClick={onStartAssessment} size="lg" className="w-full md:w-auto">
                    New Assessment
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatTile
                    label="Peak Net Speed"
                    value={metrics?.netWPM || 0}
                    unit="WPM"
                    color="secondary"
                />
                <StatTile
                    label="Global Accuracy"
                    value={metrics?.accuracy || 0}
                    unit="%"
                    color="accent"
                />
                <StatTile
                    label="Total Keystrokes"
                    value={metrics?.charsTyped || 0}
                    unit="Captures"
                />
                <StatTile
                    label="Session Rank"
                    value={sessionRank}
                    color="primary"
                />
            </div>

            {/* Drills Section */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h3 className="text-2xl font-heading font-bold text-text-main">Training Drills</h3>

                    <div className="flex bg-surface-2 p-1 rounded-xl">
                        {(['Beginner', 'Intermediate', 'Professional'] as const).map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedDifficulty(level)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-semibold transition-all
                                    ${selectedDifficulty === level
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-text-muted hover:text-text-main hover:bg-white/50'}
                                `}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drills.map(drill => (
                        <Card
                            key={drill.id}
                            variant="interactive"
                            className="flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <CardTitle>{drill.title}</CardTitle>
                                <Badge variant="accent">{drill.category}</Badge>
                            </div>

                            <CardDescription className="mb-4 flex-1">
                                {drill.description}
                            </CardDescription>

                            <div className="bg-surface-2/50 rounded-lg p-3 mb-6 font-mono text-xs text-text-muted truncate">
                                {drill.content}
                            </div>

                            <Button
                                variant="secondary"
                                className="w-full mt-auto"
                                onClick={() => onStartDrill(drill)}
                            >
                                Begin Drill
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
