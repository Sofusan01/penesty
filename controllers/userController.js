const User = require('../models/User');

exports.getProfile = (req, res) => {
    res.render('pages/profile', { user: req.user });
};

exports.getSettings = async (req, res) => {
    try {
        const users = await User.getAll();
        res.render('pages/setting', {
            user: req.user,
            users: users,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard?error=' + encodeURIComponent('Failed to load settings'));
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;
        if (parseInt(userId) === req.user.id) {
            return res.redirect('/settings?error=' + encodeURIComponent('You cannot deactivate your own account.'));
        }

        await User.updateStatus(userId, status === '1');
        res.redirect('/settings?success=' + encodeURIComponent('User status updated successfully.'));
    } catch (err) {
        console.error(err);
        res.redirect('/settings?error=' + encodeURIComponent('Failed to update user status.'));
    }
};

exports.apiGetProfile = (req, res) => {
    res.json({
        message: 'Protected data accessed',
        user: req.user
    });
};
