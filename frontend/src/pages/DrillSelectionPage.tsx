import React from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Compass,
    Rocket,
    BookOpen
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Lesson } from '@shared/curriculum';

interface DrillSelectionPageProps {
    lesson: Lesson;
    onStartDrill: (lesson: Lesson, drillText: string) => void;
    onBack: () => void;
}

const DrillSelectionPage: React.FC<DrillSelectionPageProps> = ({ lesson, onStartDrill, onBack }) => {
    return (
        <div className="max-w-6xl mx-auto w-full px-4 py-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6"
                    >
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-primary/20 transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Path</span>
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-primary/20 mb-2">
                        Module {lesson.lessonNumber} • {lesson.category}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic">
                        Select <span className="text-primary">Focus</span> Drill.
                    </h1>
                    <p className="text-text-muted max-w-2xl font-medium opacity-60">
                        {lesson.description} Pick a specific variation below to refine your kinematic precision on the {lesson.title} vector.
                    </p>
                </div>

                <div className="hidden lg:block">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                <Rocket size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40">Tier Focus</div>
                                <div className="text-lg font-black text-text-main uppercase">{lesson.difficulty}</div>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors"></div>
                    </div>
                </div>
            </header>

            {/* Drills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {lesson.practiceVariations?.map((drill, idx) => (
                    <Card key={idx} className="group relative overflow-hidden bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-500 p-8 rounded-[2.5rem]">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 text-primary group-hover:scale-110 transition-transform">
                                        <Compass size={18} />
                                    </div>
                                    <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.4em]">Drill #{idx + 1}</span>
                                </div>
                                <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">Active</div>
                            </div>

                            <div className="mb-8">
                                <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-3 opacity-40">Target String</div>
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 min-h-[80px] group-hover:border-primary/10 transition-all relative overflow-hidden">
                                    <p className="text-sm font-medium text-text-main line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {drill}
                                    </p>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            </div>

                            <Button
                                onClick={() => onStartDrill(lesson, drill)}
                                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20 transition-all font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3"
                            >
                                Initiate Drill
                                <ArrowRight size={14} />
                            </Button>
                        </div>

                        {/* Aesthetic Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 blur-[60px] translate-y-1/2 -translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </Card>
                ))}
            </div>

            {/* Empty State (Shouldn't happen with our library) */}
            {(!lesson.practiceVariations || lesson.practiceVariations.length === 0) && (
                <div className="text-center py-20 bg-white/5 border border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                        <BookOpen size={40} className="text-text-muted opacity-20" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-text-muted opacity-40">No Drills Synchronized</h3>
                    <p className="text-text-muted mt-2 uppercase text-[10px] font-black tracking-[0.3em]">Please check system library integrity</p>
                </div>
            )}
        </div>
    );
};

export default DrillSelectionPage;
