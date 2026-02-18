const EstimationConfig = require('../models/EstimationConfig');
const OWASPTestCase = require('../models/OWASPTestCase');

exports.getConfig = async (req, res) => {
    try {
        const config = await EstimationConfig.get();
        const testCases = await OWASPTestCase.getAll();
        res.render('pages/estimate_cal', {
            user: req.user,
            config: config,
            testCases: testCases,
            error: null,
            success: null
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard?error=' + encodeURIComponent('Error loading config'));
    }
};

exports.updateConfig = async (req, res) => {
    if (req.body.action === 'reset') {
        try {
            await EstimationConfig.reset();
            await OWASPTestCase.resetDefaults();

            const config = await EstimationConfig.get();
            const testCases = await OWASPTestCase.getAll();

            return res.render('pages/estimate_cal', {
                user: req.user,
                config,
                testCases,
                error: null,
                success: 'รีเซ็ตค่า configuration ทั้งหมดเป็นค่าเริ่มต้นแล้ว'
            });
        } catch (err) {
            console.error("Reset Error:", err);
            return res.redirect('/settings/estimate-cal?error=' + encodeURIComponent('Failed to reset configuration'));
        }
    }

    const {
        hours_per_function,
        report_overhead_hours,
        blackbox_factor,
        graybox_factor,
        web_factor,
        mobile_factor,
        api_factor,
        infra_factor
    } = req.body;

    const inputs = [
        hours_per_function,
        report_overhead_hours,
        blackbox_factor,
        graybox_factor,
        web_factor,
        mobile_factor,
        api_factor,
        infra_factor
    ];

    if (inputs.some(val => isNaN(parseFloat(val)) || parseFloat(val) < 0 || parseFloat(val) > 1000)) {
        try {
            const config = await EstimationConfig.get();
            const testCases = await OWASPTestCase.getAll();
            return res.render('pages/estimate_cal', {
                user: req.user,
                config,
                testCases,
                error: 'กรุณากรอกตัวเลขที่ถูกต้องและไม่ติดลบ',
                success: null
            });
        } catch (e) {
            return res.redirect('/dashboard');
        }
    }

    try {
        await EstimationConfig.update({
            hours_per_function: parseFloat(req.body.hours_per_function),
            report_overhead_hours: parseFloat(req.body.report_overhead_hours),
            blackbox_factor: parseFloat(req.body.blackbox_factor),
            graybox_factor: parseFloat(req.body.graybox_factor),
            web_factor: parseFloat(req.body.web_factor),
            mobile_factor: parseFloat(req.body.mobile_factor),
            api_factor: parseFloat(req.body.api_factor),
            infra_factor: parseFloat(req.body.infra_factor)
        });

        const updates = [];
        for (const [key, value] of Object.entries(req.body)) {
            if (key.startsWith('wstg_')) {
                const id = parseInt(key.replace('wstg_', ''));
                const hours = parseFloat(value);
                if (!isNaN(id) && !isNaN(hours) && hours >= 0 && hours <= 1000) {
                    updates.push(OWASPTestCase.updateHours(id, hours));
                }
            }
        }
        await Promise.all(updates);

        const config = await EstimationConfig.get();
        const testCases = await OWASPTestCase.getAll();

        res.render('pages/estimate_cal', {
            user: req.user,
            config,
            testCases,
            error: null,
            success: 'อัปเดตค่า configuration และ OWASP Base Hours เรียบร้อยแล้ว'
        });

    } catch (err) {
        console.error(err);
        try {
            const config = await EstimationConfig.get();
            const testCases = await OWASPTestCase.getAll();
            res.render('pages/estimate_cal', {
                user: req.user,
                config,
                testCases,
                error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                success: null
            });
        } catch (e) {
            res.redirect('/dashboard');
        }
    }
};
