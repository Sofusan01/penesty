// models/Feedback.js
const db = require('../config/sqlite');

class Feedback {
    /**
     * Create a new feedback entry.
     * @param {number} userId - ID of the user submitting feedback.
     * @param {string} message - Feedback message.
     * @returns {Promise<number>} - ID of the newly created feedback.
     */
    static async create(userId, message) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO feedbacks (user_id, message) VALUES (?, ?)';
            db.run(sql, [userId, message], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    /**
     * Get all feedbacks (Admin View).
     * @returns {Promise<Array>} - List of feedbacks joined with user details.
     */
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    f.id, 
                    f.message, 
                    f.created_at, 
                    u.username 
                FROM feedbacks f
                JOIN users u ON f.user_id = u.id
                ORDER BY f.created_at DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = Feedback;
