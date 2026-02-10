// controllers/authController.js
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

// API Handling
exports.apiLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne(username);

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1d' });
            return res.json({ auth: true, token: token });
        }

        res.status(401).json({ message: 'Authentication failed' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
