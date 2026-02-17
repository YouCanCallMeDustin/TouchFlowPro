import path from 'path';
import fs from 'fs';

/**
 * Robust path discovery for monorepo environments.
 * Finds the absolute path to the database or frontend dist folder by searching
 * relative to the current module and CWD.
 */
export function resolveResourcePath(resource: 'database' | 'frontend'): string {
    const cwd = process.cwd();
    const dirname = __dirname;

    console.log(`[PathDiscovery] Resolving ${resource} (CWD: ${cwd}, __dirname: ${dirname})`);

    // Common search patterns for monorepo structures
    const searchRoots = [
        cwd,
        path.resolve(cwd, '..'), // Up one from backend/dist
        path.resolve(dirname, '../../..'), // Up from dist/backend/src/lib
        path.resolve(dirname, '../../../../..'), // Even deeper
        '/app' // Production default
    ];

    if (resource === 'database') {
        const dbPathPatterns = [
            'backend/prisma/dev.db',
            'prisma/dev.db',
            'dev.db'
        ];

        for (const root of searchRoots) {
            for (const pattern of dbPathPatterns) {
                const fullPath = path.resolve(root, pattern);
                if (fs.existsSync(fullPath)) {
                    console.log(`[PathDiscovery] Found database at: ${fullPath}`);
                    return fullPath;
                }
            }
        }
        // Fallback to a predictable production path if not found
        const fallback = path.resolve(cwd, 'backend/prisma/dev.db');
        console.warn(`[PathDiscovery] Database NOT FOUND. Falling back to: ${fallback}`);
        return fallback;
    } else {
        const frontendPatterns = [
            'frontend/dist',
            'dist'
        ];

        for (const root of searchRoots) {
            for (const pattern of frontendPatterns) {
                const fullPath = path.resolve(root, pattern);
                if (fs.existsSync(path.join(fullPath, 'index.html'))) {
                    console.log(`[PathDiscovery] Found frontend at: ${fullPath}`);
                    return fullPath;
                }
            }
        }
        // Fallback
        const fallback = path.resolve(cwd, 'frontend/dist');
        console.warn(`[PathDiscovery] Frontend NOT FOUND. Falling back to: ${fallback}`);
        return fallback;
    }
}
