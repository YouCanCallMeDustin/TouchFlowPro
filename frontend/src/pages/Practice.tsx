import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { drillLibrary, type Drill } from '@shared/drillLibrary';
import { Curriculum, type Lesson } from '@shared/curriculum';
import LessonView from '../components/LessonView';
import type { TypingMetrics } from '@shared/types';
import { Target, Activity, Zap, Filter, Layers, ChevronRight, Search, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useLaunchStore } from '../state/launchStore';
import { useEffect } from 'react';

interface PracticeProps {
    userId: string;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => Promise<any>;
}

const Practice: React.FC<PracticeProps> = ({ userId, onSessionComplete }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
    const [activeDrill, setActiveDrill] = useState<Lesson | null>(null);
    const [completedDrills, setCompletedDrills] = useState<Set<string>>(new Set());

    // Fetch Completed Drills
    useEffect(() => {
        if (!userId) return;
        apiFetch('/api/drills/completed')
            .then(res => res.json())
            .then(data => {
                if (data.completedDrillIds) {
                    setCompletedDrills(new Set(data.completedDrillIds));
                }
            })
            .catch(err => console.error('Failed to fetch completed drills', err));
    }, [userId, activeDrill]); // Re-fetch when activeDrill changes (implies completion)

    // Extract unique categories and difficulties
    const categories = useMemo(() => {
        const cats = new Set(drillLibrary.map(d => d.category));
        return ['All', ...Array.from(cats).sort()];
    }, []);

    const difficulties = ['All', 'Beginner', 'Intermediate', 'Professional', 'Specialist'];

    // Filter drills
    const filteredDrills = useMemo(() => {
        return drillLibrary.filter(drill => {
            const catMatch = selectedCategory === 'All' || drill.category === selectedCategory;
            const diffMatch = selectedDifficulty === 'All' || drill.difficulty === selectedDifficulty;
            return catMatch && diffMatch;
        });
    }, [selectedCategory, selectedDifficulty]);

    const { user } = useAuth(); // Get user from context

    // Store Integration for Training Plans
    const { pendingLaunch, clearPendingLaunch } = useLaunchStore();

    useEffect(() => {
        if (pendingLaunch && (pendingLaunch.source === 'trainingPlan' || pendingLaunch.source === 'analytics' || pendingLaunch.source === 'manual') && !activeDrill) {
            // Auto-launch the plan item
            if (pendingLaunch.launch.kind === 'DRILL' && pendingLaunch.launch.drillId) {
                const drill = drillLibrary.find(d => d.id === pendingLaunch.launch.drillId);
                if (drill) {
                    const practiceLesson = Curriculum.drillToLesson(drill, 0);
                    // Override content if promptText is provided (e.g. for custom warmups)
                    if (pendingLaunch.launch.promptText) {
                        practiceLesson.content = pendingLaunch.launch.promptText;
                    }
                    setActiveDrill(practiceLesson);
                    clearPendingLaunch();
                } else if (pendingLaunch.launch.promptText) {
                    // Handle specialty drills (like Medical) not in the core drillLibrary
                    // Extract longest words for dynamic warmups
                    const words = pendingLaunch.launch.promptText.split(/[^a-zA-Z]+/);
                    const uniqueWords = Array.from(new Set(words.filter((w: string) => w.length > 5).map((w: string) => w.toLowerCase())));
                    const hardestWords = uniqueWords.sort((a, b) => b.length - a.length).slice(0, 10);

                    const dynamicWarmupSteps = hardestWords.map(w => ({
                        text: `${w} ${w} ${w} ${w} ${w}`,
                        insight: `Mastery Repetition: ${w.toUpperCase()}`
                    }));

                    const customLesson: Lesson = {
                        id: pendingLaunch.launch.drillId,
                        title: pendingLaunch.title || 'Specialty Drill',
                        content: pendingLaunch.launch.promptText,
                        category: 'Specialty Practice',
                        difficulty: 'Professional',
                        order: 0,
                        xpReward: 10,
                        learningObjectives: ['Targeted Repetition', 'Specialty Terminology'],
                        lessonNumber: 0,
                        prerequisites: [],
                        masteryThreshold: 0,
                        description: 'Specialty track drill session',
                        warmupSteps: dynamicWarmupSteps.length > 0 ? dynamicWarmupSteps : undefined
                    };
                    setActiveDrill(customLesson);
                    clearPendingLaunch();
                }
            } else if (pendingLaunch.launch.kind === 'CUSTOM_TEXT' && pendingLaunch.launch.promptText) {
                // Create custom lesson on the fly
                const customLesson: Lesson = {
                    id: `plan-${pendingLaunch.planItemId || 'analytics'}`,
                    title: pendingLaunch.title || 'Training Plan Lesson',
                    content: pendingLaunch.launch.promptText,
                    category: 'Training Plan',
                    difficulty: 'Professional', // Default
                    order: 0,
                    xpReward: 10,
                    learningObjectives: ['Plan Execution'],
                    lessonNumber: 0,
                    prerequisites: [],
                    masteryThreshold: 0,
                    description: 'Scheduled training task'
                };
                setActiveDrill(customLesson);
                clearPendingLaunch();
            }
        }
    }, [pendingLaunch, activeDrill, clearPendingLaunch]);

    const handleStartDrill = (drill: Drill) => {
        const isPro = user?.subscriptionStatus === 'pro';
        const isPaywalled = ['Intermediate', 'Professional', 'Specialist'].includes(drill.difficulty) && !isPro;

        if (isPaywalled) {
            if (confirm("This drill requires a Professional clearance. Initialize upgrade sequence?")) {
                window.location.hash = 'pricing'; // Simple hash navigation or use prop
                // ideally call onRequestUpgrade if passed, but for now this works or simply alert
                // better to use the prop if available, but PracticeProps doesn't have it yet.
                // Let's just block it for now.
            }
            return;
        }

        // Convert Drill to Lesson on the fly for the view
        const practiceLesson = Curriculum.drillToLesson(drill, 0);
        setActiveDrill(practiceLesson);
    };

    const handleDrillComplete = async (metrics: TypingMetrics, _passed: boolean, keystrokes?: any[]) => {
        try {
            // Save practice result
            if (activeDrill) {
                if (onSessionComplete) {
                    await onSessionComplete(metrics, 'practice', activeDrill.id, keystrokes);
                } else {
                    const res = await apiFetch(`/api/drills/${activeDrill.id}/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ metrics, userId })
                    });
                    const data = await res.json();
                    if (data.newAchievement) {
                        alert(`🏆 ACHIEVEMENT UNLOCKED: ${JSON.parse(data.newAchievement.metadata).title}!`);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to save practice result:', error);
        } finally {
            // Force return to list view
            setActiveDrill(null);
            // Refresh completed list locally for immediate feedback (though effect handles it too)
            if (activeDrill) {
                setCompletedDrills(prev => new Set(prev).add(activeDrill.id));
            }
        }
    };

    if (activeDrill) {
        return (
            <LessonView
                lesson={activeDrill}
                userId={userId}
                onComplete={handleDrillComplete}
                onCancel={() => setActiveDrill(null)}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mb-12">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Target size={18} className="text-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Skill Assessment</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                        Practice Arena
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                        Choose your challenge. Focus on specific skills.
                    </p>
                </div>

                {/* Decorative Abstract Mesh */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden hidden md:block">
                    <svg width="400" height="400" viewBox="0 0 400 400" className="translate-x-20 -translate-y-20 animate-[spin_60s_linear_infinite]">
                        <defs>
                            <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary)" />
                                <stop offset="100%" stopColor="var(--secondary)" />
                            </linearGradient>
                        </defs>
                        <path d="M 0,200 Q 100,100 200,200 T 400,200" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                        <path d="M 0,100 Q 100,0 200,100 T 400,100" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                        <path d="M 0,300 Q 100,200 200,300 T 400,300" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                    </svg>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-12 flex flex-col lg:flex-row gap-8 p-8">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Layers size={18} />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Category</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-slate-500/5 dark:bg-white/5 text-text-muted hover:bg-slate-500/10 dark:hover:bg-white/10 hover:text-text-main'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-px bg-text-main/10 hidden lg:block" />
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Filter size={18} />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Difficulty</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {difficulties.map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedDifficulty === diff
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-slate-500/5 dark:bg-white/5 text-text-muted hover:bg-slate-500/10 dark:hover:bg-white/10 hover:text-text-main'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredDrills.map((drill) => (
                        <motion.div
                            key={drill.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="card group cursor-pointer border border-slate-200/60 dark:border-white/5 hover:border-primary/20 hover:-translate-y-2 hover:shadow-2xl transition-all"
                            onClick={() => handleStartDrill(drill)}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${drill.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                                    drill.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' :
                                        drill.difficulty === 'Professional' ? 'bg-rose-500/10 text-rose-500' :
                                            'bg-primary/10 text-primary'
                                    }`}>
                                    {drill.difficulty}
                                </span>
                                {(['Intermediate', 'Professional', 'Specialist'].includes(drill.difficulty) && user?.subscriptionStatus !== 'pro') && (
                                    <span className="ml-2 text-text-muted opacity-50"><Lock size={12} /></span>
                                )}
                                {completedDrills.has(drill.id) && (
                                    <span className="ml-2 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle size={10} />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Done</span>
                                    </span>
                                )}
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
                                    {drill.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-text-main mb-3 group-hover:text-primary transition-colors tracking-tight">
                                {drill.title}
                            </h3>
                            <p className="text-text-muted text-sm mb-6 line-clamp-2 leading-relaxed opacity-80">
                                {drill.description}
                            </p>

                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center gap-3 text-xs text-text-muted font-mono bg-slate-500/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200/50 dark:border-white/5 overflow-hidden">
                                    <Zap size={14} className="text-primary shrink-0" />
                                    <span className="truncate opacity-60 italic">{drill.content}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                                    Start Practice
                                    <ChevronRight size={16} />
                                </div>
                                <Activity size={18} className="text-text-muted opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredDrills.length === 0 && (
                <div className="card text-center py-24 flex flex-col items-center border border-dashed border-slate-200 dark:border-white/10">
                    <div className="p-6 rounded-3xl bg-slate-500/5 dark:bg-white/5 text-text-muted mb-6">
                        <Search size={48} opacity={0.2} />
                    </div>
                    <h3 className="text-2xl font-black text-text-main mb-2">No signals detected</h3>
                    <p className="text-text-muted mb-8">Try adjusting your spectral filters to find matching drills.</p>
                    <button
                        onClick={() => { setSelectedCategory('All'); setSelectedDifficulty('All'); }}
                        className="px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Practice;
