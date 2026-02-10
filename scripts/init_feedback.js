// scripts/init_feedback.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite Database
const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createFeedbackTable();
    }
});

function createFeedbackTable() {
    db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error("Error creating feedbacks table:", err.message);
        } else {
            console.log("Feedbacks table ready (if not existed).");
        }
    });

    db.close();
}
