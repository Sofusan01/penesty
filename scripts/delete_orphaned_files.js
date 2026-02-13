const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const uploadsDir = path.join(__dirname, '../public/uploads/feedback');

if (!fs.existsSync(dbPath)) {
    console.error('Database not found at:', dbPath);
    process.exit(1);
}

if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory not found. Nothing to clean.');
    process.exit(0);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
        process.exit(1);
    }
});

db.all('SELECT image_path FROM feedbacks', [], (err, rows) => {
    if (err) {
        console.error('Error querying database:', err);
        db.close();
        process.exit(1);
    }

    const dbImagePaths = new Set();
    rows.forEach(row => {
        if (row.image_path) {
            // Convert /uploads/feedback/filename.jpg to filename.jpg
            const filename = path.basename(row.image_path);
            dbImagePaths.add(filename);
        }
    });

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            db.close();
            process.exit(1);
        }

        let deletedCount = 0;
        files.forEach(file => {
            if (!dbImagePaths.has(file)) {
                const filePath = path.join(uploadsDir, file);
                try {
                    fs.unlinkSync(filePath); // Delete the file
                    console.log(`Deleted orphaned file: ${file}`);
                    deletedCount++;
                } catch (delErr) {
                    console.error(`Failed to delete ${file}:`, delErr);
                }
            } else {
                // console.log(`Kept file (in use): ${file}`);
            }
        });

        console.log(`Cleanup complete. Deleted ${deletedCount} orphaned files.`);
        db.close();
    });
});
