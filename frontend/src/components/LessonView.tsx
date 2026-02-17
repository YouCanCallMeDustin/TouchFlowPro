import React, { useState, useEffect } from 'react';
import {
    Target,
    Activity,
    Rocket,
    Settings,
    ArrowRight,
    Award,
    BookOpen,
    AlertOctagon
} from 'lucide-react';
import TypingTest from './TypingTest';
import VisualKeyboard from './VisualKeyboard';
import type { Lesson } from '@shared/curriculum';
import type { TypingMetrics, KeystrokeEvent } from '@shared/types';
import AchievementCelebration from './AchievementCelebration';
import { apiFetch } from '../utils/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useLaunchStore } from '../state/launchStore';
import { PlanTimer } from './PlanTimer';

interface LessonViewProps {
    lesson: Lesson;
    userId: string;
    isCompleted?: boolean;
    onComplete: (metrics: TypingMetrics, passed: boolean, keystrokes?: KeystrokeEvent[]) => void;
    onCancel: () => void;
    initialDrillText?: string;
    timeLimit?: number;
}

type Mode = 'intro' | 'theory' | 'warmup' | 'practice' | 'test' | 'results' | 'adaptive';

const LessonView: React.FC<LessonViewProps> = ({ lesson, userId: _userId, onComplete, onCancel, initialDrillText, timeLimit }) => {
    const [mode, setMode] = useState<Mode>('intro');
    const [testMetrics, setTestMetrics] = useState<TypingMetrics | null>(null);
    const [passed, setPassed] = useState(false);
    const [practiceText, setPracticeText] = useState<string>(lesson.content);
    const [adaptiveText, setAdaptiveText] = useState<string>('');
    const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
    const [warmupStepIndex, setWarmupStepIndex] = useState(0);
    const [showWarmupStepInsight, setShowWarmupStepInsight] = useState(false);
    const [warmupStepMetrics, setWarmupStepMetrics] = useState<TypingMetrics | null>(null);
    const [isAdaptiveResult, setIsAdaptiveResult] = useState(false);
    const [suddenDeathEnabled, setSuddenDeathEnabled] = useState(false);
    const [dictationEnabled] = useState(false);
    const [enhancedModeEnabled] = useState(true); // Enable enhanced mode by default
    const [showCelebration, setShowCelebration] = useState(false);
    const [forceFinishTest, setForceFinishTest] = useState(false);

    // Store Integration
    const { pendingLaunch, clearPendingLaunch } = useLaunchStore();
    const [isPlanLauncher, setIsPlanLauncher] = useState(false);
    const [planTimerActive, setPlanTimerActive] = useState(false);
    const [planTimerPaused, setPlanTimerPaused] = useState(false);

    useEffect(() => {
        if (pendingLaunch && pendingLaunch.source === 'trainingPlan') {
            setIsPlanLauncher(true);
            setPracticeText(
                pendingLaunch.launch.promptText
                    ? pendingLaunch.launch.promptText
                    : lesson.content
            );

            // Auto start appropriate mode
            if (pendingLaunch.mode === 'practice' || pendingLaunch.mode === 'lesson') {
                setMode('practice');
            } else if (pendingLaunch.mode === 'code') {
                setMode('practice'); // uses 'code' mode inside TypingTest
            }

            // Handle timer immediately
            setPlanTimerActive(true);
        } else if (initialDrillText) {
            setPracticeText(initialDrillText);
            setMode('practice');
        }
    }, [initialDrillText, lesson.id, pendingLaunch]);

    const [newAchievement, setNewAchievement] = useState<{ name: string; icon: string; description: string } | null>(null);
    const [, setWarmupCompleted] = useState(false);

    const activeWarmupSteps = lesson.warmupSteps || [
        { text: lesson.content.split(' ').slice(0, 3).join(' '), insight: 'Let\'s start with a quick warmup to find your rhythm.' }
    ];

    const currentWarmup = activeWarmupSteps[warmupStepIndex];

    // const getRandomPracticeText = () => {
    //     if (lesson.practiceVariations && lesson.practiceVariations.length > 0) {
    //         const randomIndex = Math.floor(Math.random() * lesson.practiceVariations.length);
    //         return lesson.practiceVariations[randomIndex];
    //     }
    //     return lesson.content;
    // };

    const initiateWarmup = () => {
        setWarmupStepIndex(0);
        setShowWarmupStepInsight(false);
        setWarmupStepMetrics(null);
        setMode('warmup');
        setIsAdaptiveResult(false);
    };

    const handleWarmupComplete = (metrics: TypingMetrics) => {
        setWarmupStepMetrics(metrics);
        setShowWarmupStepInsight(true);
    };

    const nextWarmupStep = () => {
        if (warmupStepIndex < activeWarmupSteps.length - 1) {
            setWarmupStepIndex(prev => prev + 1);
            setWarmupStepMetrics(null);
            setShowWarmupStepInsight(false);
        } else {
            setWarmupStepIndex(0);
            setWarmupStepMetrics(null);
            setShowWarmupStepInsight(false);
            setWarmupCompleted(true);
            setMode('practice');
        }
    };

    const handlePracticeComplete = async (metrics: TypingMetrics, ks: KeystrokeEvent[]) => {
        const didPass = metrics.accuracy >= lesson.masteryThreshold;
        setTestMetrics(metrics);
        setKeystrokes(ks);
        setPassed(didPass);
        setIsAdaptiveResult(false);
        setMode('results');

        // Handle Training Plan Completion
        if (isPlanLauncher && pendingLaunch) {
            try {
                await apiFetch(`/api/plans/active/item/${pendingLaunch.planItemId}/complete`, {
                    method: 'POST'
                });
                // Clear pending launch so further nav works
                clearPendingLaunch();
            } catch (error) {
                console.error('Failed to complete plan item:', error);
            }
        }
    };

    const handleTestComplete = (metrics: TypingMetrics, ks: KeystrokeEvent[]) => {
        // ... (Logic same as before, see original file, will paste implementation)
        const didPass = metrics.accuracy >= lesson.masteryThreshold;
        setTestMetrics(metrics);
        setKeystrokes(ks);
        setPassed(didPass);
        setIsAdaptiveResult(false);

        if (metrics.errorMap && Object.keys(metrics.errorMap).length > 0) {
            const weakKeys = Object.entries(metrics.errorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([key]) => key);

            if (weakKeys.length > 0) {
                setAdaptiveText(weakKeys.map(k => `${k}${k}${k}`).join(' ') + ' ' + lesson.content.split(' ').slice(0, 5).join(' '));
            }
        }

        setMode('results');
    };

    const handleAdaptiveComplete = (metrics: TypingMetrics) => {
        setTestMetrics(metrics);
        setIsAdaptiveResult(true);
        setMode('results');
    };

    const handleFinish = async () => {
        if (testMetrics && mode === 'results') {
            // ... (Achievements logic from original file)
            try {
                const achievementRes = await apiFetch(`/api/achievements/${_userId}/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const achievementData = await achievementRes.json();

                if (achievementData.newAchievements && achievementData.newAchievements.length > 0) {
                    // ... map icons
                    const ACHIEVEMENT_TYPES: Record<string, { name: string; description: string; icon: string }> = {
                        'first_drill': { name: 'First Steps', description: 'Complete your first drill', icon: '🎯' },
                        'week_warrior': { name: 'Week Warrior', description: 'Practice for 7 consecutive days', icon: '🔥' },
                        '100_wpm_club': { name: '100 WPM Club', description: 'Achieve 100+ WPM', icon: '⚡' },
                        'precision_pro': { name: 'Precision Pro', description: '98%+ accuracy', icon: '🎯' },
                        'marathon_runner': { name: 'Marathon Runner', description: 'Complete 50 drills', icon: '🏃' },
                        'early_bird': { name: 'Early Bird', description: 'Practice before 9 AM', icon: '🌅' },
                        'night_owl': { name: 'Night Owl', description: 'Practice after 10 PM', icon: '🦉' },
                        'perfect_week': { name: 'Perfect Week', description: '7 days, 95%+ accuracy', icon: '💎' },
                        'speed_demon': { name: 'Speed Demon', description: '120+ WPM achieved', icon: '🚀' },
                        'completionist': { name: 'Completionist', description: 'Earn all badges', icon: '👑' },
                    };

                    const firstNew = achievementData.newAchievements[0];
                    const badgeInfo = ACHIEVEMENT_TYPES[firstNew.badgeType];
                    if (badgeInfo) {
                        setNewAchievement(badgeInfo);
                        setShowCelebration(true);
                    }
                }
            } catch (error) {
                console.error('Failed to check achievements:', error);
            }

            try {
                await apiFetch(`/api/streaks/${_userId}/record`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('Failed to record streak:', error);
            }

            onComplete(testMetrics, passed, keystrokes);
        }
    };

    // ... Effects for Enter key ...
    useEffect(() => {
        if (mode === 'warmup' && showWarmupStepInsight) {
            const handleKeyPress = (e: KeyboardEvent) => {
                if (e.key === 'Enter') nextWarmupStep();
            };
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [mode, showWarmupStepInsight, warmupStepIndex]);

    useEffect(() => {
        if (mode === 'results' && passed && testMetrics) {
            const handleKeyPress = (e: KeyboardEvent) => {
                if (e.key === 'Enter') handleFinish();
            };
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [mode, passed, testMetrics]);

    return (
        <div className="max-w-5xl mx-auto w-full relative">

            {/* PLAN TIMER OVERLAY */}
            {isPlanLauncher && pendingLaunch && planTimerActive && mode === 'practice' && (
                <PlanTimer
                    durationSeconds={pendingLaunch.recommendedSeconds || (pendingLaunch as any).minutes * 60 || 300}
                    onComplete={() => setForceFinishTest(true)}
                    isActive={!planTimerPaused}
                    onPauseToggle={(paused: boolean) => setPlanTimerPaused(paused)}
                />
            )}

            {mode === 'intro' && (
                <Card className="border border-slate-200/60 dark:border-white/5 text-center relative overflow-hidden p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                        Module {lesson.lessonNumber} • {lesson.category}
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-text-main mb-3 tracking-tighter uppercase">
                        {lesson.title}
                    </h2>
                    <p className="text-sm text-text-muted mb-4 max-w-xl mx-auto leading-relaxed opacity-60">
                        {lesson.description}
                    </p>

                    <div className="bg-white/5 border border-white/5 p-4 rounded-3xl mb-4 text-left relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                                <Target size={14} />
                            </div>
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Tactical Objectives</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {lesson.learningObjectives.map((obj, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-500/5 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-primary/20 transition-all">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></div>
                                    <span className="text-xs font-bold text-text-main leading-snug">{obj}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 max-w-md mx-auto">
                        <Button
                            onClick={initiateWarmup}
                            className="px-8 py-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Start Training
                            <Rocket size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </div>
                </Card>
            )}

            {mode === 'theory' && (
                <Card className="text-center border border-slate-200/60 dark:border-white/5 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* ... (Theory content same as original) ... */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20">
                        <BookOpen size={12} />
                        Session Info
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-text-main mb-6 tracking-tighter uppercase">Key Objectives</h3>
                    <div className="max-w-3xl mx-auto mb-8 space-y-6">
                        <div className="relative">
                            <p className="text-sm text-text-muted leading-loose text-left bg-white/5 p-4 rounded-2xl border border-white/5 italic opacity-80">
                                "{lesson.theory || "Focus on maintaining even pressure and a steady rhythm. Precision in your finger placement now builds the foundation for elite speeds later."}"
                            </p>
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings size={12} className="text-primary opacity-40" />
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Primary Focus Array</h4>
                            </div>
                            <VisualKeyboard highlightKeys={lesson.focusKeys} />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            onClick={initiateWarmup}
                            className="px-8 py-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Begin Lesson
                            <ArrowRight size={14} />
                        </Button>
                    </div>
                </Card>
            )}

            {mode === 'warmup' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* ... (Warmup content same as original) ... */}
                    <div className="bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-text-main px-4 py-2 rounded-[1rem] shadow-lg flex items-center justify-between border-t border-slate-200/20 dark:border-white/10 relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shadow-inner group">
                                <Activity size={16} className="text-primary group-hover:animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-base font-black uppercase tracking-tighter">Warmup Phase</h3>
                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40">Step {warmupStepIndex + 1} of {activeWarmupSteps.length}</p>
                            </div>
                        </div>
                        <button onClick={() => setMode('theory')} className="text-[9px] font-black uppercase tracking-[0.2em] bg-slate-500/5 dark:bg-white/5 px-3 py-1.5 rounded-lg hover:bg-slate-500/10 dark:hover:bg-white/10 transition-all border border-slate-200/50 dark:border-white/10 text-text-muted hover:text-text-main">Back</button>
                    </div>
                    {!showWarmupStepInsight ? (
                        <>
                            <TypingTest
                                text={currentWarmup.text}
                                onComplete={handleWarmupComplete}
                                showLiveMetrics={enhancedModeEnabled}
                                showVirtualKeyboard={enhancedModeEnabled}
                            />
                            <div className="mt-6">
                                <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 text-center opacity-40">Focus Key Map</div>
                                <VisualKeyboard highlightKeys={lesson.focusKeys} />
                            </div>
                        </>
                    ) : (
                        <div className="card border border-slate-200/60 dark:border-white/5 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden p-8">
                            {/* Insight Content */}
                            {warmupStepMetrics && (
                                <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                                    <div className="bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-inner group hover:border-primary/20 transition-all">
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-40">Velocity</div>
                                        <div className="text-2xl font-black text-text-main group-hover:text-primary transition-colors">{Math.round(warmupStepMetrics.netWPM)} <span className="text-[10px] opacity-20">WPM</span></div>
                                    </div>
                                    <div className="bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-inner group hover:border-secondary/20 transition-all">
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-40">Precision</div>
                                        <div className="text-2xl font-black text-text-main group-hover:text-secondary transition-colors">{Math.round(warmupStepMetrics.accuracy)}%</div>
                                    </div>
                                </div>
                            )}
                            <p className="text-base text-text-muted mb-8 max-w-xl mx-auto leading-loose italic opacity-70">
                                "{currentWarmup.insight}"
                            </p>
                            <button
                                onClick={nextWarmupStep}
                                className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto"
                            >
                                {warmupStepIndex < activeWarmupSteps.length - 1 ? 'Next Step' : 'Finish Warmup'}
                                <span className="text-[10px] opacity-40 ml-4 font-black tracking-widest">Enter_key</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'practice' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-text-main px-4 py-2 rounded-[1rem] shadow-lg flex items-center justify-between border-t border-slate-200/20 dark:border-white/10 relative overflow-hidden">
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${suddenDeathEnabled ? 'bg-rose-500 shadow-rose-500/30' : 'bg-slate-500/5 dark:bg-white/5'} rounded-lg flex items-center justify-center text-base shadow-inner border border-slate-200/50 dark:border-white/10 transition-all duration-500 group`}>
                                    {suddenDeathEnabled ? <AlertOctagon size={16} className="text-white animate-pulse" /> : <Settings size={16} className="text-text-muted group-hover:rotate-90 transition-transform duration-700" />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-black uppercase tracking-tighter text-text-main">Performance Opt</h3>
                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40">
                                        {suddenDeathEnabled ? 'Sudden Death' : 'Fluidic Mode'}
                                    </p>
                                </div>
                            </div>
                            {/* Controls */}
                            <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10 hidden lg:flex">
                                <button onClick={() => setSuddenDeathEnabled(true)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${suddenDeathEnabled ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'text-text-muted hover:text-text-main'}`}>Fatal Grip</button>
                                <button onClick={() => setSuddenDeathEnabled(false)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${!suddenDeathEnabled ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:text-text-main'}`}>Soft Sync</button>
                            </div>
                        </div>
                        <button onClick={() => { if (isPlanLauncher) { clearPendingLaunch(); onCancel(); } else { setMode('intro'); } }} className="text-[10px] font-black uppercase tracking-widest bg-slate-500/5 dark:bg-white/5 px-6 py-3 rounded-xl hover:bg-slate-500/10 dark:hover:bg-white/10 transition-all border border-slate-200/50 dark:border-white/10 text-text-muted hover:text-text-main relative z-10">
                            {isPlanLauncher ? 'Exit Plan' : 'Abort Session'}
                        </button>
                    </div>
                    <TypingTest
                        text={practiceText}
                        onComplete={handlePracticeComplete}
                        suddenDeath={suddenDeathEnabled}
                        dictationMode={dictationEnabled}
                        showLiveMetrics={enhancedModeEnabled}
                        showVirtualKeyboard={enhancedModeEnabled}
                        // If using plan timer, we DISABLE internal timer of TypingTest (pass undefined)
                        timeLimit={isPlanLauncher ? undefined : timeLimit}
                        forceFinish={forceFinishTest}
                        mode={lesson.category === 'Code' || lesson.category === 'Programming' ? 'code' : undefined}
                    />
                </div>
            )}

            {mode === 'test' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* ... (Test mode logic same as original, just keeping it consistent) */}
                    <TypingTest
                        text={lesson.content}
                        onComplete={handleTestComplete}
                        dictationMode={dictationEnabled}
                        showLiveMetrics={enhancedModeEnabled}
                        showVirtualKeyboard={enhancedModeEnabled}
                        mode={lesson.category === 'Code' || lesson.category === 'Programming' ? 'code' : undefined}
                    />
                </div>
            )}

            {mode === 'results' && testMetrics && (
                <Card className="text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    {/* ... (Results logic similar to original) ... */}
                    <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[120px] opacity-20 ${passed ? 'bg-primary' : 'bg-rose-500'}`}></div>

                    {isAdaptiveResult ? (
                        <div className="text-center mb-20 animate-in zoom-in-95 duration-700">
                            <h2 className="text-6xl font-black text-text-main mb-6 tracking-tighter uppercase">Sprint Refined</h2>
                        </div>
                    ) : passed ? (
                        <div className="relative mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20 shadow-lg animate-bounce">
                                <Award size={24} className="text-primary" />
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black text-text-main mb-1 tracking-tighter uppercase">Session Complete</h2>
                        </div>
                    ) : (
                        <div className="relative mb-6">
                            <h2 className="text-2xl sm:text-4xl font-black text-text-main mb-1 tracking-tighter uppercase">Session Failed</h2>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 px-2">
                        <div className="bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-3 rounded-[1rem]">
                            <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-40">Net Speed</div>
                            <div className="text-2xl sm:text-3xl font-black text-text-main mb-1 tracking-tighter">{testMetrics.netWPM}</div>
                        </div>
                        <div className={`p-3 rounded-[1rem] border ${testMetrics.accuracy >= lesson.masteryThreshold ? 'bg-primary/5 border-primary/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                            <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-40">Final Accuracy</div>
                            <div className={`text-2xl sm:text-3xl font-black mb-1 tracking-tighter ${testMetrics.accuracy >= lesson.masteryThreshold ? 'text-text-main' : 'text-rose-500'}`}>{testMetrics.accuracy}%</div>
                        </div>
                        <div className="bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-3 rounded-[1rem]">
                            <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-40">Mistakes</div>
                            <div className="text-2xl sm:text-3xl font-black text-text-main mb-1 tracking-tighter">{testMetrics.totalMistakes}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-3xl mx-auto">
                        <Button onClick={handleFinish} className="px-6 py-6 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex-1">
                            Commit Results <span className="text-[9px] opacity-40 ml-4">Enter_key</span>
                        </Button>
                    </div>
                </Card>
            )}

            {mode === 'adaptive' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <TypingTest text={adaptiveText} onComplete={handleAdaptiveComplete} />
                </div>
            )}

            <AchievementCelebration
                show={showCelebration}
                achievement={newAchievement}
                onClose={() => setShowCelebration(false)}
            />
        </div>
    );
};

export default LessonView;
