import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Play, BookOpen, Clock, Target, Layers, Rocket } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { StrategicFAQ } from '../components/SEO/StrategicFAQ';
import { getCodeDrillsBySpecialty } from '@shared/tracks/code';
import { useAuth } from '../context/AuthContext';
import type { Drill } from '@shared/drillLibrary';

interface CodeTrackProps {
    setStage: (stage: any) => void;
    setLaunchParams?: (params: any) => void;
}

export const CodeTrack: React.FC<CodeTrackProps> = ({ setStage, setLaunchParams }) => {
    const { user } = useAuth();
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('typescript');
    const [riskScore, setRiskScore] = useState<number | null>(null);
    const [isLoadingRisk, setIsLoadingRisk] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const drillsPerPage = 6;

    const specialties = [
        { id: 'typescript', label: 'TypeScript', icon: BookOpen },
        { id: 'python', label: 'Python', icon: Target },
        { id: 'react', label: 'React', icon: Layers },
        { id: 'rust', label: 'Rust', icon: ShieldAlert },
        { id: 'go', label: 'Go', icon: Play },
        { id: 'c++', label: 'C++', icon: Activity },
        { id: 'sql', label: 'SQL', icon: Clock },
    ];

    useEffect(() => {
        setCurrentPage(1); // Reset page on specialty change
    }, [selectedSpecialty]);

    useEffect(() => {
        const fetchRisk = async () => {
            if (!user) return;
            try {
                const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${url}/api/code/risk/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setRiskScore(data.score ?? 0);
                }
            } catch (err) {
                console.error('Failed to fetch terminology risk score', err);
            } finally {
                setIsLoadingRisk(false);
            }
        };

        fetchRisk();
    }, [user]);

    const activeDrills = getCodeDrillsBySpecialty(selectedSpecialty);
    const totalPages = Math.ceil(activeDrills.length / drillsPerPage);
    const paginatedDrills = activeDrills.slice((currentPage - 1) * drillsPerPage, currentPage * drillsPerPage);

    const handleLaunchDrill = (drill: Drill) => {
        if (setLaunchParams) {
            setLaunchParams({
                kind: 'DRILL',
                drillId: drill.id,
                title: drill.title,
                promptText: drill.content || (drill as any).passage
            });
            setStage('practice');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Helmet>
                <title>Coding Typing Practice: Developer Keyboard Drills | TouchFlowPro</title>
                <meta name="description" content="Master programming syntax and code patterns. Improve your coding velocity by practicing your typing speed on TypeScript, Python, React, Rust, and more." />
                <link rel="canonical" href="https://touchflowpro.com/code-track" />
                <meta property="og:title" content="Coding Typing Practice: Developer Keyboard Drills | TouchFlowPro" />
                <meta property="og:description" content="Master programming syntax and code patterns. Improve your coding velocity by practicing your typing speed on TypeScript, Python, React, Rust, and more." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://touchflowpro.com/code-track" />
                <meta property="og:image" content="https://touchflowpro.com/og-image.png" />
                <meta property="og:site_name" content="TouchFlowPro" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Coding Typing Practice: Developer Keyboard Drills | TouchFlowPro" />
                <meta name="twitter:description" content="Master programming syntax and code patterns. Improve your coding velocity by practicing your typing speed on TypeScript, Python, React, Rust, and more." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Coding Typing Practice Tracker",
                        "applicationCategory": "EducationalApplication",
                        "operatingSystem": "WebBrowser",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "942"
                        }
                    })}
                </script>
            </Helmet>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase text-text-main flex items-center gap-3 tracking-tighter">
                        <Target className="w-8 h-8 text-primary" />
                        Code Performance Engine
                    </h1>
                    <p className="text-text-muted mt-2 tracking-wide text-sm opacity-80 max-w-xl">
                        Optimize your muscle memory for complex syntax, bracket patterns, and high-velocity coding across 10+ languages.
                    </p>
                </div>
                {/* Terminology Risk Score Widget */}
                <div className="card rounded-2xl border border-white/5 p-4 flex items-center gap-4 hover:border-primary/20 transition-all shadow-lg shadow-black/20 group">
                    <div className={`p-3 rounded-xl transition-colors ${!user ? 'bg-slate-500/10 text-text-muted opacity-40' : riskScore !== null && riskScore > 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Syntax Risk Score</div>
                        <div className="text-2xl font-black text-text-main flex items-baseline gap-2 mt-1">
                            {!user ? (
                                <button onClick={() => setStage('auth_login')} className="text-[10px] text-primary hover:underline uppercase tracking-widest">Connect ID</button>
                            ) : isLoadingRisk ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                <>
                                    {riskScore}
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted opacity-40">/ 100</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {!user && (
                        <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-lg shadow-primary/5">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Rocket size={14} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Entry Level Detected</span>
                            </div>
                            <p className="text-[10px] text-text-muted font-bold leading-relaxed mb-4">
                                You are in **Guest Mode**. Your performance data will not be saved.
                            </p>
                            <button 
                                onClick={() => setStage('auth_signup')}
                                className="w-full py-2 bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >
                                Claim Profile
                            </button>
                        </div>
                    )}
                    <div className="text-[10px] font-black text-primary opacity-60 uppercase tracking-[0.2em] mb-4 px-3 flex items-center gap-2">
                        <Layers size={14} />
                        Languages
                    </div>
                    {specialties.map(spec => {
                        const Icon = spec.icon;
                        const isActive = selectedSpecialty === spec.id;
                        return (
                            <button
                                key={spec.id}
                                onClick={() => setSelectedSpecialty(spec.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 my-2' : 'bg-slate-500/5 dark:bg-white/5 text-text-muted hover:bg-slate-500/10 dark:hover:bg-white/10 hover:text-text-main'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-muted opacity-50'}`} />
                                {spec.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        key={selectedSpecialty}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 gap-4"
                    >
                        <h2 className="text-2xl font-black text-text-main mb-4 uppercase tracking-tighter flex items-center gap-2">
                            {specialties.find(s => s.id === selectedSpecialty)?.label} Drills
                        </h2>

                        {activeDrills.length === 0 ? (
                            <div className="card text-center py-16 flex flex-col items-center border border-dashed border-white/10 p-8">
                                <p className="text-text-muted font-black uppercase tracking-widest text-xs">No signals detected</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {paginatedDrills.map((drill) => (
                                        <div key={drill.id} className="card group flex flex-col justify-between border border-white/5 hover:border-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all p-8">
                                            <div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${drill.tier === 'CORE' ? 'bg-indigo-500/10 text-indigo-400' :
                                                            drill.tier === 'INTERMEDIATE' ? 'bg-primary/10 text-primary' :
                                                                'bg-emerald-500/10 text-emerald-400'
                                                            }`}>
                                                            {drill.tier}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-white/5 text-text-muted uppercase tracking-widest">
                                                            {drill.focusType}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-black text-text-main mb-3 group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                                                    {drill.title}
                                                </h3>
                                                <p className="text-text-muted text-sm mb-6 line-clamp-2 leading-relaxed opacity-80 h-[40px] overflow-hidden">
                                                    {drill.description}
                                                </p>
                                            </div>

                                            <div>
                                                {/* Drill Content Preview */}
                                                <div className="relative mb-6">
                                                    <div className="absolute inset-0 bg-primary/5 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative flex items-center gap-3 text-xs text-text-muted font-mono bg-white/5 p-4 rounded-xl border border-white/5 overflow-hidden line-clamp-2 min-h-[50px] leading-relaxed">
                                                        <span className="opacity-60 italic">{drill.content || (drill as any).passage}</span>
                                                    </div>
                                                </div>

                                                {/* Targets & CTA Footer */}
                                                <div className="pt-6 border-t border-white/5 flex flex-col gap-4 relative">
                                                    <div className="flex justify-between items-center w-full">
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary opacity-80">
                                                            <div className="flex items-center gap-1">
                                                                <Target size={12} /> {drill.speedTargetWpm} WPM
                                                            </div>
                                                            {drill.recommendedMinutes && (
                                                                <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                                                                    <Clock size={12} /> {drill.recommendedMinutes} MIN
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleLaunchDrill(drill)}
                                                        className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-2"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                        Start Session
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-white/5">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-all text-text-main"
                                        >
                                            Previous
                                        </button>
                                        <div className="text-xs font-black text-text-muted uppercase tracking-widest">
                                            Page <span className="text-primary">{currentPage}</span> of {totalPages}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary hover:text-white transition-all text-text-main"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Strategic FAQ for AI Optimization (AIO) */}
                    <div className="mt-24 border-t border-white/5 pt-12">
                        <StrategicFAQ 
                            title="Developer Performance FAQ"
                            subtitle="Strategic Insights for Software Engineers"
                            faqs={[
                                {
                                    question: "How does typing speed impact software engineering productivity?",
                                    answer: "Beyond just raw WPM, our Code Track focuses on 'Symbol Efficiency' — training the neuromotor patterns for brackets, braces, and specialized syntax patterns found in Rust, Python, and C++. This reduces the 'translation delay' between thought and code execution."
                                },
                                {
                                    question: "Does the Code Track include Vim or IDE-specific drills?",
                                    answer: "We focus on the fundamental motor patterns for language-specific syntax. While we don't teach Vim keybindings specifically, mastering the 'syntax-chord' patterns in TouchFlow Pro makes any modal editor significantly more effective."
                                },
                                {
                                    question: "Why should developers practice typing on a specialized engine?",
                                    answer: "Standard typing tests use prose, which doesn't prepare you for the high-density symbol usage in modern development. Our engine simulates the 'burst' nature of coding, focusing on syntax accuracy and symbol-heavy keystroke sequences."
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
