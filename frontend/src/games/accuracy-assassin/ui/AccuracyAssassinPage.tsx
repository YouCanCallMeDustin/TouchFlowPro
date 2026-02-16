// ── Accuracy Assassin: Main Page Orchestrator ──

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';

import { GameEngine } from '../engine/gameEngine';
import { saveRun } from '../engine/analyticsLogger';
import { HUD_UPDATE_INTERVAL_MS } from '../engine/config';
import type { GamePhase, GameSettings, GameSnapshot, RunSummary } from '../engine/types';
import { attachInputHandler } from '../input/inputHandler';
import { SoundManager } from '../audio/soundManager';
import { PromptRenderer } from '../render/PromptRenderer';
import { useGameEffects, getIntensityClass } from '../render/Effects';
import { submitScore } from '../engine/api';
import { PreGame } from './PreGame';
import { HUD } from './HUD';
import { DeathScreen } from './DeathScreen';
import { ResultsScreen } from './ResultsScreen';

interface AccuracyAssassinPageProps {
    onBack: () => void;
}

export function AccuracyAssassinPage({ onBack }: AccuracyAssassinPageProps) {
    // ── Settings (persist in React state — changes are infrequent) ──
    const [settings, setSettings] = useState<GameSettings>({
        muted: false,
        reduceMotion: false,
        difficulty: 'normal',
        backspaceEnabled: false,
    });

    // ── Phase drives which screen is shown ──
    const [phase, setPhase] = useState<GamePhase>('idle');
    const [countdownVal, setCountdownVal] = useState(0);
    const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
    const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showFlawless, setShowFlawless] = useState(false);

    // ── Session Best: tracks the highest-scoring run across retries ──
    const [sessionBest, setSessionBest] = useState<RunSummary | null>(null);
    // Snapshot captured at the moment of death (survives restart)
    const [deathSnapshot, setDeathSnapshot] = useState<GameSnapshot | null>(null);
    const [deathSummary, setDeathSummary] = useState<RunSummary | null>(null);
    const [submissionResult, setSubmissionResult] = useState<{ rank: number; isPersonalBest: boolean } | null>(null);

    // ── Refs (not in React render path) ──
    const engineRef = useRef<GameEngine | null>(null);
    const soundRef = useRef<SoundManager | null>(null);
    const rafRef = useRef<number>(0);
    const inputCleanupRef = useRef<(() => void) | null>(null);

    const { containerRef, overlayRef, triggerDeath } = useGameEffects({
        reduceMotion: settings.reduceMotion,
    });

    // ── Sound Manager ──
    useEffect(() => {
        soundRef.current = new SoundManager(settings.muted);
        return () => soundRef.current?.dispose();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        soundRef.current?.setMuted(settings.muted);
    }, [settings.muted]);

    // ── HUD Update Loop (RAF-based, ~12fps) ──
    const startHUDLoop = useCallback(() => {
        let lastUpdate = 0;

        const tick = (now: number) => {
            if (now - lastUpdate >= HUD_UPDATE_INTERVAL_MS) {
                lastUpdate = now;
                if (engineRef.current) {
                    setSnapshot(engineRef.current.getSnapshot());
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    }, []);

    const stopHUDLoop = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        }
    }, []);

    // ── Update session best if current run beats it ──
    const updateSessionBest = useCallback((summary: RunSummary) => {
        setSessionBest(prev => {
            if (!prev || summary.score > prev.score) {
                return summary;
            }
            return prev;
        });
    }, []);

    // ── Engine Lifecycle ──
    const createEngine = useCallback(() => {
        // Clean up previous
        inputCleanupRef.current?.();
        engineRef.current?.cleanup();
        stopHUDLoop();

        const engine = new GameEngine(settings);
        engineRef.current = engine;

        engine.setCallbacks({
            onPhaseChange: (p: GamePhase) => {
                setPhase(p);

                if (p === 'playing') {
                    startHUDLoop();
                } else if (p === 'dead') {
                    stopHUDLoop();
                    // Capture death data immediately (before any restart can wipe it)
                    const snap = engine.getSnapshot();
                    const summary = engine.getRunSummary();
                    setSnapshot(snap);
                    setDeathSnapshot(snap);
                    setDeathSummary(summary);
                    // Update session best
                    updateSessionBest(summary);
                    // Save analytics
                    saveRun(summary, engine.getKeystrokeLogs());
                    // ── WIRE TO BACKED LEADERBOARD ──
                    submitScore(summary).then(res => {
                        if (res.success) {
                            setSubmissionResult({ rank: res.rank!, isPersonalBest: !!res.isPersonalBest });
                        }
                    });
                    // Effects
                    triggerDeath();
                    soundRef.current?.play('death');
                    soundRef.current?.playNoiseBurst();
                } else if (p === 'results') {
                    // Show the session best run on the results screen
                    const current = engine.getRunSummary();
                    const best = sessionBest && sessionBest.score > current.score
                        ? sessionBest : current;
                    setRunSummary(best);
                }
            },
            onDeath: () => {
                // Additional death effects handled in onPhaseChange
            },
            onRoundClear: () => {
                soundRef.current?.play('roundClear');
                // Flawless callout + confetti
                setShowFlawless(true);
                if (!settings.reduceMotion) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 2000);
                }
                setTimeout(() => setShowFlawless(false), 1200);
                // Update snapshot to show new streak
                setSnapshot(engine.getSnapshot());
            },
            onCountdownTick: (val: number) => {
                if (val === 3) setSubmissionResult(null); // Reset on start
                setCountdownVal(val);
                soundRef.current?.play(val > 0 ? 'countdown' : 'go');
            },
        });

        return engine;
    }, [settings, startHUDLoop, stopHUDLoop, triggerDeath, updateSessionBest, sessionBest]);

    const handleStart = useCallback(() => {
        const engine = createEngine();
        // Attach input handler
        inputCleanupRef.current = attachInputHandler({
            engine,
            onRestart: () => {
                const newEngine = createEngine();
                inputCleanupRef.current?.();
                inputCleanupRef.current = attachInputHandler({
                    engine: newEngine,
                    onRestart: () => handleStart(),
                    onStartRequest: () => handleStart(),
                    onContinueToResults: () => newEngine.goToResults(),
                });
                newEngine.start();
            },
            onStartRequest: () => handleStart(),
            onContinueToResults: () => engine.goToResults(),
        });
        engine.start();
    }, [createEngine]);

    const handleRestart = useCallback(() => {
        handleStart();
    }, [handleStart]);

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            inputCleanupRef.current?.();
            engineRef.current?.cleanup();
            stopHUDLoop();
        };
    }, [stopHUDLoop]);

    // ── Settings Handlers ──
    const toggleMute = () => {
        setSettings(s => {
            const next = { ...s, muted: !s.muted };
            toast(next.muted ? '🔇 Sound muted' : '🔊 Sound enabled', { duration: 1500 });
            return next;
        });
    };

    const toggleReduceMotion = () => {
        setSettings(s => {
            const next = { ...s, reduceMotion: !s.reduceMotion };
            toast(next.reduceMotion ? '🚫 Reduce Motion enabled' : '✨ Animations enabled', { duration: 1500 });
            return next;
        });
    };

    const toggleBackspace = () => {
        setSettings(s => ({ ...s, backspaceEnabled: !s.backspaceEnabled }));
    };

    // ── Render ──
    const intensityClass = snapshot ? getIntensityClass(snapshot.streak) : '';

    return (
        <div
            ref={containerRef}
            className={`w-full min-h-[60vh] flex flex-col items-center justify-center relative ${intensityClass}`}
        >
            {/* Effect overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 pointer-events-none z-50"
                style={{ opacity: 0 }}
            />

            {/* Confetti */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    numberOfPieces={80}
                    recycle={false}
                    gravity={0.3}
                    style={{ position: 'fixed', top: 0, left: 0, zIndex: 60 }}
                />
            )}

            {/* Flawless Callout */}
            <AnimatePresence>
                {showFlawless && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.5, y: -30 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    >
                        <span className="text-4xl sm:text-6xl font-heading font-black uppercase tracking-tighter bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
                            Flawless!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {/* Pre-Game */}
                {phase === 'idle' && (
                    <PreGame
                        key="pregame"
                        settings={settings}
                        onToggleMute={toggleMute}
                        onToggleReduceMotion={toggleReduceMotion}
                        onChangeDifficulty={(d) => setSettings(s => ({ ...s, difficulty: d }))}
                        onToggleBackspace={toggleBackspace}
                        onStart={handleStart}
                    />
                )}

                {/* Countdown */}
                {phase === 'countdown' && (
                    <motion.div
                        key="countdown"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={countdownVal}
                                initial={settings.reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 2 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={settings.reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.3 }}
                                className={`text-8xl sm:text-9xl font-heading font-black ${countdownVal > 0
                                    ? 'text-text-main'
                                    : 'bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent'
                                    }`}
                            >
                                {countdownVal > 0 ? countdownVal : 'GO!'}
                            </motion.span>
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Playing */}
                {phase === 'playing' && snapshot && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full flex flex-col items-center"
                    >
                        <HUD snapshot={snapshot} />

                        {snapshot.round && (
                            <div className="card w-full max-w-3xl p-8 sm:p-12">
                                <PromptRenderer
                                    prompt={snapshot.round.prompt}
                                    cursorIndex={snapshot.round.cursorIndex}
                                    isPlaying={true}
                                    reduceMotion={settings.reduceMotion}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Dead — uses captured deathSnapshot/deathSummary that survives restart */}
                {phase === 'dead' && deathSnapshot && deathSummary && (
                    <DeathScreen
                        key="dead"
                        deathInfo={deathSummary.deathInfo!}
                        streak={deathSnapshot.streak}
                        score={deathSnapshot.score}
                        sessionBestScore={sessionBest?.score ?? null}
                        reduceMotion={settings.reduceMotion}
                        onContinue={() => engineRef.current?.goToResults()}
                        onRetry={handleRestart}
                    />
                )}

                {/* Results — shows session best */}
                {phase === 'results' && (runSummary || sessionBest) && (
                    <ResultsScreen
                        key="results"
                        summary={(sessionBest && (!runSummary || sessionBest.score >= runSummary.score)) ? sessionBest : runSummary!}
                        currentRunSummary={deathSummary}
                        submissionResult={submissionResult}
                        reduceMotion={settings.reduceMotion}
                        onRetry={handleRestart}
                        onBack={onBack}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
