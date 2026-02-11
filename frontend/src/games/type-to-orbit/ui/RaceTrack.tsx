import { motion } from 'framer-motion';
import { type RacerState } from '../engine/types';
import { Rocket } from 'lucide-react';

interface RaceTrackProps {
    racers: RacerState[];
    player: RacerState;
}

export function RaceTrack({ racers, player }: RaceTrackProps) {
    // Parallax layers based on player progress
    // 0-30% Ground visible
    // 30-80% Atmosphere/Clouds
    // 80-100% Space

    const progress = player.progress;

    return (
        <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
            {/* Layer 3: Deep Space (Slowest) */}
            <div
                className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60"
                style={{ transform: `translateY(${progress * 2}px)` }}
            />

            {/* Layer 2: Stars/Atmosphere (Mid) */}
            <div
                className="absolute inset-0"
                style={{ transform: `translateY(${progress * 5}px)` }}
            >
                {/* Random Stars */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100 - 100}%` // Start above
                        }}
                    />
                ))}
            </div>

            {/* Layer 1: Ground/Clouds (Fastest) */}
            <div
                className="absolute inset-x-0 bottom-0 h-[150vh] transition-transform duration-100 ease-linear"
                style={{ transform: `translateY(${progress * 15}px)` }}
            >
                {/* Ground */}
                <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-emerald-900 to-emerald-800/80 border-t border-emerald-500/30">
                    <div className="text-emerald-500/20 text-[10vw] font-black absolute bottom-0 left-1/2 -translate-x-1/2 select-none">LAUNCH</div>
                </div>

                {/* Clouds */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white/5 rounded-full blur-3xl"
                        style={{
                            width: `${200 + Math.random() * 300}px`,
                            height: '50px',
                            left: `${Math.random() * 80}%`,
                            bottom: `${40 + Math.random() * 40}%`
                        }}
                    />
                ))}
            </div>

            {/* Track Lanes */}
            <div className="absolute inset-x-0 top-0 bottom-0 flex justify-around px-4 lg:px-20 pointer-events-none">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="h-full w-[1px] bg-white/5" />
                ))}
            </div>

            {/* Racers */}
            <div className="absolute inset-0 px-4 lg:px-20 flex justify-around items-end pb-[15vh]">
                {racers.map((racer) => (
                    <div key={racer.id} className="relative w-full h-[80vh] flex justify-center pointer-events-none">
                        <motion.div
                            className="absolute bottom-0 flex flex-col items-center"
                            initial={{ bottom: '0%' }}
                            animate={{
                                bottom: `${racer.progress}%`,
                                x: Math.sin(Date.now() / 1000 + (racer.rank || 0)) * 2 // Mild hover wobble
                            }}
                            transition={{ ease: 'linear', duration: 0.1 }}
                        >
                            {/* Status Tag */}
                            <div className={`flex flex-col items-center mb-2 transition-opacity duration-300 ${racer.isPlayer ? 'opacity-100' : 'opacity-70'}`}>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-lg backdrop-blur-sm whitespace-nowrap mb-1 ${racer.isPlayer
                                    ? 'bg-blue-600/90 text-white shadow-blue-500/30'
                                    : 'bg-slate-800/80 text-slate-400'
                                    }`}>
                                    {racer.isPlayer ? 'YOU' : racer.name}
                                </span>

                                {/* Altitude / WPM */}
                                <span className="text-[9px] font-mono text-white/60 bg-black/40 px-1 rounded">
                                    {Math.floor(racer.progress)}% ALT
                                </span>
                            </div>

                            {/* Rocket */}
                            <div className="relative group">
                                {/* Engine Flame */}
                                <motion.div
                                    animate={{
                                        height: racer.isBoosting ? [40, 60, 40] : [20, 30, 20],
                                        opacity: [0.6, 0.9, 0.6],
                                        backgroundColor: racer.isBoosting ? ['#a855f7', '#d8b4fe', '#a855f7'] : ['#f97316', '#fb923c', '#f97316']
                                    }}
                                    transition={{ duration: 0.2, repeat: Infinity }}
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 rounded-full blur-md"
                                />

                                <Rocket
                                    size={racer.isPlayer ? 56 : 32}
                                    color={racer.color}
                                    fill={racer.color}
                                    fillOpacity={0.2}
                                    strokeWidth={1.5}
                                    className={`transform -rotate-45 drop-shadow-[0_0_15px_${racer.color}] transition-all duration-300 ${racer.isBoosting ? 'scale-110 drop-shadow-[0_0_25px_#a855f7]' : ''
                                        }`}
                                />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
}
