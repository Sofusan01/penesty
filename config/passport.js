const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'jwtsecretkey';

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne(username);

            const genericError = { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)' };

            if (!user) {
                return done(null, false, genericError);
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, genericError);
            }

            if (user.is_active === 0) {
                return done(null, false, { message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            if (user.is_active === 0) {
                return done(null, false, { message: 'Account deactivated' });
            }
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
