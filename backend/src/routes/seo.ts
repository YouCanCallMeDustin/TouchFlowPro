import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { resolveResourcePath } from '../lib/pathUtils';

const router = Router();
const seoDir = path.resolve(__dirname, '..', 'seo');

// ---------------------------------------------------------------------------
// Homepage SEO Injection
// ---------------------------------------------------------------------------
router.get('/', (_req: Request, res: Response, next) => {
    try {
        const frontendDist = resolveResourcePath('frontend');
        const indexPath = path.join(frontendDist, 'index.html');

        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            next();
        }
    } catch (error) {
        console.error('[SEO] Failed to serve homepage:', error);
        next();
    }
});

// ---------------------------------------------------------------------------
// SEO Page Registry
// Add new SEO pages here. Each entry maps a URL slug to an HTML file in the
// seo/ directory. This array also feeds the sitemap generator.
// ---------------------------------------------------------------------------
const SEO_PAGES: { slug: string; lastmod: string; priority: string }[] = [
    { slug: 'how-to-type-faster', lastmod: '2026-02-19', priority: '0.8' },
    { slug: 'increase-wpm-from-60-to-100', lastmod: '2026-02-19', priority: '0.8' },
    { slug: 'typing-speed-vs-accuracy', lastmod: '2026-02-19', priority: '0.8' },
    { slug: 'how-to-improve-typing-accuracy', lastmod: '2026-02-21', priority: '0.8' },
    { slug: 'what-is-a-good-typing-speed', lastmod: '2026-04-03', priority: '0.9' },
    { slug: 'how-to-type-60-wpm', lastmod: '2026-03-01', priority: '0.8' },
    { slug: 'medical-transcription-typing-test', lastmod: '2026-03-01', priority: '0.8' },
    { slug: 'legal-typing-test', lastmod: '2026-03-01', priority: '0.8' },
    { slug: 'typing-test-for-programmers', lastmod: '2026-03-01', priority: '0.8' },
    { slug: 'typing-speed-plateau', lastmod: '2026-04-03', priority: '0.9' },
    { slug: 'improve-typing-speed', lastmod: '2026-04-03', priority: '0.9' },
    { slug: '60-wpm-to-100-wpm', lastmod: '2026-04-03', priority: '0.9' },
    { slug: 'touchflow-vs-monkeytype', lastmod: '2026-04-05', priority: '0.9' },
];

/**
 * GET /sitemap.xml
 * Dynamically generates a sitemap based on the SEO pages registry and core site routes.
 */
router.get('/sitemap.xml', (_req: Request, res: Response) => {
    const baseUrl = 'https://touchflowpro.com';
    const now = new Date().toISOString().split('T')[0];

    // Core static pages
    const corePages = [
        { loc: '', priority: '1.0', changefreq: 'daily' },
        { loc: '/free-typing-test', priority: '0.9', changefreq: 'weekly' },
        { loc: '/articles', priority: '0.8', changefreq: 'daily' },
        { loc: '/about', priority: '0.6', changefreq: 'monthly' },
        { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
        { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
        { loc: '/pricing', priority: '0.7', changefreq: 'monthly' },
        { loc: '/medical-track', priority: '0.8', changefreq: 'monthly' },
        { loc: '/legal-track', priority: '0.8', changefreq: 'monthly' },
        { loc: '/coding-track', priority: '0.8', changefreq: 'monthly' },
        { loc: '/bible-practice', priority: '0.8', changefreq: 'monthly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add core pages
    corePages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    // Add SEO articles
    SEO_PAGES.forEach(page => {
        // Special case for 'what-is-a-good-typing-speed' which maps to 'typing-speed-averages'
        const pathSlug = page.slug === 'what-is-a-good-typing-speed' ? 'typing-speed-averages' : page.slug;
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/articles/${pathSlug}</loc>\n`;
        xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

// Resolve the directory containing SEO HTML files.
// In dev (ts-node):  __dirname = backend/src/routes  → ../seo
// In prod (compiled): __dirname = dist/backend/src/routes → ../seo
// Resolve the directory containing SEO HTML files.
// In dev (ts-node):  __dirname = backend/src/routes  → ../seo
// In prod (compiled): __dirname = dist/backend/src/routes → ../seo



// ---------------------------------------------------------------------------
// SEO page routes
// Each registered slug serves its corresponding HTML file directly.
// We prefix these with /articles/ to match the frontend router.
// ---------------------------------------------------------------------------

// Articles Index
router.get('/articles', (_req: Request, res: Response, next) => {
    try {
        const frontendDist = resolveResourcePath('frontend');
        const indexPath = path.join(frontendDist, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            next();
        }
    } catch (e) {
        next();
    }
});

// Individual Articles (Prefixed)
router.get('/articles/how-to-type-faster', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/how-to-type-faster.html'));
});

router.get('/articles/increase-wpm-from-60-to-100', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/increase-wpm-from-60-to-100.html'));
});

router.get('/articles/typing-speed-vs-accuracy', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/typing-speed-vs-accuracy.html'));
});

router.get('/articles/how-to-improve-typing-accuracy', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/how-to-improve-typing-accuracy.html'));
});

router.get('/articles/typing-speed-averages', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/what-is-a-good-typing-speed.html'));
});

router.get('/articles/how-to-type-60-wpm', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/how-to-type-60-wpm.html'));
});

router.get('/articles/medical-transcription-typing-test', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/medical-transcription-typing-test.html'));
});

router.get('/articles/legal-typing-test', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/legal-typing-test.html'));
});

router.get('/articles/typing-test-for-programmers', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/typing-test-for-programmers.html'));
});

router.get('/articles/typing-speed-plateau', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/typing-speed-plateau.html'));
});

router.get('/articles/improve-typing-speed', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/improve-typing-speed.html'));
});

router.get('/articles/60-wpm-to-100-wpm', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/60-wpm-to-100-wpm.html'));
});

// SEO Redirects for old unprefixed paths (maintains SEO juice)
const REDIRECT_MAP: InstanceType<typeof Map<string, string>> = new Map([
    ['/how-to-type-faster', '/articles/how-to-type-faster'],
    ['/increase-wpm-from-60-to-100', '/articles/increase-wpm-from-60-to-100'],
    ['/typing-speed-vs-accuracy', '/articles/typing-speed-vs-accuracy'],
    ['/how-to-improve-typing-accuracy', '/articles/how-to-improve-typing-accuracy'],
    ['/what-is-a-good-typing-speed', '/articles/typing-speed-averages'],
    ['/how-to-type-60-wpm', '/articles/how-to-type-60-wpm'],
    ['/medical-transcription-typing-test', '/articles/medical-transcription-typing-test'],
    ['/legal-typing-test', '/articles/legal-typing-test'],
    ['/typing-test-for-programmers', '/articles/typing-test-for-programmers'],
    ['/code-typing-practice', '/articles/typing-test-for-programmers'],
]);

REDIRECT_MAP.forEach((newPath, oldPath) => {
    router.get(oldPath, (_req, res) => res.redirect(301, newPath));
});

export default router;
