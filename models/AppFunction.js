// models/AppFunction.js
const db = require('../config/sqlite');

class AppFunction {
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM app_functions ORDER BY name ASC';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else {
                    // Parse the JSON field safe
                    const parsed = rows.map(row => {
                        let wstg = [];
                        try {
                            wstg = JSON.parse(row.mapped_wstg_json || '[]');
                        } catch (e) {
                            console.error(`JSON Parse Error for AppFunction ID ${row.id}:`, e);
                            wstg = [];
                        }
                        return {
                            ...row,
                            mapped_wstg_test_cases: wstg
                        };
                    });
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
                    const parsed = rows.map(row => {
                        let wstg = [];
                        try {
                            wstg = JSON.parse(row.mapped_wstg_json || '[]');
                        } catch (e) {
                            console.error(`JSON Parse Error for AppFunction ID ${row.id}:`, e);
                            wstg = [];
                        }
                        return {
                            ...row,
                            mapped_wstg_test_cases: wstg
                        };
                    });
                    resolve(parsed);
                }
            });
        });
    }
}

module.exports = AppFunction;
