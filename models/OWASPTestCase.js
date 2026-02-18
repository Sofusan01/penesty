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

    static async resetDefaults() {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE owasp_test_cases SET base_hours = CASE 
                WHEN code LIKE 'WSTG-INFO-%' THEN 0.5
                WHEN code LIKE 'WSTG-CNF-%' THEN 1.0
                WHEN code LIKE 'WSTG-IDNT-%' THEN 1.0
                WHEN code LIKE 'WSTG-ATHN-%' THEN 1.0
                WHEN code LIKE 'WSTG-ATHZ-%' THEN 1.0
                WHEN code LIKE 'WSTG-SESS-%' THEN 1.0
                WHEN code LIKE 'WSTG-INPV-%' THEN 1.5
                WHEN code LIKE 'WSTG-ERR-%' THEN 0.5
                WHEN code LIKE 'WSTG-CRYP-%' THEN 1.0
                WHEN code LIKE 'WSTG-BUSL-%' THEN 2.0
                WHEN code LIKE 'WSTG-CLNT-%' THEN 1.0
                ELSE 0.5
            END`;

            db.run(sql, [], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = OWASPTestCase;
