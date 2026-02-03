import React, { useState, useEffect } from 'react';
import type { Lesson, UserProgress } from '@shared/curriculum';
import type { DifficultyLevel } from '@shared/placement';
import { drillLibrary } from '@shared/drillLibrary';
import { Curriculum as CurriculumEngine } from '@shared/curriculum';

interface CurriculumProps {
    userId: string;
    progress: UserProgress;
    onStartLesson: (lesson: Lesson) => void;
    onLevelChange: (level: DifficultyLevel) => void;
}

const Curriculum: React.FC<CurriculumProps> = ({ userId, progress, onStartLesson, onLevelChange: _onLevelChange }) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(progress.assignedLevel);
    const [selectedSpecialization, setSelectedSpecialization] = useState<'Medical' | 'Legal' | 'Coding' | 'Journalism' | 'DevOps' | 'Gaming'>('Medical');

    useEffect(() => {
        // Convert drills to lessons
        const specPrefixes = { 'Medical': 'm', 'Legal': 'l', 'Coding': 'c', 'Journalism': 'j', 'DevOps': 'd', 'Gaming': 'g' };
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
        if (progress.completedLessons.includes(lesson.id)) return 'completed';
        if (progress.currentLesson === lesson.id) return 'current';
        if (userId === 'guest' || CurriculumEngine.isLessonUnlocked(lesson, progress.completedLessons)) return 'available';
        return 'locked';
    };

    const getLessonScore = (lessonId: string) => {
        return progress.lessonScores[lessonId];
    };

    const specPrefixes = { 'Medical': 'm', 'Legal': 'l', 'Coding': 'c', 'Journalism': 'j', 'DevOps': 'd', 'Gaming': 'g' };
    const levelPrefixes = { 'Beginner': 'b', 'Intermediate': 'i', 'Professional': 'p' };

    const currentPrefix = selectedLevel === 'Specialist'
        ? specPrefixes[selectedSpecialization as keyof typeof specPrefixes]
        : levelPrefixes[selectedLevel as keyof typeof levelPrefixes];

    const levelLessons = drillLibrary.filter(d => d.id.startsWith(currentPrefix));

    const progressPercent = CurriculumEngine.calculateLevelProgress(
        progress.completedLessons,
        currentPrefix,
        levelLessons.length
    );

    return (
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/50">
                <div>
                    <h2 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-text-main mb-2">
                        Your Learning Path
                    </h2>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
                        Master each specialized module to unlock the next. Achieve <span className="text-secondary-teal font-bold">95% accuracy</span> to advance through the professional curriculum.
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto">
                        {(['Beginner', 'Intermediate', 'Professional', 'Specialist'] as DifficultyLevel[]).map(level => {
                            const isUnlocked = userId === 'guest' || progress.unlockedLevels.includes(level);
                            const isCurrent = selectedLevel === level;

                            return (
                                <button
                                    key={level}
                                    onClick={() => isUnlocked && setSelectedLevel(level)}
                                    disabled={!isUnlocked}
                                    className={`
                                        px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                                        ${isCurrent
                                            ? 'bg-white text-primary-blue shadow-md scale-100'
                                            : isUnlocked
                                                ? 'text-text-muted hover:bg-white/50 hover:text-text-main'
                                                : 'text-slate-400 cursor-not-allowed opacity-50'}
                                    `}
                                >
                                    {!isUnlocked && <span className="text-xs">🔒</span>}
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Specialist Category Hub */}
            {selectedLevel === 'Specialist' && (
                <div className="flex flex-col items-center gap-6 py-10 border-2 border-primary-blue/10 bg-gradient-to-br from-slate-50 to-blue-50/30 -mx-4 px-4 md:mx-0 md:rounded-[2.5rem] shadow-inner">
                    <div className="text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary-teal mb-3 block">Choose Your Specialty</span>
                        <h3 className="text-3xl font-heading font-black text-text-main tracking-tight">Specialist Mastery Hub</h3>
                        <p className="text-text-muted text-sm mt-2 max-w-md">Targeted elite training for high-precision professional disciplines.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                        {(['Medical', 'Legal', 'Coding', 'Journalism', 'DevOps', 'Gaming'] as const).map(spec => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpecialization(spec)}
                                className={`
                                    px-8 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-3
                                    ${selectedSpecialization === spec
                                        ? 'bg-white text-primary-blue shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] scale-105 border-2 border-primary-blue/20 ring-4 ring-primary-blue/5'
                                        : 'bg-slate-200/40 text-text-muted hover:bg-white hover:text-text-main hover:shadow-xl'}
                                `}
                            >
                                <span className="text-xl filter drop-shadow-sm">
                                    {spec === 'Medical' && '🏥'}
                                    {spec === 'Legal' && '⚖️'}
                                    {spec === 'Coding' && '💻'}
                                    {spec === 'Journalism' && '📰'}
                                    {spec === 'DevOps' && '🛠️'}
                                    {spec === 'Gaming' && '🎮'}
                                </span>
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress Visualization */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-10">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64" cy="64" r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-slate-100"
                        />
                        <circle
                            cx="64" cy="64" r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 - (364.4 * progressPercent) / 100}
                            strokeLinecap="round"
                            className="text-secondary-teal transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-heading font-black text-text-main">{progressPercent}%</span>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-text-main mb-2 tracking-tight">{selectedLevel} Mastery</h3>
                    <p className="text-text-muted mb-6 leading-relaxed">
                        You've completed <span className="font-bold text-text-main">{progress.completedLessons.length}</span> specialized assessments.
                        Keep pushing to reach the next tier of professional proficiency.
                    </p>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-secondary-teal to-primary-blue transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(30,168,168,0.3)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Lesson Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lessons.map((lesson) => {
                    const status = getLessonStatus(lesson);
                    const score = getLessonScore(lesson.id);
                    const isLocked = status === 'locked';

                    return (
                        <div
                            key={lesson.id}
                            className={`
                                relative group bg-white border rounded-3xl p-8 transition-all duration-300
                                ${status === 'current'
                                    ? 'border-accent-orange ring-4 ring-accent-orange/10 shadow-2xl scale-[1.02] z-10'
                                    : isLocked
                                        ? 'border-slate-100 opacity-70 grayscale-[0.5]'
                                        : 'border-slate-200 hover:border-primary-blue/30 hover:shadow-2xl hover:-translate-y-1'}
                            `}
                        >
                            {/* Badges */}
                            <div className="flex justify-between items-start mb-6">
                                <span className={`
                                    px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                    ${status === 'completed' ? 'bg-teal-50 text-teal-700' :
                                        status === 'current' ? 'bg-orange-50 text-orange-700' :
                                            isLocked ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-700'}
                                `}>
                                    {isLocked && "🔒 "}Lesson {lesson.lessonNumber}
                                </span>

                                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
                                    {lesson.category}
                                </span>
                            </div>

                            <h4 className="text-xl font-bold text-text-main mb-2 tracking-tight group-hover:text-primary-blue transition-colors">
                                {lesson.title}
                            </h4>
                            <p className="text-text-muted text-sm mb-6 line-clamp-2 min-h-[40px]">
                                {lesson.description}
                            </p>

                            <div className="mb-8 p-4 bg-slate-100/50 rounded-2xl">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 font-heading">Focus Areas</div>
                                <div className="flex flex-wrap gap-2">
                                    {lesson.learningObjectives.slice(0, 2).map((obj, i) => (
                                        <span key={i} className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-secondary-teal flex-shrink-0"></span>
                                            {obj}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Score Display */}
                            {score ? (
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="text-center p-3 bg-teal-50/30 rounded-2xl border border-teal-100/50">
                                        <div className="text-2xl font-black text-secondary-teal leading-none mb-1">{score.netWPM}</div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-teal-600/70">Avg WPM</div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                                        <div className={`text-2xl font-black leading-none mb-1 ${score.accuracy >= lesson.masteryThreshold ? 'text-primary-blue' : 'text-accent-orange'}`}>
                                            {score.accuracy}%
                                        </div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600/70">Accuracy</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[74px] mb-8 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    Preliminary Phase
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={() => !isLocked && onStartLesson(lesson)}
                                disabled={isLocked}
                                className={`
                                    w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
                                    ${status === 'completed' ? 'bg-secondary-teal hover:bg-teal-700 text-white shadow-lg shadow-teal-200' :
                                        status === 'current' ? 'bg-accent-orange hover:bg-orange-600 text-slate-900 shadow-xl shadow-orange-300 ring-2 ring-white animate-pulse-slow' :
                                            isLocked ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-50' : 'bg-primary-blue hover:bg-blue-800 text-white shadow-lg shadow-blue-200'}
                                `}
                            >
                                {status === 'completed' ? 'Retake Specialist' :
                                    status === 'current' ? 'Resume Mastery' :
                                        isLocked ? 'Module Locked' : 'Begin Assessment'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Curriculum;
