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
        <h2 style="color:#e2e8f0; font-size:1.8rem; margin-bottom:2rem; font-family:'Segoe UI',system-ui,sans-serif;">Typing Science Resources</h2>
        <ul style="list-style:none; padding:0; display:flex; flex-wrap:wrap; justify-content:center; gap:2rem;">
          <li><a href="https://touchflowpro.com/how-to-type-faster" style="color:#818cf8; text-decoration:none; font-size:1.1rem; font-weight:500;">How to Type Faster</a></li>
          <li><a href="https://touchflowpro.com/increase-wpm-from-60-to-100" style="color:#818cf8; text-decoration:none; font-size:1.1rem; font-weight:500;">Increase WPM from 60 to 100</a></li>
          <li><a href="https://touchflowpro.com/typing-speed-vs-accuracy" style="color:#818cf8; text-decoration:none; font-size:1.1rem; font-weight:500;">Typing Speed vs Accuracy</a></li>
        </ul>
      </div>
    </section>
            `;

            if (html.includes('</body>')) {
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
for (const page of SEO_PAGES) {
    router.get(`/${page.slug}`, (_req: Request, res: Response) => {
        const filePath = path.join(seoDir, `${page.slug}.html`);

        if (fs.existsSync(filePath)) {
            res.type('html');
            res.sendFile(filePath);
        } else {
            console.error(`[SEO] HTML file not found: ${filePath}`);
            // Fall through to SPA fallback by calling next()
            // But since we're in a router.get, we just 404 here.
            // The SPA fallback in app.ts will catch unmatched routes.
            res.status(404).send('Page not found');
        }
    });
}

export default router;
