// middleware/validation.js
module.exports = {
    validateLogin: (req, res, next) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.render('login', { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
        }
        next();
    },
};
