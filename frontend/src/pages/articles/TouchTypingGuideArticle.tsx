import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Stage } from '../../types/stages';
import { Card } from '../../components/ui/Card';
import { ArrowRight } from 'lucide-react';
import { AggregateRating } from '../../components/articles/AggregateRating';

interface ArticleProps {
    onNavigate: (stage: Stage) => void;
}

export const TouchTypingGuideArticle: React.FC<ArticleProps> = () => {
    return (
        <div className="min-h-screen py-12 px-4 flex flex-col items-center">
            <Helmet>
                <title>Touch Typing Guide: Learn How to Type Without Looking</title>
                <meta name="description" content="Our comprehensive touch typing guide will help you learn to type faster and more accurately without ever looking at your keyboard." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": "The Ultimate Touch Typing Guide",
                        "description": "Learn touch typing with our step-by-step guide to keyboard mastery.",
                        "author": { "@type": "Organization", "name": "TouchFlow Pro" },
                        "isAccessibleForFree": "True",
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "5.0",
                            "reviewCount": "212"
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
                        Touch Typing <span className="text-primary italic">Guide.</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto font-bold uppercase tracking-wider opacity-60">
                        Learn to type without looking.
                    </p>
                </div>

                <div className="prose prose-invert prose-lg max-w-none mb-16 space-y-8 text-text-muted leading-relaxed">
                    <p className="text-xl text-text-main font-medium">
                        Welcome to the definitive <strong>touch typing guide</strong>. If you want to <strong>learn</strong> how to type at professional speeds, you must master the art of tactile feedback. 
                    </p>

                    <h2 className="text-2xl font-black text-white mt-12 mb-4 uppercase tracking-tight italic">Why Learn Touch Typing?</h2>
                    <p>
                        This <strong>guide</strong> is designed to help you <strong>learn</strong> the most efficient way to use a QWERTY keyboard. By using all ten fingers, you spread the workload and reduce the physical strain on your hands.
                    </p>

                    <Card className="p-8 bg-white/5 border-white/10 my-8">
                        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Phase 1: Key Mapping</p>
                        <p className="text-sm italic opacity-80 mb-0">
                            The first step in any <strong>touch typing guide</strong> is to <strong>learn</strong> the home row. Your indexes should rest on 'F' and 'J' (the keys with the bumps).
                        </p>
                    </Card>

                    <p>
                        Follow this <strong>guide</strong> and you'll <strong>learn</strong> that speed is a byproduct of proper form.
                    </p>
                </div>

                <AggregateRating rating={5.0} count={212} />
                
                <section className="bg-primary/5 border border-primary/10 rounded-3xl p-10 mt-16 mb-8 text-center">
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Take the test</h4>
                    <Link to="/free-typing-test" className="text-primary font-black uppercase tracking-[0.2em] text-[10px] inline-flex items-center gap-2">
                        Free Typing Baseline <ArrowRight size={14} />
                    </Link>
                </section>
            </motion.article>
        </div>
    );
};
