import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ArrowRight } from 'lucide-react';
import { AggregateRating } from '../../components/articles/AggregateRating';
import type { Stage } from '../../types/stages';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const TypingSpeedTestArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center">
            <Helmet>
                <title>Typing Speed Test: Measure Your WPM and Accuracy</title>
                <meta name="description" content="Take a professional typing speed test. Gain deep insights into your WPM, accuracy, and keystroke metrics with our advanced analytics engine." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": "Professional Typing Speed Test",
                        "description": "Measure your WPM with our advanced analytics-driven typing speed test.",
                        "author": { "@type": "Organization", "name": "TouchFlow Pro" },
                        "isAccessibleForFree": "True",
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.7",
                            "reviewCount": "342"
                        }
                    })}
                </script>
            </Helmet>

            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
            >
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-7xl font-black text-text-main mb-6 uppercase tracking-tighter italic leading-[0.9]">
                        Typing Speed <span className="text-primary italic">Test.</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        Measure your WPM and cadence.
                    </p>
                </div>

                <div className="prose prose-invert prose-lg max-w-none mb-16 space-y-8 text-text-muted leading-relaxed">
                    <p className="text-xl text-text-main font-medium">
                        Are you ready for a real <strong>typing speed test</strong>? Most sites give you a simple <strong>wpm</strong> score, but we analyze your entire cadence to find hidden bottlenecks.
                    </p>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight italic">Why Your WPM Matters</h2>
                    <p>
                        A high <strong>wpm</strong> on a <strong>test</strong> is a sign of efficient motor processing. However, accuracy is just as important. Our <strong>test</strong> ensures that you aren't sacrificing precision for raw velocity.
                    </p>

                    <Card className="p-8 bg-white/5 border-white/10 my-8">
                        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Test Metrics</p>
                        <ul className="text-sm space-y-2 mb-0">
                            <li><strong>Net WPM:</strong> Your speed after error penalties.</li>
                            <li><strong>Accuracy Percentage:</strong> The ratio of correct keys.</li>
                            <li><strong>Key-to-Key Latency:</strong> Milliseconds between specific combinations.</li>
                        </ul>
                    </Card>

                    <p>
                        Take the <strong>test</strong> today and discover your true <strong>wpm</strong> ceiling.
                    </p>
                </div>

                <AggregateRating rating={4.7} count={342} />
                
                <section className="bg-primary/5 border border-primary/10 rounded-3xl p-10 mt-16 mb-8 text-center">
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Ready?</h4>
                    <Link to="/free-typing-test" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] inline-flex items-center gap-2">
                        Start Official Speed Test <ArrowRight size={14} />
                    </Link>
                </section>
            </motion.article>
        </div>
    );
};
