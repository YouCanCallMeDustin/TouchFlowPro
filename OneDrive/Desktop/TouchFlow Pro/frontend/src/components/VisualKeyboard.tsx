import React from 'react';

interface VisualKeyboardProps {
    highlightKeys?: string[];
    activeKey?: string;
}

const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ highlightKeys = [], activeKey }) => {
    const rows = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ];

    const isHighlighted = (key: string) => highlightKeys.includes(key.toLowerCase());
    const isActive = (key: string) => activeKey?.toLowerCase() === key.toLowerCase();

    return (
        <div className="flex flex-col gap-2 p-6 bg-slate-900/5 rounded-3xl border border-slate-200/50 backdrop-blur-sm select-none">
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1.5" style={{ paddingLeft: `${rowIndex * 20}px` }}>
                    {row.map((key) => {
                        const highlighted = isHighlighted(key);
                        const active = isActive(key);

                        return (
                            <div
                                key={key}
                                className={`
                                    w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm font-black uppercase transition-all duration-150
                                    ${active
                                        ? 'bg-accent-orange text-slate-900 scale-110 shadow-lg shadow-orange-300 ring-2 ring-white z-20'
                                        : highlighted
                                            ? 'bg-primary-blue text-white shadow-md shadow-blue-100 ring-1 ring-primary-blue/20 z-10'
                                            : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                                    }
                                `}
                            >
                                {key}
                            </div>
                        );
                    })}
                </div>
            ))}
            <div className="flex justify-center mt-2 pl-[60px]">
                <div className={`
                    w-40 sm:w-64 h-10 sm:h-12 rounded-xl flex items-center justify-center text-xs font-bold uppercase transition-all
                    ${isActive(' ')
                        ? 'bg-accent-orange text-slate-900 shadow-lg ring-2 ring-white'
                        : isHighlighted(' ')
                            ? 'bg-primary-blue text-white shadow-md'
                            : 'bg-white text-slate-300 border border-slate-100 shadow-sm'
                    }
                `}>
                    Space
                </div>
            </div>
        </div>
    );
};

export default VisualKeyboard;
