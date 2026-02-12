import React, { useEffect } from 'react';
import { useGameStore } from '../state/store';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { format } from 'date-fns';

export const HighScoreBoard: React.FC = () => {
    const { highScores, loadHighScores } = useGameStore();

    useEffect(() => {
        loadHighScores();
    }, [loadHighScores]);

    if (highScores.length === 0) {
        return (
            <div className="text-center text-slate-500 text-sm py-4">
                No high scores yet. Be the first!
            </div>
        );
    }

    return (
        <div className="w-full max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="text-[10px] uppercase text-slate-500 border-b border-white/5">
                        <th className="pb-2 pl-2">Rank</th>
                        <th className="pb-2">Pilot</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2 text-center">Combo</th>
                        <th className="pb-2 text-right pr-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {highScores.map((entry, index) => (
                        <motion.tr
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                border-b border-white/5 hover:bg-white/5 transition-colors
                                ${index === 0 ? 'text-yellow-400 font-bold' : 'text-slate-300'}
                                ${index === 1 ? 'text-slate-200' : ''}
                                ${index === 2 ? 'text-amber-600' : ''}
                            `}
                        >
                            <td className="py-3 pl-2 flex items-center gap-2">
                                {index === 0 && <Trophy size={14} />}
                                #{index + 1}
                            </td>
                            <td className="py-3 font-bold uppercase tracking-wider text-xs truncate max-w-[100px]">{entry.name}</td>
                            <td className="py-3 font-mono">{entry.score.toLocaleString()}</td>
                            <td className="py-3 text-center text-purple-400">{entry.maxCombo}x</td>
                            <td className="py-3 text-right pr-2 text-slate-500 text-xs text-nowrap">
                                {format(entry.date, 'MMM d, H:mm')}
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
