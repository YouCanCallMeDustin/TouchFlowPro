// ── Games Landing Page ──

import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';

interface GamesLandingProps {
    onNavigate: (stage: string) => void;
}

export function GamesLanding({ onNavigate }: GamesLandingProps) {
    const games = [
        {
            id: 'accuracy_assassin',
            stage: 'games_accuracy_assassin',
            title: 'Accuracy Assassin',
            subtitle: 'Arcade Mode',
            description: 'Zero-tolerance typing. One mistake and you\'re dead. How far can you streak?',
            icon: Crosshair,
            gradient: 'from-red-500 via-orange-500 to-yellow-500',
            shadow: 'shadow-orange-500/20',
            badge: 'NEW',
        },
        // Future games go here
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl font-heading font-black uppercase tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3"
                >
                    Games
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-text-muted text-sm font-bold uppercase tracking-[0.3em]"
                >
                    Test your skills with typing challenges
                </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game, i) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="card group cursor-pointer hover:border-primary/30 transition-all duration-300"
                            onClick={() => onNavigate(game.stage)}
                        >
                            {/* Badge */}
                            {game.badge && (
                                <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
                                    {game.badge}
                                </span>
                            )}

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-5 shadow-lg ${game.shadow} group-hover:scale-110 transition-transform`}>
                                <game.icon size={28} className="text-white" strokeWidth={2.5} />
                            </div>

                            {/* Content */}
                            <h2 className="text-lg font-heading font-black uppercase tracking-tight text-text-main mb-1">
                                {game.title}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">
                                {game.subtitle}
                            </p>
                            <p className="text-sm text-text-muted leading-relaxed mb-6">
                                {game.description}
                            </p>

                            {/* Play Button */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={`w-full py-3 rounded-xl bg-gradient-to-r ${game.gradient} text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg ${game.shadow} transition-all hover:shadow-xl`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate(game.stage);
                                }}
                            >
                                Play Now
                            </motion.button>
                        </div>
                    </motion.div>
                ))}

                {/* Coming Soon placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card opacity-40 pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h2 className="text-lg font-heading font-black uppercase tracking-tight text-text-muted mb-1">
                            More Games
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-3">
                            Coming Soon
                        </p>
                        <p className="text-sm text-text-muted/50 leading-relaxed">
                            New typing games and challenges are in development.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
