const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '../code_project.txt');
const rootDir = path.join(__dirname, '../');

// Directories to explicitly exclude (by name, not full path)
const excludeDirs = ['node_modules', '.git', '.vscode', 'dist', 'build', 'coverage'];
// Files to explicitly exclude
const excludeFiles = ['package-lock.json', 'database.sqlite', '.DS_Store', 'code_project.txt', 'project_code_summary.txt', 'sessions.sqlite', '.env', '.env.local']; // Exclude .env for security if needed, but user asked for "all code". I'll keep .env if it exists but usually it contains secrets. The user said "all code", I'll include .env.example if exists, but .env might be sensitive. I'll include it as per request "all code" but be careful. Actually, standard practice is to exclude .env. I will exclude .env.

// Extensions to include
const includeExts = ['.js', '.json', '.ejs', '.css', '.html', '.md', '.txt', '.gitignore', '.yaml', '.yml', '.sql'];

function shouldExclude(dir, file) {
    if (excludeDirs.includes(file)) return true;
    if (excludeFiles.includes(file)) return true;
    if (file.startsWith('.')) return true; // Exclude dotfiles like .eslintrc, .prettierrc unless explicitly included? No, let's include basic dotfiles if they are config. 
    // Actually, let's blindly include extensions.
    return false;
}

function getFileTree(dir, prefix = '') {
    let output = '';
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) { return ''; }

    // Filter out excluded dirs/files early for tree view
    files = files.filter(f => !excludeDirs.includes(f) && !excludeFiles.includes(f) && f !== '.git' && f !== 'node_modules');

    files.sort((a, b) => {
        const aStat = fs.statSync(path.join(dir, a));
        const bStat = fs.statSync(path.join(dir, b));
        if (aStat.isDirectory() && !bStat.isDirectory()) return -1;
        if (!aStat.isDirectory() && bStat.isDirectory()) return 1;
        return a.localeCompare(b);
    });

    files.forEach((file, index) => {
        const fullPath = path.join(dir, file);
        let stat;
        try { stat = fs.statSync(fullPath); } catch (e) { return; }

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
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) { return ''; }

    files.forEach(file => {
        if (excludeDirs.includes(file) || excludeFiles.includes(file)) return;

        const fullPath = path.join(dir, file);
        let stat;
        try { stat = fs.statSync(fullPath); } catch (e) { return; }

        if (stat.isDirectory()) {
            output += getFileContents(fullPath);
        } else {
            // Check extension
            const ext = path.extname(file);
            const isCodeFile = includeExts.includes(ext) || file === 'Dockerfile' || file === 'docker-compose.yml' || file === 'LICENSE' || file === 'README';

            if (isCodeFile) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    // Add a header for each file
                    output += `\n` + '='.repeat(80) + `\n`;
                    output += `File: ${path.relative(rootDir, fullPath).replace(/\\/g, '/')}\n`;
                    output += '='.repeat(80) + `\n`;
                    output += content + '\n';
                } catch (e) {
                    output += `\n[Error reading file: ${file}]\n`;
                }
            }
        }
    });
    return output;
}

console.log('Generating code_project.txt...');

const tree = `PROJECT STRUCTURE\n=================\n${getFileTree(rootDir)}\n\n`;
const contents = `FILE CONTENTS\n=============\n${getFileContents(rootDir)}`;

fs.writeFileSync(outputFile, tree + contents);
console.log(`Successfully wrote to ${outputFile}`);
