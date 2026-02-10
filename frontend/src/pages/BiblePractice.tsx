import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Zap } from 'lucide-react';
import BibleLessonView from '../components/BibleLessonView';
import type { TypingMetrics } from '@shared/types';
import type { BibleVerse } from '@shared/bibleVerses';
import { apiFetch } from '../utils/api';

interface BiblePracticeProps {
    userId: string;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => Promise<any>;
    hideHeader?: boolean;
}

interface BibleBook {
    name: string;
    abbreviation: string;
    testament: 'OT' | 'NT';
    icon: string;
}

type ViewMode = 'books' | 'chapters' | 'practice';

const BiblePractice: React.FC<BiblePracticeProps> = ({ userId, onSessionComplete, hideHeader }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('books');
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Bible book chapter counts for OT/NT (standard counts)
    const bookChapterCounts: Record<string, number> = {
        'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
        'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
        '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
        'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
        'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
        'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14,
        'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3,
        'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
        'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
        '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
        'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3,
        '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13,
        'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
        'Jude': 1, 'Revelation': 22
    };

    // Fetch books on mount
    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('/api/bible/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            const data = await response.json();
            setBooks(data);
        } catch (err) {
            setError('Failed to load Bible books. Please try again.');
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookSelect = (book: BibleBook) => {
        setSelectedBook(book);
        setViewMode('chapters');
    };

    const handleChapterSelect = async (chapterNumber: number) => {
        if (!selectedBook) return;

        try {
            setLoading(true);
            setError(null);
            setSelectedChapter(chapterNumber);

            // Fetch verses from API
            const response = await apiFetch(
                `/api/bible/chapter/${encodeURIComponent(selectedBook.name)}/${chapterNumber}`
            );

            if (!response.ok) throw new Error('Failed to fetch chapter');

            const data = await response.json();

            if (!data.verses || data.verses.length === 0) {
                throw new Error('No verses found for this chapter');
            }

            setChapterVerses(data.verses);
            setViewMode('practice');
        } catch (err: any) {
            setError(err.message || 'Failed to load chapter. Please try again.');
            console.error('Error fetching chapter:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePracticeComplete = async (metrics: TypingMetrics[], keystrokesByVerse?: any[][]) => {
        try {
            // Save practice results for all verses
            for (let i = 0; i < metrics.length; i++) {
                const metric = metrics[i];
                const keystrokes = keystrokesByVerse ? keystrokesByVerse[i] : undefined;

                if (onSessionComplete) {
                    await onSessionComplete(metric, 'bible', `bible-${selectedBook?.name}-${selectedChapter}`, keystrokes);
                } else {
                    await apiFetch(`/api/drills/bible_practice/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ metrics: metric, userId, keystrokes })
                    });
                }
            }
        } catch (error) {
            console.error('Failed to save Bible practice results:', error);
        } finally {
            // Return to chapter selection
            setChapterVerses([]);
            setViewMode('chapters');
        }
    };

    const handleBackToBooks = () => {
        setSelectedBook(null);
        setSelectedChapter(null);
        setChapterVerses([]);
        setError(null);
        setViewMode('books');
    };

    const handleBackToChapters = () => {
        setSelectedChapter(null);
        setChapterVerses([]);
        setError(null);
        setViewMode('chapters');
    };

    // If in practice mode, show the Bible lesson view
    if (viewMode === 'practice' && chapterVerses.length > 0) {
        return (
            <BibleLessonView
                verses={chapterVerses}
                onComplete={handlePracticeComplete}
                onCancel={handleBackToChapters}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Mission Critical Header */}
            {!hideHeader && (viewMode !== 'practice') && (
                <div className="relative overflow-hidden card group min-h-[200px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/5 p-8 sm:p-12 mb-12">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                                <BookOpen size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Scripture Legacy Protocol</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            Bible <span className="text-primary italic">Practice</span>
                        </h1>
                        <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed opacity-60">
                            Practice typing Scripture from the ESV® Bible. Select a book and chapter to begin.
                            <span className="block mt-2 text-primary font-black uppercase tracking-widest text-[9px]">Signal Clarity: 100% Operational</span>
                        </p>
                    </div>

                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden hidden md:block">
                        <svg width="400" height="400" viewBox="0 0 400 400" className="translate-x-20 -translate-y-20 animate-[spin_120s_linear_infinite]">
                            <defs>
                                <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--secondary)" />
                                </linearGradient>
                            </defs>
                            <path d="M 0,200 Q 100,100 200,200 T 400,200" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,100 Q 100,0 200,100 T 400,100" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                            <path d="M 0,300 Q 100,200 200,300 T 400,300" fill="none" stroke="url(#meshGrad)" strokeWidth="0.5" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-10 p-6 bg-accent/10 border border-accent/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Zap size={18} className="text-accent" />
                    </div>
                    <p className="text-accent text-[11px] font-black uppercase tracking-[0.2em]">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && !chapterVerses.length && (
                <div className="flex flex-col justify-center items-center py-24 gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border border-primary/30 blur-sm animate-pulse" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Syncing Scripture Stream...</div>
                </div>
            )}

            {!loading && (
                <div className="space-y-12">
                    {/* Breadcrumb Navigation */}
                    {viewMode !== 'books' && (
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            <button
                                onClick={handleBackToBooks}
                                className="text-primary hover:text-primary/70 transition-colors flex items-center gap-2 group"
                            >
                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                    <BookOpen size={10} />
                                </div>
                                Books
                            </button>
                            <ArrowRight size={10} className="opacity-20 translate-y-[1px]" />
                            {selectedBook && (
                                <span className="text-text-main py-1 px-3 bg-white/5 rounded-lg border border-white/5">{selectedBook.name}</span>
                            )}
                        </div>
                    )}

                    {/* Books View */}
                    {viewMode === 'books' && (
                        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {/* Old Testament */}
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-3xl font-black tracking-tighter uppercase text-text-main">Old <span className="text-primary/60 italic">Testament</span></h2>
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
                                    {books.filter(b => b.testament === 'OT').map((book) => (
                                        <motion.button
                                            key={book.name}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleBookSelect(book)}
                                            className="card p-6 border-white/5 hover:border-primary/30 group text-center"
                                        >
                                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">{book.icon}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-primary transition-colors">
                                                {book.name}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* New Testament */}
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-3xl font-black tracking-tighter uppercase text-text-main">New <span className="text-secondary/60 italic">Testament</span></h2>
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
                                    {books.filter(b => b.testament === 'NT').map((book) => (
                                        <motion.button
                                            key={book.name}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleBookSelect(book)}
                                            className="card p-6 border-white/5 hover:border-secondary/30 group text-center"
                                        >
                                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">{book.icon}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-secondary transition-colors">
                                                {book.name}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chapters View */}
                    {viewMode === 'chapters' && selectedBook && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card p-10 bg-white/[0.02] border-white/5"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="text-6xl">{selectedBook.icon}</div>
                                    <div>
                                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-1">Signal Selection In Progress</div>
                                        <h2 className="text-5xl font-black tracking-tighter uppercase text-text-main">
                                            {selectedBook.name} <span className="text-text-muted/20">—</span> Chapters
                                        </h2>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Total Nodes Available</div>
                                    <div className="text-2xl font-black text-text-main">{bookChapterCounts[selectedBook.name] || '???'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
                                {Array.from({ length: bookChapterCounts[selectedBook.name] || 50 }, (_, i) => i + 1).map((chapterNum) => (
                                    <motion.button
                                        key={chapterNum}
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(var(--primary-rgb), 0.15)', borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleChapterSelect(chapterNum)}
                                        className="aspect-square flex items-center justify-center bg-white/5 border border-white/5 rounded-xl transition-all duration-300 group"
                                    >
                                        <span className="text-lg font-black text-text-muted group-hover:text-primary group-hover:scale-110 transition-all">{chapterNum}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* ESV Copyright Notice */}
            <div className="mt-20 pt-10 border-t border-white/5 opacity-50">
                <p className="text-[10px] font-medium tracking-widest text-text-muted text-center leading-relaxed">
                    Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®),
                    © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
                    {' — '}
                    <a
                        href="https://www.esv.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-black hover:underline"
                    >
                        OFFICIAL ESV PORTAL
                    </a>
                </p>
            </div>
        </div>
    );
};

export default BiblePractice;
