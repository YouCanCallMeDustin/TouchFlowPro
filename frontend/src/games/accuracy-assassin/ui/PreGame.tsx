// ── Accuracy Assassin: Pre-Game Screen ──

import { motion } from 'framer-motion';
import type { DifficultyPreset } from '../engine/types';

interface PreGameProps {
    settings: {
        muted: boolean;
        reduceMotion: boolean;
        difficulty: DifficultyPreset;
        backspaceEnabled: boolean;
    };
    onToggleMute: () => void;
    onToggleReduceMotion: () => void;
    onChangeDifficulty: (d: DifficultyPreset) => void;
    onToggleBackspace: () => void;
    onStart: () => void;
}

export function PreGame({
    settings, onToggleMute, onToggleReduceMotion,
    onChangeDifficulty, onToggleBackspace, onStart,
}: PreGameProps) {
    const difficulties: DifficultyPreset[] = ['easy', 'normal', 'hard'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl mx-auto text-center"
        >
            {/* Title */}
            <div className="mb-8">
                <h1 className="text-5xl sm:text-6xl font-heading font-black uppercase tracking-tighter bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-3">
                    Accuracy Assassin
                </h1>
                <p className="text-text-muted text-sm font-bold uppercase tracking-[0.3em]">
                    Arcade Mode
                </p>
            </div>

            {/* Rules */}
            <div className="card mb-8 text-left">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Rules</h2>
                <ul className="space-y-2 text-sm text-text-main">
                    <li className="flex items-start gap-2">
                        <span className="text-red-400 font-bold mt-0.5">⚡</span>
                        <span>Type the prompted text. <strong className="text-red-400">One wrong character = instant death.</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold mt-0.5">⏱</span>
                        <span>Each round is 15 seconds. Complete the prompt before time runs out.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-400 font-bold mt-0.5">📈</span>
                        <span>Difficulty ramps after each flawless round. How far can you go?</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold mt-0.5">🔄</span>
                        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-xs font-mono font-bold">R</kbd> anytime to restart instantly.</span>
                    </li>
                </ul>
            </div>

            {/* Settings */}
            <div className="card mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Settings</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <ToggleButton
                        label="Mute"
                        active={settings.muted}
                        onClick={onToggleMute}
                        icon={settings.muted ? '🔇' : '🔊'}
                    />
                    <ToggleButton
                        label="Reduce Motion"
                        active={settings.reduceMotion}
                        onClick={onToggleReduceMotion}
                        icon={settings.reduceMotion ? '🚫' : '✨'}
                    />
                    <ToggleButton
                        label="Backspace"
                        active={settings.backspaceEnabled}
                        onClick={onToggleBackspace}
                        icon={settings.backspaceEnabled ? '⌫' : '🚫'}
                    />
                </div>

                {/* Difficulty */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3">Difficulty</p>
                    <div className="flex gap-2 justify-center">
                        {difficulties.map((d) => (
                            <button
                                key={d}
                                onClick={() => onChangeDifficulty(d)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200
                  ${settings.difficulty === d
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                        : 'bg-white/5 border border-white/10 text-text-muted hover:bg-white/10 hover:text-text-main'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Start */}
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStart}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-orange-500/30 transition-all hover:shadow-orange-500/50"
            >
                Start Game
                <span className="block text-[9px] tracking-[0.2em] opacity-70 mt-1">or press ENTER</span>
            </motion.button>
        </motion.div>
    );
}

function ToggleButton({ label, active, onClick, icon }: {
    label: string; active: boolean; onClick: () => void; icon: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-200 border
        ${active
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'}`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    );
}
