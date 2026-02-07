import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import BibleLessonView from '../components/BibleLessonView';
import type { TypingMetrics } from '@shared/types';
import type { BibleVerse } from '@shared/bibleVerses';

interface BiblePracticeProps {
    userId: string;
    onSessionComplete?: (metrics: TypingMetrics, type: string, drillId: string, keystrokes?: any[], liveMetrics?: any[]) => Promise<any>;
}

interface BibleBook {
    name: string;
    abbreviation: string;
    testament: 'OT' | 'NT';
    icon: string;
}

type ViewMode = 'books' | 'chapters' | 'practice';

const BiblePractice: React.FC<BiblePracticeProps> = ({ userId, onSessionComplete }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('books');
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch books on mount
    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/bible/books');
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
            const response = await fetch(
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
                    await fetch(`/api/drills/bible_practice/complete`, {
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
            {/* Header */}
            {/* Header */}
            <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12 mb-12">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <BookOpen size={18} className="text-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Scripture Legacy</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                        Bible Practice
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                        Practice typing Scripture from the <span className="text-primary font-black uppercase tracking-wider">ESV Bible</span>. Select a book and chapter to begin.
                    </p>
                </div>

                {/* Decorative Abstract Mesh */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden hidden md:block">
                    <svg width="400" height="400" viewBox="0 0 400 400" className="translate-x-20 -translate-y-20 animate-[spin_60s_linear_infinite]">
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

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                </div>
            )}

            {/* Breadcrumb Navigation */}
            {viewMode !== 'books' && (
                <div className="mb-6 flex items-center gap-2 text-sm">
                    <button
                        onClick={handleBackToBooks}
                        className="text-primary-blue hover:underline font-semibold"
                    >
                        Books
                    </button>
                    {selectedBook && (
                        <>
                            <span className="text-text-muted">/</span>
                            <span className="text-text-main font-semibold">{selectedBook.name}</span>
                        </>
                    )}
                </div>
            )}

            {/* Books View */}
            {viewMode === 'books' && !loading && (
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Old Testament */}
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-text-main mb-4">Old Testament</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {books.filter(b => b.testament === 'OT').map((book) => (
                                    <motion.button
                                        key={book.name}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleBookSelect(book)}
                                        className="p-4 bg-surface-dark border border-border-subtle rounded-lg hover:border-primary-blue transition-all group"
                                    >
                                        <div className="text-3xl mb-2">{book.icon}</div>
                                        <div className="text-sm font-semibold text-text-main group-hover:text-primary-blue transition-colors">
                                            {book.name}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* New Testament */}
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-text-main mb-4">New Testament</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {books.filter(b => b.testament === 'NT').map((book) => (
                                    <motion.button
                                        key={book.name}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleBookSelect(book)}
                                        className="p-4 bg-surface-dark border border-border-subtle rounded-lg hover:border-primary-blue transition-all group"
                                    >
                                        <div className="text-3xl mb-2">{book.icon}</div>
                                        <div className="text-sm font-semibold text-text-main group-hover:text-primary-blue transition-colors">
                                            {book.name}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Chapters View */}
            {viewMode === 'chapters' && selectedBook && !loading && (
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2 className="text-2xl font-heading font-bold text-text-main mb-6">
                            {selectedBook.icon} {selectedBook.name} - Select a Chapter
                        </h2>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                            {/* Generate chapter buttons - we'll show 50 chapters max for now */}
                            {Array.from({ length: 50 }, (_, i) => i + 1).map((chapterNum) => (
                                <motion.button
                                    key={chapterNum}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleChapterSelect(chapterNum)}
                                    className="aspect-square p-4 bg-surface-dark border border-border-subtle rounded-lg hover:border-primary-blue hover:bg-primary-blue/10 transition-all"
                                >
                                    <span className="text-lg font-bold text-text-main">{chapterNum}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* ESV Copyright Notice */}
            <div className="mt-12 pt-8 border-t border-border-subtle">
                <p className="text-xs text-text-muted text-center">
                    Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®),
                    © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
                    {' '}
                    <a
                        href="https://www.esv.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-blue hover:underline"
                    >
                        www.esv.org
                    </a>
                </p>
            </div>
        </div>
    );
};

export default BiblePractice;
