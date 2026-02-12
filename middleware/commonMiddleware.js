// middleware/commonMiddleware.js
exports.setLocals = (req, res, next) => {
    res.locals.path = req.path;
    res.locals.user = req.user || null; // Ensure user is always available or null
    next();
};
