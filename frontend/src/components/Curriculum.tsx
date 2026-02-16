import React, { useState, useEffect } from 'react';
import {
    Shield,
    Activity,
    Zap,
    Lock,
    Gamepad2,
    Code,
    Scale,
    Terminal,
    Newspaper,
    Stethoscope,
    TrendingUp,
    ArrowRight,
    BookOpen,
    Compass
} from 'lucide-react';
import type { Lesson, UserProgress } from '@shared/curriculum';
import type { DifficultyLevel } from '@shared/placement';
import { drillLibrary } from '@shared/drillLibrary';
import { Curriculum as CurriculumEngine } from '@shared/curriculum';
import type { TypingMetrics } from '@shared/types';
import BiblePractice from '../pages/BiblePractice';

interface CurriculumProps {
    userId: string;
    progress: UserProgress;
    onStartLesson: (lesson: Lesson, isCompleted: boolean, drillText?: string) => void;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => Promise<any>;
    onLevelChange: (level: DifficultyLevel) => void;
    onViewDrills: (lesson: Lesson) => void;
    onRequestUpgrade?: () => void;
}

export const Curriculum: React.FC<CurriculumProps> = ({
    userId,
    progress,
    onStartLesson,
    onSessionComplete,
    onLevelChange: _onLevelChange,
    onViewDrills,
    onRequestUpgrade
}) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(progress.assignedLevel);
    const [selectedSpecialization, setSelectedSpecialization] = useState<'Medical' | 'Legal' | 'Coding' | 'Journalism' | 'DevOps' | 'Gaming' | 'Faith'>('Medical');

    useEffect(() => {
        const specPrefixes = { 'Medical': 'm', 'Legal': 'l', 'Coding': 'c', 'Journalism': 'j', 'DevOps': 'd', 'Gaming': 'g', 'Faith': 'f' };
        const levelPrefixes = { 'Beginner': 'b', 'Intermediate': 'i', 'Professional': 'p' };

        const prefix = selectedLevel === 'Specialist'
            ? specPrefixes[selectedSpecialization as keyof typeof specPrefixes]
            : levelPrefixes[selectedLevel as keyof typeof levelPrefixes];

        const levelDrills = drillLibrary.filter(d => d.id.startsWith(prefix));
        const levelLessons = levelDrills.map((drill, index) =>
            CurriculumEngine.drillToLesson(drill, index + 1)
        );

        setLessons(levelLessons);
    }, [selectedLevel, selectedSpecialization]);

    const getLessonStatus = (lesson: Lesson): 'locked' | 'available' | 'completed' | 'current' => {
        if (userId === 'admin') return 'available';
        if (progress.completedLessons.includes(lesson.id)) return 'completed';
        if (progress.currentLesson === lesson.id) return 'current';

        // Unlock all Specialist lessons for registered members
        if (selectedLevel === 'Specialist' && userId !== 'guest') return 'available';

        if (userId === 'guest' || CurriculumEngine.isLessonUnlocked(lesson, progress.completedLessons)) return 'available';
        return 'locked';
    };

    const getLessonScore = (lessonId: string) => {
        return progress.lessonScores[lessonId];
    };

    const specPrefixes = { 'Medical': 'm', 'Legal': 'l', 'Coding': 'c', 'Journalism': 'j', 'DevOps': 'd', 'Gaming': 'g', 'Faith': 'f' };
    const levelPrefixes = { 'Beginner': 'b', 'Intermediate': 'i', 'Professional': 'p' };

    const currentPrefix = selectedLevel === 'Specialist'
        ? specPrefixes[selectedSpecialization as keyof typeof specPrefixes]
        : levelPrefixes[selectedLevel as keyof typeof levelPrefixes];

    const levelLessonsCount = drillLibrary.filter(d => d.id.startsWith(currentPrefix)).length;

    const progressPercent = CurriculumEngine.calculateLevelProgress(
        progress.completedLessons,
        currentPrefix,
        levelLessonsCount
    );

    return (
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-16 pb-20">
            {/* Header Area */}
            {/* Header Area */}
            <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <TrendingUp size={18} className="text-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Performance Path</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                        Tactical Curriculum
                    </h2>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                        Systematic operational expansion. Maintain <span className="text-primary font-black uppercase tracking-wider">95%+ Accuracy</span> across objective modules to achieve elite tier certification.
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

            {/* Specialist Category Hub */}
            {selectedLevel === 'Specialist' && (
                <div className="card text-center border border-slate-200/60 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 py-4">
                        <div className="mb-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 mb-4 block">Specialization Matrix</span>
                            <h3 className="text-4xl font-black text-text-main tracking-tighter uppercase">Discipline Command Hub</h3>
                            <p className="text-text-muted text-sm mt-4 max-w-md mx-auto opacity-50 font-black uppercase tracking-widest">Targeted operational integration for professional sectors.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
                            {(['Medical', 'Legal', 'Coding', 'Journalism', 'DevOps', 'Gaming', 'Faith'] as const).map(spec => {
                                const Icon = {
                                    'Medical': Stethoscope,
                                    'Legal': Scale,
                                    'Coding': Code,
                                    'Journalism': Newspaper,
                                    'DevOps': Terminal,
                                    'Gaming': Gamepad2,
                                    'Faith': BookOpen
                                }[spec];

                                return (
                                    <button
                                        key={spec}
                                        onClick={() => setSelectedSpecialization(spec)}
                                        className={`
                                            px-10 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-4 group/btn
                                            ${selectedSpecialization === spec
                                                ? 'bg-primary text-white shadow-[0_20px_40px_-5px_rgba(var(--primary-rgb),0.3)] scale-110 border border-primary/20'
                                                : 'bg-slate-500/5 dark:bg-white/5 text-text-muted hover:bg-slate-500/10 dark:hover:bg-white/10 hover:text-text-main border border-slate-200/50 dark:border-white/10'}
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedSpecialization === spec ? 'bg-white/20' : 'bg-primary/10'}`}>
                                            <Icon size={18} />
                                        </div>
                                        {spec}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Visualization */}
            <div className="card border border-slate-200/60 dark:border-white/5 flex flex-col md:flex-row items-center gap-12 group hover:border-primary/20 transition-all overflow-hidden relative">
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative w-40 h-40 flex-shrink-0 z-10">
                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                        <circle
                            cx="80" cy="80" r="74"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-slate-200 dark:text-white/5"
                        />
                        <circle
                            cx="80" cy="80" r="74"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeDasharray={465}
                            strokeDashoffset={465 - (465 * progressPercent) / 100}
                            strokeLinecap="round"
                            className="text-primary transition-all duration-1500 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-black text-text-main tracking-tighter">{progressPercent}</span>
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Percent</span>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <div className="flex flex-wrap bg-slate-500/5 dark:bg-white/5 p-1.5 rounded-2xl gap-2 border border-slate-200/50 dark:border-white/5 backdrop-blur-md mb-8 w-fit mx-auto md:mx-0">
                        {(['Beginner', 'Intermediate', 'Professional', 'Specialist'] as DifficultyLevel[]).map(level => {
                            // Specialist is unlocked for all registered members (skipping skill progression)
                            const isSpecialistForMember = level === 'Specialist' && userId !== 'guest';
                            const isProgressionUnlocked = userId === 'guest' || userId === 'admin' || progress.unlockedLevels.includes(level) || isSpecialistForMember;

                            const isProRequired = level !== 'Beginner';
                            const isPro = ['pro', 'enterprise', 'PRO', 'ENTERPRISE', 'starter', 'STARTER'].includes(progress.subscriptionStatus);
                            const isPaywalled = isProRequired && !isPro;

                            // Locked if: Not unlocked by skill OR (Unlocked by skill but Paywalled)
                            const isLocked = !isProgressionUnlocked || isPaywalled;
                            const isCurrent = selectedLevel === level;

                            return (
                                <button
                                    key={level}
                                    onClick={() => {
                                        if (isPaywalled) {
                                            if (confirm("This training tier requires a Professional clearance. Initialize upgrade sequence?")) {
                                                onRequestUpgrade?.();
                                            }
                                        } else if (isProgressionUnlocked) {
                                            setSelectedLevel(level);
                                        }
                                    }}
                                    className={`
                                        px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 relative group/level
                                        ${isCurrent
                                            ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-100'
                                            : !isLocked
                                                ? 'text-text-muted hover:bg-slate-500/5 dark:hover:bg-white/5 hover:text-text-main hover:scale-105'
                                                : 'text-text-muted/20 cursor-not-allowed opacity-50'}
                                    `}
                                >
                                    {isPaywalled && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span></span>}
                                    {!isProgressionUnlocked && !isPaywalled && <Lock size={12} className="opacity-40" />}
                                    {isPaywalled && <Shield size={12} className="text-secondary" />}
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                        <Shield size={16} className="text-primary opacity-60" />
                        <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter">{selectedLevel} Operational Status</h3>
                    </div>
                    <p className="text-text-muted mb-10 leading-relaxed font-black uppercase tracking-[0.2em] text-[11px] opacity-40">
                        Operational nodes verified: <span className="text-text-main opacity-100">{progress.completedLessons.length}</span>.
                        Consistency protocol maintaining expected density. Proceed to higher tier sectors.
                    </p>
                    <div className="w-full h-2 bg-slate-500/5 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                        <div
                            className="h-full bg-primary transition-all duration-1500 ease-out rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Lesson Grid */}
            {selectedLevel === 'Specialist' && selectedSpecialization === 'Faith' ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <BiblePractice userId={userId} onSessionComplete={onSessionComplete} hideHeader={true} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {lessons.map((lesson) => {
                        const status = getLessonStatus(lesson);
                        const score = getLessonScore(lesson.id);
                        const isLocked = status === 'locked';

                        return (
                            <div
                                key={lesson.id}
                                className={`
                                card p-10 flex flex-col h-full border transition-all duration-500 group
                                ${status === 'current'
                                        ? 'border-primary/40 ring-4 ring-primary/5 shadow-2xl scale-[1.03] z-10'
                                        : isLocked
                                            ? 'border-slate-200/60 dark:border-white/5 opacity-40 grayscale pointer-events-none'
                                            : 'border-slate-200/60 dark:border-white/5 hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2'}
                            `}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <span className={`
                                    px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border
                                    ${status === 'completed' ? 'bg-primary/10 text-primary border-primary/20' :
                                            status === 'current' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' :
                                                'bg-slate-500/5 dark:bg-white/5 text-text-muted border border-slate-200/50 dark:border-white/5'}
                                `}>
                                        {isLocked && <Lock size={10} className="inline mr-2" />}
                                        Module {lesson.lessonNumber}
                                    </span>

                                    <div className="p-2 bg-slate-500/5 dark:bg-white/5 rounded-lg border border-slate-200/50 dark:border-white/5 group-hover:border-primary/20 transition-all">
                                        <Activity size={12} className="text-text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                <h4 className="text-2xl font-black text-text-main mb-4 tracking-tighter uppercase group-hover:text-primary transition-colors">
                                    {lesson.title}
                                </h4>
                                <p className="text-text-muted text-sm mb-10 line-clamp-2 min-h-[44px] opacity-60 font-medium leading-relaxed">
                                    {lesson.description}
                                </p>

                                <div className="mb-10 p-6 bg-slate-500/5 dark:bg-white/5 rounded-[1.5rem] border border-slate-200/50 dark:border-white/5 group-hover:border-primary/10 transition-all">
                                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted/60 mb-4 font-heading">Primary Objectives</div>
                                    <div className="space-y-3">
                                        {lesson.learningObjectives.slice(0, 2).map((obj, i) => (
                                            <div key={i} className="text-[11px] font-black uppercase text-text-muted hover:text-text-main transition-colors flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></div>
                                                {obj}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    {score ? (
                                        <div className="grid grid-cols-2 gap-4 mb-10">
                                            <div className="p-4 bg-slate-500/5 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 group-hover:bg-primary/5 transition-all text-center">
                                                <div className="text-[9px] font-black text-text-muted/40 uppercase tracking-[0.2em] mb-1">Velocity</div>
                                                <div className="text-2xl font-black text-text-main tracking-tighter">{score.netWPM}</div>
                                                <div className="text-[8px] font-bold uppercase text-primary/60">WPM</div>
                                            </div>
                                            <div className="p-4 bg-slate-500/5 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 group-hover:bg-primary/5 transition-all text-center">
                                                <div className="text-[9px] font-black text-text-muted/40 uppercase tracking-[0.2em] mb-1">Accuracy</div>
                                                <div className="text-2xl font-black text-text-main tracking-tighter">{score.accuracy}%</div>
                                                <div className="text-[8px] font-bold uppercase text-primary/60">Accuracy Level</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-[74px] mb-10 flex flex-col items-center justify-center border border-dashed border-slate-200/60 dark:border-white/10 rounded-2xl">
                                            <div className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.3em]">Module Unsecured</div>
                                            <div className="mt-1 flex gap-1">
                                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10" />)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => !isLocked && onStartLesson(lesson, status === 'completed')}
                                            disabled={isLocked}
                                            className={`
                                            w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group/btn
                                            ${status === 'completed' ? 'bg-slate-500/5 text-primary border border-primary/20 hover:bg-primary hover:text-white shadow-xl hover:shadow-primary/30' :
                                                    status === 'current' ? 'bg-primary text-white shadow-2xl shadow-primary/40 ring-4 ring-primary/10 animate-pulse' :
                                                        isLocked ? 'bg-slate-500/5 text-text-muted/20 border border-slate-200/50 dark:border-white/5 cursor-not-allowed' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'}
                                        `}
                                        >
                                            {status === 'completed' ? (
                                                <>Re-Engage Lesson <Zap size={14} /></>
                                            ) : status === 'current' ? (
                                                <>Resume Lesson <ArrowRight size={14} /></>
                                            ) : isLocked ? (
                                                'Sector Locked'
                                            ) : (
                                                <>Begin Lesson <ArrowRight size={14} /></>
                                            )}
                                        </button>

                                        {status === 'completed' && lesson.practiceVariations && lesson.practiceVariations.length > 0 && (
                                            <button
                                                onClick={() => onViewDrills(lesson)}
                                                className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2"
                                            >
                                                <Compass size={14} />
                                                View {lesson.practiceVariations.length} Drills
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


