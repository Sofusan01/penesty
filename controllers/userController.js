// controllers/userController.js
exports.getProfile = (req, res) => {
    res.render('pages/profile', { user: req.user });
};

exports.apiGetProfile = (req, res) => {
    res.json({
        message: 'Protected data accessed',
        user: req.user
    });
};
