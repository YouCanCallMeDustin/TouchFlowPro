import React, { useState, useEffect, useRef } from 'react';

interface DictationEngineProps {
    text: string;
    onComplete: () => void;
    isActive: boolean;
    speed?: number; // 0.5 to 1.5
    onWordSpoken?: (wordIndex: number) => void;
}

const DictationEngine: React.FC<DictationEngineProps> = ({ text, isActive, speed = 1, onComplete }) => {
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (isActive && !window.speechSynthesis.speaking) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speed;
            utterance.pitch = 1;

            // Try to find a high-quality voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US')) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => onComplete();
            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        }

        return () => {
            window.speechSynthesis.cancel();
        };
    }, [isActive, text, speed, onComplete]);

    return null;
};

interface DictationUIProps {
    text: string;
    isStarted: boolean;
    userInput: string;
    onSpeedChange: (speed: number) => void;
    currentSpeed: number;
    drillId?: string;
}

export const DictationUI: React.FC<DictationUIProps> = ({ text, isStarted, userInput, onSpeedChange, currentSpeed, drillId }) => {
    const [showPeek, setShowPeek] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        if (drillId) {
            const audio = new Audio(`/audio/drills/${drillId}.mp3`);
            audioRef.current = audio;
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [drillId]);

    // Handle play/pause based on isStarted
    useEffect(() => {
        if (isStarted && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        } else if (!isStarted && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [isStarted]);

    // Handle speed changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = currentSpeed;
        }
    }, [currentSpeed]);

    return (
        <div className="relative">
            {/* Speed Control */}
            <div className="flex items-center justify-between mb-6 bg-slate-900/5 p-4 rounded-2xl border border-slate-200/50">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dictation Speed</span>
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                        {[0.5, 0.75, 1, 1.25].map(s => (
                            <button
                                key={s}
                                onClick={() => onSpeedChange(s)}
                                className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${currentSpeed === s ? 'bg-primary-blue text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onMouseDown={() => setShowPeek(true)}
                    onMouseUp={() => setShowPeek(false)}
                    onMouseLeave={() => setShowPeek(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-blue hover:border-primary-blue transition-all shadow-sm active:scale-95 select-none"
                    title="Hold to peek at text"
                >
                    <span>👁️</span> Hold to Peek
                </button>
            </div>

            {/* Ghost Text Area */}
            <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl border-4 border-slate-800 p-10 min-h-[200px] flex items-center justify-center">
                {/* Visual Audio Waves (Animated) */}
                {isStarted && !showPeek && (
                    <div className="absolute inset-x-0 bottom-0 h-32 flex items-end justify-center gap-1.5 pb-10 opacity-30 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-primary-blue rounded-full animate-audio-bar"
                                style={{
                                    height: `${20 + Math.random() * 60}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: `${0.5 + Math.random()}s`
                                }}
                            ></div>
                        ))}
                    </div>
                )}

                <div className="relative z-10 text-center">
                    {showPeek ? (
                        <p className="text-2xl font-mono text-white leading-relaxed max-w-2xl animate-in fade-in duration-200">
                            {text}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className={`text-6xl mb-4 transition-transform duration-500 ${isStarted ? 'scale-110' : 'scale-100'}`}>
                                {isStarted ? '🎙️' : '🎧'}
                            </div>
                            <h4 className="text-white font-black text-2xl tracking-tighter uppercase italic">
                                {isStarted ? 'Transcribing Live Audio...' : 'Audio Ready to Play'}
                            </h4>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
                                {isStarted ? 'Listen closely and capture the sequence' : 'Start typing to begin dictation'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Ring Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-[20px] border-white/5 rounded-full pointer-events-none"></div>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-[20px] border-primary-blue/20 rounded-full pointer-events-none border-t-primary-blue transition-all duration-300"
                    style={{ transform: `translate(-50%, -50%) rotate(${(userInput.length / text.length) * 360}deg)` }}
                ></div>
            </div>
        </div>
    );
};

export default DictationEngine;
