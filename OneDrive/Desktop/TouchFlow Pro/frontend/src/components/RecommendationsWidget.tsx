import React, { useEffect, useState } from 'react';

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
            const response = await fetch(`/api/recommendations/${userId}`);
            const data = await response.json();
            setRecommendations(data.slice(0, 3)); // Show top 3
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
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
            await fetch(`/api/recommendations/${userId}/dismiss/${recId}`, {
                method: 'POST'
            });
            setRecommendations(recs => recs.filter(r => r.id !== recId));
        } catch (error) {
            console.error('Failed to dismiss recommendation:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                <p className="text-slate-600">Complete some drills to get personalized recommendations.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-2xl font-heading font-black text-slate-900">Recommended for You</h3>
            </div>

            <div className="space-y-4">
                {recommendations.map((rec, index) => (
                    <div
                        key={rec.id}
                        className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">
                                        {index === 0 ? '⭐' : index === 1 ? '🔥' : '💡'}
                                    </span>
                                    <h4 className="text-lg font-bold text-slate-900">{rec.title}</h4>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">{rec.reason}</p>

                                <div className="flex items-center gap-2">
                                    {rec.content && onStartPractice && (
                                        <button
                                            onClick={() => handleStart(rec)}
                                            className="px-4 py-2 bg-primary-blue text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md"
                                        >
                                            Start Practice
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDismiss(rec.id)}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-black text-sm">
                                    #{index + 1}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
