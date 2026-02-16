const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'server.key');
const certPath = path.join(__dirname, 'server.cert');

console.log('Generating SSL certificates...');
console.log('Output Key:', keyPath);
console.log('Output Cert:', certPath);

// Command to generate self-signed certificate
// Note: Requires OpenSSL to be installed and in system PATH
// (Git Bash on Windows usually includes OpenSSL)
const command = 'openssl req -nodes -new -x509 -keyout "server.key" -out "server.cert" -days 365 -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Dev/OU=Dev/CN=localhost"';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`\n[Error] Failed to generate SSL certificates.`);
        console.error(`Message: ${error.message}`);
        console.error(`\nPossible fixes:`);
        console.error(`1. Ensure 'openssl' is installed and added to your System PATH.`);
        console.error(`2. If you have Git installed, try running this script from Git Bash.`);
        return;
    }

    console.log('\n✅ SSL certificates generated successfully!');
    console.log('- server.key');
    console.log('- server.cert');
});
