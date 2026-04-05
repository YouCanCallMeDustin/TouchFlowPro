import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Zap, Shield, Target } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

interface StrategicFAQProps {
    title?: string;
    subtitle?: string;
    faqs: FAQ[];
}

export const StrategicFAQ: React.FC<StrategicFAQProps> = ({ 
    title = "Frequently Asked Questions", 
    subtitle = "Strategic Insights for Elite Operatives",
    faqs 
}) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // AI Optimization: Inject JSON-LD FAQPage Schema for LLMs (ChatGPT, Claude, etc.)
    useEffect(() => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'faq-schema';
        script.innerHTML = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            const existingScript = document.getElementById('faq-schema');
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [faqs]);

    return (
        <section className="py-24 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                >
                    <HelpCircle size={12} /> Support Intelligence
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter uppercase mb-4 leading-none">
                    {title}
                </h2>
                <p className="text-text-muted text-lg font-medium opacity-60">
                    {subtitle}
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={`group rounded-2xl border transition-all duration-300 ${
                            openIndex === index 
                            ? 'bg-white/5 border-primary/30 shadow-2xl shadow-primary/10' 
                            : 'bg-transparent border-white/5 hover:border-white/20'
                        }`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-8 py-6 flex items-center justify-between text-left gap-4"
                        >
                            <span className={`text-lg font-bold tracking-tight transition-colors ${
                                openIndex === index ? 'text-primary' : 'text-text-main'
                            }`}>
                                {faq.question}
                            </span>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                openIndex === index ? 'bg-primary text-white rotate-180' : 'bg-white/5 text-text-muted group-hover:bg-white/10'
                            }`}>
                                {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                            </div>
                        </button>
                        
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 pb-8 text-text-muted text-base leading-relaxed opacity-80 border-t border-white/5 pt-6">
                                        {faq.answer}
                                        
                                        <div className="mt-6 flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-primary/60 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                                <Target size={12} /> Expert Context
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-secondary/60 bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/10">
                                                <Zap size={12} /> Tactical Insight
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* AIO Trust Signal */}
            <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-primary/[0.03] to-transparent border border-white/5 text-center">
                <Shield size={32} className="mx-auto mb-4 text-primary opacity-50" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted opacity-40">
                    Verified Performance Intelligence Platform
                </p>
            </div>
        </section>
    );
};
