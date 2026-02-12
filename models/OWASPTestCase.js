// models/OWASPTestCase.js
const db = require('../config/sqlite');

class OWASPTestCase {
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM owasp_test_cases ORDER BY code ASC';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async updateHours(id, hours) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE owasp_test_cases SET base_hours = ? WHERE id = ?';
            db.run(sql, [hours, id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = OWASPTestCase;
