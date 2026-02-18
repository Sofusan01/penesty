const db = require('../config/sqlite');

class Feedback {
    static async create(userId, subject, message, imagePath = null) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO feedbacks (user_id, subject, message, image_path) VALUES (?, ?, ?, ?)';
            db.run(sql, [userId, subject, message, imagePath], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

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

    static async count() {
        return new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) as count FROM feedbacks", [], (err, row) => {
                if (err) return reject(err);
                resolve(row.count);
            });
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM feedbacks WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM feedbacks WHERE id = ?';
            db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }

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
