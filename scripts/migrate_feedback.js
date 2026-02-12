const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to DB for migration.');
        runMigration();
    }
});

function runMigration() {
    db.serialize(() => {
        // Add subject column
        db.run("ALTER TABLE feedbacks ADD COLUMN subject TEXT DEFAULT 'No Subject'", (err) => {
            if (err) {
                if (err.message.includes('duplicate column')) {
                    console.log('Subject column likely already exists.');
                } else {
                    console.error('Error adding subject column:', err.message);
                }
            } else {
                console.log('Subject column added.');
            }
        });

        // Add image_path column
        db.run("ALTER TABLE feedbacks ADD COLUMN image_path TEXT", (err) => {
            if (err) {
                if (err.message.includes('duplicate column')) {
                    console.log('Image path column likely already exists.');
                } else {
                    console.error('Error adding image_path column:', err.message);
                }
            } else {
                console.log('Image path column added.');
            }
        });
    });

    // Using timeout to ensure async operations complete before close
    // In real migration tools, we'd chain promises or use async/await properly
    setTimeout(() => {
        db.close();
        console.log("Migration script finished.");
    }, 1000);
}
