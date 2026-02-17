import React from 'react';
import { motion } from 'framer-motion';
import type { TypingMetrics, EnhancedKeystrokeEvent } from '@shared/types';
import { TypingEngine } from '@shared/typingEngine';

interface SessionInsightsProps {
    metrics: TypingMetrics;
    keystrokes: EnhancedKeystrokeEvent[];
    previousBest?: {
        wpm: number;
        accuracy: number;
    };
    onClose: () => void;
    onContinue?: () => void;
}

export const SessionInsights: React.FC<SessionInsightsProps> = ({
    metrics,
    keystrokes,
    previousBest,
    onClose,
    onContinue
}) => {
    // Calculate additional insights
    const perKeyStats = TypingEngine.getPerKeyStats(keystrokes);
    const troubleKeys = TypingEngine.identifyTroubleKeys(perKeyStats, 85);
    const peakWPM = TypingEngine.calculatePeakWPM(keystrokes.map(k => ({
        keyCode: k.keyCode,
        key: k.key,
        eventType: k.eventType,
        timestamp: k.timestamp
    })));

    // Calculate improvements
    const wpmImprovement = previousBest ? metrics.netWPM - previousBest.wpm : 0;
    const accuracyImprovement = previousBest ? metrics.accuracy - previousBest.accuracy : 0;

    // Calculate XP earned (simple formula)
    const baseXP = Math.floor(metrics.netWPM * 2);
    const accuracyBonus = metrics.accuracy >= 95 ? 50 : metrics.accuracy >= 90 ? 25 : 0;
    const improvementBonus = wpmImprovement > 0 ? Math.floor(wpmImprovement * 5) : 0;
    const totalXP = baseXP + accuracyBonus + improvementBonus;

    // Keys mastered this session (>95% accuracy)
    const masteredKeys = Array.from(perKeyStats.values())
        .filter(stat => stat.accuracy >= 95 && stat.totalAttempts >= 5)
        .map(stat => stat.key);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 max-w-4xl w-full shadow-2xl border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-6xl mb-4"
                    >
                        {metrics.accuracy >= 98 ? '🏆' : metrics.accuracy >= 95 ? '⭐' : metrics.netWPM >= 80 ? '🚀' : '✨'}
                    </motion.div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Session Complete!
                    </h2>
                    <p className="text-gray-400">Here's how you performed</p>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700"
                    >
                        <div className="text-sm text-gray-400 mb-2">Net WPM</div>
                        <div className="text-4xl font-bold text-blue-400">{metrics.netWPM.toFixed(0)}</div>
                        {wpmImprovement !== 0 && (
                            <div className={`text-sm mt-2 ${wpmImprovement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {wpmImprovement > 0 ? '↑' : '↓'} {Math.abs(wpmImprovement).toFixed(1)}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700"
                    >
                        <div className="text-sm text-gray-400 mb-2">Accuracy</div>
                        <div className="text-4xl font-bold text-green-400">{metrics.accuracy.toFixed(1)}%</div>
                        {accuracyImprovement !== 0 && (
                            <div className={`text-sm mt-2 ${accuracyImprovement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {accuracyImprovement > 0 ? '↑' : '↓'} {Math.abs(accuracyImprovement).toFixed(1)}%
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700"
                    >
                        <div className="text-sm text-gray-400 mb-2">Peak WPM</div>
                        <div className="text-4xl font-bold text-purple-400">{peakWPM.toFixed(0)}</div>
                        <div className="text-xs text-gray-500 mt-2">Best burst</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-center"
                    >
                        <div className="text-sm text-yellow-100 mb-2">XP Earned</div>
                        <div className="text-4xl font-bold text-white">+{totalXP}</div>
                        <div className="text-xs text-yellow-200 mt-2">Level up!</div>
                    </motion.div>
                </div>

                {/* Insights Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Keys Mastered */}
                    {masteredKeys.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                        >
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span>🎯</span> Keys Mastered
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {masteredKeys.slice(0, 10).map(key => (
                                    <span
                                        key={key}
                                        className="bg-green-600 text-white px-3 py-1 rounded-lg font-mono font-bold"
                                    >
                                        {key}
                                    </span>
                                ))}
                                {masteredKeys.length > 10 && (
                                    <span className="text-gray-400 px-3 py-1">
                                        +{masteredKeys.length - 10} more
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Trouble Keys */}
                    {troubleKeys.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                        >
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span>⚠️</span> Needs Practice
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {troubleKeys.slice(0, 10).map(key => (
                                    <span
                                        key={key}
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg font-mono font-bold"
                                    >
                                        {key}
                                    </span>
                                ))}
                                {troubleKeys.length > 10 && (
                                    <span className="text-gray-400 px-3 py-1">
                                        +{troubleKeys.length - 10} more
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-800 rounded-2xl border border-gray-700">
                    <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Duration</div>
                        <div className="text-xl font-bold text-white">
                            {Math.floor(metrics.durationMs / 60000)}:{((metrics.durationMs % 60000) / 1000).toFixed(0).padStart(2, '0')}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Characters</div>
                        <div className="text-xl font-bold text-white">{metrics.charsTyped}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Errors</div>
                        <div className="text-xl font-bold text-white">{metrics.errors}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-700 text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all"
                    >
                        Close
                    </button>
                    {onContinue && (
                        <button
                            onClick={onContinue}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                            Continue Practicing
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
