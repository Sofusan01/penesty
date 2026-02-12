// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { loginLimiter, apiLimiter } = require('../config/rateLimiters');
const { isApiAuthenticated } = require('../middleware/authMiddleware');

router.post('/login', loginLimiter, authController.apiLogin);
router.get('/profile', apiLimiter, isApiAuthenticated, userController.apiGetProfile);

module.exports = router;
