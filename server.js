const setup = require('./config/database');

const PORT = process.env.PORT || 3000;

const fs = require('fs');

const https = require('https');

const http = require('http');

const path = require('path');

setup()
    .then(() => {
        const app = require('./app');

        const keyPath = path.join(__dirname, 'server.key');

        const certPath = path.join(__dirname, 'server.cert');

        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            const options = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };

            https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on HTTPS ${PORT} (Secure)`);
            });
        } else {
            http.createServer(app).listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on HTTP ${PORT} (No SSL found)`);
            });
        }
    })
    .catch(err => {
        console.error('Failed to initialize database. Server will not start.', err);

        process.exit(1);
    });