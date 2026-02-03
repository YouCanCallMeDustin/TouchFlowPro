import React, { useState, useEffect, useRef } from 'react';
import { TypingEngine } from '@shared/typingEngine';
import type { KeystrokeEvent, TypingMetrics } from '@shared/types';

interface Props {
    text: string;
    onComplete?: (metrics: TypingMetrics, keystrokes: KeystrokeEvent[]) => void;
    suddenDeath?: boolean;
    onSuddenDeathFailure?: () => void;
}

const TypingTest: React.FC<Props> = ({ text, onComplete, suddenDeath, onSuddenDeathFailure }) => {
    const [userInput, setUserInput] = useState('');
    const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
    const [metrics, setMetrics] = useState<TypingMetrics>({
        grossWPM: 0,
        netWPM: 0,
        accuracy: 0,
        charsTyped: 0,
        errors: 0,
        durationMs: 0,
        errorMap: {}
    });
    const [isStarted, setIsStarted] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [liveWPM, setLiveWPM] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const resetTest = () => {
        setUserInput('');
        setKeystrokes([]);
        setMetrics({
            grossWPM: 0,
            netWPM: 0,
            accuracy: 0,
            charsTyped: 0,
            errors: 0,
            durationMs: 0,
            errorMap: {}
        });
        setIsStarted(false);
        setIsFailed(false);
        setLiveWPM(0);
        startTimeRef.current = null;
        inputRef.current?.focus();
    };

    // Calculate live WPM as user types
    useEffect(() => {
        if (isStarted && startTimeRef.current && !isFailed) {
            const interval = setInterval(() => {
                const elapsed = (Date.now() - startTimeRef.current!) / 1000 / 60; // minutes
                if (elapsed > 0) {
                    const words = userInput.length / 5; // Standard: 5 chars = 1 word
                    setLiveWPM(Math.round(words / elapsed));
                }
            }, 100); // Update every 100ms

            return () => clearInterval(interval);
        }
    }, [isStarted, userInput, isFailed]);

    useEffect(() => {
        if (userInput.length === text.length && text.length > 0 && !isFailed) {
            onComplete?.(metrics, keystrokes);
        }
    }, [userInput, text, metrics, keystrokes, onComplete, isFailed]);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isFailed) return;

        if (!isStarted) {
            setIsStarted(true);
            startTimeRef.current = Date.now();
        }

        if (e.key.length === 1 || e.key === 'Backspace') {
            const isCorrect = e.key === text[userInput.length];

            if (suddenDeath && !isCorrect && e.key !== 'Backspace') {
                setIsFailed(true);
                onSuddenDeathFailure?.();
                setTimeout(resetTest, 600);
                return;
            }

            const event: KeystrokeEvent = {
                keyCode: e.code,
                key: e.key,
                eventType: 'keydown',
                timestamp: Date.now()
            };

            const updatedKeystrokes = [...keystrokes, event];
            setKeystrokes(updatedKeystrokes);

            const newMetrics = TypingEngine.calculateMetrics(updatedKeystrokes, text);
            setMetrics(newMetrics);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFailed) return;
        const value = e.target.value;
        if (value.length <= text.length) {
            setUserInput(value);
        }
    };

    // Render text with character-by-character highlighting
    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = 'text-2xl p-[1px] transition-all duration-75 inline-block';

            if (index < userInput.length) {
                // Already typed
                if (userInput[index] === char) {
                    // Correct
                    className += ' text-emerald-700 bg-emerald-50 rounded-sm';
                } else {
                    // Incorrect
                    className += ' text-rose-700 bg-rose-50 underline decoration-rose-400 decoration-wavy underline-offset-4 rounded-sm';
                }
            } else if (index === userInput.length) {
                // Current character
                className += ' bg-accent-orange text-slate-900 font-black rounded-md shadow-lg animate-pulse-fast relative z-10 ring-2 ring-white';
            } else {
                // Not yet typed
                className += ' text-slate-400';
            }

            return (
                <span key={index} className={className}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            );
        });
    };

    return (
        <div className={`relative bg-white/70 backdrop-blur-xl border rounded-[2.5rem] shadow-2xl p-8 sm:p-12 w-full max-w-4xl mx-auto transition-all duration-300 ${isFailed ? 'border-rose-500 ring-4 ring-rose-500/20' : 'border-white/50'}`}>
            {/* Sudden Death Failure Overlay */}
            {isFailed && (
                <div className="absolute inset-0 bg-rose-600/20 backdrop-blur-[2px] rounded-[2.5rem] z-50 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-rose-500 scale-110 animate-in zoom-in-95">
                        <span className="text-rose-600 font-black uppercase tracking-widest text-xl flex items-center gap-3">
                            <span className="animate-pulse">💀</span> PRECISION FAILURE <span className="animate-pulse">💀</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Advanced Metrics Dashboard */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-10 p-6 bg-slate-900/5 rounded-3xl border border-slate-200/50">
                <div className="text-center group">
                    <div className="text-4xl sm:text-5xl font-heading font-black text-primary-blue transition-transform group-hover:scale-110 duration-300">
                        {liveWPM}
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Velocity</div>
                </div>
                <div className="text-center group text-slate-900 border-x border-slate-200">
                    <div className={`text-4xl sm:text-5xl font-heading font-black transition-transform group-hover:scale-110 duration-300 ${metrics.accuracy >= 95 ? 'text-secondary-teal' : 'text-accent-orange'}`}>
                        {metrics.accuracy}%
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Accuracy</div>
                </div>
                <div className="text-center group text-slate-900">
                    <div className="text-4xl sm:text-5xl font-heading font-black opacity-90 transition-transform group-hover:scale-110 duration-300 text-primary-blue">
                        {Math.round((userInput.length / text.length) * 100)}%
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Progression</div>
                </div>
            </div>

            {/* Performance Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full mb-12 overflow-hidden shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-primary-blue via-secondary-teal to-accent-orange transition-all duration-300 ease-out shadow-[0_0_10px_rgba(30,168,168,0.4)]"
                    style={{ width: `${(userInput.length / text.length) * 100}%` }}
                />
            </div>

            <div className="relative mb-10 overflow-hidden group">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-8 px-10 bg-slate-100/50 border border-slate-200 rounded-3xl min-h-[160px] font-mono leading-[3] select-none text-2xl tracking-tight transition-all text-slate-900">
                    {renderText()}
                </div>
            </div>

            {/* Command Interface */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isStarted ? '' : 'Capture the sequence...'}
                    className={`
                        w-full py-6 pr-14 pl-8 text-xl font-mono bg-white border-2 rounded-2xl outline-none transition-all shadow-lg
                        ${isStarted ? 'border-primary-blue shadow-primary-blue/10 ring-8 ring-primary-blue/5' : 'border-slate-200 hover:border-slate-300'}
                    `}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />

                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <div className={`w-3 h-3 rounded-full ${isStarted ? 'bg-secondary-teal animate-ping' : 'bg-slate-300'}`}></div>
                </div>
            </div>

            {/* Tactical Hint */}
            {!isStarted && (
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest animate-bounce-slow">
                    <span>💡 Precision over Velocity</span>
                </div>
            )}
        </div>
    );
};


export default TypingTest;
