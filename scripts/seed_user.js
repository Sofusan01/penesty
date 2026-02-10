// scripts/seed_user.js
// Usage: node scripts/seed_user.js <username> <password> <role>

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

const args = process.argv.slice(2);

if (args.length < 3) {
    if (process.env.NODE_ENV === 'production') {
        console.error("FATAL: In production, you must provide username, password, and role arguments.");
        console.error("Usage: node scripts/seed_user.js <username> <password> <role>");
        process.exit(1);
    } else {
        console.warn("WARNING: Using insecure default credentials (admin/password123). DO NOT USE IN PRODUCTION.");
    }
}

const username = args[0] || 'admin';
const password = args[1] || 'password123';
const role = args[2] || 'admin';

const hash = bcrypt.hashSync(password, 10);

db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hash, role], (err) => {
    if (err) console.error("Error creating user:", err);
    else console.log(`User '${username}' created with role '${role}'.`);
});
