const AppFunction = require('../models/AppFunction');
const SystemSetting = require('../models/SystemSetting');
const OWASPTestCase = require('../models/OWASPTestCase');
const EstimationConfig = require('../models/EstimationConfig');

// ─── WSTG categories ที่ต้องทดสอบซ้ำตามจำนวน Role ───
// Authentication, Authorization, Session, Identity → ต้องทดสอบทุก role
// ส่วน INFO, CNF, CRYP, INPV, CLNT, BUSL, ERR, API → ทดสอบครั้งเดียว
const ROLE_DEPENDENT_PREFIXES = ['WSTG-ATHN-', 'WSTG-ATHZ-', 'WSTG-SESS-', 'WSTG-IDNT-'];

function isRoleDependent(code) {
    return ROLE_DEPENDENT_PREFIXES.some(prefix => code.startsWith(prefix));
}

exports.calculate = async ({ device_type, test_type, platform_count, number_of_roles, selected_functions, selected_wstg_codes }) => {
    let funcIds = selected_functions || [];
    if (!Array.isArray(funcIds)) funcIds = [funcIds];
    funcIds = [...new Set(funcIds.filter(f => f))];

    let explicitWstgCodes = selected_wstg_codes || [];
    if (!Array.isArray(explicitWstgCodes)) explicitWstgCodes = [explicitWstgCodes];
    explicitWstgCodes = [...new Set(explicitWstgCodes.filter(c => c))];

    // ─── โหลดข้อมูลทั้งหมดพร้อมกัน ───
    const [constraints, calcRules, roleRules, allWSTG, config] = await Promise.all([
        SystemSetting.get('test_type_constraints').then(res => res || {}),
        SystemSetting.get('calculation_rules').then(res => res || { hours_per_day: 8 }),
        SystemSetting.get('role_rules').then(res => res || { min_roles: 1, max_roles: 20 }),
        OWASPTestCase.getAll(),
        EstimationConfig.get().catch(() => ({
            hours_per_function: 2.0, report_overhead_hours: 8.0, blackbox_factor: 1.5, graybox_factor: 1.0,
            web_factor: 1.0, mobile_factor: 1.2, api_factor: 0.9, infra_factor: 0.5
        }))
    ]);

    const errors = [];
    // ... validation (omitted for brevity in replacement, will keep original logic) ...

    const roles = parseInt(number_of_roles) || 1;
    if (roles < (roleRules.min_roles || 1) || roles > (roleRules.max_roles || 20)) {
        errors.push(`Roles must be between ${roleRules.min_roles || 1} and ${roleRules.max_roles || 20}.`);
    }

    const platforms = 1;

    if (funcIds.length === 0 && explicitWstgCodes.length === 0) {
        errors.push('Please select at least one function or test case.');
    }

    const selectedFuncDetails = await AppFunction.getByIds(funcIds);
    // Note: We don't error out if func count doesn't match because user might be selecting WSTGs directly

    if (errors.length > 0) {
        return { error: errors.join(' ') };
    }

    // ─── สร้าง WSTG lookup map ───
    const wstgMap = {};
    allWSTG.forEach(tc => { wstgMap[tc.code] = tc.base_hours; });

    // ─── รวบรวม unique WSTG codes ───
    const finalWSTGCodes = new Set();
    let functionsWithoutWSTG = 0;

    if (explicitWstgCodes.length > 0) {
        // กรณีมีรายการ WSTG ที่เลือกมาโดยตรง (Granular)
        explicitWstgCodes.forEach(code => finalWSTGCodes.add(code));

        // ยังต้องนับ function ที่ไม่มี WSTG เพื่อทำ fallback (เช่น ฟังก์ชันแต่งรูป, อัปโหลดไฟล์ ที่ไม่มี WSTG เฉพาะ)
        selectedFuncDetails.forEach(func => {
            if (!func.mapped_wstg_test_cases || func.mapped_wstg_test_cases.length === 0) {
                functionsWithoutWSTG++;
            }
        });
    } else {
        // กรณีเลือกทั้งก้อน (Legacy/Bulk selection)
        selectedFuncDetails.forEach(func => {
            if (func.mapped_wstg_test_cases && func.mapped_wstg_test_cases.length > 0) {
                func.mapped_wstg_test_cases.forEach(code => finalWSTGCodes.add(code));
            } else {
                functionsWithoutWSTG++;
            }
        });
    }

    // ─── FIX: แยก Role-Dependent vs Role-Independent hours ───
    let roleIndependentHours = 0;
    let roleDependentHours = 0;
    const usedWSTG = [];
    const missingWSTG = [];

    finalWSTGCodes.forEach(code => {
        if (wstgMap[code] !== undefined) {
            if (isRoleDependent(code)) {
                roleDependentHours += wstgMap[code];
            } else {
                roleIndependentHours += wstgMap[code];
            }
            usedWSTG.push(code);
        } else {
            missingWSTG.push(code);
        }
    });

    // ─── FIX: ใช้ hours_per_function เป็น fallback สำหรับ function ที่เลือกแต่ไม่มี mapping ───
    const fallbackHours = functionsWithoutWSTG * (config.hours_per_function || 2.0);


    // ─── สูตรใหม่ ───
    // totalBaseHours = (ชม.ที่ไม่ขึ้นกับ role + fallback) + (ชม.ที่ขึ้นกับ role × จำนวน roles)
    const totalBaseHours = (roleIndependentHours + fallbackHours) + (roleDependentHours * roles);

    // ─── Test Type Factor (blackbox/graybox) ───
    let typeFactor = config.graybox_factor || 1.0;
    if (test_type === 'blackbox') typeFactor = config.blackbox_factor || 1.5;

    // ─── Device Factor ───
    let deviceFactor = config.web_factor || 1.0;
    if (device_type === 'web_application') deviceFactor = config.web_factor || 1.0;
    else if (device_type === 'mobile_application') deviceFactor = config.mobile_factor || 1.2;
    else if (device_type === 'api_webservice') deviceFactor = config.api_factor || 0.9;
    else if (device_type === 'infrastructure') deviceFactor = config.infra_factor || 0.5;

    // ─── คำนวณ effort hours ───
    let effortHours = totalBaseHours * typeFactor * deviceFactor;

    // ─── FIX: Report overhead scale ตามขนาด scope ───
    // scope เล็ก (≤10 WSTG) = report_overhead ปกติ
    // scope ใหญ่ (>10 WSTG) = report_overhead เพิ่มตามสัดส่วน
    const baseReportHours = config.report_overhead_hours || 8.0;
    const scopeScale = Math.max(1.0, uniqueWSTGCodes.size / 10);
    const reportHours = baseReportHours * scopeScale;
    effortHours += reportHours;

    // ─── แปลงเป็น Man-Days (ปัดขึ้นเสมอ) ───
    const hoursPerDay = calcRules.hours_per_day || 8;
    const mandays = Math.ceil(effortHours / hoursPerDay);

    // ─── สร้าง warnings ถ้ามี WSTG code ที่หาไม่เจอ ───
    const warnings = [];
    if (missingWSTG.length > 0) {
        warnings.push(`WSTG codes not found in database (skipped): ${missingWSTG.join(', ')}`);
    }

    return {
        success: true,
        estimated_days: mandays,
        effort_hours: Math.round(effortHours * 100) / 100,
        function_count: funcIds.length,
        unique_wstg_count: usedWSTG.length,
        wstg_list: usedWSTG,
        platform_count: platforms,
        number_of_roles: roles,
        role_dependent_hours: Math.round(roleDependentHours * 100) / 100,
        role_independent_hours: Math.round(roleIndependentHours * 100) / 100,
        report_hours: Math.round(reportHours * 100) / 100,
        target_info_map: {},
        warnings: warnings.length > 0 ? warnings : undefined,
        // เพิ่มตัวแปรสำหรับใช้อธิบาย Step-by-Step
        fallback_hours: Math.round(fallbackHours * 100) / 100,
        functions_without_wstg: functionsWithoutWSTG,
        dependent_total_hours: Math.round((roleDependentHours * roles) * 100) / 100,
        total_base_hours: Math.round(totalBaseHours * 100) / 100,
        device_factor: deviceFactor,
        test_factor: typeFactor,
        initial_effort_hours: Math.round((totalBaseHours * typeFactor * deviceFactor) * 100) / 100,
        scope_scale: Math.round(scopeScale * 100) / 100
    };
};
