// scripts/init_app_functions.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

const businessFunctions = [
    { id: 'WEB_STATIC', name: 'Static Website', description: 'Simple HTML/CSS/JS site, no dynamic backend processing', wstg: JSON.stringify(['WSTG-INFO-02', 'WSTG-CNF-01', 'WSTG-CLNT-01']) },
    { id: 'WEB_CMS', name: 'Dynamic Website / CMS', description: 'Content Management System (WordPress, Drupal, Custom)', wstg: JSON.stringify(['WSTG-INFO-02', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-02', 'WSTG-SESS-02', 'WSTG-INPV-01', 'WSTG-INPV-02', 'WSTG-INPV-05', 'WSTG-INPV-11']) },
    { id: 'WEB_SPA', name: 'Single Page Application (SPA)', description: 'React, Vue, Angular based frontend with API backend', wstg: JSON.stringify(['WSTG-INFO-05', 'WSTG-CLNT-01', 'WSTG-CLNT-02', 'WSTG-CLNT-08', 'WSTG-ATHN-02', 'WSTG-SESS-02', 'WSTG-API-01']) },
    { id: 'WEB_ECOMM', name: 'E-Commerce System', description: 'Shopping cart, payment processing, product catalog', wstg: JSON.stringify(['WSTG-BUSL-01', 'WSTG-BUSL-02', 'WSTG-BUSL-03', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-03', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-CRYP-01', 'WSTG-CRYP-03']) },
    { id: 'WEB_FIN', name: 'Financial System', description: 'Banking, fintech, wallet, high-security transactions', wstg: JSON.stringify(['WSTG-BUSL-01', 'WSTG-BUSL-03', 'WSTG-ATHN-01', 'WSTG-ATHN-02', 'WSTG-ATHZ-03', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-CRYP-01', 'WSTG-CRYP-02', 'WSTG-CRYP-03']) },
    { id: 'WEB_CUSTOM', name: 'Custom Web Application', description: 'Bespoke business logic application', wstg: JSON.stringify(['WSTG-INFO-02', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-02', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-BUSL-01']) },
    { id: 'WEB_PWA', name: 'Progressive Web App (PWA)', description: 'Hybrid web/mobile functionality', wstg: JSON.stringify(['WSTG-INFO-05', 'WSTG-CLNT-01', 'WSTG-CLNT-12', 'WSTG-ATHN-02', 'WSTG-API-01']) },
    { id: 'API_MICRO', name: 'API / Microservices', description: 'Backend APIs (REST, GraphQL, SOAP)', wstg: JSON.stringify(['WSTG-INFO-10', 'WSTG-CONF-07', 'WSTG-IDNT-04', 'WSTG-ATHN-03', 'WSTG-ATHZ-03', 'WSTG-INPV-05', 'WSTG-INPV-08', 'WSTG-API-01']) },
    { id: 'WEB_PORTAL', name: 'Portal / Multi-Tenant System', description: 'SaaS platform with multiple organizations/tenants', wstg: JSON.stringify(['WSTG-IDNT-01', 'WSTG-IDNT-04', 'WSTG-ATHN-02', 'WSTG-ATHZ-02', 'WSTG-ATHZ-04', 'WSTG-SESS-02', 'WSTG-INPV-05', 'WSTG-BUSL-01']) },
    { id: 'INFRA_AD', name: 'Active Directory / LDAP', description: 'Directory services authentication', wstg: JSON.stringify(['WSTG-IDNT-01', 'WSTG-ATHN-01', 'WSTG-CNF-01']) },
    { id: 'INFRA_SRV', name: 'Other Service Server', description: 'Database, Mail, DNS, File Server', wstg: JSON.stringify(['WSTG-CNF-01', 'WSTG-CNF-02', 'WSTG-CNF-06', 'WSTG-CRYP-03']) }
];

db.serialize(() => {
    // Drop old table to enforce new schema if needed or just replace data
    // For safety, we keep the table but clean data
    // Ensure fresh start logic inside table creation callback

    // Create Table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS app_functions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        mapped_wstg_json TEXT
    )`, (err) => {
        if (err) {
            console.error("Error creating table:", err);
            return;
        }

        // Drop old data to enforce new schema if needed or just replace data
        db.run(`DELETE FROM app_functions`, (err) => {
            if (err) console.error("Error clearing old functions:", err);
            else console.log("Old functions cleared.");

            const stmt = db.prepare("INSERT OR REPLACE INTO app_functions (id, name, description, mapped_wstg_json) VALUES (?, ?, ?, ?)");
            businessFunctions.forEach(func => {
                stmt.run(func.id, func.name, func.description, func.wstg);
            });
            stmt.finalize();

            console.log("Business-Level Function Catalog Initialized.");
        });
    });
});
