// models/AppFunction.js
const db = require('../config/sqlite');

class AppFunction {
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM app_functions ORDER BY name ASC';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else {
                    // Parse the JSON field
                    const parsed = rows.map(row => ({
                        ...row,
                        mapped_wstg_test_cases: JSON.parse(row.mapped_wstg_json || '[]')
                    }));
                    resolve(parsed);
                }
            });
        });
    }

    static async getByIds(ids) {
        if (!ids || ids.length === 0) return [];
        return new Promise((resolve, reject) => {
            const placeholders = ids.map(() => '?').join(',');
            const sql = `SELECT * FROM app_functions WHERE id IN (${placeholders})`;
            db.all(sql, ids, (err, rows) => {
                if (err) reject(err);
                else {
                    const parsed = rows.map(row => ({
                        ...row,
                        mapped_wstg_test_cases: JSON.parse(row.mapped_wstg_json || '[]')
                    }));
                    resolve(parsed);
                }
            });
        });
    }
}

module.exports = AppFunction;
