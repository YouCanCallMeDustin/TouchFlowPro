import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KeyStats {
    key: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    averageSpeed: number;
}

interface ConfusionPair {
    intended: string;
    typed: string;
    count: number;
}

interface ErrorAnalysisProps {
    userId: string;
}

export const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({ userId }) => {
    const [troubleKeys, setTroubleKeys] = useState<KeyStats[]>([]);
    const [confusionPairs, setConfusionPairs] = useState<ConfusionPair[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchErrorData();
    }, [userId]);

    const fetchErrorData = async () => {
        try {
            setLoading(true);

            // Fetch trouble keys
            const troubleResponse = await fetch(`/api/keystroke-tracking/trouble-keys/${userId}`);
            if (troubleResponse.ok) {
                const keys = await troubleResponse.json();
                setTroubleKeys(keys.slice(0, 10)); // Top 10
            }

            // Fetch all key stats to calculate confusion pairs
            const statsResponse = await fetch(`/api/keystroke-tracking/stats/${userId}`);
            if (statsResponse.ok) {
                // For now, we'll show a placeholder for confusion pairs
                // In a real implementation, we'd need to track actual mistyped keys
                setConfusionPairs([]);
            }
        } catch (error) {
            console.error('Failed to fetch error data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    // Prepare data for bar chart
    const chartData = troubleKeys.map(stat => ({
        key: stat.key,
        accuracy: stat.accuracy,
        attempts: stat.totalAttempts
    }));

    return (
        <div className="space-y-6">
            {/* Most Missed Keys */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Most Missed Keys</h3>
                        <p className="text-sm text-gray-500">Keys with lowest accuracy</p>
                    </div>
                    <div className="text-3xl">⚠️</div>
                </div>

                {troubleKeys.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Great job! No trouble keys found. Keep practicing!
                    </div>
                ) : (
                    <>
                        {/* Bar Chart */}
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="key"
                                    stroke="#6B7280"
                                    style={{ fontSize: '14px', fontWeight: 'bold' }}
                                />
                                <YAxis
                                    stroke="#6B7280"
                                    style={{ fontSize: '12px' }}
                                    label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar
                                    dataKey="accuracy"
                                    fill="#EF4444"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Key List */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                            {troubleKeys.map((stat, index) => (
                                <motion.div
                                    key={stat.key}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center"
                                >
                                    <div className="text-3xl font-bold font-mono text-red-600 mb-1">
                                        {stat.key}
                                    </div>
                                    <div className="text-sm text-red-700 font-bold">
                                        {stat.accuracy.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {stat.totalAttempts} attempts
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>

            {/* Targeted Practice Recommendations */}
            {troubleKeys.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200"
                >
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">💡</div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Recommended Practice
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Focus on these keys to improve your overall accuracy:
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {troubleKeys.slice(0, 5).map(stat => (
                                    <span
                                        key={stat.key}
                                        className="bg-white px-4 py-2 rounded-lg font-mono font-bold text-lg border-2 border-blue-300 text-blue-700"
                                    >
                                        {stat.key}
                                    </span>
                                ))}
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <div className="font-bold text-gray-900 mb-2">Practice Tip:</div>
                                <p className="text-sm text-gray-700">
                                    Try typing words that contain these letters repeatedly.
                                    Focus on accuracy over speed. Use the correct finger for each key.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Confusion Pairs (Placeholder) */}
            {confusionPairs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Confusion Pairs</h3>
                            <p className="text-sm text-gray-500">Keys often mistyped for each other</p>
                        </div>
                        <div className="text-3xl">🔄</div>
                    </div>

                    <div className="space-y-3">
                        {confusionPairs.map((pair, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="font-mono font-bold text-2xl text-gray-900">
                                        {pair.intended}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="font-mono font-bold text-2xl text-red-600">
                                        {pair.typed}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {pair.count} times
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
