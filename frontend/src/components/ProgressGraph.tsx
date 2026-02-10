import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiFetch } from '../utils/api';

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
            const response = await apiFetch(`/api/analytics/${userId}/trends?days=${days}`);
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
            className="card p-8 border border-white/5"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted mb-1">
                        {title || config.defaultTitle}
                    </h3>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Context: Last {days} days</p>
                </div>
                <div className="text-right">
                    <div className="text-right">
                        <div className={`text-3xl font-black italic tracking-tighter ${improvement >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                            {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}
                        </div>
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
                            {improvement >= 0 ? 'Velocity Gain' : 'Velocity Delta'}: {Math.abs(Number(improvementPercent))}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph */}
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 40, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)', letterSpacing: '0.1em' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)', opacity: 0.3 }}
                        tickFormatter={(value) => `${value}${metric === 'accuracy' ? '%' : metric === 'wpm' ? '' : ''}`}
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
                        stroke="var(--primary)"
                        strokeWidth={4}
                        dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 2, stroke: 'var(--bg-card)' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name={config.name}
                        label={{
                            position: 'top',
                            fill: 'var(--text-main)',
                            fontSize: 10,
                            fontWeight: 900,
                            offset: 15,
                            formatter: (val: any) => val > 0 ? val : ''
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-10 pt-10 border-t border-white/5">
                <div className="text-center">
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-40">Current</div>
                    <div className="text-2xl font-black text-text-main italic">
                        {lastValue.toFixed(1)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-40">Average</div>
                    <div className="text-2xl font-black text-text-main italic">
                        {(data.reduce((sum, d) => sum + ((d[config.dataKey] as number) || 0), 0) / data.length).toFixed(1)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-40">Peak</div>
                    <div className="text-2xl font-black text-primary italic">
                        {Math.max(...data.map(d => (d[config.dataKey] as number) || 0)).toFixed(1)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
