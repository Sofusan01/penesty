const AppFunction = require('../models/AppFunction');
const SystemSetting = require('../models/SystemSetting');
const OWASPTestCase = require('../models/OWASPTestCase');
const Estimation = require('../models/Estimation');
const estimationCalculator = require('../utils/estimationCalculator');

// สร้าง lookup map: code → testCase object
function buildOwaspByCode(allWSTG) {
    const byCode = {};
    allWSTG.forEach(tc => { byCode[tc.code] = tc; });
    return byCode;
}

// Enrich แต่ละ AppFunction ด้วย OWASP sub-items จัดกลุ่มตาม category (ทำใน server ไม่ใช่ EJS)
function enrichFunctions(appFunctions, owaspByCode) {
    return appFunctions.map((func, fi) => {
        const grouped = {};
        let totalHours = 0;
        (func.mapped_wstg_test_cases || []).forEach(code => {
            const tc = owaspByCode[code];
            if (!tc) return;
            if (!grouped[tc.category]) grouped[tc.category] = [];
            grouped[tc.category].push(tc);
            totalHours += tc.base_hours;
        });
        return {
            ...func,
            owaspGrouped: grouped,
            owaspCategories: Object.keys(grouped),
            totalWstgHours: Math.round(totalHours * 10) / 10,
            accordionIndex: fi
        };
    });
}

exports.getDashboard = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const order = ['ASC', 'DESC'].includes((req.query.order || 'DESC').toUpperCase()) ? (req.query.order || 'DESC').toUpperCase() : 'DESC';

        const userId = req.user.role === 'admin' ? null : req.user.id;

        const totalItems = await Estimation.count(userId);
        const totalPages = Math.ceil(totalItems / limit);

        const [estimations, appFunctions, constraints, allWSTG] = await Promise.all([
            (req.user.role === 'admin' ? Estimation.getAll(limit, offset, order) : Estimation.findByUserId(req.user.id, limit, offset, order))
                .catch(err => { console.error('Est Select Err:', err); return []; }),
            AppFunction.getAll().catch(err => { console.error('AppFunc Select Err:', err); return []; }),
            SystemSetting.get('test_type_constraints').then(res => res || {}).catch(() => ({})),
            OWASPTestCase.getAll().catch(() => [])
        ]);
        const owaspByCode = buildOwaspByCode(allWSTG);
        const enrichedFunctions = enrichFunctions(appFunctions, owaspByCode);

        res.render('pages/dashboard', {
            user: req.user,
            estimations,
            appFunctions: enrichedFunctions,
            constraints,
            currentPage: page,
            totalPages,
            totalItems,
            order,
            error: req.query.error || null,
            success: req.query.success || null,
            previewResult: null
        });
    } catch (err) {
        console.error("Critical Dashboard Error:", err);
        next(err);
    }
};

exports.calculateEstimation = async (req, res) => {
    const {
        client_name, device_type, test_type, platform_count, selected_functions,
        selected_wstg, number_of_roles, target_url, target_mobile_app, target_infra_desc
    } = req.body;

    try {
        let funcIds = selected_functions || [];
        if (!Array.isArray(funcIds)) funcIds = [funcIds];
        funcIds = [...new Set(funcIds.filter(f => f))];

        let wstgCodes = selected_wstg || [];
        if (!Array.isArray(wstgCodes)) wstgCodes = [wstgCodes];
        wstgCodes = wstgCodes.filter(c => c);

        const calcResult = await estimationCalculator.calculate({
            device_type, test_type, platform_count, number_of_roles,
            selected_functions: funcIds,
            selected_wstg_codes: wstgCodes
        });

        const [estimations, appFunctions, constraints, totalItems, allWSTG2] = await Promise.all([
            Estimation.findByUserId(req.user.id, 3, 0),
            AppFunction.getAll(),
            SystemSetting.get('test_type_constraints').then(res => res || {}),
            Estimation.count(req.user.id),
            OWASPTestCase.getAll().catch(() => [])
        ]);
        const owaspByCode2 = buildOwaspByCode(allWSTG2);
        const enrichedFunctions2 = enrichFunctions(appFunctions, owaspByCode2);
        const totalPages = Math.ceil(totalItems / 3);

        if (calcResult.error) {
            return res.render('pages/dashboard', {
                user: req.user,
                estimations, appFunctions: enrichedFunctions2, constraints,
                currentPage: 1, totalPages, totalItems,
                error: calcResult.error, success: null, previewResult: null
            });
        }

        let targetInfo = target_url || client_name;

        res.render('pages/dashboard', {
            user: req.user,
            estimations, appFunctions: enrichedFunctions2, constraints,
            currentPage: 1, totalPages, totalItems,
            error: null, success: null,
            previewResult: {
                client_name, device_type, test_type,
                target_info: targetInfo,
                selected_functions: funcIds,
                function_count: calcResult.function_count,
                unique_wstg_count: calcResult.unique_wstg_count,
                platform_count: calcResult.platform_count,
                number_of_roles: calcResult.number_of_roles,
                estimated_days: calcResult.estimated_days,
                wstg_list: calcResult.wstg_list,
                // Step-by-step Details
                role_independent_hours: calcResult.role_independent_hours,
                role_dependent_hours: calcResult.role_dependent_hours,
                functions_without_wstg: calcResult.functions_without_wstg,
                fallback_hours: calcResult.fallback_hours,
                dependent_total_hours: calcResult.dependent_total_hours,
                total_base_hours: calcResult.total_base_hours,
                device_factor: calcResult.device_factor,
                test_factor: calcResult.test_factor,
                initial_effort_hours: calcResult.initial_effort_hours,
                scope_scale: calcResult.scope_scale,
                report_hours: calcResult.report_hours,
                final_effort_hours: calcResult.effort_hours,
                selected_wstg: calcResult.wstg_list // Store what was actually used
            }
        });

    } catch (err) {
        console.error("Calculation Error:", err);
        res.redirect('/dashboard');
    }
};

exports.confirmEstimation = async (req, res) => {
    const {
        client_name, device_type, test_type, target_url,
        platform_count, number_of_roles,
        selected_functions_json, selected_wstg_json
    } = req.body;

    const target_info = target_url || client_name;

    try {
        let selected_functions = [];
        try {
            selected_functions = JSON.parse(selected_functions_json);
            if (!Array.isArray(selected_functions)) {
                selected_functions = [];
            }
        } catch (e) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("Invalid function data."));
        }

        let selected_wstg = [];
        try {
            if (selected_wstg_json) {
                selected_wstg = JSON.parse(selected_wstg_json);
            }
        } catch (e) {
            console.error("Error parsing selected_wstg_json", e);
        }

        const calcResult = await estimationCalculator.calculate({
            device_type, test_type, platform_count, number_of_roles,
            selected_functions,
            selected_wstg_codes: selected_wstg
        });

        if (calcResult.error) {
            return res.redirect('/dashboard?error=' + encodeURIComponent(calcResult.error));
        }

        if (!client_name || typeof client_name !== 'string' || client_name.trim().length === 0) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("Client/Target Info is required."));
        }

        if (client_name.length > 255) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("Client/Target Info must be less than 255 characters."));
        }

        const suspiciousPattern = /[<>]/;
        if (suspiciousPattern.test(client_name)) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("Invalid characters detected in Client/Target Info."));
        }

        await Estimation.create({
            user_id: req.user.id,
            client_name,
            device_type,
            test_type,
            function_count: calcResult.function_count,
            platform_count: calcResult.platform_count,
            number_of_roles: calcResult.number_of_roles,
            target_info,
            estimated_days: calcResult.estimated_days,
            selected_functions: JSON.stringify(selected_functions),
            selected_wstg_json: JSON.stringify(calcResult.wstg_list || [])
        });

        res.redirect('/dashboard?success=' + encodeURIComponent('Estimation saved successfully!'));

    } catch (err) {
        console.error("Save Error:", err);
        res.redirect('/dashboard?error=' + encodeURIComponent("Failed to save estimation."));
    }
};

exports.deleteEstimation = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.redirect('/dashboard?tab=history');

        if (req.user.role === 'admin') {
            await Estimation.deleteById(id);
        } else {
            await Estimation.delete(id, req.user.id);
        }
        res.redirect('/dashboard?tab=history');
    } catch (err) {
        res.redirect('/dashboard?tab=history');
    }
};

exports.bulkDeleteEstimation = async (req, res) => {
    try {
        let ids = req.body.ids;
        if (typeof ids === 'string') {
            try {
                ids = JSON.parse(ids);
            } catch (e) {
                ids = [];
            }
        }

        // H4 Fix: Sanitize IDs to integers only
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("No items selected for deletion.") + '&tab=history');
        }

        ids = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        if (ids.length === 0) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("Invalid item IDs.") + '&tab=history');
        }

        const isAdmin = req.user.role === 'admin';
        await Estimation.bulkDelete(ids, req.user.id, isAdmin);

        res.redirect('/dashboard?success=' + encodeURIComponent(`${ids.length} items deleted successfully.`) + '&tab=history');
    } catch (err) {
        console.error("Bulk Delete Error:", err);
        res.redirect('/dashboard?error=' + encodeURIComponent("Failed to delete selected items.") + '&tab=history');
    }
};
