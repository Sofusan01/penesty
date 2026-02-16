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
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const order = (req.query.order || 'DESC').toUpperCase();

        const totalItems = await Feedback.count();
        const totalPages = Math.ceil(totalItems / limit);

        const feedbacks = await Feedback.getAll(limit, offset, order);

        res.render('pages/feedback_history', {
            user: req.user,
            feedbacks: feedbacks,
            currentPage: page,
            totalPages,
            totalItems,
            order,
            error: req.query.error || null,
            success: req.query.success || null
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
        res.redirect('/feedback/history?success=' + encodeURIComponent('Feedback deleted successfully'));
    } catch (err) {
        console.error(err);
        res.redirect('/feedback/history?error=' + encodeURIComponent('ไม่สามารถลบข้อเสนอแนะได้'));
    }
};

exports.bulkDeleteFeedback = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (typeof ids === 'string') {
            try {
                ids = JSON.parse(ids);
            } catch (e) {
                ids = [];
            }
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.redirect('/feedback/history?error=' + encodeURIComponent("No items selected for deletion."));
        }

        // Fetch all feedbacks to be deleted for image cleanup
        // Since we don't have a bulk get, we'll iterate or fetch all and filter.
        // Fetching all is safer given the likely small number, but iterating by ID is more direct if getById is efficient.
        // Let's iterate for images.
        for (const id of ids) {
            try {
                const feedback = await Feedback.getById(id);
                if (feedback && feedback.image_path) {
                    const uniquePath = feedback.image_path.startsWith('/') ? feedback.image_path.substring(1) : feedback.image_path;
                    const absolutePath = path.join(__dirname, '../public', uniquePath);
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                    }
                }
            } catch (e) {
                console.error(`Error deleting image for feedback ${id}:`, e);
            }
        }

        await Feedback.bulkDelete(ids);

        res.redirect('/feedback/history?success=' + encodeURIComponent(`${ids.length} items deleted successfully.`));
    } catch (err) {
        console.error("Bulk Delete Error:", err);
        res.redirect('/feedback/history?error=' + encodeURIComponent("Failed to delete selected items."));
    }
};
