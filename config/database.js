const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'database.sqlite');

function dbRun(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function dbGet(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

const defaultOWASP = [
    { code: 'WSTG-INFO-01', category: 'Information Gathering', name: 'Conduct Search Engine Discovery', base_hours: 0.5 },
    { code: 'WSTG-INFO-02', category: 'Information Gathering', name: 'Fingerprint Web Server', base_hours: 0.5 },
    { code: 'WSTG-INFO-05', category: 'Information Gathering', name: 'Review Webpage Content', base_hours: 0.5 },
    { code: 'WSTG-INFO-10', category: 'Information Gathering', name: 'Map Application Architecture', base_hours: 1.0 },
    { code: 'WSTG-CNF-01', category: 'Configuration Management', name: 'Test Network/Infrastructure', base_hours: 1.0 },
    { code: 'WSTG-CNF-02', category: 'Configuration Management', name: 'Test Platform Configuration', base_hours: 1.0 },
    { code: 'WSTG-CNF-06', category: 'Configuration Management', name: 'Test HTTP Methods', base_hours: 0.5 },
    { code: 'WSTG-CNF-07', category: 'Configuration Management', name: 'Test HTTP Strict Transport', base_hours: 0.5 },
    { code: 'WSTG-IDNT-01', category: 'Identity Management', name: 'Test Role Definitions', base_hours: 0.5 },
    { code: 'WSTG-IDNT-02', category: 'Identity Management', name: 'Test User Registration Process', base_hours: 1.0 },
    { code: 'WSTG-IDNT-04', category: 'Identity Management', name: 'Test Account Enumeration', base_hours: 1.0 },
    { code: 'WSTG-ATHN-01', category: 'Authentication', name: 'Test Credentials Transport', base_hours: 0.5 },
    { code: 'WSTG-ATHN-02', category: 'Authentication', name: 'Test Default Credentials', base_hours: 1.0 },
    { code: 'WSTG-ATHN-03', category: 'Authentication', name: 'Test Weak Lock Out Mechanism', base_hours: 1.0 },
    { code: 'WSTG-ATHZ-02', category: 'Authorization', name: 'Test Bypassing Auth Schema', base_hours: 1.5 },
    { code: 'WSTG-ATHZ-03', category: 'Authorization', name: 'Test Privilege Escalation', base_hours: 1.5 },
    { code: 'WSTG-ATHZ-04', category: 'Authorization', name: 'Test IDOR', base_hours: 1.5 },
    { code: 'WSTG-SESS-02', category: 'Session Management', name: 'Test Cookie Attributes', base_hours: 0.5 },
    { code: 'WSTG-CLNT-01', category: 'Client Side Testing', name: 'Test for DOM-Based XSS', base_hours: 1.5 },
    { code: 'WSTG-CLNT-02', category: 'Client Side Testing', name: 'Test for JavaScript Execution', base_hours: 1.0 },
    { code: 'WSTG-CLNT-08', category: 'Client Side Testing', name: 'Test Cross Origin Resource Sharing', base_hours: 0.5 },
    { code: 'WSTG-CLNT-12', category: 'Client Side Testing', name: 'Test Browser Storage', base_hours: 0.5 },
    { code: 'WSTG-INPV-01', category: 'Input Validation', name: 'Test for Reflected XSS', base_hours: 1.0 },
    { code: 'WSTG-INPV-02', category: 'Input Validation', name: 'Test for Stored XSS', base_hours: 1.5 },
    { code: 'WSTG-INPV-05', category: 'Input Validation', name: 'Test for SQL Injection', base_hours: 2.0 },
    { code: 'WSTG-INPV-08', category: 'Input Validation', name: 'Test for SSI Injection', base_hours: 1.0 },
    { code: 'WSTG-INPV-11', category: 'Input Validation', name: 'Test for Code Injection', base_hours: 1.5 },
    { code: 'WSTG-BUSL-01', category: 'Business Logic', name: 'Test Business Logic Data Validation', base_hours: 1.5 },
    { code: 'WSTG-BUSL-02', category: 'Business Logic', name: 'Test Ability to Forge Requests', base_hours: 1.0 },
    { code: 'WSTG-BUSL-03', category: 'Business Logic', name: 'Test Integrity Checks', base_hours: 1.0 },
    { code: 'WSTG-CRYP-01', category: 'Cryptography', name: 'Test for Weak SSL/TLS', base_hours: 0.5 },
    { code: 'WSTG-CRYP-02', category: 'Cryptography', name: 'Test for Padding Oracle', base_hours: 1.0 },
    { code: 'WSTG-CRYP-03', category: 'Cryptography', name: 'Test for Sensitive Info in Unencrypted Channels', base_hours: 0.5 },
    { code: 'WSTG-API-01', category: 'API Testing', name: 'Test GraphQL/REST API', base_hours: 2.0 }
];

const businessFunctions = [
    { id: 'WEB_STATIC', name: 'Static Website', description: 'Simple HTML/CSS/JS site, no dynamic backend processing', wstg: JSON.stringify(['WSTG-INFO-02', 'WSTG-CNF-01', 'WSTG-CLNT-01']) },
    { id: 'WEB_CMS', name: 'Dynamic Website / CMS', description: 'Content Management System (WordPress, Drupal, Custom)', wstg: JSON.stringify(['WSTG-INFO-02', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-02', 'WSTG-SESS-02', 'WSTG-INPV-01', 'WSTG-INPV-02', 'WSTG-INPV-05', 'WSTG-INPV-11']) },
    { id: 'WEB_SPA', name: 'Single Page Application (SPA)', description: 'React, Vue, Angular based frontend with API backend', wstg: JSON.stringify(['WSTG-INFO-05', 'WSTG-CLNT-01', 'WSTG-CLNT-02', 'WSTG-CLNT-08', 'WSTG-ATHN-02', 'WSTG-SESS-02', 'WSTG-API-01']) },
    { id: 'WEB_ECOMM', name: 'E-Commerce System', description: 'Shopping cart, payment processing, product catalog', wstg: JSON.stringify(['WSTG-BUSL-01', 'WSTG-BUSL-02', 'WSTG-BUSL-03', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-03', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-CRYP-01', 'WSTG-CRYP-03']) },
    { id: 'WEB_FIN', name: 'Financial System', description: 'Banking, fintech, wallet, high-security transactions', wstg: JSON.stringify(['WSTG-BUSL-01', 'WSTG-BUSL-03', 'WSTG-ATHN-01', 'WSTG-ATHN-02', 'WSTG-ATHZ-03', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-CRYP-01', 'WSTG-CRYP-02', 'WSTG-CRYP-03']) },
    { id: 'WEB_CUSTOM', name: 'Custom Web Application', description: 'Bespoke business logic application', wstg: JSON.stringify(['WSTG-INFO-02', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-02', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-BUSL-01']) },
    { id: 'WEB_PWA', name: 'Progressive Web App (PWA)', description: 'Hybrid web/mobile functionality', wstg: JSON.stringify(['WSTG-INFO-05', 'WSTG-CLNT-01', 'WSTG-CLNT-12', 'WSTG-ATHN-02', 'WSTG-API-01']) },
    { id: 'API_MICRO', name: 'API / Microservices', description: 'Backend APIs (REST, GraphQL, SOAP)', wstg: JSON.stringify(['WSTG-INFO-10', 'WSTG-CNF-07', 'WSTG-IDNT-04', 'WSTG-ATHN-03', 'WSTG-ATHZ-03', 'WSTG-INPV-05', 'WSTG-INPV-08', 'WSTG-API-01']) },
    { id: 'WEB_PORTAL', name: 'Portal / Multi-Tenant System', description: 'SaaS platform with multiple organizations/tenants', wstg: JSON.stringify(['WSTG-IDNT-01', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-02', 'WSTG-ATHZ-04', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-BUSL-01']) },
    { id: 'INFRA_AD', name: 'Active Directory / LDAP', description: 'Directory services authentication', wstg: JSON.stringify(['WSTG-IDNT-01', 'WSTG-ATHN-01', 'WSTG-CNF-01']) },
    { id: 'INFRA_SRV', name: 'Other Service Server', description: 'Database, Mail, DNS, File Server', wstg: JSON.stringify(['WSTG-CNF-01', 'WSTG-CNF-02', 'WSTG-CNF-06', 'WSTG-CRYP-03']) }
];

const defaultSettings = [
    {
        key: 'test_type_constraints',
        value: JSON.stringify({
            "web_application": ["blackbox", "graybox"],
            "mobile_application": ["graybox"],
            "api_webservice": ["graybox"],
            "infrastructure": ["blackbox"]
        }),
        description: 'Allowed test types for each device type.'
    },
    {
        key: 'calculation_rules',
        value: JSON.stringify({
            "hours_per_day": 8,
            "rounding_step": 0.5
        }),
        description: 'Global calculation parameters like Man-Day hours and rounding.'
    },
    {
        key: 'role_rules',
        value: JSON.stringify({
            "min_roles": 1,
            "max_roles": 20,
            "default_roles": 1
        }),
        description: 'Constraints for role counts.'
    },
    {
        key: 'platform_rules',
        value: JSON.stringify({
            "default_platforms": 1,
            "max_platforms": 10,
            "min_platforms": 1
        }),
        description: 'Constraints for platform counts.'
    }
];

const defaultUsers = [
    { username: 'admin', password: 'password123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
];

async function setup() {
    const isNewDb = !fs.existsSync(dbPath);

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('[Setup] Created data directory.');
    }

    const uploadsDir = path.join(__dirname, '../public/uploads/feedback');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('[Setup] Created uploads directory.');
    }

    const db = new sqlite3.Database(dbPath);

    try {
        await dbRun(db, "PRAGMA journal_mode=WAL");
        await dbRun(db, "PRAGMA foreign_keys = ON");

        console.log('[Setup] Checking database tables...');

        await dbRun(db, `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1
        )`);

        await dbRun(db, `CREATE TABLE IF NOT EXISTS estimations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            client_name TEXT,
            device_type TEXT,
            test_type TEXT,
            function_count INTEGER,
            platform_count INTEGER DEFAULT 1,
            number_of_roles INTEGER DEFAULT 1,
            target_info TEXT,
            estimated_days REAL,
            selected_functions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await dbRun(db, `CREATE TABLE IF NOT EXISTS estimation_configs (
            id INTEGER PRIMARY KEY DEFAULT 1,
            hours_per_function REAL DEFAULT 2.0,
            report_overhead_hours REAL DEFAULT 8.0,
            blackbox_factor REAL DEFAULT 1.5,
            graybox_factor REAL DEFAULT 1.0,
            web_factor REAL DEFAULT 1.0,
            mobile_factor REAL DEFAULT 1.2,
            api_factor REAL DEFAULT 0.9,
            infra_factor REAL DEFAULT 0.5,
            updated_at DATETIME
        )`);

        await dbRun(db, `CREATE TABLE IF NOT EXISTS feedbacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject TEXT DEFAULT 'No Subject',
            message TEXT NOT NULL,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        await dbRun(db, `CREATE TABLE IF NOT EXISTS owasp_test_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            base_hours REAL DEFAULT 1.0,
            description TEXT,
            risk_weight TEXT DEFAULT 'Medium'
        )`);

        await dbRun(db, `CREATE TABLE IF NOT EXISTS app_functions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            mapped_wstg_json TEXT
        )`);

        await dbRun(db, `CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('[Setup] ✓ All tables verified.');

        console.log('[Setup] Running migrations...');

        const migrations = [
            { table: 'users', column: 'is_active', sql: "ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1" },
            { table: 'estimations', column: 'created_at', sql: "ALTER TABLE estimations ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP" },
            { table: 'estimations', column: 'target_info', sql: "ALTER TABLE estimations ADD COLUMN target_info TEXT" },
            { table: 'estimations', column: 'number_of_roles', sql: "ALTER TABLE estimations ADD COLUMN number_of_roles INTEGER DEFAULT 1" },
            { table: 'estimations', column: 'platform_count', sql: "ALTER TABLE estimations ADD COLUMN platform_count INTEGER DEFAULT 1" },
            { table: 'feedbacks', column: 'subject', sql: "ALTER TABLE feedbacks ADD COLUMN subject TEXT DEFAULT 'No Subject'" },
            { table: 'feedbacks', column: 'image_path', sql: "ALTER TABLE feedbacks ADD COLUMN image_path TEXT" },
        ];

        for (const m of migrations) {
            try {
                await dbRun(db, m.sql);
                console.log(`  ✓ Added column: ${m.table}.${m.column}`);
            } catch (err) {
                if (err.message.includes('duplicate column')) {
                } else {
                    console.warn(`  ⚠ Migration ${m.table}.${m.column}:`, err.message);
                }
            }
        }

        console.log('[Setup] ✓ Migrations complete.');

        console.log('[Setup] Checking seed data...');

        const configRow = await dbGet(db, "SELECT COUNT(*) as count FROM estimation_configs");
        if (configRow.count === 0) {
            await dbRun(db, `INSERT INTO estimation_configs 
                (id, hours_per_function, report_overhead_hours, blackbox_factor, graybox_factor, web_factor, mobile_factor, api_factor, infra_factor, updated_at) 
                VALUES (1, 2.0, 8.0, 1.5, 1.0, 1.0, 1.2, 0.9, 0.5, CURRENT_TIMESTAMP)`);
            console.log('  ✓ Seeded estimation_configs.');
        }

        const owaspRow = await dbGet(db, "SELECT COUNT(*) as count FROM owasp_test_cases");
        if (owaspRow.count === 0) {
            for (const test of defaultOWASP) {
                try {
                    await dbRun(db, "INSERT OR IGNORE INTO owasp_test_cases (code, category, name, base_hours) VALUES (?, ?, ?, ?)",
                        [test.code, test.category, test.name, test.base_hours]);
                } catch (e) { }
            }
            console.log('  ✓ Seeded owasp_test_cases.');
        }

        const funcRow = await dbGet(db, "SELECT COUNT(*) as count FROM app_functions");
        if (funcRow.count === 0) {
            for (const func of businessFunctions) {
                try {
                    await dbRun(db, "INSERT OR REPLACE INTO app_functions (id, name, description, mapped_wstg_json) VALUES (?, ?, ?, ?)",
                        [func.id, func.name, func.description, func.wstg]);
                } catch (e) { }
            }
            console.log('  ✓ Seeded app_functions.');
        }

        const settingRow = await dbGet(db, "SELECT COUNT(*) as count FROM system_settings");
        if (settingRow.count === 0) {
            for (const setting of defaultSettings) {
                try {
                    await dbRun(db, "INSERT OR REPLACE INTO system_settings (key, value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
                        [setting.key, setting.value, setting.description]);
                } catch (e) { }
            }
            console.log('  ✓ Seeded system_settings.');
        }

        const userRow = await dbGet(db, "SELECT COUNT(*) as count FROM users");
        if (userRow.count === 0) {
            if (process.env.NODE_ENV === 'production') {
                console.log('  ⚠ No users found. In production, run: node scripts/seed_user.js <username> <password> <role>');
            } else {
                for (const user of defaultUsers) {
                    try {
                        const hash = bcrypt.hashSync(user.password, 10);
                        await dbRun(db, "INSERT OR IGNORE INTO users (username, password, role, is_active) VALUES (?, ?, ?, 1)",
                            [user.username, hash, user.role]);
                    } catch (e) { }
                }
                console.log('  ✓ Seeded default users (dev mode).');
                console.warn('  ⚠ WARNING: Default credentials created. DO NOT USE IN PRODUCTION.');
            }
        }

        console.log('[Setup] ✓ Seed data verified.');

        if (isNewDb) {
            console.log('\n══════════════════════════════════════════════════');
            console.log('  ✓ NEW DATABASE CREATED AND INITIALIZED');
            console.log('══════════════════════════════════════════════════');
        } else {
            console.log('\n══════════════════════════════════════════════════');
            console.log('  ✓ EXISTING DATABASE VERIFIED');
            console.log('══════════════════════════════════════════════════');
        }

    } catch (err) {
        console.error('[Setup] ✗ FATAL ERROR:', err);
        throw err;
    } finally {
        db.close();
    }
}

module.exports = setup;

if (require.main === module) {
    setup()
        .then(() => {
            console.log('[Setup] Done.');
            process.exit(0);
        })
        .catch(err => {
            console.error('[Setup] Failed:', err);
            process.exit(1);
        });
}
