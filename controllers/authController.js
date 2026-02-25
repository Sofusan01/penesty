const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET || 'jwtsecretkey';

exports.loginPage = (req, res) => {
    if (req.user) {
        return res.redirect('/profile');
    }
    res.render('auth/login', { error: null });
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.render('auth/login', { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)' });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/profile');
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
};

exports.apiLogin = async (req, res) => {
    const { username, password } = req.body;

    // H3 Fix: Validate input before processing
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username.length > 255 || password.length > 255) {
        return res.status(400).json({ message: 'Input too long' });
    }

    try {
        const user = await User.findOne(username);

        if (user && bcrypt.compareSync(password, user.password)) {
            if (user.is_active === 0) {
                return res.status(403).json({ message: 'Account deactivated' });
            }
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1d' });
            return res.json({ auth: true, token: token });
        }

        res.status(401).json({ message: 'Authentication failed' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
