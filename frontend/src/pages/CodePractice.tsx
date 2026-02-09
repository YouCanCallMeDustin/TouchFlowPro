import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { codeSnippets } from '../data/codeSnippets';
import { type Lesson } from '@shared/curriculum';
import LessonView from '../components/LessonView';
import type { TypingMetrics } from '@shared/types';
import { Code, Terminal, Play } from 'lucide-react';
import ProFeatureLock from '../components/ProFeatureLock';

interface CodePracticeProps {
    userId: string;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[]) => Promise<any>;
}

const CodePractice: React.FC<CodePracticeProps> = ({ userId, onSessionComplete }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
    const [activeDrill, setActiveDrill] = useState<Lesson | null>(null);

    const languages = ['All', ...Array.from(new Set(codeSnippets.map(s => s.language)))];

    const filteredSnippets = selectedLanguage === 'All'
        ? codeSnippets
        : codeSnippets.filter(s => s.language === selectedLanguage);

    const handleStartDrill = (snippet: typeof codeSnippets[0]) => {
        // Create a Lesson object from the snippet
        const codeLesson: Lesson = {
            id: snippet.id,
            title: snippet.title,
            content: snippet.content,
            difficulty: snippet.difficulty as any,
            category: 'Code',
            description: `Practice typing ${snippet.language} code syntax.`,
            lessonNumber: 0,
            prerequisites: [],
            masteryThreshold: 90,
            learningObjectives: ['Code Syntax Mastery', 'Special Character Accuracy'],
            xpReward: 25,
            order: 999
        };
        setActiveDrill(codeLesson);
    };

    const handleDrillComplete = async (metrics: TypingMetrics, _passed: boolean, keystrokes?: any[]) => {
        try {
            if (activeDrill && onSessionComplete) {
                await onSessionComplete(metrics, 'code', activeDrill.id, keystrokes);
            }
        } catch (error) {
            console.error('Failed to save code practice result:', error);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <ProFeatureLock title="Developer Mode">
                <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-slate-900 border border-slate-700 p-8 sm:p-12 mb-12">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Terminal size={18} className="text-emerald-500" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Developer Mode</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase leading-[0.9]">
                            Code Syntax
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed opacity-70">
                            Master the muscle memory for <span className="text-emerald-500 font-black uppercase tracking-wider">Programming Constructs</span> across multiple languages.
                        </p>
                    </div>

                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none font-mono text-xs text-emerald-500 p-4 break-all overflow-hidden">
                        {`function optimize() { return metrics.filter(m => m.efficiency > 0.9); } // Matrix alignment complete`}
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-12 flex gap-4 p-8 bg-slate-800/50 border-slate-700">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <Code size={18} />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Language</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {languages.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedLanguage === lang
                                    ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 scale-105'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredSnippets.map((snippet) => (
                            <motion.div
                                key={snippet.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card group cursor-pointer bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all p-6"
                                onClick={() => handleStartDrill(snippet)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                                        {snippet.language}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-500 transition-colors tracking-tight">
                                    {snippet.title}
                                </h3>

                                <div className="relative mt-6 bg-black/50 rounded-xl p-4 border border-white/5 font-mono text-xs text-slate-400 overflow-hidden h-32">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />
                                    <pre>{snippet.content}</pre>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500 group-hover:gap-4 transition-all">
                                        Execute
                                        <Play size={16} fill="currentColor" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ProFeatureLock>
        </div>
    );
};

export default CodePractice;
