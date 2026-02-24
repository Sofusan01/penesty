const fs = require('fs');
let content = fs.readFileSync('views/pages/estimate_cal.ejs', 'utf8');

const texts = {
    'hours_per_function': 'เวลาเฉลี่ยที่ใช้ในการตรวจสอบและประเมินช่องโหว่ความปลอดภัยต่อ 1 ฟังก์ชันการทำงานหลักของระบบ (เช่น ระบบ Login คิดเป็น 1 ฟังก์ชัน)',
    'report_overhead_hours': 'เวลาที่เผื่อไว้สำหรับการจัดทำและสรุปรายงาน (ชั่วโมง)',
    'graybox_factor': 'ตัวคูณระยะเวลาสำหรับการทดสอบแบบรู้ข้อมูลระบบบางส่วน (มาตรฐานคือ 1.0)',
    'blackbox_factor': 'ตัวคูณระยะเวลาสำหรับการทดสอบโดยไม่รู้ข้อมูลระบบเลย (ใช้เวลามากกว่า)',
    'web_factor': 'ตัวคูณสำหรับระบบประเภทเว็บแอปพลิเคชัน',
    'mobile_factor': 'ตัวคูณสำหรับระบบแอปพลิเคชันมือถือ (มักจะใช้เวลาตรวจสอบนานกว่าเว็บ)',
    'api_factor': 'ตัวคูณสำหรับระบบ API (มักจะใช้เวลาน้อยกว่าหน้าเว็บที่มี UI)',
    'infra_factor': 'ตัวคูณสำหรับโครงสร้างพื้นฐานหรือระบบเครือข่าย'
};

const labels = [
    { id: 'hours_per_function', title: 'เวลาต่อฟังก์ชัน (Hours per Function)' },
    { id: 'report_overhead_hours', title: 'เวลาทำรายงาน (Report Overhead Hours)' },
    { id: 'graybox_factor', title: 'Gray Box Factor' },
    { id: 'blackbox_factor', title: 'Black Box Factor' },
    { id: 'web_factor', title: 'Web Application' },
    { id: 'mobile_factor', title: 'Mobile Application' },
    { id: 'api_factor', title: 'API / Webservice' },
    { id: 'infra_factor', title: 'Infrastructure' }
];

const svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="text-muted" viewBox="0 0 16 16"><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z"/></svg>';

labels.forEach(label => {
    // Regex fix: [\s\S]
    const regex = new RegExp('<label for="' + label.id + '"[\\s\\S]*?</label>', 'g');
    const replacement = '<label for="' + label.id + '" style="display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem;">' + label.title.replace('(', '<br/>(') + '\n' +
        '    <span class="inline-tooltip">\n' +
        '        ' + svgHtml + '\n' +
        '        <span class="inline-tooltip-text">' + texts[label.id] + '</span>\n' +
        '    </span>\n' +
        '</label>';
    content = content.replace(regex, replacement);
});

fs.writeFileSync('views/pages/estimate_cal.ejs', content);
console.log('Successfully replaced all tooltips!');
