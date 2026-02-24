const fs = require('fs');
let content = fs.readFileSync('views/pages/system_settings.ejs', 'utf8');

const tooltipData = {
    'hours_per_day': 'จำนวนชั่วโมงทำงานต่อ 1 วัน (Man-Day) ใช้คำนวณวันทำงาน',
    'rounding_step': 'การปัดเศษ (0.5 = ปัดเศษทีละครึ่งวัน, 1 = ปัดเศษเต็มวัน, 0 = ไม่ปัดเศษ)',
    'default_platforms': 'จำนวนแพลตฟอร์มเริ่มต้น หากไม่ได้ระบุ',
    'max_platforms': 'จำนวนแพลตฟอร์มสูงสุดที่อนุญาตให้ทดสอบได้',
    'min_platforms': 'จำนวนแพลตฟอร์มต่ำสุดที่ต้องระบุ',
    'min_roles': 'จำนวน Role (สิทธิ์ผู้ใช้งาน) ต่ำสุดที่ต้องระบุ',
    'max_roles': 'จำนวน Role สูงสุดที่อนุญาตให้ประเมินได้',
    'default_roles': 'จำนวน Role เริ่มต้น',
    'web_application': 'ประเภทการทดสอบที่อนุญาตสำหรับเว็บแอปพลิเคชัน',
    'mobile_application': 'ประเภทการทดสอบที่อนุญาตสำหรับโมบายล์แอปพลิเคชัน',
    'api_webservice': 'ประเภทการทดสอบที่อนุญาตสำหรับ API / เว็บเซอร์วิส',
    'infrastructure': 'ประเภทการทดสอบที่อนุญาตสำหรับโครงสร้างพื้นฐาน'
};

const tooltipFn = `
function getTooltipText(param) {
    const data = ${JSON.stringify(tooltipData)};
    return data[param] || 'พารามิเตอร์การตั้งค่าระบบ';
}
`;

const svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="text-muted" viewBox="0 0 16 16"><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z"/></svg>';

const replacementBlock = `
                                                                                    <td style="font-family: monospace; font-weight: 500;">
                                                                                        <div style="display: flex; align-items: center; gap: 0.35rem;">
                                                                                            <%= param %>
                                                                                            <span class="inline-tooltip">
                                                                                                ${svgHtml}
                                                                                                <span class="inline-tooltip-text">
                                                                                                    <% 
                                                                                                        var tData = ${JSON.stringify(tooltipData)};
                                                                                                        var tText = tData[param] || 'กำหนดค่าการทำงานของระบบ';
                                                                                                    %>
                                                                                                    <%= tText %>
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                    </td>
`;

const searchBlock = '<td style="font-family: monospace; font-weight: 500;"><%= param %></td>';
content = content.replace(searchBlock, replacementBlock);


const styleBlock = `
<style>
.inline-tooltip {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: help;
}
.inline-tooltip .inline-tooltip-text {
    visibility: hidden;
    width: max-content;
    max-width: 250px;
    background-color: #1e293b;
    color: #fff;
    text-align: left;
    border-radius: 6px;
    padding: 8px 12px;
    position: absolute;
    z-index: 9999;
    bottom: 150%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 0.85rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    white-space: normal;
    font-weight: 400;
    line-height: 1.4;
    pointer-events: none;
    font-family: 'Sarabun', sans-serif;
}
.inline-tooltip .inline-tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #1e293b transparent transparent transparent;
}
.inline-tooltip:hover .inline-tooltip-text {
    visibility: visible;
    opacity: 1;
}
</style>
`;
if (!content.includes('.inline-tooltip {')) {
    content = content.replace('<div class="content">', '<div class="content">\n' + styleBlock);
}

fs.writeFileSync('views/pages/system_settings.ejs', content);
