// routes/indexRoutes.js
const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const userController = require('../controllers/userController');

// Clean up the index route if it's just a splash page, or redirect to dashboard if logged in
router.get('/', (req, res) => {
    // If logged in, maybe redirect to dashboard? or show landing page
    res.render('pages/index', { user: req.user });
});

router.get('/dashboard', isAuthenticated, dashboardController.getDashboard);
router.post('/dashboard/estimate', isAuthenticated, dashboardController.calculateEstimation);
router.post('/dashboard/save', isAuthenticated, dashboardController.confirmEstimation);
router.post('/dashboard/delete/:id', isAuthenticated, dashboardController.deleteEstimation); // Changed from GET to POST

router.get('/profile', isAuthenticated, userController.getProfile);

// New Routes
const feedbackController = require('../controllers/feedbackController');

// Routes for Feedback
router.get('/feedback', isAuthenticated, (req, res) => {
    res.render('pages/feedback', { user: req.user, error: null, success: null });
});
router.post('/feedback', isAuthenticated, feedbackController.submitFeedback);
router.get('/feedback/history', isAuthenticated, isAdmin, feedbackController.getFeedbackHistory);

router.get('/settings', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/setting', { user: req.user });
});

// Estimate Calibration (Admin)
const estimateConfigController = require('../controllers/estimateConfigController');
const systemSettingsController = require('../controllers/systemSettingsController');

router.get('/settings/estimate-cal', isAuthenticated, isAdmin, estimateConfigController.getConfig);
router.post('/update-config', isAuthenticated, isAdmin, estimateConfigController.updateConfig);

router.get('/settings/system', isAuthenticated, isAdmin, systemSettingsController.getSettingsPage);
router.post('/settings/system', isAuthenticated, isAdmin, systemSettingsController.updateSettings);

module.exports = router;
