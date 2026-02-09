import React from 'react';
import TypingTest from './TypingTest';
import type { TypingMetrics, KeystrokeEvent } from '@shared/types';

interface Drill {
    id: string;
    title: string;
    content: string;
    difficulty: string;
}

interface DrillPlayerProps {
    drill: Drill;
    onComplete: (metrics: TypingMetrics, keystrokes: KeystrokeEvent[]) => void;
    onCancel: () => void;
}

const DrillPlayer: React.FC<DrillPlayerProps> = ({ drill, onComplete, onCancel }) => {
    return (
        <div style={{ width: '100%', maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Drill: {drill.title} ({drill.difficulty})</h2>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>Cancel</button>
            </div>
            <TypingTest text={drill.content} onComplete={onComplete} />
        </div>
    );
};

export default DrillPlayer;
