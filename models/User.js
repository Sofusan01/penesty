// models/User.js
const db = require('../config/sqlite');
const bcrypt = require('bcryptjs');

module.exports = {
    findOne: (username) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE username = ?";
            db.get(sql, [username], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE id = ?";
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    },

    create: (user) => {
        return new Promise((resolve, reject) => {
            const hash = bcrypt.hashSync(user.password, 10);
            const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";

            // Note: need to use function() {} to access this.lastID
            db.run(sql, [user.username, hash, user.role || 'user'], function (err) {
                if (err) return reject(err);
                resolve({
                    id: this.lastID,
                    username: user.username,
                    role: user.role || 'user'
                });
            });
        });
    },

    getAll: () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT id, username, role, is_active FROM users ORDER BY id ASC";
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    updateStatus: (id, isActive) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE users SET is_active = ? WHERE id = ?";
            db.run(sql, [isActive ? 1 : 0, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
};
