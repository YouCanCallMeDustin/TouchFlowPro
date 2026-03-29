import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FaqPageProps {
    onBack: () => void;
}

const faqs = [
    {
        question: "How is TouchFlow Pro different from Monkeytype?",
        answer: "Monkeytype is an excellent tool for raw burst speed testing (usually random dictionary words), but it lacks long-term structured progressive overload. TouchFlow Pro tracks detailed historical keystroke fatigue, provides specific medical/legal/code nomenclatures, implements spaced reflection intervals, and organizes data in a professional organizational dashboard."
    },
    {
        question: "Who is TouchFlow Pro built for?",
        answer: "Our core audience includes medical transcriptionists, paralegals, court reporters, software engineers, and administrative command staff who need to type extremely fast (80-120+ WPM) with near-perfect accuracy under extended durations."
    },
    {
        question: "Is there a free version?",
        answer: "Yes. Basic diagnostic typing tests, reading articles, and limited practice drills are completely free to use without an account. To save your progress and utilize advanced fatigue tracking, a premium subscription is required."
    },
    {
        question: "How do the Professional Tracks work?",
        answer: "When you select a track like Medical or Code, our curriculum engine swaps out standard English words for specialized syntax. For example, the Medical track requires you to type complex pharmacological terms and ICD-10 phrasing to accurately gauge your practical charting speed."
    },
    {
        question: "Can I use TouchFlow Pro for my company?",
        answer: "Yes! Our 'Orgs' feature allows a company administrator to securely dashboard team members, assign practice quotas, and view composite reports for training outcomes."
    }
];

export default function FaqPage({ onBack }: FaqPageProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full px-4 flex flex-col items-center py-12">
            <Helmet>
                <title>Frequently Asked Questions | TouchFlow Pro</title>
                <meta name="description" content="Answers to common questions about TouchFlow Pro pricing, professional tracking engines, organization management, and typing metrics." />
                <link rel="canonical" href="https://touchflowpro.com/faq" />
                <script type="application/ld+json">
                    {JSON.stringify({
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
                    })}
                </script>
            </Helmet>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl w-full"
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
                </button>

                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h1 className="text-4xl md:text-7xl font-black text-text-main mb-6 uppercase tracking-tighter italic leading-[0.9]">
                        Common <span className="text-primary italic">Questions.</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        Everything you need to know about the platform.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="max-w-3xl mx-auto space-y-4 pb-24">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="font-bold text-text-main pr-4">{faq.question}</span>
                                <ChevronDown 
                                    className={`w-5 h-5 text-text-muted transition-transform duration-300 flex-shrink-0 ${openIndex === idx ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-text-muted text-sm leading-relaxed border-t border-white/5 mt-2">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
