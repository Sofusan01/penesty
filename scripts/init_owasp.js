// scripts/init_owasp.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

const defaultOWASP = [
    { code: 'WSTG-INFO-01', category: 'Information Gathering', name: 'Conduct Search Engine Discovery', base_hours: 0.5 },
    { code: 'WSTG-INFO-02', category: 'Information Gathering', name: 'Fingerprint Web Server', base_hours: 0.5 },
    { code: 'WSTG-CNF-01', category: 'Configuration Management', name: 'Test Network/Infrastructure', base_hours: 1.0 },
    { code: 'WSTG-CNF-02', category: 'Configuration Management', name: 'Test Platform Configuration', base_hours: 1.0 },
    { code: 'WSTG-IDNT-01', category: 'Identity Management', name: 'Test Role Definitions', base_hours: 0.5 },
    { code: 'WSTG-IDNT-02', category: 'Identity Management', name: 'Test User Registration Process', base_hours: 1.0 },
    { code: 'WSTG-CLNT-01', category: 'Client Side Testing', name: 'Test for DOM-Based XSS', base_hours: 1.5 },
    { code: 'WSTG-INPV-01', category: 'Input Validation', name: 'Test for Reflected XSS', base_hours: 1.0 },
    { code: 'WSTG-INPV-02', category: 'Input Validation', name: 'Test for Stored XSS', base_hours: 1.5 },
    { code: 'WSTG-INPV-05', category: 'Input Validation', name: 'Test for SQL Injection', base_hours: 2.0 }
];

db.serialize(() => {
    // Create OWASP Test Cases Table
    db.run(`CREATE TABLE IF NOT EXISTS owasp_test_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        base_hours REAL DEFAULT 1.0,
        description TEXT,
        risk_weight TEXT DEFAULT 'Medium'
    )`);

    const stmt = db.prepare("INSERT OR IGNORE INTO owasp_test_cases (code, category, name, base_hours) VALUES (?, ?, ?, ?)");
    defaultOWASP.forEach(test => {
        stmt.run(test.code, test.category, test.name, test.base_hours);
    });
    stmt.finalize();

    console.log("OWASP Test Cases Table Initialized and Seeded.");
});
