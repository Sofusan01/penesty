// scripts/init_db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database.');

        db.serialize(() => {
            // Create Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'user'
            )`, (err) => {
                if (err) console.error("Error creating users table:", err);
                else console.log("Users table OK.");
            });

            // Create Estimations Table
            db.run(`CREATE TABLE IF NOT EXISTS estimations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                client_name TEXT,
                device_type TEXT,
                test_type TEXT,
                function_count INTEGER,
                platform_count INTEGER,
                number_of_roles INTEGER DEFAULT 1,
                target_info TEXT,
                estimated_days REAL,
                selected_functions TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error("Error creating estimations table:", err);
                else console.log("Estimations table OK.");
            });

            // NEW: Estimation Config Table
            db.run(`CREATE TABLE IF NOT EXISTS estimation_configs (
                id INTEGER PRIMARY KEY DEFAULT 1,
                hours_per_function REAL DEFAULT 2.0,
                report_overhead_hours REAL DEFAULT 8.0,
                blackbox_factor REAL DEFAULT 1.5,
                graybox_factor REAL DEFAULT 1.0,
                web_factor REAL DEFAULT 1.0,
                mobile_factor REAL DEFAULT 1.2,
                api_factor REAL DEFAULT 0.9,
                infra_factor REAL DEFAULT 0.5,
                updated_at DATETIME
            )`, (err) => {
                if (err) console.error("Error creating estimation_configs table:", err);
                else {
                    // Start transaction to insert if not exists
                    db.run(`INSERT OR IGNORE INTO estimation_configs 
                        (id, hours_per_function, report_overhead_hours, blackbox_factor, graybox_factor, web_factor, mobile_factor, api_factor, infra_factor, updated_at) 
                        VALUES (1, 2.0, 8.0, 1.5, 1.0, 1.0, 1.2, 0.9, 0.5, CURRENT_TIMESTAMP)`,
                        (err) => {
                            if (err) console.error("Error seeding config:", err);
                            else console.log("Estimation Config table OK and Seeded.");
                        });
                }
            });

            console.log("Database initialized. You may run scripts/seed_user.js to create admin.");
        });
    }
});
