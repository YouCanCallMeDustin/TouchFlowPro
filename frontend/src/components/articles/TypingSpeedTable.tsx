import React from 'react';
import { Card } from '../ui/Card';

interface TypingStat {
    range: string;
    level: string;
    description: string;
    percentile: string;
    careers: string[];
}

const DEFAULT_STATS: TypingStat[] = [
    {
        range: '0 - 20 WPM',
        level: 'Novice',
        description: 'Hunt-and-peck typist. Significant cognitive drag.',
        percentile: 'Bottom 10%',
        careers: ['Non-digital roles']
    },
    {
        range: '21 - 40 WPM',
        level: 'Average',
        description: 'Global average. Sufficient for casual email and browsing.',
        percentile: '50th Percentile',
        careers: ['General Labor', 'Retail']
    },
    {
        range: '41 - 60 WPM',
        level: 'Professional',
        description: 'Efficiency threshold. Smooth enough for most office work.',
        percentile: '75th Percentile',
        careers: ['Admin', 'Management', 'Sales']
    },
    {
        range: '61 - 80 WPM',
        level: 'High Performance',
        description: 'Fluent touch-typing. Minimum for technical data roles.',
        percentile: '90th Percentile',
        careers: ['Developer', 'Writer', 'Analyst']
    },
    {
        range: '81 - 100 WPM',
        level: 'Elite',
        description: 'Zero cognitive drag. Typing at the speed of thought.',
        percentile: '98th Percentile',
        careers: ['Paralegal', 'Transcriptionist', 'Senior Dev']
    },
    {
        range: '100+ WPM',
        level: 'Top 1%',
        description: 'Professional-grade speed. Competitive typist level.',
        percentile: '99th+ Percentile',
        careers: ['Court Reporter', 'Elite Editor']
    }
];

export const TypingSpeedTable: React.FC = () => {
    return (
        <Card className="overflow-hidden border-white/5 bg-white/5 my-8">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted">
                            <th className="px-6 py-4 border-b border-white/5">WPM Range</th>
                            <th className="px-6 py-4 border-b border-white/5">Skill Level</th>
                            <th className="px-6 py-4 border-b border-white/5 hidden md:table-cell">Description</th>
                            <th className="px-6 py-4 border-b border-white/5">Percentile</th>
                            <th className="px-6 py-4 border-b border-white/5 hidden sm:table-cell">Target Careers</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {DEFAULT_STATS.map((stat, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4 font-black text-white group-hover:text-primary transition-colors">
                                    {stat.range}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${
                                        stat.level === 'Elite' || stat.level === 'Top 1%' 
                                        ? 'bg-primary/20 text-primary border border-primary/30' 
                                        : 'bg-white/10 text-white/70'
                                    }`}>
                                        {stat.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs opacity-60 leading-relaxed hidden md:table-cell">
                                    {stat.description}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs opacity-80 italic">
                                    {stat.percentile}
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {stat.careers.map((career, cIdx) => (
                                            <span key={cIdx} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded opacity-40">
                                                {career}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-primary/5 p-4 text-center border-t border-white/5">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-0">
                    Source: Combined Motor Learning & Workplace Efficiency Research (2024)
                </p>
            </div>
        </Card>
    );
};
