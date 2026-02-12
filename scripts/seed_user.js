// scripts/seed_user.js
// Usage: node scripts/seed_user.js <username> <password> <role>

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

const args = process.argv.slice(2);

const seedUsers = [];

if (args.length < 3) {
    if (process.env.NODE_ENV === 'production') {
        console.error("FATAL: In production, you must provide username, password, and role arguments.");
        console.error("Usage: node scripts/seed_user.js <username> <password> <role>");
        process.exit(1);
    } else {
        console.warn("WARNING: Using insecure default credentials. DO NOT USE IN PRODUCTION.");
        seedUsers.push({ username: 'admin', password: 'password123', role: 'admin' });
        // Adding the requested user
        seedUsers.push({ username: 'user', password: 'user123', role: 'user' });
    }
} else {
    seedUsers.push({ username: args[0], password: args[1], role: args[2] });
}

db.serialize(() => {
    const stmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");

    seedUsers.forEach(user => {
        const hash = bcrypt.hashSync(user.password, 10);
        stmt.run(user.username, hash, user.role, (err) => {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.log(`User '${user.username}' already exists.`);
                } else {
                    console.error(`Error creating user '${user.username}':`, err.message);
                }
            } else {
                console.log(`User '${user.username}' created with role '${user.role}'.`);
            }
        });
    });

    stmt.finalize();
});

