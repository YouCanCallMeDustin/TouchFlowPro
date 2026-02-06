import express from 'express';
import axios from 'axios';

const router = express.Router();

interface CacheEntry {
    data: any;
    timestamp: number;
}

// In-memory cache for Bible verses (max 500 verses as per ESV terms)
const verseCache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 500;
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days


// ESV API configuration
const ESV_API_URL = 'https://api.esv.org/v3/passage/text/';
const ESV_API_KEY = process.env.ESV_API_KEY || '';

// Helper to manage cache size
function addToCache(key: string, data: any) {
    // If cache is full, remove oldest entry
    if (verseCache.size >= CACHE_MAX_SIZE) {
        const firstKey = verseCache.keys().next().value;
        if (firstKey) {
            verseCache.delete(firstKey);
        }
    }

    verseCache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Helper to check if cache entry is valid
function getCachedData(key: string): any | null {
    const entry = verseCache.get(key) as CacheEntry | undefined;

    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
        verseCache.delete(key);
        return null;
    }

    return entry.data;
}

// GET /api/bible/passage/:reference
// Fetch a specific passage (e.g., "John 3:16" or "Psalm 23")
router.get('/passage/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        const cacheKey = `passage:${reference}`;

        // Check cache first
        const cached = getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Fetch from ESV API
        const response = await axios.get(ESV_API_URL, {
            params: {
                q: reference,
                'include-headings': false,
                'include-footnotes': false,
                'include-verse-numbers': true,
                'include-short-copyright': false,
                'include-passage-references': true
            },
            headers: {
                'Authorization': `Token ${ESV_API_KEY}`
            }
        });

        const data = {
            reference: response.data.canonical,
            passages: response.data.passages,
            copyright: 'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.'
        };

        // Cache the result
        addToCache(cacheKey, data);

        res.json(data);
    } catch (error: any) {
        console.error('ESV API error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch Bible passage',
            message: error.response?.data?.detail || error.message
        });
    }
});

// GET /api/bible/chapter/:book/:chapter
// Fetch an entire chapter (e.g., book="John", chapter=3)
router.get('/chapter/:book/:chapter', async (req, res) => {
    try {
        const { book, chapter } = req.params;
        const reference = `${book} ${chapter}`;
        const cacheKey = `chapter:${book}:${chapter}`;

        // Check cache first
        const cached = getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Fetch from ESV API
        const response = await axios.get(ESV_API_URL, {
            params: {
                q: reference,
                'include-headings': false,
                'include-footnotes': false,
                'include-verse-numbers': true,
                'include-short-copyright': false,
                'include-passage-references': true
            },
            headers: {
                'Authorization': `Token ${ESV_API_KEY}`
            }
        });

        // Parse the passage into individual verses
        const passageText = response.data.passages[0];
        const verses = parseVersesFromPassage(passageText, book, parseInt(chapter));

        const data = {
            book,
            chapter: parseInt(chapter),
            verses,
            copyright: 'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.'
        };

        // Cache the result
        addToCache(cacheKey, data);

        res.json(data);
    } catch (error: any) {
        console.error('ESV API error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch Bible chapter',
            message: error.response?.data?.detail || error.message
        });
    }
});

// Helper function to parse verses from passage text
function parseVersesFromPassage(passageText: string, book: string, chapter: number) {
    const verses = [];

    // ESV API returns text with verse numbers in brackets like [1], [2], etc.
    // Split by verse numbers
    const versePattern = /\[(\d+)\]\s*([^\[]+)/g;
    let match;

    while ((match = versePattern.exec(passageText)) !== null) {
        const verseNumber = parseInt(match[1]);
        const verseText = match[2].trim();

        verses.push({
            book,
            chapter,
            verse: verseNumber,
            text: verseText,
            reference: `${book} ${chapter}:${verseNumber}`
        });
    }

    return verses;
}

// GET /api/bible/books
// Get list of all Bible books
router.get('/books', (req, res) => {
    const books = [
        // Old Testament
        { name: 'Genesis', abbreviation: 'Gen', testament: 'OT', icon: '📖' },
        { name: 'Exodus', abbreviation: 'Exod', testament: 'OT', icon: '🔥' },
        { name: 'Leviticus', abbreviation: 'Lev', testament: 'OT', icon: '⚖️' },
        { name: 'Numbers', abbreviation: 'Num', testament: 'OT', icon: '🔢' },
        { name: 'Deuteronomy', abbreviation: 'Deut', testament: 'OT', icon: '📜' },
        { name: 'Joshua', abbreviation: 'Josh', testament: 'OT', icon: '⚔️' },
        { name: 'Judges', abbreviation: 'Judg', testament: 'OT', icon: '⚖️' },
        { name: 'Ruth', abbreviation: 'Ruth', testament: 'OT', icon: '💕' },
        { name: '1 Samuel', abbreviation: '1 Sam', testament: 'OT', icon: '👑' },
        { name: '2 Samuel', abbreviation: '2 Sam', testament: 'OT', icon: '👑' },
        { name: '1 Kings', abbreviation: '1 Kgs', testament: 'OT', icon: '👑' },
        { name: '2 Kings', abbreviation: '2 Kgs', testament: 'OT', icon: '👑' },
        { name: '1 Chronicles', abbreviation: '1 Chr', testament: 'OT', icon: '📚' },
        { name: '2 Chronicles', abbreviation: '2 Chr', testament: 'OT', icon: '📚' },
        { name: 'Ezra', abbreviation: 'Ezra', testament: 'OT', icon: '🏛️' },
        { name: 'Nehemiah', abbreviation: 'Neh', testament: 'OT', icon: '🧱' },
        { name: 'Esther', abbreviation: 'Esth', testament: 'OT', icon: '👸' },
        { name: 'Job', abbreviation: 'Job', testament: 'OT', icon: '😢' },
        { name: 'Psalms', abbreviation: 'Ps', testament: 'OT', icon: '🎵' },
        { name: 'Proverbs', abbreviation: 'Prov', testament: 'OT', icon: '💡' },
        { name: 'Ecclesiastes', abbreviation: 'Eccl', testament: 'OT', icon: '🤔' },
        { name: 'Song of Solomon', abbreviation: 'Song', testament: 'OT', icon: '💝' },
        { name: 'Isaiah', abbreviation: 'Isa', testament: 'OT', icon: '🔮' },
        { name: 'Jeremiah', abbreviation: 'Jer', testament: 'OT', icon: '😭' },
        { name: 'Lamentations', abbreviation: 'Lam', testament: 'OT', icon: '💔' },
        { name: 'Ezekiel', abbreviation: 'Ezek', testament: 'OT', icon: '👁️' },
        { name: 'Daniel', abbreviation: 'Dan', testament: 'OT', icon: '🦁' },
        { name: 'Hosea', abbreviation: 'Hos', testament: 'OT', icon: '💔' },
        { name: 'Joel', abbreviation: 'Joel', testament: 'OT', icon: '🦗' },
        { name: 'Amos', abbreviation: 'Amos', testament: 'OT', icon: '⚖️' },
        { name: 'Obadiah', abbreviation: 'Obad', testament: 'OT', icon: '📜' },
        { name: 'Jonah', abbreviation: 'Jonah', testament: 'OT', icon: '🐋' },
        { name: 'Micah', abbreviation: 'Mic', testament: 'OT', icon: '⚖️' },
        { name: 'Nahum', abbreviation: 'Nah', testament: 'OT', icon: '⚡' },
        { name: 'Habakkuk', abbreviation: 'Hab', testament: 'OT', icon: '❓' },
        { name: 'Zephaniah', abbreviation: 'Zeph', testament: 'OT', icon: '⚖️' },
        { name: 'Haggai', abbreviation: 'Hag', testament: 'OT', icon: '🏛️' },
        { name: 'Zechariah', abbreviation: 'Zech', testament: 'OT', icon: '🔮' },
        { name: 'Malachi', abbreviation: 'Mal', testament: 'OT', icon: '📜' },

        // New Testament
        { name: 'Matthew', abbreviation: 'Matt', testament: 'NT', icon: '📖' },
        { name: 'Mark', abbreviation: 'Mark', testament: 'NT', icon: '🦁' },
        { name: 'Luke', abbreviation: 'Luke', testament: 'NT', icon: '🐂' },
        { name: 'John', abbreviation: 'John', testament: 'NT', icon: '✝️' },
        { name: 'Acts', abbreviation: 'Acts', testament: 'NT', icon: '🔥' },
        { name: 'Romans', abbreviation: 'Rom', testament: 'NT', icon: '📜' },
        { name: '1 Corinthians', abbreviation: '1 Cor', testament: 'NT', icon: '💌' },
        { name: '2 Corinthians', abbreviation: '2 Cor', testament: 'NT', icon: '💌' },
        { name: 'Galatians', abbreviation: 'Gal', testament: 'NT', icon: '🕊️' },
        { name: 'Ephesians', abbreviation: 'Eph', testament: 'NT', icon: '⚔️' },
        { name: 'Philippians', abbreviation: 'Phil', testament: 'NT', icon: '😊' },
        { name: 'Colossians', abbreviation: 'Col', testament: 'NT', icon: '👑' },
        { name: '1 Thessalonians', abbreviation: '1 Thess', testament: 'NT', icon: '🙏' },
        { name: '2 Thessalonians', abbreviation: '2 Thess', testament: 'NT', icon: '🙏' },
        { name: '1 Timothy', abbreviation: '1 Tim', testament: 'NT', icon: '📖' },
        { name: '2 Timothy', abbreviation: '2 Tim', testament: 'NT', icon: '📖' },
        { name: 'Titus', abbreviation: 'Titus', testament: 'NT', icon: '📖' },
        { name: 'Philemon', abbreviation: 'Phlm', testament: 'NT', icon: '💌' },
        { name: 'Hebrews', abbreviation: 'Heb', testament: 'NT', icon: '⚓' },
        { name: 'James', abbreviation: 'Jas', testament: 'NT', icon: '💪' },
        { name: '1 Peter', abbreviation: '1 Pet', testament: 'NT', icon: '🪨' },
        { name: '2 Peter', abbreviation: '2 Pet', testament: 'NT', icon: '🪨' },
        { name: '1 John', abbreviation: '1 John', testament: 'NT', icon: '❤️' },
        { name: '2 John', abbreviation: '2 John', testament: 'NT', icon: '❤️' },
        { name: '3 John', abbreviation: '3 John', testament: 'NT', icon: '❤️' },
        { name: 'Jude', abbreviation: 'Jude', testament: 'NT', icon: '⚡' },
        { name: 'Revelation', abbreviation: 'Rev', testament: 'NT', icon: '🌟' }
    ];

    res.json(books);
});

// Clear cache endpoint (for admin use)
router.post('/cache/clear', (req, res) => {
    verseCache.clear();
    res.json({ message: 'Cache cleared successfully' });
});

export default router;
