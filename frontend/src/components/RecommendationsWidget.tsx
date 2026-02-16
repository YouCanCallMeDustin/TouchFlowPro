import React, { useEffect, useState } from 'react';
import { Target, Star, Flame, Lightbulb, Sparkles, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';

interface Recommendation {
    id: string;
    type: 'drill' | 'lesson' | 'custom';
    title: string;
    reason: string;
    priority: number;
    content?: string;
}

interface Props {
    userId: string;
    onStartPractice?: (content: string, title: string) => void;
}

export const RecommendationsWidget: React.FC<Props> = ({ userId, onStartPractice }) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [userId]);

    const fetchRecommendations = async () => {
        try {
            const data = await apiFetch<any>('/api/recommendations/next');
            if (data.next) {
                const rec: Recommendation = {
                    id: data.next.drillId,
                    type: data.next.mode === 'break' ? 'custom' : 'drill',
                    title: data.next.title || (data.next.mode === 'break' ? 'Take a Break' : 'Recommended Drill'),
                    reason: data.next.reasons?.[0] || 'Recommended for you',
                    priority: 1,
                    content: data.next.content
                };
                setRecommendations([rec]);
            } else {
                setRecommendations([]);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = (rec: Recommendation) => {
        if (rec.content && onStartPractice) {
            onStartPractice(rec.content, rec.title);
        }
    };

    const handleDismiss = async (recId: string) => {
        try {
            await apiFetch(`/api/recommendations/${userId}/dismiss/${recId}`, {
                method: 'POST'
            });
            setRecommendations(recs => recs.filter(r => r.id !== recId));
        } catch (error) {
            console.error('Failed to dismiss recommendation:', error);
        }
    };

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="space-y-6">
                    <div className="h-6 bg-white/5 rounded w-1/3"></div>
                    <div className="space-y-3">
                        <div className="h-24 bg-white/5 rounded-2xl"></div>
                        <div className="h-24 bg-white/5 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="card border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                    <Target size={32} className="text-primary opacity-40" />
                </div>
                <h3 className="text-xl font-black text-text-main mb-2 uppercase tracking-tighter">All Caught Up</h3>
                <p className="text-[11px] font-black text-text-muted uppercase tracking-widest opacity-40">Complete drills to generate new recommendations</p>
            </div>
        );
    }

    const getIcon = (index: number) => {
        if (index === 0) return Star;
        if (index === 1) return Flame;
        return Lightbulb;
    };

    const getColor = (index: number) => {
        if (index === 0) return 'text-yellow-400';
        if (index === 1) return 'text-orange-400';
        return 'text-blue-400';
    };

    return (
        <div className="card border border-white/5 overflow-hidden">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Sparkles size={18} className="text-primary" />
                </div>
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted">Recommended Practice</h3>
                    <div className="text-2xl font-black text-text-main tracking-tighter">Personalized Drills</div>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {recommendations.map((rec, index) => {
                        const Icon = getIcon(index);
                        const color = getColor(index);
                        return (
                            <motion.div
                                key={rec.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={() => handleStart(rec)}
                                className="group relative bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-primary/40 hover:bg-white/[0.08] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-inner"
                            >
                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform duration-500`}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-lg font-black text-text-main truncate uppercase tracking-tight group-hover:text-primary transition-colors">{rec.title}</h4>
                                            <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-widest">{rec.type}</span>
                                        </div>
                                        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest opacity-50 mb-6">{rec.reason}</p>

                                        <div className="flex items-center gap-3">
                                            {rec.content && onStartPractice && (
                                                <div className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                                    Start Session
                                                    <ArrowRight size={12} />
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDismiss(rec.id);
                                                }}
                                                className="p-2.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all relative z-10"
                                                title="Dismiss Suggestion"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 hidden sm:block">
                                        <div className="text-[10px] font-black text-text-muted/20 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                                            {index === 0 ? 'Primary Focus' : index === 1 ? 'Daily Goal' : 'Skill Building'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};
