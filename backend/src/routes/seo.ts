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
            let html = fs.readFileSync(indexPath, 'utf-8');

            // Inject the SEO section before the closing body tag
            // This ensures it's part of the static HTML response for crawlers
            const seoSection = `
    <section id="typing-resources" style="background:#111827; padding:4rem 2rem; border-top:1px solid #1e293b; text-align:center;">
      <div style="max-width:900px; margin:0 auto;">
        <h2 style="color:#e2e8f0; font-size:1.8rem; margin-bottom:2rem; font-family:'Segoe UI',system-ui,sans-serif;">Typing Performance Research</h2>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:2rem; text-align:left;">
            <div style="flex: 1 1 300px; background:#1a2236; padding:1.5rem; border-radius:12px; border:1px solid #1e293b;">
                <h3 style="color:#818cf8; font-size:1.2rem; margin-top:0; margin-bottom:0.8rem;">How to Type Faster</h3>
                <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:1rem;">Master advanced techniques, deliberate practice strategies, and neuromuscular optimization.</p>
                <a href="https://touchflowpro.com/how-to-type-faster" style="color:#6366f1; text-decoration:none; font-weight:600;">Read More &rarr;</a>
            </div>
            <div style="flex: 1 1 300px; background:#1a2236; padding:1.5rem; border-radius:12px; border:1px solid #1e293b;">
                <h3 style="color:#818cf8; font-size:1.2rem; margin-top:0; margin-bottom:0.8rem;">Increase WPM from 60 to 100</h3>
                <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:1rem;">A structured 3-phase training system featuring burst conditioning and rhythm acceleration.</p>
                <a href="https://touchflowpro.com/increase-wpm-from-60-to-100" style="color:#6366f1; text-decoration:none; font-weight:600;">Read More &rarr;</a>
            </div>
            <div style="flex: 1 1 300px; background:#1a2236; padding:1.5rem; border-radius:12px; border:1px solid #1e293b;">
                <h3 style="color:#818cf8; font-size:1.2rem; margin-top:0; margin-bottom:0.8rem;">Typing Speed vs Accuracy</h3>
                <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:1rem;">Discover why mechanical precision and high accuracy is the foundational driver of elite speed.</p>
                <a href="https://touchflowpro.com/typing-speed-vs-accuracy" style="color:#6366f1; text-decoration:none; font-weight:600;">Read More &rarr;</a>
            </div>
            <div style="flex: 1 1 300px; background:#1a2236; padding:1.5rem; border-radius:12px; border:1px solid #1e293b;">
                <h3 style="color:#818cf8; font-size:1.2rem; margin-top:0; margin-bottom:0.8rem;">How to Improve Typing Accuracy</h3>
                <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:1rem;">Learn how to correct errors and optimize your accuracy to stop slowing down your typing speed.</p>
                <a href="https://touchflowpro.com/how-to-improve-typing-accuracy" style="color:#6366f1; text-decoration:none; font-weight:600;">Read More &rarr;</a>
            </div>
            <div style="flex: 1 1 300px; background:#1a2236; padding:1.5rem; border-radius:12px; border:1px solid #1e293b;">
                <h3 style="color:#818cf8; font-size:1.2rem; margin-top:0; margin-bottom:0.8rem;">How to Type 60 WPM</h3>
                <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:1rem;">A complete guide to the fundamentals needed to hit the golden 60 words per minute benchmark.</p>
                <a href="https://touchflowpro.com/how-to-type-60-wpm" style="color:#6366f1; text-decoration:none; font-weight:600;">Read More &rarr;</a>
            </div>
            <div style="flex: 1 1 300px; background:#1a2236; padding:1.5rem; border-radius:12px; border:1px solid #1e293b;">
                <h3 style="color:#818cf8; font-size:1.2rem; margin-top:0; margin-bottom:0.8rem;">Medical Typing Test</h3>
                <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:1rem;">Evaluate your healthcare typing speed with real-world clinical documentation and pharmacology terminology.</p>
                <a href="https://touchflowpro.com/medical-transcription-typing-test" style="color:#6366f1; text-decoration:none; font-weight:600;">Read More &rarr;</a>
            </div>
        </div>
      </div>
    </section>
            `;

            if (html.includes('<div id="root"></div>')) {
                html = html.replace('<div id="root"></div>', `<div id="root">\n${seoSection}\n</div>`);
            } else if (html.includes('</body>')) {
                html = html.replace('</body>', `${seoSection}</body>`);
            } else {
                html += seoSection;
            }

            res.send(html);
        } else {
            // If index.html is missing, fall through to next middleware (which might 404 or handle it)
            next();
        }
    } catch (error) {
        console.error('[SEO] Failed to inject homepage content:', error);
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
    { slug: 'what-is-a-good-typing-speed', lastmod: '2026-02-21', priority: '0.7' },
    { slug: 'how-to-type-60-wpm', lastmod: '2026-03-01', priority: '0.8' },
    { slug: 'medical-transcription-typing-test', lastmod: '2026-03-01', priority: '0.8' },
];

// Resolve the directory containing SEO HTML files.
// In dev (ts-node):  __dirname = backend/src/routes  → ../seo
// In prod (compiled): __dirname = dist/backend/src/routes → ../seo
// Resolve the directory containing SEO HTML files.
// In dev (ts-node):  __dirname = backend/src/routes  → ../seo
// In prod (compiled): __dirname = dist/backend/src/routes → ../seo

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------
router.get('/robots.txt', (_req: Request, res: Response) => {
    res.type('text/plain');
    res.send(
        `User-agent: *\nAllow: /\n\nSitemap: https://touchflowpro.com/sitemap.xml\n`
    );
});

// ---------------------------------------------------------------------------
// sitemap.xml
// ---------------------------------------------------------------------------
router.get('/sitemap.xml', (_req: Request, res: Response) => {
    const today = new Date().toISOString().split('T')[0];

    const staticEntries = [
        { loc: 'https://touchflowpro.com/', lastmod: today, priority: '1.0' },
    ];

    const seoEntries = SEO_PAGES.map((p) => ({
        loc: `https://touchflowpro.com/${p.slug}`,
        lastmod: p.lastmod,
        priority: p.priority,
    }));

    const entries = [...staticEntries, ...seoEntries];

    const urls = entries
        .map(
            (e) =>
                `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <priority>${e.priority}</priority>\n  </url>`
        )
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

    res.type('application/xml');
    res.send(xml);
});

// ---------------------------------------------------------------------------
// SEO page routes
// Each registered slug serves its corresponding HTML file directly.
// ---------------------------------------------------------------------------
router.get('/how-to-type-faster', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/how-to-type-faster.html'));
});

router.get('/increase-wpm-from-60-to-100', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/increase-wpm-from-60-to-100.html'));
});

router.get('/typing-speed-vs-accuracy', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/typing-speed-vs-accuracy.html'));
});

router.get('/how-to-improve-typing-accuracy', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/how-to-improve-typing-accuracy.html'));
});

router.get('/what-is-a-good-typing-speed', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/what-is-a-good-typing-speed.html'));
});

router.get('/how-to-type-60-wpm', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/how-to-type-60-wpm.html'));
});

router.get('/medical-transcription-typing-test', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../seo/medical-transcription-typing-test.html'));
});

export default router;
