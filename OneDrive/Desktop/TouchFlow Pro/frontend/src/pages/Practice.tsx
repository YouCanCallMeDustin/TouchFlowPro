import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { drillLibrary, type Drill } from '@shared/drillLibrary';
import { Curriculum, type Lesson } from '@shared/curriculum';
import LessonView from '../components/LessonView';
import type { TypingMetrics } from '@shared/types';

interface PracticeProps {
    userId: string;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => Promise<any>;
}

const Practice: React.FC<PracticeProps> = ({ userId, onSessionComplete }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
    const [activeDrill, setActiveDrill] = useState<Lesson | null>(null);

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

    const handleStartDrill = (drill: Drill) => {
        // Convert Drill to Lesson on the fly for the view
        const practiceLesson = Curriculum.drillToLesson(drill, 0); // 0 indicates practice/no-number
        setActiveDrill(practiceLesson);
    };

    const handleDrillComplete = async (metrics: TypingMetrics, _passed: boolean, keystrokes?: any[]) => {
        try {
            // Save practice result
            if (activeDrill) {
                if (onSessionComplete) {
                    await onSessionComplete(metrics, 'practice', activeDrill.id, keystrokes);
                } else {
                    await fetch(`/api/drills/${activeDrill.id}/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ metrics, userId })
                    });
                }
            }
        } catch (error) {
            console.error('Failed to save practice result:', error);
        } finally {
            setActiveDrill(null);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-heading font-black text-text-main mb-4">🎯 Practice Arena</h1>
                <p className="text-xl text-text-muted">
                    Choose your challenge. Focus on specific skills or just have fun.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wide">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-primary-blue text-white shadow-md'
                                    : 'bg-slate-50 text-text-muted hover:bg-slate-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-bold text-text-muted mb-2 uppercase tracking-wide">Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                        {difficulties.map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedDifficulty === diff
                                    ? 'bg-secondary-teal text-white shadow-md'
                                    : 'bg-slate-50 text-text-muted hover:bg-slate-100'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Drill Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredDrills.map((drill) => (
                        <motion.div
                            key={drill.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-100 transition-all cursor-pointer group hover:-translate-y-1"
                            onClick={() => handleStartDrill(drill)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${drill.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                    drill.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                        drill.difficulty === 'Professional' ? 'bg-red-100 text-red-700' :
                                            'bg-purple-100 text-purple-700'
                                    }`}>
                                    {drill.difficulty}
                                </span>
                                <span className="text-xs font-bold text-text-muted bg-slate-50 px-2 py-1 rounded-md">
                                    {drill.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-primary-blue transition-colors">
                                {drill.title}
                            </h3>
                            <p className="text-text-muted text-sm mb-4 line-clamp-2">
                                {drill.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-text-muted font-mono bg-slate-50 p-2 rounded-lg truncate">
                                <span className="mr-1">Preview:</span>
                                {drill.content}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-sm font-bold text-primary-blue">Start Practice</span>
                                <span className="text-xl">→</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredDrills.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-text-main">No drills found</h3>
                    <p className="text-text-muted">Try adjusting your filters</p>
                </div>
            )}
        </div>
    );
};

export default Practice;
