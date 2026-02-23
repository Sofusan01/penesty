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

app.set('trust proxy', false);

app.disable('x-powered-by');

app.set('etag', false);

app.use(secureHeadersMiddleware);

app.use(cspMiddleware);

app.use(originCheckMiddleware);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public'), {
   etag: false,
   maxAge: '1d'
}));

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
   name: cookieName,
   proxy: isProduction,
   cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction
   }
}));

app.use(passport.initialize());

app.use(passport.session());

app.use(require('./middleware/commonMiddleware').setLocals);

app.use('/auth', require('./routes/authRoutes'));

app.use('/api', require('./routes/apiRoutes'));

app.use('/', require('./routes/indexRoutes'));

app.use((req, res) => {
   if (req.originalUrl.startsWith('/api/')) {
       return res.status(404).json({ error: 'API Endpoint Not Found' });
   }
   res.status(404).render('pages/404', { url: req.originalUrl, user: req.user });
});

app.use((err, req, res, next) => {
   console.error("\x1b[31m[Server Error]\x1b[0m", err);
   if (req.originalUrl.startsWith('/api/')) {
       return res.status(500).json({ error: 'Internal Server Error' });
   }
   res.status(500).render('pages/500', { 
       error: process.env.NODE_ENV === 'production' ? 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' : err.message,
       user: req.user || null 
   });
});

module.exports = app;
