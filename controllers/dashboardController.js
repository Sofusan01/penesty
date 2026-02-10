const AppFunction = require('../models/AppFunction');
const SystemSetting = require('../models/SystemSetting');
const OWASPTestCase = require('../models/OWASPTestCase');
const Estimation = require('../models/Estimation');

exports.getDashboard = async (req, res) => {
    try {
        const estimations = await Estimation.findByUserId(req.user.id);
        const appFunctions = await AppFunction.getAll();
        const constraints = await SystemSetting.get('test_type_constraints') || {};

        res.render('pages/dashboard', {
            user: req.user,
            estimations: estimations,
            appFunctions: appFunctions,
            constraints: constraints, // Pass to view
            error: null,
            success: null,
            previewResult: null
        });
    } catch (err) {
        console.error(err);
        res.render('pages/dashboard', { user: req.user, estimations: [], appFunctions: [], constraints: {}, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

exports.calculateEstimation = async (req, res) => {
    // 1. INPUTS
    const {
        client_name, device_type, test_type, platform_count, selected_functions,
        number_of_roles, target_url, target_mobile_app, target_infra_desc
    } = req.body;

    let funcIds = selected_functions || [];
    if (!Array.isArray(funcIds)) funcIds = [funcIds];
    funcIds = funcIds.filter(f => f);

    try {
        // LOAD ALL DATA (Parallel for performance)
        const [appFunctions, constraints, calcRules, roleRules, estimations, allWSTG, config] = await Promise.all([
            AppFunction.getAll(),
            SystemSetting.get('test_type_constraints').then(res => res || {}),
            SystemSetting.get('calculation_rules').then(res => res || { hours_per_day: 8, rounding_step: 0.5 }),
            SystemSetting.get('role_rules').then(res => res || { min_roles: 1, max_roles: 20 }),
            Estimation.findByUserId(req.user.id),
            OWASPTestCase.getAll(),
            require('../models/EstimationConfig').get().catch(() => ({
                report_overhead_hours: 8.0, blackbox_factor: 1.5, graybox_factor: 1.0,
                web_factor: 1.0, mobile_factor: 1.2, api_factor: 0.9, infra_factor: 0.5
            }))
        ]);

        const errors = [];

        // 2. VALIDATION & SECURITY
        if (!client_name || client_name.length > 100) errors.push("Invalid client name.");

        // Target Info Map
        let targetInfo = '';
        if (device_type === 'web_application' || device_type === 'api_webservice') {
            if (!target_url) errors.push("Target URL/FQDN is required.");
            else targetInfo = target_url;
        } else if (device_type === 'mobile_application') {
            if (!target_mobile_app) errors.push("Application Name is required.");
            else targetInfo = target_mobile_app;
        } else if (device_type === 'infrastructure') {
            if (!target_infra_desc) errors.push("System Description is required.");
            else targetInfo = target_infra_desc;
        }

        // Constraints
        if (constraints && constraints[device_type]) {
            const allowed = constraints[device_type];
            if (Array.isArray(allowed) && !allowed.includes(test_type)) {
                errors.push(`Device type '${device_type}' only supports: ${allowed.join(', ')}.`);
            }
        }

        // Role Validation
        const roles = parseInt(number_of_roles) || 1;
        if (roles < (roleRules.min_roles || 1) || roles > (roleRules.max_roles || 20)) {
            errors.push(`Roles must be between ${roleRules.min_roles} and ${roleRules.max_roles}.`);
        }

        const platforms = parseInt(platform_count) || 1;
        if (isNaN(platforms) || platforms < 1 || platforms > 50) {
            errors.push("Platform count must be between 1 and 50.");
        }

        if (errors.length > 0) {
            return res.render('pages/dashboard', {
                user: req.user,
                estimations, appFunctions, constraints,
                error: errors.join(' '), success: null, previewResult: null
            });
        }

        if (funcIds.length === 0) {
            return res.render('pages/dashboard', {
                user: req.user,
                estimations, appFunctions, constraints,
                error: 'Please select at least one function.',
                success: null, previewResult: null
            });
        }

        // 3. MAPPING LOGIC (Function -> WSTG -> Base Hours)
        const wstgMap = {};
        allWSTG.forEach(tc => wstgMap[tc.code] = tc.base_hours);

        const selectedFuncDetails = await AppFunction.getByIds(funcIds);
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

        // 4. APPLY FACTORS
        let typeFactor = config.graybox_factor;
        if (test_type === 'blackbox') typeFactor = config.blackbox_factor;

        let deviceFactor = config.web_factor;
        if (device_type === 'web_application') deviceFactor = config.web_factor;
        else if (device_type === 'mobile_application') deviceFactor = config.mobile_factor;
        else if (device_type === 'api_webservice') deviceFactor = config.api_factor;
        else if (device_type === 'infrastructure') deviceFactor = config.infra_factor;

        // 5. CALCULATION FORMULA
        // Base * Factors * Platforms * Roles
        let effortHours = (totalBaseHours * typeFactor * deviceFactor) * platforms * roles;

        // Add Reporting Overhead (Fixed per engagement, or per platform? Usually per engagement)
        // Let's assume per engagement.
        effortHours += config.report_overhead_hours;

        // Man-Days (Dynamic Rules)
        const hoursPerDay = calcRules.hours_per_day || 8;
        const roundingStep = calcRules.rounding_step || 0.5;

        let mandays = effortHours / hoursPerDay;

        // Dynamic Rounding
        if (roundingStep > 0) {
            mandays = Math.ceil(mandays / roundingStep) * roundingStep;
        } else {
            mandays = Math.ceil(mandays);
        }

        // 6. RENDER PREVIEW
        res.render('pages/dashboard', {
            user: req.user,
            estimations, appFunctions, constraints,
            error: null, success: null,
            previewResult: {
                client_name, device_type, test_type,
                target_info: targetInfo, // Pass through
                function_count: funcIds.length,
                unique_wstg_count: uniqueWSTGCodes.size,
                platform_count: platforms,
                number_of_roles: roles,
                estimated_days: mandays,
                wstg_list: usedWSTG // For audit/display
            }
        });

    } catch (err) {
        console.error("Calculation Error:", err);
        res.redirect('/dashboard');
    }
};

exports.confirmEstimation = async (req, res) => {
    // 1. INPUTS
    const {
        client_name, device_type, test_type, function_count,
        platform_count, number_of_roles, target_info, estimated_days
    } = req.body;

    // 2. VALIDATION (Re-validate before save)
    const errors = [];
    if (!client_name || client_name.length > 100) errors.push("Invalid client name.");
    if (!target_info || target_info.length > 255) errors.push("Invalid target info.");

    // Additional strict type checks
    if (!device_type || !test_type) errors.push("Missing required fields.");

    if (errors.length > 0) {
        return res.redirect('/dashboard?error=' + encodeURIComponent(errors.join(' ')));
    }

    try {
        await Estimation.create({
            user_id: req.user.id,
            client_name,
            device_type,
            test_type,
            function_count: parseInt(function_count) || 0,
            platform_count: parseInt(platform_count) || 1,
            number_of_roles: parseInt(number_of_roles) || 1,
            target_info,
            estimated_days: parseFloat(estimated_days) || 0
        });

        res.render('pages/dashboard', {
            user: req.user,
            estimations: await Estimation.findByUserId(req.user.id),
            appFunctions: await AppFunction.getAll(),
            constraints: await SystemSetting.get('test_type_constraints') || {},
            error: null, success: 'Estimation saved successfully!', previewResult: null
        });

    } catch (err) {
        console.error("Save Error:", err);
        res.redirect('/dashboard?error=' + encodeURIComponent("Failed to save estimation."));
    }
};

exports.deleteEstimation = async (req, res) => {
    try {
        await Estimation.delete(req.params.id, req.user.id);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};
