const fs = require('fs');
let content = fs.readFileSync('views/pages/estimate_cal.ejs', 'utf8');
// Remove the <br/> tags that were added previously
content = content.replace(/<br\/>/g, ' ');
fs.writeFileSync('views/pages/estimate_cal.ejs', content);
console.log('Removed all <br/> tags!');
