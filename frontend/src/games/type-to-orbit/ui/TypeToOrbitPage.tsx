import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RaceEngine } from '../engine/raceEngine';
import { type RaceSnapshot } from '../engine/types';
import { soundManager } from '../engine/SoundManager';
import { RaceTrack } from './RaceTrack';
import { TypingDashboard } from './TypingDashboard';
import { Play, RotateCcw, Trophy, Rocket, AlertTriangle, Cpu } from 'lucide-react';
import './type-to-orbit.css';

interface TypeToOrbitPageProps {
    onBack: () => void;
}

export function BurnerBurstPage({ onBack }: TypeToOrbitPageProps) {
    const engineRef = useRef<RaceEngine | null>(null);
    const rafRef = useRef<number>(0);

    const [snapshot, setSnapshot] = useState<RaceSnapshot | null>(null);
    const [eventMessage, setEventMessage] = useState<string | null>(null);

    // Initialize Engine
    useEffect(() => {
        // Initialize if not exists
        if (!engineRef.current) {
            const engine = new RaceEngine('MEDIUM');
            engineRef.current = engine;

            engine.onEvent = (type) => {
                if (type === 'orbit') {
                    setEventMessage('ORBIT ACHIEVED');
                    soundManager.playOrbit();
                } else if (type === 'error') {
                    soundManager.playError();
                } else if (type === 'launch') {
                    soundManager.playLaunch();
                }
            };
        }

        // Initial snapshot
        if (engineRef.current) {
            setSnapshot(engineRef.current.getSnapshot());
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Init audio on first interaction
            soundManager.init();
            soundManager.resume();

            const engine = engineRef.current;
            if (!engine) return;

            if (e.key.length === 1 || e.key === 'Enter') {
                if (e.key === ' ') e.preventDefault();

                // Play typing sound
                soundManager.playType();

                engine.handleInput(e.key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        let lastTime = performance.now();
        const loop = (time: number) => {
            const dt = time - lastTime;
            lastTime = time;

            const engine = engineRef.current;
            if (engine) {
                engine.tick(time, dt);
                setSnapshot(engine.getSnapshot());
            }

            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'>('MEDIUM');

    const handleLobby = () => {
        const engine = new RaceEngine(difficulty);
        engineRef.current = engine;
        setSnapshot(engine.getSnapshot());
        setEventMessage(null);
    };

    const handleStart = () => {
        // Re-init with selected difficulty just in case
        if (snapshot?.phase === 'lobby') {
            const engine = new RaceEngine(difficulty);
            engineRef.current = engine;
            engine.onEvent = (type) => {
                if (type === 'orbit') {
                    setEventMessage('ORBIT ACHIEVED');
                    soundManager.playOrbit();
                } else if (type === 'error') {
                    soundManager.playError();
                } else if (type === 'launch') {
                    soundManager.playLaunch();
                }
            };
            setSnapshot(engine.getSnapshot());
            engine.start();
        } else {
            engineRef.current?.start();
        }
    };

    const handleRestart = () => {
        const engine = new RaceEngine(difficulty);
        engineRef.current = engine;

        // Re-bind event listener
        engine.onEvent = (type) => {
            if (type === 'orbit') {
                setEventMessage('ORBIT ACHIEVED');
                soundManager.playOrbit();
            } else if (type === 'error') {
                soundManager.playError();
            } else if (type === 'launch') {
                soundManager.playLaunch();
            }
        };

        engine.start(); // Auto-start for Re-Launch
        setSnapshot(engine.getSnapshot());
        setEventMessage(null);
    };

    if (!snapshot) return <div className="text-white">Initializing Launch Systems...</div>;

    const player = snapshot.player;

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col font-sans overflow-hidden select-none">

            {/* Cinematic Event Overlay */}
            <AnimatePresence>
                {eventMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 1.2 }}
                        className="absolute top-1/3 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-black/50 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full text-white font-black italic text-2xl uppercase tracking-widest shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            {eventMessage}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top UI: Exit & Status */}
            <div className="absolute top-6 left-6 z-50 flex gap-4">
                <button onClick={onBack} className="bg-black/40 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors backdrop-blur-sm border border-white/5">
                    ← Abort Mission
                </button>
            </div>

            {/* Core Visuals */}
            <div className="absolute inset-0 z-0">
                <RaceTrack racers={snapshot.racers} player={player} />
            </div>

            {/* Countdown Overlay */}
            <div className="absolute top-0 inset-x-0 bottom-0 z-20 flex items-center justify-center pointer-events-none">
                <AnimatePresence>
                    {snapshot.phase === 'countdown' && (
                        <motion.div
                            key={snapshot.countdown} // Key change triggers animation
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            className="text-9xl font-black text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                        >
                            {snapshot.countdown}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom UI Area */}
            <div className="absolute bottom-0 inset-x-0 z-30 pb-8 flex justify-center pointer-events-none">
                <div className="pointer-events-auto w-full max-w-5xl">

                    {/* Lobby Screen */}
                    {snapshot.phase === 'lobby' && (
                        <div className="bg-black/80 backdrop-blur-2xl p-12 rounded-3xl border border-blue-500/20 text-center shadow-2xl max-w-2xl mx-auto">
                            <div className="mb-6 flex justify-center">
                                <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/50">
                                    <Rocket size={48} className="text-blue-400" />
                                </div>
                            </div>
                            <h1 className="text-5xl font-heading font-black text-white italic mb-2 tracking-tight">
                                TYPE<span className="text-blue-500">TO</span>ORBIT
                            </h1>
                            <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs font-bold">
                                Vertical Velocity Training Simulation
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-left max-w-md mx-auto">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-2"><Cpu size={12} /> AI Opponents</div>
                                    <div className="text-sm text-slate-300">
                                        <Chatter difficulty={difficulty} />
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-2"><AlertTriangle size={12} /> Efficiency</div>
                                    <div className="text-sm text-slate-300">Errors reduce your fuel efficiency. Type cleanly!</div>
                                </div>
                            </div>

                            {/* Difficulty Selector */}
                            <div className="bg-white/5 p-2 rounded-xl border border-white/5 max-w-md mx-auto mb-8 flex gap-1">
                                {(['EASY', 'MEDIUM', 'HARD', 'INSANE'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${difficulty === level
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3"
                            >
                                <Play fill="currentColor" size={20} /> Initiate Launch
                            </button>
                        </div>
                    )}

                    {/* Main HUD (Active Race) */}
                    {(snapshot.phase === 'launch' || snapshot.phase === 'orbit') && (
                        <div className="animate-in slide-in-from-bottom duration-700">
                            <TypingDashboard
                                text={engineRef.current?.getText() || ''}
                                cursorIndex={player.cursorIndex}
                                wpm={player.wpm}
                                fuelEfficiency={player.fuelEfficiency}
                                isBoosting={player.isBoosting}
                            />
                        </div>
                    )}

                    {/* Results Screen */}
                    {snapshot.phase === 'orbit' && snapshot.elapsedTime > 3000 && (
                        // Delay showing results so player sees "Orbit Achieved" first
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black/90 backdrop-blur-2xl p-10 rounded-3xl border border-yellow-500/30 text-center shadow-2xl max-w-xl mx-auto mt-4"
                        >
                            <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
                            <h2 className="text-4xl font-heading font-black text-white mb-2">
                                MISSION {player.rank === 1 ? 'SUCCESS' : 'COMPLETE'}
                            </h2>
                            <div className="flex justify-center gap-8 my-6">
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase">Rank</div>
                                    <div className="text-3xl font-black text-white">#{player.rank}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase">Speed</div>
                                    <div className="text-3xl font-black text-blue-400">{player.wpm}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase">Efficiency</div>
                                    <div className="text-3xl font-black text-green-400">{Math.floor(player.fuelEfficiency)}%</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleLobby} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-xs uppercase tracking-widest">
                                    Hangar
                                </button>
                                <button onClick={handleRestart} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                                    <RotateCcw size={14} /> Re-Launch
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Chatter({ difficulty }: { difficulty: string }) {
    const [msg, setMsg] = useState("Initializing communication sub-systems...");

    useEffect(() => {
        const messages = [
            { bot: 'Atlas', text: "Systems nominal. I am ready." },
            { bot: 'Viper', text: "Try to keep up, human." },
            { bot: 'Echo', text: "I learn from your mistakes." },
            { bot: 'Nova', text: "Efficiency is key. Speed is a byproduct." },
            { bot: 'System', text: "Propulsion systems heating up..." },
            { bot: 'System', text: "T-minus 3 minutes to launch window." },
            { bot: 'Viper', text: "My reaction time is 0.02ms. Yours?" },
            { bot: 'Atlas', text: "Slow and steady wins the... oh wait, this is a race." }
        ];

        const interval = setInterval(() => {
            const random = messages[Math.floor(Math.random() * messages.length)];
            setMsg(`${random.bot}: "${random.text}"`);
        }, 4000);

        return () => clearInterval(interval);
    }, [difficulty]);

    return (
        <span className="italic text-slate-400 animate-pulse">
            {msg}
        </span>
    );
}
