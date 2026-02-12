// middleware/authMiddleware.js
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // If user is not authenticated, redirect to login page.
    // Ensure the login route is correct per new structure.
    res.redirect('/auth/login');
};

exports.isApiAuthenticated = require('passport').authenticate('jwt', { session: false });

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    // If authenticated but not admin, return 403 Forbidden
    if (req.isAuthenticated()) {
        return res.status(403).send('Forbidden: Admins only');
    }
    // If not authenticated at all, redirect to login
    res.redirect('/auth/login');
};
