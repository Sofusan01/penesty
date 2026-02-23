const AppFunction = require('../models/AppFunction');
const SystemSetting = require('../models/SystemSetting');
const OWASPTestCase = require('../models/OWASPTestCase');
const Estimation = require('../models/Estimation');
const estimationCalculator = require('../utils/estimationCalculator');

exports.getDashboard = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const order = (req.query.order || 'DESC').toUpperCase();

        const userId = req.user.role === 'admin' ? null : req.user.id;

        const totalItems = await Estimation.count(userId);
        const totalPages = Math.ceil(totalItems / limit);

        const [estimations, appFunctions, constraints] = await Promise.all([
            (req.user.role === 'admin' ? Estimation.getAll(limit, offset, order) : Estimation.findByUserId(req.user.id, limit, offset, order))
                .catch(err => { console.error('Est Select Err:', err); return []; }),
            AppFunction.getAll().catch(err => { console.error('AppFunc Select Err:', err); return []; }),
            SystemSetting.get('test_type_constraints').then(res => res || {}).catch(() => ({}))
        ]);

        res.render('pages/dashboard', {
            user: req.user,
            estimations,
            appFunctions,
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
        number_of_roles, target_url, target_mobile_app, target_infra_desc
    } = req.body;

    try {
        let funcIds = selected_functions || [];
        if (!Array.isArray(funcIds)) funcIds = [funcIds];
        funcIds = [...new Set(funcIds.filter(f => f))];

        const calcResult = await estimationCalculator.calculate({
            device_type, test_type, platform_count, number_of_roles, selected_functions: funcIds
        });

        const [estimations, appFunctions, constraints, totalItems] = await Promise.all([
            Estimation.findByUserId(req.user.id, 3, 0),
            AppFunction.getAll(),
            SystemSetting.get('test_type_constraints').then(res => res || {}),
            Estimation.count(req.user.id)
        ]);
        const totalPages = Math.ceil(totalItems / 3);

        if (calcResult.error) {
            return res.render('pages/dashboard', {
                user: req.user,
                estimations, appFunctions, constraints,
                currentPage: 1, totalPages, totalItems,
                error: calcResult.error, success: null, previewResult: null
            });
        }

        let targetInfo = target_url || client_name;

        res.render('pages/dashboard', {
            user: req.user,
            estimations, appFunctions, constraints,
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
                wstg_list: calcResult.wstg_list
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
        platform_count, number_of_roles, selected_functions_json
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
            selected_functions: JSON.stringify(selected_functions)
        });

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
            await Estimation.delete(req.params.id, req.user.id);
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

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.redirect('/dashboard?error=' + encodeURIComponent("No items selected for deletion.") + '&tab=history');
        }

        const isAdmin = req.user.role === 'admin';
        await Estimation.bulkDelete(ids, req.user.id, isAdmin);

        res.redirect('/dashboard?success=' + encodeURIComponent(`${ids.length} items deleted successfully.`) + '&tab=history');
    } catch (err) {
        console.error("Bulk Delete Error:", err);
        res.redirect('/dashboard?error=' + encodeURIComponent("Failed to delete selected items.") + '&tab=history');
    }
};
