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
    const [lockTextVisible, setLockTextVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [voiceProfile, setVoiceProfile] = useState<string>(() => localStorage.getItem('tf_voice_profile') || 'neutral');
    const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => localStorage.getItem('tf_auto_sync') !== 'false');
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [speechCharIndex, setCharacterIndex] = useState(0);
    const [ambiance, setAmbiance] = useState<'none' | 'medical' | 'legal'>(() => (localStorage.getItem('tf_ambiance') as any) || 'none');
    const [showSettings, setShowSettings] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const ambianceRef = useRef<HTMLAudioElement | null>(null);
    const lastSpeakRef = useRef<number>(0);

    // Ambiance Logic
    useEffect(() => {
        if (ambiance !== 'none') {
            const track = ambiance === 'medical' 
                ? 'https://www.soundjay.com/ambient/hospital-ambience-01.mp3' // Placeholder
                : 'https://www.soundjay.com/ambient/office-ambience-01.mp3';
            
            const audio = new Audio(track);
            audio.loop = true;
            audio.volume = 0.1;
            ambianceRef.current = audio;
            if (isPlaying) audio.play().catch(() => {});
        } else {
            if (ambianceRef.current) ambianceRef.current.pause();
            ambianceRef.current = null;
        }

        return () => {
            if (ambianceRef.current) ambianceRef.current.pause();
        };
    }, [ambiance]);

    useEffect(() => {
        if (isPlaying && ambianceRef.current) {
            ambianceRef.current.play().catch(() => {});
        } else if (ambianceRef.current) {
            ambianceRef.current.pause();
        }
    }, [isPlaying]);

    // Initialize audio
    useEffect(() => {
        const updateAudioSource = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            let source = '';
            if (voiceProfile === 'neutral' && drillId) {
                source = `/audio/drills/${drillId}.mp3`;
            } else if (voiceProfile !== 'neutral') {
                source = `/api/tts?voice=${voiceProfile}&text=${encodeURIComponent(text)}`;
            }

            if (source) {
                const audio = new Audio(source);
                audio.playbackRate = currentSpeed;
                audio.onended = () => setIsPlaying(false);
                audio.ontimeupdate = () => setAudioCurrentTime(audio.currentTime);
                audio.onloadedmetadata = () => setAudioDuration(audio.duration);
                audioRef.current = audio;
                
                // If it was playing, resume playing the new voice
                if (isPlaying) {
                    audio.play().catch(e => console.error("Audio switch failed", e));
                }
            }
        };

        updateAudioSource();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [drillId, voiceProfile, text]); // Re-run when voice changes

    // Persist settings
    useEffect(() => {
        localStorage.setItem('tf_voice_profile', voiceProfile);
    }, [voiceProfile]);

    useEffect(() => {
        localStorage.setItem('tf_auto_sync', autoSyncEnabled.toString());
    }, [autoSyncEnabled]);

    useEffect(() => {
        localStorage.setItem('tf_ambiance', ambiance);
    }, [ambiance]);

    // Sync with isStarted
    useEffect(() => {
        if (isStarted) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
        }
    }, [isStarted]);

    // Handle play/pause based on isPlaying
    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback failed", e));
        } else if (!isPlaying && audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, voiceProfile, text]);

    // Progress Tracking logic moved to linear meter component for cleaner state logic
    const currentProgressChar = audioDuration > 0 
        ? (audioCurrentTime / audioDuration) * text.length 
        : 0;

    const handleRewind = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
            setAudioCurrentTime(audioRef.current.currentTime);
        }
    };

    // Human-Sync Logic: Auto-pause if falling behind
    useEffect(() => {
        if (!isPlaying || !autoSyncEnabled || !audioRef.current || audioDuration === 0) return;

        const interval = setInterval(() => {
            if (!audioRef.current) return;
            
            const audioProgressChar = (audioRef.current.currentTime / audioDuration) * text.length;
            const userProgressChar = userInput.length;
            const gap = audioProgressChar - userProgressChar;

            // Sensitivity threshold (chars)
            const pauseThreshold = 25; 
            const resumeThreshold = 5;

            if (gap > pauseThreshold && !audioRef.current.paused) {
                audioRef.current.pause();
            } else if (gap < resumeThreshold && audioRef.current.paused) {
                audioRef.current.play().catch(() => {});
            }
        }, 300);

        return () => clearInterval(interval);
    }, [isPlaying, autoSyncEnabled, userInput.length, audioDuration, text.length]);

    // Handle keyboard shortcut (Ctrl + Enter, Ctrl + Left, Ctrl + Up, Ctrl + Down)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    setIsPlaying(prev => !prev);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        setIsPlaying(true);
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const speeds = [0.5, 0.75, 1, 1.25];
                    const currentIndex = speeds.indexOf(currentSpeed);
                    if (currentIndex < speeds.length - 1) {
                        onSpeedChange(speeds[currentIndex + 1]);
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const speeds = [0.5, 0.75, 1, 1.25];
                    const currentIndex = speeds.indexOf(currentSpeed);
                    if (currentIndex > 0) {
                        onSpeedChange(speeds[currentIndex - 1]);
                    }
                } else if (e.key === 'j' || e.key === 'J') {
                    e.preventDefault();
                    handleRewind();
                } else if (e.key === 'v' || e.key === 'V') {
                    e.preventDefault();
                    setLockTextVisible(prev => !prev);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSpeed, onSpeedChange]);

    // Handle speed changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = currentSpeed;
        }
    }, [currentSpeed]);

    return (
        <div className="relative">
            {/* Unified Command Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-5 bg-slate-900/40 rounded-xl border border-white/5 backdrop-blur-sm mb-2.5">
                <div className="flex items-center gap-2.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Speed</span>
                    <div className="flex bg-black/20 p-0.5 rounded-lg border border-white/5">
                        {[0.5, 0.75, 1, 1.25].map(s => (
                            <button
                                key={s}
                                onClick={() => onSpeedChange(s)}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${currentSpeed === s ? 'bg-indigo-500 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleRewind}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95"
                        title="Rewind 5s (CTRL + J)"
                    >
                        <span>⏪</span> -5s
                    </button>

                    <button
                        onClick={() => setIsPlaying(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${isPlaying ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}
                    >
                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>

                    <button
                        onClick={() => setShowSettings(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${showSettings ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                        title="Studio Settings"
                    >
                        <span>⚙️</span>
                    </button>
                </div>
            </div>

            {/* Studio Settings Panel (Absolute Overlay) */}
            <div className="relative">
                {showSettings && (
                    <div className="absolute top-0 inset-x-0 z-[60] p-6 bg-slate-900 border border-white/20 rounded-3xl shadow-2xl animate-in slide-in-from-top-4 duration-300 backdrop-blur-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Auto-Sync Toggle */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h6 className="text-[10px] font-black uppercase tracking-widest text-white/50">Human-Sync Engine</h6>
                                    <button 
                                        onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${autoSyncEnabled ? 'bg-green-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoSyncEnabled ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic">
                                    Automatically pauses audio if you fall behind or stop typing. Resumes when you catch up.
                                </p>
                            </div>

                            {/* Ambiance Selector */}
                            <div className="space-y-3">
                                <h6 className="text-[10px] font-black uppercase tracking-widest text-white/50">Acoustic Atmosphere</h6>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'none', label: 'Silence', icon: '🔇' },
                                        { id: 'medical', label: 'Medical Clinic', icon: '🏥' },
                                        { id: 'legal', label: 'Quiet Office', icon: '🏢' }
                                    ].map(a => (
                                        <button
                                            key={a.id}
                                            onClick={() => setAmbiance(a.id as any)}
                                            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${ambiance === a.id ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}
                                        >
                                            <span className="text-sm">{a.icon}</span>
                                            <span className="text-[8px] font-black uppercase">{a.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Voice Selection */}
            <div className="space-y-3 mb-3 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 italic">Personnel Roster</span>
                    <div className="flex items-center gap-3">
                        <button 
                            onMouseDown={() => setShowPeek(true)}
                            onMouseUp={() => setShowPeek(false)}
                            onMouseLeave={() => setShowPeek(false)}
                            className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all select-none"
                        >
                            <span>👁️</span> Peek
                        </button>
                        <button 
                            onClick={() => setVoiceProfile('neutral')}
                            className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${voiceProfile === 'neutral' ? 'bg-indigo-500 text-white' : 'text-white/30 border border-white/5'}`}
                        >
                            Original
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Men */}
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { id: 'christopher', label: 'Chris', icon: '👨' },
                            { id: 'guy', label: 'Guy', icon: '🧔' },
                            { id: 'eric', label: 'Eric', icon: '🤵' },
                            { id: 'roger', label: 'Roger', icon: '👱' },
                            { id: 'steffan', label: 'Stef', icon: '👴' },
                            { id: 'ryan', label: 'Ryan', icon: '🕵️' }
                        ].map(v => (
                            <button
                                key={v.id}
                                onClick={() => setVoiceProfile(v.id)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold transition-all active:scale-95 ${voiceProfile === v.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`}
                                title={v.label}
                            >
                                <span>{v.icon}</span> {v.label}
                            </button>
                        ))}
                    </div>

                    {/* Women */}
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { id: 'jenny', label: 'Jen', icon: '👩' },
                            { id: 'aria', label: 'Aria', icon: '👧' },
                            { id: 'michelle', label: 'Mich', icon: '👩‍💼' },
                            { id: 'emma', label: 'Emma', icon: '👩‍🎨' },
                            { id: 'sonia', label: 'Sonia', icon: '💃' },
                            { id: 'natasha', label: 'Nat', icon: '🏄' }
                        ].map(v => (
                            <button
                                key={v.id}
                                onClick={() => setVoiceProfile(v.id)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold transition-all active:scale-95 ${voiceProfile === v.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`}
                                title={v.label}
                            >
                                <span>{v.icon}</span> {v.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ghost Text Area (Compacted) */}
            <div className="relative mb-3 overflow-hidden rounded-2xl bg-slate-900 shadow-xl border-2 border-slate-800 min-h-[160px] flex flex-col">
                {/* Visual Audio Waves (Animated) */}
                {isPlaying && !showPeek && (
                    <div className="absolute inset-x-0 bottom-0 h-32 flex items-end justify-center gap-1.5 pb-10 opacity-30 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-primary rounded-full animate-audio-bar"
                                style={{
                                    height: `${20 + Math.random() * 60}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: `${0.5 + Math.random()}s`
                                }}
                            ></div>
                        ))}
                    </div>
                )}

                {/* Dual-Track Liner Progress Meter */}
                <div className="h-2 w-full bg-white/5 relative overflow-hidden">
                    {/* Character Progress (Typing) */}
                    <div 
                        className="absolute top-0 left-0 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 z-10"
                        style={{ width: `${(userInput.length / text.length) * 100}%` }}
                    ></div>
                    {/* Audio Progress */}
                    <div 
                        className="absolute top-0 left-0 h-full bg-white opacity-20 transition-all duration-300 z-0"
                        style={{ width: `${(audioCurrentTime / audioDuration) * 100}%` }}
                    ></div>
                </div>

                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-6">
                    {(showPeek || lockTextVisible) ? (
                        <p className="text-xl font-mono text-white leading-relaxed max-w-2xl animate-in fade-in duration-200 text-center">
                            {text}
                        </p>
                    ) : userInput.length > 0 ? (
                        <div className="w-full text-left">
                            <p className="text-lg font-mono text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                                {userInput}<span className="inline-block w-1.5 h-5 bg-primary animate-pulse align-middle ml-1"></span>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 text-center">
                            <div className={`text-4xl mb-2 transition-transform duration-500 ${isStarted ? 'scale-110' : 'scale-100'}`}>
                                {isStarted ? '🎙️' : '🎧'}
                            </div>
                            <h4 className="text-white font-black text-xl tracking-tighter uppercase italic">
                                {isPlaying ? 'Playing Live Audio...' : 'Audio Ready to Play'}
                            </h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
                                {isStarted ? 'Listen closely and capture the sequence' : 'Press CTRL + ENTER to play audio'}
                                <br />
                                <span className="text-[9px] text-slate-500 mt-1 block">CTRL+J to jump back • CTRL+← to restart</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Indicators in Area Foot */}
                <div className="relative z-20 px-6 py-3 flex justify-between items-center bg-black/20 border-t border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                        Words: {userInput.split(' ').length} / {text.split(' ').length}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">
                        {Math.round((userInput.length / text.length) * 100)}% Mastered
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DictationEngine;
