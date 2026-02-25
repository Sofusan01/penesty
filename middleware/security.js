const cspMiddleware = (req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "connect-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "object-src 'none'; " +
        "base-uri 'self';"
    );
    next();
};

const originCheckMiddleware = (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const origin = req.get('Origin');
        const referer = req.get('Referer');
        const host = req.get('Host');

        if (!origin && !referer) {
            return res.status(403).send('Forbidden: Missing Origin/Referer');
        }

        let valid = false;

        try {
            if (origin) {
                const originUrl = new URL(origin);
                if (originUrl.host === host) valid = true;
            }

            if (!valid && referer) {
                const refererUrl = new URL(referer);
                if (refererUrl.host === host) valid = true;
            }
        } catch (e) {
            console.error("Malform Origin/Referer URL:", e.message);
            valid = false;
        }

        if (!valid) {
            console.warn(`[Security] Blocked request. Host: ${host}, Origin: ${origin}, Referer: ${referer}`);
            return res.status(403).send('Forbidden: Invalid Origin/Referer');
        }
    }
    next();
};

const secureHeadersMiddleware = (req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', "geolocation=(), camera=(), microphone=()");
    next();
};

module.exports = {
    cspMiddleware,
    originCheckMiddleware,
    secureHeadersMiddleware
};
