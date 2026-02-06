import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BibleLessonView from '../components/BibleLessonView';
import type { TypingMetrics } from '@shared/types';
import type { BibleVerse } from '@shared/bibleVerses';

interface BiblePracticeProps {
    userId: string;
}

interface BibleBook {
    name: string;
    abbreviation: string;
    testament: 'OT' | 'NT';
    icon: string;
}

type ViewMode = 'books' | 'chapters' | 'practice';

const BiblePractice: React.FC<BiblePracticeProps> = ({ userId }) => {
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

    const handlePracticeComplete = async (metrics: TypingMetrics[]) => {
        try {
            // Save practice results for all verses
            for (const metric of metrics) {
                await fetch(`/api/drills/bible_practice/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ metrics: metric, userId })
                });
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
                userId={userId}
                onComplete={handlePracticeComplete}
                onCancel={handleBackToChapters}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-heading font-black text-text-main mb-4">📖 Bible Practice</h1>
                <p className="text-xl text-text-muted">
                    Practice typing Scripture from the ESV Bible. Select a book and chapter to begin.
                </p>
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
