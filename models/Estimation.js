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

    findByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM estimations WHERE user_id = ? ORDER BY created_at DESC";
            db.all(sql, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    getAll: () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT estimations.*, users.username FROM estimations LEFT JOIN users ON estimations.user_id = users.id ORDER BY created_at DESC";
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
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
    }
};
