// models/Feedback.js
const db = require('../config/sqlite');

class Feedback {
    /**
     * Create a new feedback entry.
     * @param {number} userId - ID of the user submitting feedback.
     * @param {string} message - Feedback message.
     * @returns {Promise<number>} - ID of the newly created feedback.
     */
    static async create(userId, subject, message, imagePath = null) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO feedbacks (user_id, subject, message, image_path) VALUES (?, ?, ?, ?)';
            db.run(sql, [userId, subject, message, imagePath], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    /**
     * Get all feedbacks (Admin View).
     * @returns {Promise<Array>} - List of feedbacks joined with user details.
     */
    static async getAll(limit = 10, offset = 0, order = 'DESC') {
        return new Promise((resolve, reject) => {
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            const sql = `
                SELECT 
                    f.id, 
                    f.subject,
                    f.message, 
                    f.image_path,
                    f.created_at, 
                    u.username 
                FROM feedbacks f
                JOIN users u ON f.user_id = u.id
                ORDER BY f.created_at ${sortOrder}, f.id ${sortOrder}
                LIMIT ? OFFSET ?
            `;
            db.all(sql, [limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Count all feedbacks.
     * @returns {Promise<number>}
     */
    static async count() {
        return new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) as count FROM feedbacks", [], (err, row) => {
                if (err) return reject(err);
                resolve(row.count);
            });
        });
    }

    /**
     * Get feedback by ID.
     * @param {number} id - Feedback ID.
     * @returns {Promise<Object>} - Feedback object.
     */
    static async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM feedbacks WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    /**
     * Delete a feedback entry by ID.
     * @param {number} id - ID of the feedback to delete.
     * @returns {Promise<void>}
     */
    static async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM feedbacks WHERE id = ?';
            db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Bulk delete feedbacks by IDs.
     * @param {number[]} ids - Array of feedback IDs to delete.
     * @returns {Promise<void>}
     */
    static async bulkDelete(ids) {
        return new Promise((resolve, reject) => {
            if (!ids || ids.length === 0) return resolve();

            const placeholders = ids.map(() => '?').join(',');
            const sql = `DELETE FROM feedbacks WHERE id IN (${placeholders})`;

            db.run(sql, ids, function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

module.exports = Feedback;
