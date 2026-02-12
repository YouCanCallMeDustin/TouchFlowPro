import { motion } from 'framer-motion';
import { type RacerState } from '../engine/types';
import { useEffect, useRef } from 'react';

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
            {/* Layer 3: Deep Space (Slowest) - Fades in */}
            <div
                className="absolute inset-0 bg-[url('/assets/bg_space.png')] bg-cover bg-center transition-opacity duration-1000"
                style={{
                    transform: `translateY(${progress * 2}px)`,
                    opacity: Math.max(0, (progress - 20) / 40) // Fade in starting at 20%
                }}
            />

            {/* Layer 2: Stars/Atmosphere (Mid) - Additional parallax depth */}
            <div
                className="absolute inset-0"
                style={{ transform: `translateY(${progress * 5}px)` }}
            >
                {/* Random Stars for extra depth */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100 - 100}%`
                        }}
                    />
                ))}
            </div>

            {/* Layer 1: Ground/Clouds (Fastest) - Fades out */}
            <div
                className="absolute inset-x-0 bottom-0 h-[150vh] transition-transform duration-100 ease-linear bg-[url('/assets/bg_launch.png')] bg-cover bg-bottom"
                style={{
                    transform: `translateY(${progress * 15}px)`,
                    opacity: Math.max(0, 1 - (progress / 40)) // Fade out by 40%
                }}
            >
            </div>

            {/* Track Lanes */}
            <div className="absolute inset-x-0 top-0 bottom-0 flex justify-around px-4 lg:px-20 pointer-events-none">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="h-full w-[1px] bg-white/5" />
                ))}
            </div>

            {/* Particle Layer (Behind Rockets) */}
            <ParticleSystem racers={racers} />

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
                            <div className={`flex flex-col items-center mb-2 transition-opacity duration-300 ${racer.isPlayer ? 'opacity-100' : 'opacity-80'}`}>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border whitespace-nowrap mb-1 ${racer.isPlayer
                                    ? 'bg-white text-blue-700 border-blue-600'
                                    : 'bg-white text-slate-700 border-slate-400'
                                    }`}>
                                    {racer.isPlayer ? 'YOU' : racer.name}
                                </span>

                                {/* Altitude */}
                                <span className="text-[9px] font-mono font-bold text-slate-900 bg-white/90 border border-slate-300 px-1.5 rounded-full shadow-sm">
                                    {Math.floor(racer.progress)}%
                                </span>
                            </div>

                            {/* Rocket Sprite */}
                            <div className="relative group">
                                {/* Engine Flame (Core) */}
                                <motion.div
                                    animate={{
                                        height: racer.isBoosting ? [60, 100, 60] : [40, 60, 40],
                                        opacity: [0.6, 0.9, 0.6],
                                        backgroundColor: racer.isBoosting ? ['#a855f7', '#d8b4fe', '#a855f7'] : ['#f97316', '#fb923c', '#f97316']
                                    }}
                                    transition={{ duration: 0.1, repeat: Infinity }}
                                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-6 rounded-full blur-md"
                                />

                                {/* Sprite Sheet Rocket */}
                                <div
                                    className={`relative z-10 transition-transform duration-300 drop-shadow-xl ${racer.isPlayer ? 'w-32 h-40' : 'w-24 h-32'
                                        } ${racer.isBoosting ? 'scale-105' : ''}`}
                                    style={{
                                        backgroundImage: "url('/assets/rockets_row.png')",
                                        backgroundSize: '500% 100%', // 5 cols, 1 row
                                        backgroundPosition: racer.isPlayer
                                            ? '0% 0%' // Blue (1st)
                                            : (() => {
                                                // Map other bots to remaining 4 slots
                                                // Hash the entire ID string to ensure uniqueness
                                                const seed = racer.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                                const hash = (seed % 4) + 1; // 1, 2, 3, 4

                                                switch (hash) {
                                                    case 1: return '25% 0%'; // Red
                                                    case 2: return '50% 0%'; // Green
                                                    case 3: return '75% 0%'; // Yellow
                                                    case 4: return '100% 0%'; // Purple
                                                    default: return '25% 0%';
                                                }
                                            })()
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Particle System implementation
function ParticleSystem({ racers }: { racers: RacerState[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastTimeRef = useRef(0);
    const particlePoolRef = useRef<{ x: number, y: number, vx: number, vy: number, life: number, color: string, size: number }[]>([]);

    useEffect(() => {
        let rafId: number;

        const loop = (time: number) => {
            const dt = (time - lastTimeRef.current) / 1000;
            if (dt > 0.1) {
                lastTimeRef.current = time; // Skip large delta
                rafId = requestAnimationFrame(loop);
                return;
            }
            lastTimeRef.current = time;

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');

            if (canvas && ctx) {
                // Resize if needed
                if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                    canvas.width = canvas.clientWidth;
                    canvas.height = canvas.clientHeight;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Spawn new particles based on racer positions
                racers.forEach((racer, index) => {
                    const laneWidth = canvas.width / 5; // Assuming 5 racers
                    const x = (index + 0.5) * laneWidth;

                    const H = canvas.height;
                    const yFromBottom = (0.15 * H) + (racer.progress / 100) * (0.8 * H);
                    const y = H - yFromBottom + (H * 0.05); // +Offset to overlap engine

                    // Spawn logic
                    if (Math.random() > 0.3) { // High spawn rate for trails
                        particlePoolRef.current.push({
                            x: x + (Math.random() - 0.5) * 10,
                            y: y,
                            vx: (Math.random() - 0.5) * 20,
                            vy: 100 + Math.random() * 200 + (racer.isBoosting ? 300 : 0),
                            life: 0.6 + Math.random() * 0.4,
                            color: racer.isBoosting ? '#a855f7' : '#f97316',
                            size: Math.random() * 4 + 2
                        });
                    }
                });

                // Update and Draw
                for (let i = particlePoolRef.current.length - 1; i >= 0; i--) {
                    const p = particlePoolRef.current[i];
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.life -= dt * 2.0;

                    if (p.life <= 0) {
                        particlePoolRef.current.splice(i, 1);
                    } else {
                        ctx.globalAlpha = p.life;
                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [racers]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
    );
}
