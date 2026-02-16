// models/Estimation.js
const db = require('../config/sqlite');

module.exports = {
    create: (data) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO estimations 
                (user_id, client_name, device_type, test_type, function_count, platform_count, number_of_roles, target_info, estimated_days, selected_functions) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                data.user_id,
                data.client_name,
                data.device_type,
                data.test_type,
                data.function_count,
                data.platform_count || 1,
                data.number_of_roles || 1,
                data.target_info || '',
                data.estimated_days,
                data.selected_functions || '[]'
            ];

            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, ...data });
            });
        });
    },

    findByUserId: (userId, limit = 10, offset = 0, order = 'DESC') => {
        return new Promise((resolve, reject) => {
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            const sql = `SELECT * FROM estimations WHERE user_id = ? ORDER BY created_at ${sortOrder}, id ${sortOrder} LIMIT ? OFFSET ?`;
            db.all(sql, [userId, limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    getAll: (limit = 10, offset = 0, order = 'DESC') => {
        return new Promise((resolve, reject) => {
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            const sql = `SELECT estimations.*, users.username FROM estimations LEFT JOIN users ON estimations.user_id = users.id ORDER BY created_at ${sortOrder}, estimations.id ${sortOrder} LIMIT ? OFFSET ?`;
            db.all(sql, [limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    count: (userId = null) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT COUNT(*) as count FROM estimations";
            let params = [];

            if (userId) {
                sql += " WHERE user_id = ?";
                params.push(userId);
            }

            db.get(sql, params, (err, row) => {
                if (err) return reject(err);
                resolve(row.count);
            });
        });
    },

    delete: (id, userId) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM estimations WHERE id = ? AND user_id = ?";
            db.run(sql, [id, userId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    },

    // Admin Delete (Can delete any by ID)
    deleteById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM estimations WHERE id = ?";
            db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    },

    bulkDelete: (ids, userId, isAdmin = false) => {
        return new Promise((resolve, reject) => {
            if (!ids || ids.length === 0) return resolve(0);

            const placeholders = ids.map(() => '?').join(',');
            let sql = `DELETE FROM estimations WHERE id IN (${placeholders})`;
            let params = [...ids];

            if (!isAdmin) {
                sql += " AND user_id = ?";
                params.push(userId);
            }

            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
};
