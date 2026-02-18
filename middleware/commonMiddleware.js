exports.setLocals = (req, res, next) => {
    res.locals.path = req.path;
    res.locals.user = req.user || null;
    next();
};
