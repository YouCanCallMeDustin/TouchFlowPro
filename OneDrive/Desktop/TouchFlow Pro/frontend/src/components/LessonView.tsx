import React, { useState, useEffect } from 'react';
import TypingTest from './TypingTest';
import VisualKeyboard from './VisualKeyboard';
import type { Lesson } from '@shared/curriculum';
import type { TypingMetrics } from '@shared/types';
import type { KeystrokeEvent } from '@shared/types';
import AchievementCelebration from './AchievementCelebration';

interface LessonViewProps {
    lesson: Lesson;
    userId: string;
    onComplete: (metrics: TypingMetrics, passed: boolean, keystrokes?: KeystrokeEvent[]) => void;
    onCancel: () => void;
}

type Mode = 'intro' | 'theory' | 'warmup' | 'practice' | 'test' | 'results' | 'adaptive';

const LessonView: React.FC<LessonViewProps> = ({ lesson, userId: _userId, onComplete, onCancel }) => {
    const [mode, setMode] = useState<Mode>('intro');
    const [testMetrics, setTestMetrics] = useState<TypingMetrics | null>(null);
    const [passed, setPassed] = useState(false);
    const [practiceText, setPracticeText] = useState<string>('');
    const [adaptiveText, setAdaptiveText] = useState<string>('');
    const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
    const [warmupStepIndex, setWarmupStepIndex] = useState(0);
    const [showWarmupStepInsight, setShowWarmupStepInsight] = useState(false);
    const [warmupStepMetrics, setWarmupStepMetrics] = useState<TypingMetrics | null>(null);
    const [isAdaptiveResult, setIsAdaptiveResult] = useState(false);
    const [suddenDeathEnabled, setSuddenDeathEnabled] = useState(true);
    const [dictationEnabled, setDictationEnabled] = useState(false);
    const [enhancedModeEnabled, setEnhancedModeEnabled] = useState(true); // Enable enhanced mode by default
    const [showCelebration, setShowCelebration] = useState(false);
    const [newAchievement, setNewAchievement] = useState<{ name: string; icon: string; description: string } | null>(null);

    const activeWarmupSteps = lesson.warmupSteps || [
        { text: lesson.content.split(' ').slice(0, 3).join(' '), insight: 'Let\'s start with a quick calibration to find your center.' }
    ];

    const currentWarmup = activeWarmupSteps[warmupStepIndex];

    // Get random practice text when entering practice mode
    const getRandomPracticeText = () => {
        if (lesson.practiceVariations && lesson.practiceVariations.length > 0) {
            const randomIndex = Math.floor(Math.random() * lesson.practiceVariations.length);
            return lesson.practiceVariations[randomIndex];
        }
        return lesson.content; // Fallback to original content
    };

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
            // Reset for next time and return to the main Lesson screen (intro)
            setWarmupStepIndex(0);
            setWarmupStepMetrics(null);
            setShowWarmupStepInsight(false);
            setMode('intro');
        }
    };

    const handlePracticeComplete = (metrics: TypingMetrics, ks: KeystrokeEvent[]) => {
        setTestMetrics(metrics);
        setKeystrokes(ks);
        setIsAdaptiveResult(false);
        setMode('results');
    };

    const handleTestComplete = (metrics: TypingMetrics, ks: KeystrokeEvent[]) => {
        const didPass = metrics.accuracy >= lesson.masteryThreshold;
        setTestMetrics(metrics);
        setKeystrokes(ks);
        setPassed(didPass);
        setIsAdaptiveResult(false);

        // If they failed or had specific errors, prepare adaptive recovery
        if (Object.keys(metrics.errorMap).length > 0) {
            const weakKeys = Object.entries(metrics.errorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([key]) => key);

            if (weakKeys.length > 0) {
                // Generate a sprint based on weak keys
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
            // Check for new achievements
            try {
                const achievementRes = await fetch(`/api/achievements/${_userId}/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const achievementData = await achievementRes.json();

                // Show celebration for new achievements
                if (achievementData.newAchievements && achievementData.newAchievements.length > 0) {
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

            // Record daily streak
            try {
                await fetch(`/api/streaks/${_userId}/record`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('Failed to record streak:', error);
            }

            onComplete(testMetrics, passed, keystrokes);
        }
    };

    // Listen for Enter key on warmup insight screen
    useEffect(() => {
        if (mode === 'warmup' && showWarmupStepInsight) {
            const handleKeyPress = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    nextWarmupStep();
                }
            };
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [mode, showWarmupStepInsight, warmupStepIndex]);

    // Listen for Enter key on results screen (when passed)
    useEffect(() => {
        if (mode === 'results' && passed && testMetrics) {
            const handleKeyPress = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    handleFinish();
                }
            };
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [mode, passed, testMetrics]);

    return (
        <div className="max-w-5xl mx-auto w-full">
            {mode === 'intro' && (
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl p-10 sm:p-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-accent-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-orange-100">
                        <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse"></span>
                        Module {lesson.lessonNumber} • {lesson.category}
                    </div>

                    <h2 className="text-4xl sm:text-6xl font-heading font-black text-text-main mb-6 tracking-tighter">
                        {lesson.title}
                    </h2>
                    <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                        {lesson.description}
                    </p>

                    <div className="bg-slate-50/50 border border-slate-100 p-8 sm:p-10 rounded-[2rem] mb-12 text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue">🎯</div>
                            <h3 className="text-xl font-bold text-text-main tracking-tight">Technical Objectives</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {lesson.learningObjectives.map((obj, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-secondary-teal mt-2"></div>
                                    <span className="text-sm font-semibold text-text-main leading-tight">{obj}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 max-w-md mx-auto">
                        <button
                            onClick={() => setMode('theory')}
                            className="px-10 py-6 bg-primary-blue text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-800 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 flex items-center justify-center gap-3"
                        >
                            Begin Instruction Path 🚀
                        </button>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setPracticeText(getRandomPracticeText());
                                    setMode('practice');
                                }}
                                className="flex-1 py-4 bg-white border-2 border-slate-200 text-text-muted rounded-xl font-bold text-xs uppercase tracking-widest hover:border-secondary-teal hover:text-secondary-teal transition-all"
                            >
                                Quick Drill
                            </button>
                            <button
                                onClick={() => setMode('test')}
                                className="flex-1 py-4 bg-white border-2 border-slate-200 text-text-muted rounded-xl font-bold text-xs uppercase tracking-widest hover:border-accent-orange hover:text-accent-orange transition-all"
                            >
                                Skip to Test
                            </button>
                        </div>

                        {lesson.difficulty === 'Specialist' && (
                            <div className="mt-4 p-4 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-between group hover:border-primary-blue/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-blue/20 rounded-lg flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">🎙️</div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Training Variant</div>
                                        <div className="text-sm font-bold text-white">Audio Dictation Mode</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDictationEnabled(!dictationEnabled)}
                                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${dictationEnabled ? 'bg-primary-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${dictationEnabled ? 'left-8' : 'left-1'}`}></div>
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onCancel}
                        className="mt-12 text-slate-600 font-bold text-xs uppercase tracking-[0.2em] hover:text-primary-blue transition-colors border-b border-transparent hover:border-primary-blue pb-1"
                    >
                        Return to Hub
                    </button>
                </div>
            )}

            {mode === 'theory' && (
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl p-10 sm:p-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100">
                        Tactical Instruction
                    </div>

                    <h3 className="text-3xl font-heading font-black text-text-main mb-8">Lesson Theory</h3>

                    <div className="max-w-3xl mx-auto mb-12">
                        <p className="text-lg text-text-muted leading-relaxed mb-10 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                            "{lesson.theory || "Focus on maintaining even pressure and a steady rhythm. Precision in your finger placement now builds the foundation for elite speeds later."}"
                        </p>

                        <div className="mb-6 text-left">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Focus Key Mapping</div>
                            <VisualKeyboard highlightKeys={lesson.focusKeys} />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={initiateWarmup}
                            className="px-12 py-5 bg-primary-blue text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95"
                        >
                            Initiate Warm-up
                        </button>
                    </div>
                </div>
            )}

            {mode === 'warmup' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 text-white px-8 py-5 rounded-3xl shadow-xl flex items-center justify-between border-b-4 border-slate-700/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🔥</div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Warm-up Phase</h3>
                                <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Calibration {warmupStepIndex + 1} of {activeWarmupSteps.length}</p>
                            </div>
                        </div>
                        <button onClick={() => setMode('theory')} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all border border-white/10">Back to Theory</button>
                    </div>

                    {!showWarmupStepInsight ? (
                        <>
                            <TypingTest
                                text={currentWarmup.text}
                                onComplete={handleWarmupComplete}
                                showLiveMetrics={enhancedModeEnabled}
                                showVirtualKeyboard={enhancedModeEnabled}
                            />
                            <div className="mt-8">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Reference Keyboard</div>
                                <VisualKeyboard highlightKeys={lesson.focusKeys} />
                            </div>
                        </>
                    ) : (
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-10 text-center animate-in zoom-in-95 duration-300">
                            {warmupStepMetrics && (
                                <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                                    <div className="bg-white/50 border border-slate-100 p-4 rounded-2xl shadow-sm">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Velocity</div>
                                        <div className="text-2xl font-black text-primary-blue">{Math.round(warmupStepMetrics.netWPM)} WPM</div>
                                    </div>
                                    <div className="bg-white/50 border border-slate-100 p-4 rounded-2xl shadow-sm">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precision</div>
                                        <div className="text-2xl font-black text-secondary-teal">{Math.round(warmupStepMetrics.accuracy)}%</div>
                                    </div>
                                </div>
                            )}

                            <div className="w-16 h-16 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm border border-blue-100">💡</div>
                            <h4 className="text-xl font-bold text-text-main mb-4">Tactical Insight</h4>
                            <p className="text-lg text-text-muted mb-10 max-w-xl mx-auto leading-relaxed italic">
                                "{currentWarmup.insight}"
                            </p>
                            <button
                                onClick={nextWarmupStep}
                                className="px-12 py-5 bg-primary-blue text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto"
                            >
                                {warmupStepIndex < activeWarmupSteps.length - 1 ? 'Next Calibration Step →' : 'Complete Preparation'}
                                <span className="text-xs opacity-60 ml-2">(Press Enter)</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'practice' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 text-white px-8 py-5 rounded-3xl shadow-xl flex items-center justify-between border-b-4 border-slate-700/30">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 ${suddenDeathEnabled ? 'bg-rose-500 shadow-rose-500/20' : 'bg-slate-700'} rounded-xl flex items-center justify-center text-xl shadow-lg transition-colors`}>
                                    {suddenDeathEnabled ? '💀' : '🛡️'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-white">Targeted Practice</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                        {suddenDeathEnabled ? 'Sudden Death: One error resets' : 'Standard: Practice without reset'}
                                    </p>
                                </div>
                            </div>

                            {/* Optional Toggle */}
                            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                                <button
                                    onClick={() => setSuddenDeathEnabled(true)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${suddenDeathEnabled ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    High Stakes
                                </button>
                                <button
                                    onClick={() => setSuddenDeathEnabled(false)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!suddenDeathEnabled ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Casual
                                </button>
                            </div>

                            {/* Enhanced Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEnhancedModeEnabled(!enhancedModeEnabled)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${enhancedModeEnabled
                                        ? 'bg-purple-500 text-white shadow-lg'
                                        : 'bg-white/10 text-slate-400 hover:text-white border border-white/10'
                                        }`}
                                >
                                    {enhancedModeEnabled ? '✨ Enhanced' : 'Basic'}
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setMode('intro')} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all border border-white/10">Abort Drill</button>
                    </div>
                    <TypingTest
                        text={practiceText}
                        onComplete={handlePracticeComplete}
                        suddenDeath={suddenDeathEnabled}
                        dictationMode={dictationEnabled}
                        showLiveMetrics={enhancedModeEnabled}
                        showVirtualKeyboard={enhancedModeEnabled}
                    />
                </div>
            )}

            {mode === 'test' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-accent-orange text-white px-8 py-5 rounded-3xl shadow-xl shadow-orange-100 flex items-center justify-between border-b-4 border-orange-700/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏆</div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Challenge Active</h3>
                                <p className="text-xs text-orange-50/70 font-bold uppercase tracking-widest">Required Precision: {lesson.masteryThreshold}%</p>
                            </div>
                        </div>
                        <button onClick={() => setMode('intro')} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all border border-white/20">Abort</button>
                    </div>
                    <TypingTest
                        text={lesson.content}
                        onComplete={handleTestComplete}
                        dictationMode={dictationEnabled}
                        showLiveMetrics={enhancedModeEnabled}
                        showVirtualKeyboard={enhancedModeEnabled}
                    />
                </div>
            )}

            {mode === 'results' && testMetrics && (
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[3rem] shadow-2xl p-10 sm:p-16 text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 ${passed ? 'bg-secondary-teal' : 'bg-accent-orange'}`}></div>

                    {isAdaptiveResult ? (
                        <div className="text-center mb-16 animate-in zoom-in duration-700">
                            <span className="inline-block px-4 py-1.5 bg-orange-100 text-accent-orange text-[10px] font-black uppercase tracking-[0.25em] rounded-full mb-6 border border-orange-200">
                                Focus Sprint Complete
                            </span>
                            <h2 className="text-6xl font-heading font-black text-text-main mb-4 tracking-tight">
                                Sprint Performance
                            </h2>
                            <p className="text-xl text-text-muted mb-12 font-medium">
                                Recovery phase successful. Apply these corrected patterns to the main challenge.
                            </p>
                        </div>
                    ) : passed ? (
                        <div className="relative">
                            <div className="text-7xl mb-6 drop-shadow-xl animate-bounce">🥇</div>
                            <h2 className="text-5xl sm:text-6xl font-heading font-black text-secondary-teal mb-4 tracking-tighter">
                                Assessment Verified
                            </h2>
                            <p className="text-xl text-text-muted mb-12 font-medium">
                                Elite performance detected. Module successfully mastered.
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="text-7xl mb-6 drop-shadow-xl">🛠️</div>
                            <h2 className="text-5xl sm:text-6xl font-heading font-black text-accent-orange mb-4 tracking-tighter">
                                Recalibration Required
                            </h2>
                            <p className="text-xl text-text-muted mb-12 font-medium">
                                Threshold not met. Focus on precision to bridge the gap.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-100 group hover:border-primary-blue/30 transition-all">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Net Velocity</div>
                            <div className="text-5xl font-heading font-black text-text-main mb-1 group-hover:scale-110 transition-transform">{testMetrics.netWPM}</div>
                            <div className="text-xs font-bold text-secondary-teal uppercase">WPM</div>
                        </div>

                        <div className={`p-8 rounded-3xl border group transition-all ${testMetrics.accuracy >= lesson.masteryThreshold ? 'bg-teal-50/50 border-teal-100 hover:border-teal-300' : 'bg-orange-50/50 border-orange-100 hover:border-orange-300'}`}>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Final Precision</div>
                            <div className={`text-5xl font-heading font-black mb-1 group-hover:scale-110 transition-transform ${testMetrics.accuracy >= lesson.masteryThreshold ? 'text-secondary-teal' : 'text-accent-orange'}`}>
                                {testMetrics.accuracy}%
                            </div>
                            <div className="text-xs font-bold uppercase">
                                {testMetrics.accuracy >= lesson.masteryThreshold ? '✓ Threshold Met' : `Target: ${lesson.masteryThreshold}%`}
                            </div>
                        </div>

                        <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-100 group hover:border-rose-200 transition-all">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Anomalies Detected</div>
                            <div className="text-5xl font-heading font-black text-text-main mb-1 group-hover:scale-110 transition-transform">{testMetrics.errors}</div>
                            <div className="text-xs font-bold text-rose-500 uppercase">Input Errors</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {passed ? (
                            <>
                                <button
                                    onClick={handleFinish}
                                    className="px-12 py-5 bg-primary-blue text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-800 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95"
                                >
                                    Commit Progress & Advance <span className="text-xs opacity-60 ml-2">(Press Enter)</span>
                                </button>
                                {adaptiveText && (
                                    <button
                                        onClick={() => setMode('adaptive')}
                                        className="px-8 py-5 bg-white border-2 border-orange-200 text-accent-orange rounded-2xl font-black text-lg hover:bg-orange-50 transition-all active:scale-95"
                                    >
                                        Precision Focus Sprint ⚡
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                {adaptiveText && (
                                    <button
                                        onClick={() => setMode('adaptive')}
                                        className="px-10 py-5 bg-orange-100 text-accent-orange border-2 border-orange-200 rounded-2xl font-black text-lg hover:bg-orange-200 transition-all active:scale-95"
                                    >
                                        Precision Recovery ⚡
                                    </button>
                                )}
                                <button
                                    onClick={() => setMode('test')}
                                    className="px-10 py-5 bg-accent-orange text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95"
                                >
                                    Re-Attempt Challenge
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="px-8 py-5 bg-white border-2 border-slate-200 text-text-main rounded-2xl font-black text-lg hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Curriculum Hub
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {mode === 'adaptive' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-orange-500 text-white px-8 py-5 rounded-3xl shadow-xl flex items-center justify-between border-b-4 border-orange-700/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">⚡</div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Precision Focus</h3>
                                <p className="text-xs text-orange-50 font-bold uppercase tracking-widest">Recalibrating missed key signatures</p>
                            </div>
                        </div>
                        <button onClick={() => setMode('results')} className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-4 py-2 rounded-lg hover:bg-black/20 transition-all">Exit Sprint</button>
                    </div>
                    <TypingTest text={adaptiveText} onComplete={handleAdaptiveComplete} />
                    <div className="p-8 bg-orange-50 rounded-[2.5rem] border border-orange-100 text-center">
                        <h4 className="text-orange-800 font-black uppercase tracking-widest text-xs mb-4">Tactical Guidance</h4>
                        <p className="text-orange-700 font-medium mb-6">Slow down. Focus exclusively on the correct finger reaches for the highlighted keys below.</p>
                        <VisualKeyboard highlightKeys={testMetrics ? Object.keys(testMetrics.errorMap) : []} />
                    </div>
                </div>
            )}

            {/* Achievement Celebration */}
            <AchievementCelebration
                show={showCelebration}
                achievement={newAchievement}
                onClose={() => setShowCelebration(false)}
            />
        </div>
    );
};


export default LessonView;
