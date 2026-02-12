// middleware/security.js

// 4. CONTENT SECURITY POLICY
// Minimize unsafe-inline/eval. 
// Note: EJS often needs unsafe-inline for scripts in templates unless moved to files/nonces.
// For strictness, we remove unsafe-eval.
const cspMiddleware = (req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "connect-src 'self'; " + // Explicitly allow AJAX/Fetch to self
        "script-src 'self' 'unsafe-inline'; " + // Allow inline scripts (needed for template logic)
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "object-src 'none'; " +
        "base-uri 'self';"
    );
    next();
};

// 2. SECURITY FIXES
// Enforce Origin / Referer validation for state-changing requests
const originCheckMiddleware = (req, res, next) => {
    // Only verify on state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const origin = req.get('Origin');
        const referer = req.get('Referer');
        // Support Nginx/Proxy: Check X-Forwarded-Host first, then Host
        const host = req.get('X-Forwarded-Host') || req.get('Host');

        // Allow requests with no Origin/Referer if receiving from non-browser agents (optional policy)
        // But for browser security, we usually expect one.
        if (!origin && !referer) {
            // Strict mode: Block if neither is present
            return res.status(403).send('Forbidden: Missing Origin/Referer');
        }

        let valid = false;

        try {
            if (origin) {
                const originUrl = new URL(origin);
                if (originUrl.host === host) valid = true;
            }

            // Fallback to Referer if Origin matches or if strictly relying on Referer
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
