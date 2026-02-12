// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'jwtsecretkey';

// Local Strategy (Async)
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne(username);

            // Security: Use generic error message to prevent Username Enumeration
            const genericError = { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)' };

            if (!user) {
                return done(null, false, genericError);
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, genericError);
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// JWT Strategy (Async)
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

// Serialize
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize (Async)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
