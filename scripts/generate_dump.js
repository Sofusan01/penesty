const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '../project_code_summary.txt');
const rootDir = path.join(__dirname, '../');

const excludeDirs = ['node_modules', '.git', 'data', '.vscode', 'public/images']; // Exclude data/images/etc
const excludeFiles = ['package-lock.json', 'database.sqlite', '.DS_Store', 'project_code_summary.txt', 'sessions.sqlite'];
const includeExts = ['.js', '.json', '.ejs', '.css', '.html', '.md', '.txt', '.env', 'Dockerfile', '.gitignore'];

function getFileTree(dir, prefix = '') {
    let output = '';
    const files = fs.readdirSync(dir);

    // Sort directories first, then files
    files.sort((a, b) => {
        const aStat = fs.statSync(path.join(dir, a));
        const bStat = fs.statSync(path.join(dir, b));
        if (aStat.isDirectory() && !bStat.isDirectory()) return -1;
        if (!aStat.isDirectory() && bStat.isDirectory()) return 1;
        return a.localeCompare(b);
    });

    files.forEach((file, index) => {
        if (excludeDirs.includes(file) || excludeFiles.includes(file)) return;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const isLast = index === files.length - 1;
        const pointer = isLast ? '└── ' : '├── ';

        output += `${prefix}${pointer}${file}\n`;

        if (stat.isDirectory()) {
            output += getFileTree(fullPath, prefix + (isLast ? '    ' : '│   '));
        }
    });
    return output;
}

function getFileContents(dir) {
    let output = '';
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        if (excludeDirs.includes(file) || excludeFiles.includes(file)) return;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            output += getFileContents(fullPath);
        } else {
            // Check extension or specific include
            const ext = path.extname(file);
            if (includeExts.includes(ext) || includeExts.includes(file)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    output += `\n================================================================================\n`;
                    output += `File: ${path.relative(rootDir, fullPath).replace(/\\/g, '/')}\n`;
                    output += `================================================================================\n`;
                    output += content + '\n';
                } catch (e) {
                    output += `\n[Error reading file: ${file}]\n`;
                }
            }
        }
    });
    return output;
}

console.log('Generating project summary...');

const tree = `PROJECT STRUCTURE\n=================\n${getFileTree(rootDir)}\n\n`;
const contents = `FILE CONTENTS\n=============\n${getFileContents(rootDir)}`;

fs.writeFileSync(outputFile, tree + contents);
console.log(`Successfully wrote to ${outputFile}`);
