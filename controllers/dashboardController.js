const AppFunction = require('../models/AppFunction');
const SystemSetting = require('../models/SystemSetting');
const OWASPTestCase = require('../models/OWASPTestCase');
const Estimation = require('../models/Estimation');
const estimationCalculator = require('../utils/estimationCalculator');

exports.getDashboard = async (req, res) => {
    try {
        // Safe Parallel DB Selects
        const [estimations, appFunctions, constraints] = await Promise.all([
            (req.user.role === 'admin' ? Estimation.getAll() : Estimation.findByUserId(req.user.id))
                .catch(err => { console.error('Est Select Err:', err); return []; }),
            AppFunction.getAll().catch(err => { console.error('AppFunc Select Err:', err); return []; }),
            SystemSetting.get('test_type_constraints').then(res => res || {}).catch(() => ({}))
        ]);

        res.render('pages/dashboard', {
            user: req.user,
            estimations,
            appFunctions,
            constraints,
            error: req.query.error || null,
            success: req.query.success || null,
            previewResult: null
        });
    } catch (err) {
        console.error("Critical Dashboard Error:", err);
        res.status(500).send("System Error: Unable to load dashboard data. Please try again later.");
    }
};

// ... (skipping calculateEstimation) ...

exports.calculateEstimation = async (req, res) => {
    // 1. INPUTS
    const {
        client_name, device_type, test_type, platform_count, selected_functions,
        number_of_roles, target_url, target_mobile_app, target_infra_desc
    } = req.body;

    try {
        // Use Centralized Calculator
        // 1. INPUTS
        let funcIds = selected_functions || [];
        if (!Array.isArray(funcIds)) funcIds = [funcIds];
        // Deduplicate and filter truthy values
        funcIds = [...new Set(funcIds.filter(f => f))];

        const calcResult = await estimationCalculator.calculate({
            device_type, test_type, platform_count, number_of_roles, selected_functions: funcIds
        });

        const [estimations, appFunctions, constraints] = await Promise.all([
            Estimation.findByUserId(req.user.id),
            AppFunction.getAll(),
            SystemSetting.get('test_type_constraints').then(res => res || {})
        ]);

        if (calcResult.error) {
            return res.render('pages/dashboard', {
                user: req.user,
                estimations, appFunctions, constraints,
                error: calcResult.error, success: null, previewResult: null
            });
        }

        // Target Info Map - Consolidated input from frontend maps to 'req.body.target_url'
        let targetInfo = target_url || client_name; // Fallback to client_name if target_url is not provided (merged input)

        // 6. RENDER PREVIEW
        res.render('pages/dashboard', {
            user: req.user,
            estimations, appFunctions, constraints,
            error: null, success: null,
            previewResult: {
                client_name, device_type, test_type,
                target_info: targetInfo,
                selected_functions: funcIds, // Pass array for re-submission
                function_count: calcResult.function_count,
                unique_wstg_count: calcResult.unique_wstg_count,
                platform_count: calcResult.platform_count,
                number_of_roles: calcResult.number_of_roles,
                estimated_days: calcResult.estimated_days,
                wstg_list: calcResult.wstg_list
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
        client_name, device_type, test_type, target_url, // Maps from consolidated input name
        platform_count, number_of_roles, selected_functions_json
    } = req.body;

    // Map for consistency
    const target_info = target_url || client_name;

    try {
        let selected_functions = [];
        try {
            selected_functions = JSON.parse(selected_functions_json);
            if (!Array.isArray(selected_functions)) {
                // If parsed successfully but not an array, treat as empty or invalid
                selected_functions = [];
            }
        } catch (e) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("Invalid function data."));
        }

        // 2. RE-CALCULATE for Security
        const calcResult = await estimationCalculator.calculate({
            device_type, test_type, platform_count, number_of_roles, selected_functions
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

        // Prevent XSS or basic Injection attempts (though EJS escapes by default, we can be strict)
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
            estimated_days: calcResult.estimated_days // Trusted Server-Side Calculation
        });

        // SUCCESS: Redirect using PRG Pattern
        res.redirect('/dashboard?success=' + encodeURIComponent('Estimation saved successfully!'));

    } catch (err) {
        console.error("Save Error:", err);
        res.redirect('/dashboard?error=' + encodeURIComponent("Failed to save estimation."));
    }
};

exports.deleteEstimation = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            await Estimation.deleteById(req.params.id);
        } else {
            // User can only delete their own
            await Estimation.delete(req.params.id, req.user.id);
        }
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};
