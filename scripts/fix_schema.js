const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Starting Database Schema Fix...");

db.serialize(() => {
    // 1. Add created_at
    db.run("ALTER TABLE estimations ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP", (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) console.log("✓ created_at exists");
            else console.error("x created_at error:", err.message);
        } else {
            console.log("✓ Added column: created_at");
        }
    });

    // 2. Add target_info
    db.run("ALTER TABLE estimations ADD COLUMN target_info TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) console.log("✓ target_info exists");
            else console.error("x target_info error:", err.message);
        } else {
            console.log("✓ Added column: target_info");
        }
    });

    // 3. Add number_of_roles
    db.run("ALTER TABLE estimations ADD COLUMN number_of_roles INTEGER DEFAULT 1", (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) console.log("✓ number_of_roles exists");
            else console.error("x number_of_roles error:", err.message);
        } else {
            console.log("✓ Added column: number_of_roles");
        }
    });

    // 4. Add platform_count
    db.run("ALTER TABLE estimations ADD COLUMN platform_count INTEGER DEFAULT 1", (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) console.log("✓ platform_count exists");
            else console.error("x platform_count error:", err.message);
        } else {
            console.log("✓ Added column: platform_count");
        }
    });

    // 5. Check if we need to clean up NULL user_ids (Optional housekeeping)
    db.run("DELETE FROM estimations WHERE user_id IS NULL", (err) => {
        if (!err) console.log("✓ Cleaned up any orphaned rows");
    });
});

db.close(() => {
    console.log("Database Schema Fix Complete.");
});
