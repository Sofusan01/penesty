const fs = require('fs');

const magicNumbers = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46, 0x38]
};

function checkMagicNumbers(filepath) {
    try {
        const buffer = Buffer.alloc(4);
        const fd = fs.openSync(filepath, 'r');
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);

        if (buffer[0] === magicNumbers.jpg[0] && buffer[1] === magicNumbers.jpg[1] && buffer[2] === magicNumbers.jpg[2]) return 'jpg';
        if (buffer[0] === magicNumbers.png[0] && buffer[1] === magicNumbers.png[1] && buffer[2] === magicNumbers.png[2] && buffer[3] === magicNumbers.png[3]) return 'png';
        if (buffer[0] === magicNumbers.gif[0] && buffer[1] === magicNumbers.gif[1] && buffer[2] === magicNumbers.gif[2] && buffer[3] === magicNumbers.gif[3]) return 'gif';

        return false;
    } catch (err) {
        console.error('Error checking magic numbers:', err);
        return false;
    }
}

module.exports = checkMagicNumbers;
