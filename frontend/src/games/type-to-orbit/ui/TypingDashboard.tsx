import { useRef, useEffect } from 'react';
import { Gauge } from 'lucide-react';

interface TypingDashboardProps {
    text: string;
    cursorIndex: number;
    wpm: number;
    fuelEfficiency: number;
    isBoosting: boolean; // Keeping isBoosting for potential other effects or as legacy for now, or remove? 
    // Actually keep isBoosting as prop but maybe it's always false now? 
    // The engine still has isBoosting state, just never sets it to true?
    // Let's keep isBoosting in interface to avoid breaking parent usage yet, but remove boostCharge.
}

export function TypingDashboard({
    text, cursorIndex, wpm, fuelEfficiency, isBoosting
}: TypingDashboardProps) {
    const cursorRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to cursor
    useEffect(() => {
        if (cursorRef.current && containerRef.current) {
            const container = containerRef.current;
            const cursor = cursorRef.current;

            const containerRect = container.getBoundingClientRect();
            const cursorRect = cursor.getBoundingClientRect();

            // Only scroll if cursor is near bottom or top of view
            const bottomThreshold = containerRect.bottom - 40;
            const topThreshold = containerRect.top + 40;

            if (cursorRect.bottom > bottomThreshold || cursorRect.top < topThreshold) {
                cursor.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [cursorIndex]);

    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            {/* 3-Panel Cockpit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">

                {/* LEFT: System Check (Expanded) */}
                <div className="md:col-span-3 bg-slate-900/80 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg flex flex-col justify-between h-40">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <Gauge size={14} /> Systems
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-500 font-mono">VELOCITY</span>
                            <span className="text-2xl font-black text-blue-400 font-heading">{wpm} WPM</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-500 font-mono">STABILITY</span>
                            <span className={`text-xl font-bold font-mono ${fuelEfficiency > 90 ? 'text-green-400' : 'text-yellow-500'}`}>
                                {Math.floor(fuelEfficiency)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* CENTER: Main Display (Expanded) */}
                <div className={`md:col-span-9 bg-black/80 backdrop-blur-xl rounded-2xl p-6 border-2 shadow-2xl relative overflow-hidden flex flex-col h-40 transition-colors duration-300 ${isBoosting ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-blue-500/30'
                    }`}>
                    {/* Scanlines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

                    <div
                        ref={containerRef}
                        className="font-mono text-xl leading-relaxed z-20 relative w-full h-full overflow-y-auto pr-2 text-left scrollbar-hide whitespace-pre-wrap break-normal"
                    >
                        {/* 
                           We map the text into words to ensure they stay together. 
                           We track a global character index to match against `cursorIndex`.
                        */}
                        {(() => {
                            const elements = [];
                            let globalIdx = 0;
                            // Split by spaces but preserve them as tokens to be rendered
                            const tokens = text.split(/(\s+)/);

                            for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
                                const token = tokens[tIdx];
                                const isSpace = /^\s+$/.test(token);

                                // For words, we wrap in an inline-block to prevent splitting.
                                // For spaces, we just render them (they allow breaking).

                                const charElements = token.split('').map((char, localIdx) => {
                                    const currentGlobal = globalIdx + localIdx;
                                    let status = 'future';
                                    if (currentGlobal < cursorIndex) status = 'done';
                                    if (currentGlobal === cursorIndex) status = 'current';

                                    const isCursor = status === 'current';

                                    return (
                                        <span
                                            key={currentGlobal}
                                            ref={isCursor ? cursorRef : null}
                                            className={`transition-colors duration-100 ${isCursor ? 'inline-block' : 'inline'
                                                } ${status === 'done' ? 'text-slate-600 brightness-75' :
                                                    status === 'current' ? 'bg-blue-500/20 text-blue-100 border-b-2 border-blue-400 rounded-sm' :
                                                        'text-slate-300'
                                                }`}
                                        >
                                            {char}
                                        </span>
                                    );
                                });

                                if (isSpace) {
                                    elements.push(
                                        <span key={`token-${tIdx}`} className="inline">{charElements}</span>
                                    );
                                } else {
                                    // Word: use inline-block to keep together
                                    elements.push(
                                        <span key={`token-${tIdx}`} className="inline-block">{charElements}</span>
                                    );
                                }

                                globalIdx += token.length;
                            }
                            return elements;
                        })()}
                    </div>
                </div>

            </div>
        </div>
    );
}
