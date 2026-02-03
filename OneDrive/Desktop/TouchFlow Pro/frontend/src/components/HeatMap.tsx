import React from 'react';

interface HeatMapProps {
    errorMap: Record<string, number>;
}

const HeatMap: React.FC<HeatMapProps> = ({ errorMap }) => {
    const rows = [
        ['esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'back'],
        ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
        ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
        ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
        ['ctrl', 'win', 'alt', 'space', 'alt', 'win', 'menu', 'ctrl']
    ];

    const maxErrors = Math.max(...Object.values(errorMap), 1);

    const getKeyStyles = (key: string) => {
        const errors = errorMap[key.toLowerCase()] || 0;
        const intensity = errors / maxErrors;

        // Custom widths for specific keys
        let widthClass = 'w-12';
        if (key === 'back' || key === 'tab') widthClass = 'w-20';
        if (key === 'caps') widthClass = 'w-24';
        if (key === 'enter') widthClass = 'w-28';
        if (key === 'shift') widthClass = 'w-32';
        if (key === 'space') widthClass = 'w-[450px]';
        if (key === 'ctrl' || key === 'win' || key === 'alt') widthClass = 'w-16';

        const baseColor = intensity > 0
            ? `hsl(${38 - intensity * 20}, 92%, ${51 + intensity * 10}%)`
            : 'rgb(248 250 252)'; // slate-50

        const shadowColor = intensity > 0
            ? `hsl(${38 - intensity * 20}, 92%, 40%)`
            : 'rgb(203 213 225)'; // slate-300

        return {
            style: {
                backgroundColor: baseColor,
                boxShadow: `0 4px 0 0 ${shadowColor}`,
                color: intensity > 0.6 ? 'white' : 'rgb(15 23 42)' // slate-900
            },
            className: `${widthClass} h-12 m-1 flex items-center justify-center rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-tighter transition-all active:translate-y-1 active:shadow-none pointer-default relative border border-white/20 select-none`
        };
    };

    return (
        <div className="bg-slate-50/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 p-8 sm:p-12 w-full">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-text-main tracking-tight uppercase">Tactical Heatmap</h3>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Peripheral Input Density Analysis</p>
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-white border-2 border-slate-200 shadow-sm"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-accent-orange shadow-lg shadow-orange-200"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-6 sm:p-10 rounded-[3rem] shadow-2xl overflow-x-auto border-t-8 border-slate-700/50">
                <div className="min-w-[800px]">
                    {rows.map((row, i) => (
                        <div key={i} className={`flex ${i === 4 ? 'justify-between' : 'justify-start'}`}>
                            {row.map((key, j) => {
                                const styles = getKeyStyles(key);
                                return (
                                    <div
                                        key={`${i}-${j}`}
                                        className={styles.className}
                                        style={styles.style}
                                    >
                                        {key === 'space' ? (
                                            <div className="w-1/4 h-1 bg-black/10 rounded-full"></div>
                                        ) : key}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900/5 rounded-3xl border border-slate-100 flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">🔬</div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    Visualizing keystroke anomalies. The <span className="text-accent-orange font-black">Orange zones</span> indicate high error frequency. Focus on these keys during specialized drills to optimize neuro-muscular efficiency.
                </p>
            </div>
        </div>
    );
};


export default HeatMap;
