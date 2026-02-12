// config/sqlite.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use relative path to data folder
const dbPath = path.join(__dirname, '../data/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        // No auto-init or seeding logic here anymore.
        // Run scripts/init_db.js and scripts/seed_user.js manually.
    }
});

module.exports = db;
