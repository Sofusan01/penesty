const AppFunction = require('../models/AppFunction');
const SystemSetting = require('../models/SystemSetting');
const OWASPTestCase = require('../models/OWASPTestCase');
const EstimationConfig = require('../models/EstimationConfig');

exports.calculate = async ({ device_type, test_type, platform_count, number_of_roles, selected_functions }) => {
    let funcIds = selected_functions || [];
    if (!Array.isArray(funcIds)) funcIds = [funcIds];
    funcIds = [...new Set(funcIds.filter(f => f))];

    const [appFunctions, constraints, calcRules, roleRules, allWSTG, config] = await Promise.all([
        AppFunction.getAll(),
        SystemSetting.get('test_type_constraints').then(res => res || {}),
        SystemSetting.get('calculation_rules').then(res => res || { hours_per_day: 8, rounding_step: 0.5 }),
        SystemSetting.get('role_rules').then(res => res || { min_roles: 1, max_roles: 20 }),
        OWASPTestCase.getAll(),
        EstimationConfig.get().catch(() => ({
            report_overhead_hours: 8.0, blackbox_factor: 1.5, graybox_factor: 1.0,
            web_factor: 1.0, mobile_factor: 1.2, api_factor: 0.9, infra_factor: 0.5
        }))
    ]);

    const errors = [];

    const allowedDevices = ['web_application', 'mobile_application', 'api_webservice', 'infrastructure'];
    const allowedTests = ['graybox', 'blackbox'];

    if (!allowedDevices.includes(device_type)) {
        errors.push(`Invalid device type. Allowed: ${allowedDevices.join(', ')}`);
    }

    if (!allowedTests.includes(test_type)) {
        errors.push(`Invalid test type. Allowed: ${allowedTests.join(', ')}`);
    }

    if (constraints && constraints[device_type]) {
        const allowed = constraints[device_type];
        if (Array.isArray(allowed) && !allowed.includes(test_type)) {
            errors.push(`Device type '${device_type}' only supports: ${allowed.join(', ')}.`);
        }
    }

    const roles = parseInt(number_of_roles) || 1;
    if (roles < (roleRules.min_roles || 1) || roles > (roleRules.max_roles || 20)) {
        errors.push(`Roles must be between ${roleRules.min_roles} and ${roleRules.max_roles}.`);
    }

    const platforms = parseInt(platform_count) || 1;
    if (isNaN(platforms) || platforms < 1 || platforms > 50) {
        errors.push("Platform count must be between 1 and 50.");
    }

    if (funcIds.length === 0) {
        errors.push('Please select at least one function.');
    }

    const selectedFuncDetails = await AppFunction.getByIds(funcIds);
    if (selectedFuncDetails.length !== funcIds.length) {
        errors.push('One or more selected functions are invalid or do not exist.');
    }

    if (errors.length > 0) {
        return { error: errors.join(' ') };
    }

    const wstgMap = {};
    allWSTG.forEach(tc => wstgMap[tc.code] = tc.base_hours);

    const uniqueWSTGCodes = new Set();
    selectedFuncDetails.forEach(func => {
        if (func.mapped_wstg_test_cases) {
            func.mapped_wstg_test_cases.forEach(code => uniqueWSTGCodes.add(code));
        }
    });

    let totalBaseHours = 0;
    const usedWSTG = [];
    uniqueWSTGCodes.forEach(code => {
        if (wstgMap[code]) {
            totalBaseHours += wstgMap[code];
            usedWSTG.push(code);
        }
    });

    let typeFactor = config.graybox_factor;
    if (test_type === 'blackbox') typeFactor = config.blackbox_factor;

    let deviceFactor = config.web_factor;
    if (device_type === 'web_application') deviceFactor = config.web_factor;
    else if (device_type === 'mobile_application') deviceFactor = config.mobile_factor;
    else if (device_type === 'api_webservice') deviceFactor = config.api_factor;
    else if (device_type === 'infrastructure') deviceFactor = config.infra_factor;

    let effortHours = (totalBaseHours * typeFactor * deviceFactor) * roles;
    effortHours += config.report_overhead_hours;

    const hoursPerDay = calcRules.hours_per_day || 8;
    const roundingStep = calcRules.rounding_step || 0.5;

    let mandays = effortHours / hoursPerDay;

    if (roundingStep > 0) {
        mandays = Math.ceil(mandays / roundingStep) * roundingStep;
    } else {
        mandays = Math.ceil(mandays);
    }

    return {
        success: true,
        estimated_days: mandays,
        function_count: funcIds.length,
        unique_wstg_count: uniqueWSTGCodes.size,
        wstg_list: usedWSTG,
        platform_count: platforms,
        number_of_roles: roles,
        target_info_map: {}
    };
};
