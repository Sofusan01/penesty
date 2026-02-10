// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const path = require('path');
const db = require('./config/sqlite'); // Use sqlite config directly
const { originCheckMiddleware, secureHeadersMiddleware, cspMiddleware } = require('./middleware/security');

const app = express();

// --- PRODUCTION HARDENING: Env Var Validation ---
const REQUIRED_ENV = ['SESSION_SECRET', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
    const missing = REQUIRED_ENV.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`FATAL: Missing required environment variables in production: ${missing.join(', ')}`);
        process.exit(1);
    }
}

// Trust local proxy (necessary for Nginx/Caddy/Cloudflare to pass 'secure' cookies)
app.set('trust proxy', 1);

// Security Middleware (Order matters!)
app.disable('x-powered-by');
app.use(secureHeadersMiddleware);
app.use(cspMiddleware);
app.use(originCheckMiddleware); 

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Persistent Session Store
const SQLiteStore = require('connect-sqlite3')(session);

// Session Config (Hardened)
app.use(session({
    store: new SQLiteStore({ dir: './data', db: 'sessions.sqlite' }),
    secret: process.env.SESSION_SECRET || 'changethisinprod_supersecret',
    resave: false,
    saveUninitialized: false, 
    proxy: true, // Required for 'secure: true' behind a proxy
    name: '__Host-session', // More secure cookie name (prefixed)
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true, // Prevent client JS access
        sameSite: 'lax', // CSRF protection
        secure: process.env.NODE_ENV === 'production' // Only send over HTTPS in prod
    }
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Global Locals for templates
app.use(require('./middleware/commonMiddleware').setLocals);

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));
app.use('/', require('./routes/indexRoutes'));

module.exports = app;
