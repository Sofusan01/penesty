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
            const hash = bcrypt.hashSync(user.password, 8);
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
    }
};
