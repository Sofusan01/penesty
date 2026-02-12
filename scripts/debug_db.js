const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Checking 'estimations' table schema...");
    db.all("PRAGMA table_info(estimations)", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(rows);
        }
    });

    console.log("\nChecking row count for estimations...");
    db.get("SELECT COUNT(*) as count FROM estimations", (err, row) => {
        if (err) console.error(err);
        else console.log("Total rows:", row.count);
    });
});

db.close();
