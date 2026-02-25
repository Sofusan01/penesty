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
            // ค่า base_hours ตรงกับ seed data ใน database.js ทุกตัว
            const sql = `UPDATE owasp_test_cases SET base_hours = CASE 
                WHEN code = 'WSTG-INFO-01' THEN 0.5
                WHEN code = 'WSTG-INFO-02' THEN 0.5
                WHEN code = 'WSTG-INFO-05' THEN 0.5
                WHEN code = 'WSTG-INFO-10' THEN 1.0
                WHEN code = 'WSTG-CNF-01' THEN 1.0
                WHEN code = 'WSTG-CNF-02' THEN 1.0
                WHEN code = 'WSTG-CNF-06' THEN 0.5
                WHEN code = 'WSTG-CNF-07' THEN 0.5
                WHEN code = 'WSTG-IDNT-01' THEN 0.5
                WHEN code = 'WSTG-IDNT-02' THEN 1.0
                WHEN code = 'WSTG-IDNT-04' THEN 1.0
                WHEN code = 'WSTG-ATHN-01' THEN 0.5
                WHEN code = 'WSTG-ATHN-02' THEN 1.0
                WHEN code = 'WSTG-ATHN-03' THEN 1.0
                WHEN code = 'WSTG-ATHZ-02' THEN 1.5
                WHEN code = 'WSTG-ATHZ-03' THEN 1.5
                WHEN code = 'WSTG-ATHZ-04' THEN 1.5
                WHEN code = 'WSTG-SESS-02' THEN 0.5
                WHEN code = 'WSTG-CLNT-01' THEN 1.5
                WHEN code = 'WSTG-CLNT-02' THEN 1.0
                WHEN code = 'WSTG-CLNT-08' THEN 0.5
                WHEN code = 'WSTG-CLNT-12' THEN 0.5
                WHEN code = 'WSTG-INPV-01' THEN 1.0
                WHEN code = 'WSTG-INPV-02' THEN 1.5
                WHEN code = 'WSTG-INPV-05' THEN 2.0
                WHEN code = 'WSTG-INPV-08' THEN 1.0
                WHEN code = 'WSTG-INPV-11' THEN 1.5
                WHEN code = 'WSTG-BUSL-01' THEN 1.5
                WHEN code = 'WSTG-BUSL-02' THEN 1.0
                WHEN code = 'WSTG-BUSL-03' THEN 1.0
                WHEN code = 'WSTG-CRYP-01' THEN 0.5
                WHEN code = 'WSTG-CRYP-02' THEN 1.0
                WHEN code = 'WSTG-CRYP-03' THEN 0.5
                WHEN code = 'WSTG-API-01' THEN 2.0
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
