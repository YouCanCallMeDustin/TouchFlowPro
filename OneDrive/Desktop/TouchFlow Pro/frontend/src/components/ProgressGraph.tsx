import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
    date: string;
    wpm?: number;
    accuracy?: number;
    practiceTime?: number;
    [key: string]: string | number | undefined; // Index signature for dynamic access
}

interface ProgressGraphProps {
    userId: string;
    metric: 'wpm' | 'accuracy' | 'practiceTime';
    days?: number;
    title?: string;
}

export const ProgressGraph: React.FC<ProgressGraphProps> = ({
    userId,
    metric,
    days = 30,
    title
}) => {
    const [data, setData] = React.useState<DataPoint[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchTrends();
    }, [userId, days, metric]);

    const fetchTrends = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics/${userId}/trends?days=${days}`);
            if (response.ok) {
                const trendsData = await response.json();
                setData(trendsData);
            }
        } catch (error) {
            console.error('Failed to fetch trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMetricConfig = () => {
        switch (metric) {
            case 'wpm':
                return {
                    dataKey: 'wpm',
                    name: 'WPM',
                    color: '#3B82F6',
                    yAxisLabel: 'Words Per Minute',
                    defaultTitle: 'WPM Progress'
                };
            case 'accuracy':
                return {
                    dataKey: 'accuracy',
                    name: 'Accuracy',
                    color: '#10B981',
                    yAxisLabel: 'Accuracy (%)',
                    defaultTitle: 'Accuracy Progress'
                };
            case 'practiceTime':
                return {
                    dataKey: 'practiceTime',
                    name: 'Practice Time',
                    color: '#F59E0B',
                    yAxisLabel: 'Minutes',
                    defaultTitle: 'Practice Time'
                };
        }
    };

    const config = getMetricConfig();

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {title || config.defaultTitle}
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    No data available yet. Start practicing to see your progress!
                </div>
            </div>
        );
    }

    // Calculate improvement
    const firstValue = (data[0]?.[config.dataKey] as number) || 0;
    const lastValue = (data[data.length - 1]?.[config.dataKey] as number) || 0;
    const improvement = lastValue - firstValue;
    const improvementPercent = firstValue > 0 ? ((improvement / firstValue) * 100).toFixed(1) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {title || config.defaultTitle}
                    </h3>
                    <p className="text-sm text-gray-500">Last {days} days</p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {improvement >= 0 ? '↑' : '↓'} {Math.abs(Number(improvementPercent))}%
                    </div>
                </div>
            </div>

            {/* Graph */}
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="currentColor"
                        className="text-text-muted opacity-40"
                        style={{ fontSize: '10px', fontWeight: '900' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}${metric === 'accuracy' ? '%' : metric === 'wpm' ? ' WPM' : ''}`}
                    />
                    <Tooltip
                        cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                        contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '12px',
                            color: 'var(--text-main)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any) => [`${Number(value || 0).toFixed(1)}${metric === 'accuracy' ? '%' : metric === 'wpm' ? ' WPM' : ''}`, config.name]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey={config.dataKey}
                        stroke={config.color}
                        strokeWidth={3}
                        dot={{ fill: config.color, r: 4 }}
                        activeDot={{ r: 6 }}
                        name={config.name}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Current</div>
                    <div className="text-xl font-bold text-gray-900">
                        {lastValue.toFixed(1)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Average</div>
                    <div className="text-xl font-bold text-gray-900">
                        {(data.reduce((sum, d) => sum + ((d[config.dataKey] as number) || 0), 0) / data.length).toFixed(1)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Best</div>
                    <div className="text-xl font-bold text-gray-900">
                        {Math.max(...data.map(d => (d[config.dataKey] as number) || 0)).toFixed(1)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
