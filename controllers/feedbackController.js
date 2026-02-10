// controllers/feedbackController.js
const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '' || message.length > 1000) {
            return res.render('pages/feedback', { user: req.user, error: 'Feedback message cannot be empty.', success: null });
        }

        await Feedback.create(req.user.id, message.trim());

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
