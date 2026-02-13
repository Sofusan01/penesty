require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const path = require('path');
const fs = require('fs');
const SQLiteStore = require('connect-sqlite3')(session);
const db = require('./config/sqlite');
const {
   originCheckMiddleware,
   secureHeadersMiddleware,
   cspMiddleware
} = require('./middleware/security');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

/* ======================================================
   BASIC HARDENING
====================================================== */
// Force false to prevent rate-limit validation errors until we are behind a real proxy
app.set('trust proxy', false);

/* ======================================================
   BASIC HARDENING
====================================================== */
app.disable('x-powered-by');      // Hide Express
app.set('etag', false);           // Reduce fingerprinting

/* ======================================================
   SECURITY MIDDLEWARE (ORDER IMPORTANT)
====================================================== */
app.use(secureHeadersMiddleware);
app.use(cspMiddleware);
app.use(originCheckMiddleware);

/* ======================================================
   VIEW ENGINE
====================================================== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ======================================================
   BODY PARSING
====================================================== */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

/* ======================================================
   STATIC FILES
====================================================== */
app.use(express.static(path.join(__dirname, 'public'), {
   etag: false,
   maxAge: '1d'
}));

/* ======================================================
   SESSION CONFIG (SECURE)
====================================================== */
// Use __Host- prefix only in Production (requires HTTPS)
// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
   fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

const cookieName = isProduction ? '__Host-session' : 'session_id';

app.use(session({
   store: new SQLiteStore({
      dir: './data',
      db: 'sessions.sqlite'
   }),
   secret: process.env.SESSION_SECRET || 'default_dev_secret',
   resave: false,
   saveUninitialized: false,
   name: cookieName, // Secure name for Prod, normal for Dev
   proxy: isProduction, // Proxy only in Prod
   cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction // true for Prod (HTTPS), false for Dev (HTTP)
   }
}));

/* ======================================================
   PASSPORT INIT
====================================================== */
app.use(passport.initialize());
app.use(passport.session());

/* ======================================================
   GLOBAL LOCALS
====================================================== */
app.use(require('./middleware/commonMiddleware').setLocals);

/* ======================================================
   ROUTES
====================================================== */
app.use('/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));
app.use('/', require('./routes/indexRoutes'));

/* ======================================================
   GENERIC 404 HANDLER (Hide stack traces)
====================================================== */
app.use((req, res) => {
   res.status(404).send('Not Found');
});

/* ======================================================
   GLOBAL ERROR HANDLER (No stack leak)
====================================================== */
app.use((err, req, res, next) => {
   console.error(err); // log internally
   res.status(500).send('Internal Server Error');
});

module.exports = app;
