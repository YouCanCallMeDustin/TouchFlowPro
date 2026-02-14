import React from 'react';

interface PlanTimerProps {
    durationSeconds: number;
    onComplete: () => void;
    isActive: boolean;
    onPauseToggle: (paused: boolean) => void;
}

export const PlanTimer: React.FC<PlanTimerProps> = ({ durationSeconds, onComplete: _onComplete, isActive: _isActive, onPauseToggle: _onPauseToggle }) => {
    return (
        <div className="fixed top-4 right-4 bg-slate-900 text-white p-4 rounded-lg z-50">
            Timer: {durationSeconds}s
        </div>
    );
};
