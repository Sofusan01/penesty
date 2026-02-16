// middleware/authMiddleware.js
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.is_active) {
            return next();
        } else {
            // User is deactivated, log them out
            req.logout((err) => {
                if (err) console.error(err);
                return res.redirect('/auth/login?error=' + encodeURIComponent('Your account has been deactivated. Please contact administrator.'));
            });
            return;
        }
    }
    res.redirect('/auth/login');
};

exports.isApiAuthenticated = require('passport').authenticate('jwt', { session: false });

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.is_active && req.user.role === 'admin') {
            return next();
        } else if (!req.user.is_active) {
            req.logout((err) => {
                if (err) console.error(err);
                return res.redirect('/auth/login?error=' + encodeURIComponent('Your account has been deactivated.'));
            });
            return;
        }
        return res.status(403).send('Forbidden: Admins only');
    }
    res.redirect('/auth/login');
};
