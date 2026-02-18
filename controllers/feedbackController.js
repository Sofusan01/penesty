const Feedback = require('../models/Feedback');
const fs = require('fs');
const path = require('path');
const checkMagicNumbers = require('../utils/fileValidator');

exports.submitFeedback = async (req, res) => {
    try {
        const { subject, message } = req.body;
        let imagePath = null;

        if (req.file) {
            // 1. Verify Magic Bytes (File Signature)
            const filePath = req.file.path;
            const fileCheck = checkMagicNumbers(filePath);

            if (!fileCheck) {
                // If invalid file type (based on content), DELETE immediately
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.render('pages/feedback', {
                    user: req.user,
                    error: 'Unsafe file detected (invalid image signature). Upload rejected.',
                    success: null
                });
            }

            // 2. Additional check: Extension match (optional but good practice)
            const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
            // Simple mapping for common extensions
            const typeMap = { 'jpg': 'jpg', 'jpeg': 'jpg', 'png': 'png', 'gif': 'gif' };

            if (typeMap[ext] !== fileCheck && !(ext === 'jpeg' && fileCheck === 'jpg')) {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.render('pages/feedback', {
                    user: req.user,
                    error: 'File extension does not match content type.',
                    success: null
                });
            }

            // If passed, use the path for DB
            imagePath = '/uploads/feedback/' + req.file.filename;
        }

        if (!subject || subject.trim() === '') {
            // If validation failed, cleanup file
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.render('pages/feedback', { user: req.user, error: 'Subject cannot be empty.', success: null });
        }

        if (!message || typeof message !== 'string' || message.trim() === '' || message.length > 2000) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.render('pages/feedback', { user: req.user, error: 'Feedback message cannot be empty or too long.', success: null });
        }

        await Feedback.create(req.user.id, subject.trim(), message.trim(), imagePath);

        res.render('pages/feedback', {
            user: req.user,
            error: null,
            success: 'ขอบคุณสำหรับข้อเสนอแนะ! เราได้รับข้อมูลเรียบร้อยแล้ว'
        });

    } catch (err) {
        console.error(err);
        // Error handling cleanup
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
        res.redirect('/dashboard?error=' + encodeURIComponent('เกิดข้อผิดพลาดในการโหลดประวัติข้อเสนอแนะ'));
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;

        const feedback = await Feedback.getById(feedbackId);

        if (feedback && feedback.image_path) {
            const uniquePath = feedback.image_path.startsWith('/') ? feedback.image_path.substring(1) : feedback.image_path;
            const absolutePath = path.join(__dirname, '../public', uniquePath);

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
