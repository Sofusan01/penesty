// scripts/backup_db.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const backupDir = path.join(__dirname, '../backups');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `database_backup_${timestamp}.sqlite`);

try {
    if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        console.log(`Backup successful: ${backupPath}`);

        // Optional: Keep only last 7 backups
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('database_backup_'))
            .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);

        if (files.length > 7) {
            files.slice(7).forEach(f => {
                fs.unlinkSync(path.join(backupDir, f.name));
                console.log(`Deleted old backup: ${f.name}`);
            });
        }
    } else {
        console.error('Database file not found at:', dbPath);
    }
} catch (err) {
    console.error('Backup failed:', err);
}
