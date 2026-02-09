import React from 'react';
import { motion } from 'framer-motion';

interface LiveMetricsBarProps {
    currentWPM: number;
    currentAccuracy: number;
    timeElapsed: number; // in milliseconds
    keystrokesPerMinute: number;
    averageKeyDelay: number; // in milliseconds
}

export const LiveMetricsBar: React.FC<LiveMetricsBarProps> = ({
    currentWPM,
    currentAccuracy,
    timeElapsed,
    keystrokesPerMinute,
    averageKeyDelay
}) => {
    // Format time elapsed
    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Get color based on WPM
    const getWPMColor = (wpm: number): string => {
        if (wpm >= 80) return 'text-green-500';
        if (wpm >= 60) return 'text-blue-500';
        if (wpm >= 40) return 'text-yellow-500';
        return 'text-gray-500';
    };

    // Get color based on accuracy
    const getAccuracyColor = (accuracy: number): string => {
        if (accuracy >= 98) return 'text-green-500';
        if (accuracy >= 95) return 'text-blue-500';
        if (accuracy >= 90) return 'text-yellow-500';
        return 'text-red-500';
    };

    // Get keystroke speed indicator
    const getSpeedIndicator = (): { text: string; color: string } => {
        if (averageKeyDelay < 100) return { text: '🔥 Fast', color: 'text-orange-500' };
        if (averageKeyDelay < 150) return { text: '⚡ Good', color: 'text-green-500' };
        if (averageKeyDelay < 200) return { text: '✓ Steady', color: 'text-blue-500' };
        return { text: '🐢 Slow', color: 'text-gray-500' };
    };

    const speedIndicator = getSpeedIndicator();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700 mb-6"
        >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {/* Current WPM */}
                <div className="text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Current WPM
                    </div>
                    <motion.div
                        key={currentWPM}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className={`text-4xl font-bold ${getWPMColor(currentWPM)}`}
                    >
                        {currentWPM.toFixed(0)}
                    </motion.div>
                </div>

                {/* Accuracy */}
                <div className="text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Accuracy
                    </div>
                    <motion.div
                        key={currentAccuracy}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className={`text-4xl font-bold ${getAccuracyColor(currentAccuracy)}`}
                    >
                        {currentAccuracy.toFixed(0)}%
                    </motion.div>
                </div>

                {/* Time Elapsed */}
                <div className="text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Time
                    </div>
                    <div className="text-4xl font-bold text-purple-500">
                        {formatTime(timeElapsed)}
                    </div>
                </div>

                {/* Keystroke Speed */}
                <div className="text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Speed
                    </div>
                    <div className={`text-2xl font-bold ${speedIndicator.color}`}>
                        {speedIndicator.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {averageKeyDelay.toFixed(0)}ms avg
                    </div>
                </div>

                {/* Keystrokes/Min */}
                <div className="text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Keys/Min
                    </div>
                    <div className="text-4xl font-bold text-cyan-500">
                        {keystrokesPerMinute.toFixed(0)}
                    </div>
                </div>
            </div>

            {/* Progress Bar (optional visual indicator) */}
            <div className="mt-4">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min(currentAccuracy, 100)}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};
