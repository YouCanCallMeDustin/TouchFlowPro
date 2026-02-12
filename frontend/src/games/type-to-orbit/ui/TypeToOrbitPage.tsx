import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RaceEngine } from '../engine/raceEngine';
import { type RaceSnapshot, type RaceState } from '../engine/types';
import { soundManager } from '../engine/SoundManager';
import { RaceTrack } from './RaceTrack';
import { TypingDashboard } from './TypingDashboard';
import { Play, RotateCcw, Trophy, Rocket, AlertTriangle, Cpu } from 'lucide-react';
import './type-to-orbit.css';

interface TypeToOrbitPageProps {
    onBack: () => void;
}

function Chatter({ difficulty }: { difficulty: string }) {
    const [msg, setMsg] = useState("Initializing communication sub-systems...");

    useEffect(() => {
        const messages = [
            { bot: "Atlas", text: "My logic processors are running at 99% efficiency." },
            { bot: "Echo", text: "You type like a rusty terminal." },
            { bot: "Nova", text: "I calculate a 0.00% chance of your victory." },
            { bot: "Atlas", text: "Human reaction times are... quaint." },
            { bot: "System", text: "Weather conditions: Optional for orbital insertion." },
            { bot: "Echo", text: "Prepare to eat my exhaust dust." },
            { bot: "Nova", text: "My algorithms predict you will typo." },
        ];
        const interval = setInterval(() => {
            const random = messages[Math.floor(Math.random() * messages.length)];
            setMsg(`${random.bot}: "${random.text}"`);
        }, 4000);
        return () => clearInterval(interval);
    }, [difficulty]);

    return (
        <motion.div
            key={msg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="italic text-slate-400"
        >
            {msg}
        </motion.div>
    );
}

export function BurnerBurstPage({ onBack }: TypeToOrbitPageProps) {
    const engineRef = useRef<RaceEngine | null>(null);
    const rafRef = useRef<number>(0);

    const [snapshot, setSnapshot] = useState<RaceSnapshot | null>(null);
    const [eventMessage, setEventMessage] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'>('MEDIUM');

    // Shake State
    const [shake, setShake] = useState({ x: 0, y: 0 });
    const triggerShake = (intensity: number = 5) => {
        const x = (Math.random() - 0.5) * intensity;
        const y = (Math.random() - 0.5) * intensity;
        setShake({ x, y });
        setTimeout(() => setShake({ x: 0, y: 0 }), 50);
    };

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
                    triggerShake(8); // Jolt on error
                } else if (type === 'launch') {
                    soundManager.playLaunch();
                    // Launch Shake Sequence
                    let count = 0;
                    const interval = setInterval(() => {
                        triggerShake(12);
                        count++;
                        if (count > 20) clearInterval(interval);
                    }, 50);
                } else if (type === 'boost_start') {
                    triggerShake(4);
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

            // Get FRESH snapshot directly from engine to avoid stale closure
            const snap = engine.getSnapshot();

            // Restart Logic (Enter on Results Screen)
            // We allow restart if we are in orbit and a short delay has passed (e.g. 500ms)
            // The renderer controls the visual appearance, but we control the logic here.
            if (snap.phase === 'orbit' && snap.endTime) {
                const timeSinceFinish = performance.now() - snap.endTime;
                if (timeSinceFinish > 500 && e.key === 'Enter') {
                    handleLobby();
                    return;
                }
            }

            if (e.key.length === 1 || e.key === 'Enter') {
                if (e.key === ' ') e.preventDefault();
                engine.handleInput(e.key);
                // Sound is handled by engine events or we can do it here for regular typing
                soundManager.playType();
            } else if (e.key === 'Backspace') {
                engine.handleInput('Backspace');
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

                // Continuous shake if boosting
                const snap = engine.getSnapshot();
                if (snap.player.isBoosting) {
                    // Randomly shake every few frames? Or just rely on CSS vibration?
                    // Let's do JS shake for "Game Juice"
                    if (Math.random() > 0.5) triggerShake(3);
                }
            }

            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const handleLobby = () => {
        const engine = engineRef.current;
        if (engine) {
            engine.setDifficulty(difficulty); // Ensure difficulty is set
            engine.resetRace();
            setSnapshot(engine.getSnapshot());
            setEventMessage(null);
        }
    };

    const handleStart = () => {
        const engine = engineRef.current;
        if (engine && snapshot?.phase === 'lobby') {
            engine.setDifficulty(difficulty);
            engine.resetRace(); // Reset to pick new text
            engine.startRace(); // Uses internal random text
        }
    };

    // Manual Input Handler (passed to Dashboard)
    const handleManualInput = (char: string) => {
        // This is primarily for the visual keyboard or if Dashboard assumes control
        // But we have a global listener. 
        // We can just trigger sound here if needed.
    };

    if (!snapshot) return <div className="text-white">Initializing Launch Systems...</div>;

    const player = snapshot.player;

    return (
        <motion.div
            className="fixed inset-0 bg-slate-950 flex flex-col font-sans overflow-hidden select-none"
            animate={{ x: shake.x, y: shake.y }}
            transition={{ type: 'tween', duration: 0.05 }}
        >

            {/* Cinematic Event Overlay */}
            <AnimatePresence>
                {eventMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 1.2 }}
                        className="absolute top-1/3 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-black/60 backdrop-blur-md px-12 py-6 rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest drop-shadow-lg">
                                {eventMessage}
                            </h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg backdrop-blur-sm transition-all border border-white/10 group"
                >
                    <RotateCcw size={16} className="group-hover:-rotate-90 transition-transform" />
                    <span className="text-sm font-bold tracking-wider">ABORT</span>
                </button>
            </div>

            {/* Game World Layer */}
            <RaceTrack racers={snapshot.racers} player={player} />

            {/* UI Overlay Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">

                {/* Lobby Screen */}
                {snapshot.phase === 'lobby' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
                        <div className="max-w-2xl w-full mx-4 text-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mb-12"
                            >
                                <h1 className="text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                    TYPE<span className="text-blue-500">TO</span>ORBIT
                                </h1>
                                <p className="text-blue-200 tracking-[0.5em] text-sm mt-4 font-bold uppercase opacity-80">
                                    Vertical Velocity Training Simulation
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-2"><Cpu size={12} /> AI Opponents</div>
                                    <Chatter difficulty={difficulty} />
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
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${difficulty === level
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                            : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
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
                    </div>
                )}

                {/* Countdown Screen */}
                {snapshot.phase === 'countdown' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <motion.div
                            key={snapshot.countdown}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            className="text-9xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,1)] stroke-black"
                            style={{ WebkitTextStroke: '4px black' }}
                        >
                            {snapshot.countdown > 0 ? snapshot.countdown : 'GO!'}
                        </motion.div>
                    </div>
                )}

                {/* Main HUD (Active Race) */}
                {(snapshot.phase === 'launch' || snapshot.phase === 'orbit') && (
                    <div className="absolute bottom-6 inset-x-0 z-50 animate-in slide-in-from-bottom duration-700 pointer-events-auto">
                        <TypingDashboard
                            text={engineRef.current?.getText() || ''}
                            cursorIndex={snapshot.player.cursorIndex}
                            wpm={snapshot.player.wpm}
                            fuelEfficiency={snapshot.player.fuelEfficiency}
                            isBoosting={snapshot.player.isBoosting}
                            // onInput={handleManualInput} 
                            onError={() => triggerShake(8)}
                        />
                    </div>
                )}

                {/* Results Screen */}
                {snapshot.phase === 'orbit' && (!snapshot.endTime || (performance.now() - snapshot.endTime > 500)) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto"
                    >
                        <div className="bg-slate-900 border border-white/10 p-12 rounded-3xl text-center max-w-2xl w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]" />

                            <h2 className="text-5xl font-black text-white italic mb-2">MISSION COMPLETE</h2>
                            <p className="text-slate-400 mb-12 uppercase tracking-widest font-bold">Orbital Insertion Successful</p>

                            <div className="grid grid-cols-3 gap-8 mb-12">
                                <div>
                                    <div className="text-4xl font-black text-white mb-2">{Math.floor(snapshot.player.wpm)}</div>
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">WPM</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-blue-400 mb-2">{snapshot.player.accuracy}%</div>
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Accuracy</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-purple-400 mb-2">
                                        {((snapshot.endTime! - snapshot.startTime) / 1000).toFixed(1)}s
                                    </div>
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Time</div>
                                </div>
                            </div>

                            <button
                                onClick={handleLobby}
                                className="group px-12 py-4 bg-white text-slate-900 hover:bg-blue-50 font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 shadow-xl flex items-center gap-3 mx-auto relative"
                            >
                                <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
                                <span>Race Again</span>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-bold opacity-60 whitespace-nowrap">
                                    PRESS <span className="border border-slate-500 px-1 rounded">ENTER</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
