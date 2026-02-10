// models/EstimationConfig.js
const db = require('../config/sqlite');

class EstimationConfig {
    static async get() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM estimation_configs WHERE id = 1';
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    // Fallback if not seeded properly
                    const defaultConfig = {
                        hours_per_function: 2.0,
                        report_overhead_hours: 8.0,
                        blackbox_factor: 1.5,
                        graybox_factor: 1.0,
                        web_factor: 1.0,
                        mobile_factor: 1.2,
                        api_factor: 0.9,
                        infra_factor: 0.5
                    };
                    resolve(defaultConfig);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static async update(data) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE estimation_configs SET 
                hours_per_function = ?, 
                report_overhead_hours = ?, 
                blackbox_factor = ?, 
                graybox_factor = ?, 
                web_factor = ?, 
                mobile_factor = ?, 
                api_factor = ?, 
                infra_factor = ?, 
                updated_at = CURRENT_TIMESTAMP 
                WHERE id = 1`;

            const params = [
                data.hours_per_function,
                data.report_overhead_hours,
                data.blackbox_factor,
                data.graybox_factor,
                data.web_factor,
                data.mobile_factor,
                data.api_factor,
                data.infra_factor
            ];

            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}

module.exports = EstimationConfig;
