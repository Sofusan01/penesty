// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const fs = require('fs');
const path = require('path');

exports.submitFeedback = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const imagePath = req.file ? '/uploads/feedback/' + req.file.filename : null;

        if (!subject || subject.trim() === '') {
            return res.render('pages/feedback', { user: req.user, error: 'Subject cannot be empty.', success: null });
        }

        if (!message || typeof message !== 'string' || message.trim() === '' || message.length > 2000) {
            return res.render('pages/feedback', { user: req.user, error: 'Feedback message cannot be empty or too long.', success: null });
        }

        await Feedback.create(req.user.id, subject.trim(), message.trim(), imagePath);

        // Success redirect
        res.render('pages/feedback', {
            user: req.user,
            error: null,
            success: 'ขอบคุณสำหรับข้อเสนอแนะ! เราได้รับข้อมูลเรียบร้อยแล้ว'
        });

    } catch (err) {
        console.error(err);
        res.render('pages/feedback', { user: req.user, error: 'เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ', success: null });
    }
};

exports.getFeedbackHistory = async (req, res) => {
    try {
        const feedbacks = await Feedback.getAll();
        res.render('pages/feedback_history', {
            user: req.user,
            feedbacks: feedbacks,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.render('pages/dashboard', { user: req.user, error: 'เกิดข้อผิดพลาดในการโหลดประวัติข้อเสนอแนะ', success: null });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;

        // Fetch feedback to get image path before deleting
        const feedback = await Feedback.getById(feedbackId);

        if (feedback && feedback.image_path) {
            // Construct absolute path to the image
            // image_path is like "/uploads/feedback/filename.jpg"
            const uniquePath = feedback.image_path.startsWith('/') ? feedback.image_path.substring(1) : feedback.image_path;
            const absolutePath = path.join(__dirname, '../public', uniquePath);

            // Delete file if it exists
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        await Feedback.delete(feedbackId);
        res.redirect('/feedback/history');
    } catch (err) {
        console.error(err);
        res.redirect('/feedback/history?error=' + encodeURIComponent('ไม่สามารถลบข้อเสนอแนะได้'));
    }
};
