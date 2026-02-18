module.exports = {
    validateLogin: (req, res, next) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.render('auth/login', { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
        }
        next();
    },
};
