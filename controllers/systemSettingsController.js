const SystemSetting = require('../models/SystemSetting');

exports.getSettingsPage = async (req, res) => {
    try {
        const settings = await SystemSetting.getAll();
        res.render('pages/system_settings', {
            user: req.user,
            settings: settings,
            error: null,
            success: null
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard?error=' + encodeURIComponent('Error loading system settings'));
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updateTasks = [];

        for (const [key, rawValue] of Object.entries(req.body)) {
            if (key.startsWith('setting_')) {
                const settingKey = key.replace('setting_', '');

                try {
                    const parsedValue = JSON.parse(rawValue);

                    if (settingKey === 'calculation_rules') {
                        if (typeof parsedValue.hours_per_day !== 'number' || parsedValue.hours_per_day <= 0 || parsedValue.hours_per_day > 24) {
                            throw new Error('hours_per_day must be 1-24');
                        }
                        if (typeof parsedValue.rounding_step !== 'number' || parsedValue.rounding_step < 0 || parsedValue.rounding_step > 1) {
                            throw new Error('rounding_step must be 0-1');
                        }
                    } else if (settingKey === 'test_type_constraints') {
                        if (typeof parsedValue !== 'object' || parsedValue === null) throw new Error('Must be an object');
                        for (const k in parsedValue) {
                            if (!Array.isArray(parsedValue[k])) throw new Error(`Value for ${k} must be an array`);
                        }
                    }

                    updateTasks.push(SystemSetting.update(settingKey, parsedValue));
                } catch (e) {
                    return res.render('pages/system_settings', {
                        user: req.user,
                        settings: await SystemSetting.getAll(),
                        error: `Invalid JSON format for key '${settingKey}': ${e.message}`,
                        success: null
                    });
                }
            }
        }

        await Promise.all(updateTasks);

        const settings = await SystemSetting.getAll();
        res.render('pages/system_settings', {
            user: req.user,
            settings: settings,
            error: null,
            success: 'System settings updated successfully.'
        });

    } catch (err) {
        console.error(err);
        res.render('pages/system_settings', {
            user: req.user,
            settings: await SystemSetting.getAll(),
            error: 'Failed to update settings.',
            success: null
        });
    }
};
