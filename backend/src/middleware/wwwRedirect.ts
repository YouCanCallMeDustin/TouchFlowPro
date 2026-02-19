import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that 301-redirects www requests to the non-www canonical domain.
 * Only active in production to avoid interfering with local development.
 */
export const wwwRedirect = (req: Request, res: Response, next: NextFunction): void => {
    if (
        process.env.NODE_ENV === 'production' &&
        req.hostname?.startsWith('www.')
    ) {
        const nonWwwHost = req.hostname.replace(/^www\./, '');
        const redirectUrl = `https://${nonWwwHost}${req.originalUrl}`;
        res.redirect(301, redirectUrl);
        return;
    }
    next();
};

export default wwwRedirect;
