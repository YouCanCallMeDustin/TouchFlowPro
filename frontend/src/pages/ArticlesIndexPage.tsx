import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface ArticlesIndexPageProps {
    onBack: () => void;
}

const articles = [
    {
        title: "TouchFlow Pro vs. MonkeyType: Professional Differences",
        desc: "Why professionals in medical, legal, and engineering fields require the precision and lexical density of TouchFlow Pro over hobbyist typing games.",
        path: "/articles/touchflow-vs-monkeytype",
        readTime: "8 min read"
    },
    {
        title: "How to Break Your Typing Speed Plateau",
        desc: "Stuck at 60 or 80 WPM? Learn the science behind typing speed plateaus and research-backed methods to successfully hit 100+ WPM.",
        path: "/articles/typing-speed-plateau",
        readTime: "7 min read"
    },
    {
        title: "Crossing the Chasm: 60 to 100 WPM",
        desc: "A structural guide on taking your typing speed from an average 60 WPM to an elite 100 WPM.",
        path: "/articles/60-wpm-to-100-wpm",
        readTime: "9 min read"
    },
    {
        title: "Fastest Typing Techniques: Pro Keyboard Strategies",
        desc: "Discover the fastest typing techniques used by competitive typists. Learn pro hacks, chording, and advanced methods.",
        path: "/articles/fastest-typing-techniques",
        readTime: "8 min read"
    },
    {
        title: "How to Improve Typing Speed: Expert Tips",
        desc: "Learn proven deliberate practice techniques to increase your typing speed. Science-backed drills for measurable WPM gains.",
        path: "/articles/improve-typing-speed",
        readTime: "6 min read"
    },
    {
        title: "What Is a Good Typing Speed? Average WPM",
        desc: "Discover what counts as a good typing speed for your profession. Average benchmarks for writers, programmers, and legal.",
        path: "/articles/typing-speed-averages",
        readTime: "5 min read"
    },
    {
        title: "Type Faster & Accurately: Scientific WPM Strategies",
        desc: "Discover the mechanics of typing faster without sacrificing precision. Learn about N-grams and motor learning science.",
        path: "/articles/type-faster-accurately",
        readTime: "11 min read"
    },
    {
        title: "Typing Practice: Daily Keystroke Strategies",
        desc: "Learn the fundamentals of effective daily typing practice. Stop internalizing bad habits and train intentionally.",
        path: "/articles/typing-practice",
        readTime: "6 min read"
    },
    {
        title: "Typing Accuracy: Stop Missing Keystrokes",
        desc: "Why typing accurately is the foundation for fast speeds. Address the 'backspace penalty' killing your total net WPM.",
        path: "/articles/typing-accuracy",
        readTime: "5 min read"
    },
    {
        title: "The Best Typing Platform for Beginners in 2026",
        desc: "Starting your journey? Discover why TouchFlow Pro is the premier typing platform for beginners looking for professional results.",
        path: "/articles/typing-platform-for-beginners",
        readTime: "7 min read"
    },
    {
        title: "Best Typing Platform 2026: Professional Performance Guide",
        desc: "The definitive guide to the leading typing tools of 2026. Why performance architecture is replacing casual games.",
        path: "/articles/best-typing-platforms-2026",
        readTime: "8 min read"
    },
    {
        title: "Ultimate Guide to Typing Speed in 2026",
        desc: "The comprehensive mega-guide covering hardware, posture, training regimens, tracking tools, and raw physical limits.",
        path: "/articles/ultimate-guide-to-typing-speed",
        readTime: "14 min read"
    },
    {
        title: "How to Type Faster: Universal Baseline Rules",
        desc: "Break down the core rules of typing speed improvement. Master the home row, correct finger placements, and baseline posture.",
        path: "/articles/how-to-type-faster",
        readTime: "6 min read"
    },
    {
        title: "Touch Typing Guide: Mastering the Keyboard",
        desc: "A comprehensive guide to authentic touch typing. How to navigate your keyboard entirely via muscle memory without looking down.",
        path: "/articles/touch-typing-guide",
        readTime: "10 min read"
    },
    {
        title: "Taking a Typing Speed Test Properly",
        desc: "How to mentally prepare, measure, and analyze a 1-minute typing test for accurate baseline diagnostic reporting.",
        path: "/articles/typing-speed-test",
        readTime: "4 min read"
    },
    {
        title: "Typing Speed for Lawyers: The ROI of Fast Transcription",
        desc: "Discover how typing speed impacts legal billables. Learn the ROI of fast transcription for lawyers, clerks, and legal assistants.",
        path: "/articles/typing-speed-for-lawyers",
        readTime: "7 min read"
    },
    {
        title: "ICD-10 Typing Practice: Drills for Medical Scribes",
        desc: "Master clinical documentation speed. Dedicated ICD-10 typing practice and SOAP note drills for medical scribes and transcribers.",
        path: "/articles/icd-10-typing-practice",
        readTime: "6 min read"
    },
    {
        title: "VS Code Typing Hacks for Senior Engineers",
        desc: "Optimize your developer workflow. Specialist typing hacks for VS Code, Vim, and high-velocity engineering.",
        path: "/articles/vs-code-typing-hacks",
        readTime: "5 min read"
    }
];

export default function ArticlesIndexPage({ onBack }: ArticlesIndexPageProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="w-full px-4 flex flex-col items-center py-12">
            <Helmet>
                <title>Typing Performance Library: Professional Training & Research | TouchFlow Pro</title>
                <meta name="description" content="Explore our library of professional typing guides. Master 100+ WPM, optimize accuracy, and discover keyboard science for engineers, doctors, and legal pros." />
                <link rel="canonical" href="https://touchflowpro.com/articles" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Typing Performance Library",
                        "url": "https://touchflowpro.com/articles",
                        "description": "Professional training guides and research on typing speed, accuracy, and performance optimization.",
                        "hasPart": articles.map(article => ({
                            "@type": "Article",
                            "headline": article.title,
                            "url": `https://touchflowpro.com${article.path}`
                        }))
                    })}
                </script>
            </Helmet>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl w-full"
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
                </button>

                <div className="flex items-center gap-4 mb-16 border-b border-white/10 pb-12">
                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="text-primary w-8 h-8" />
                     </div>
                     <div>
                          <h1 className="text-4xl md:text-5xl font-black text-text-main mb-2 uppercase tracking-tighter italic">
                              Resource <span className="text-primary italic">Library.</span>
                          </h1>
                          <p className="text-text-muted text-sm font-bold uppercase tracking-widest opacity-60">
                              Accelerate your motor learning.
                          </p>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                    {articles.map((article, idx) => (
                        <motion.div key={idx} variants={itemVariants}>
                            <Link 
                                to={article.path}
                                className="block h-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 group hover:border-primary/20 hover:bg-white/[0.04] transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">
                                    <Clock size={12} className="text-primary" />
                                    {article.readTime}
                                </div>
                                
                                <h2 className="text-lg font-black text-text-main leading-tight mb-3 pr-4 group-hover:text-primary transition-colors">
                                    {article.title}
                                </h2>
                                
                                <p className="text-xs text-text-muted leading-relaxed font-medium mb-6">
                                    {article.desc}
                                </p>
                                
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 group-hover:text-primary transition-colors mt-auto">
                                    Read Guide <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
