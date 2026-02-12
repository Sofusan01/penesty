// scripts/init_system_settings.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

const defaultSettings = [
    {
        key: 'test_type_constraints',
        value: JSON.stringify({
            "web_application": ["blackbox", "graybox"],
            "mobile_application": ["graybox"],
            "api_webservice": ["graybox"],
            "infrastructure": ["blackbox"]
        }),
        description: 'Allowed test types for each device type.'
    },
    {
        key: 'calculation_rules',
        value: JSON.stringify({
            "hours_per_day": 8,
            "rounding_step": 0.5
        }),
        description: 'Global calculation parameters like Man-Day hours and rounding.'
    },
    {
        key: 'role_rules',
        value: JSON.stringify({
            "min_roles": 1,
            "max_roles": 20,
            "default_roles": 1
        }),
        description: 'Constraints for role counts.'
    },
    {
        key: 'platform_rules',
        value: JSON.stringify({
            "default_platforms": 1,
            "max_platforms": 10,
            "min_platforms": 1
        }),
        description: 'Constraints for platform counts.'
    }
];

db.serialize(() => {
    // Create System Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    const stmt = db.prepare("INSERT OR REPLACE INTO system_settings (key, value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");

    defaultSettings.forEach(setting => {
        stmt.run(setting.key, setting.value, setting.description);
    });

    stmt.finalize();

    console.log("System Settings Table Initialized and Seeded.");
});
