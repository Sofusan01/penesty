// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../config/rateLimiters');
const validation = require('../middleware/validation');

router.get('/login', authController.loginPage);
router.post('/login', loginLimiter, validation.validateLogin, authController.login);

router.get('/logout', authController.logout);

module.exports = router;
