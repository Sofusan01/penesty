const fs = require('fs');

let content = fs.readFileSync('views/pages/system_settings.ejs', 'utf8');

const replacement = `
                                            <% if (settings) { %>
                                                <div class="tabs-container">
                                                    <ul class="tabs-nav">
                                                        <% settings.forEach((setting, index) => { %>
                                                            <li class="tab-link <%= index === 0 ? 'active' : '' %>" onclick="switchSystemTab('<%= setting.key %>')">
                                                                <%= setting.key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase()) %>
                                                            </li>
                                                        <% }) %>
                                                    </ul>
                                                </div>

                                                <% settings.forEach((setting, index) => { %>
                                                    <div id="tab-<%= setting.key %>" class="system-tab-content" style="display: <%= index === 0 ? 'block' : 'none' %>;">
                                                        <div class="setting-block" style="border-top-left-radius: 0;">
                                                            <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start;">
                                                                <div>
                                                                    <label style="font-size: 1.25rem; color: var(--primary-color); margin-bottom: 0.25rem;"><%= setting.key %></label>
                                                                    <span class="text-muted"><%= setting.description %></span>
                                                                </div>
                                                            </div>
                                                            
                                                            <textarea class="json-editor" name="setting_<%= setting.key %>" id="setting_<%= setting.key %>" style="display:none;" required><%= JSON.stringify(setting.value, null, 2) %></textarea>
                                                            
                                                            <div class="table-container">
                                                                <table class="data-table ui-builder-table" data-target="setting_<%= setting.key %>">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Parameter / Key</th>
                                                                            <th>Value</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <% if (typeof setting.value === 'object' && !Array.isArray(setting.value)) { %>
                                                                            <% Object.keys(setting.value).forEach(param => { %>
                                                                                <tr>
                                                                                    <td style="font-family: monospace; font-weight: 500;"><%= param %></td>
                                                                                    <td>
                                                                                        <% if (typeof setting.value[param] === 'number') { %>
                                                                                            <input type="number" step="0.1" class="form-input ui-builder-input" data-key="<%= param %>" data-type="number" value="<%= setting.value[param] %>" style="width: 100%; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 4px;">
                                                                                        <% } else if (Array.isArray(setting.value[param])) { %>
                                                                                            <input type="text" class="form-input ui-builder-input" data-key="<%= param %>" data-type="array" value="<%= setting.value[param].join(', ') %>" placeholder="comma separated..." style="width: 100%; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 4px;">
                                                                                            <small class="text-muted" style="display:block; margin-top:0.25rem;">Comma separated (e.g. blackbox, graybox)</small>
                                                                                        <% } else { %>
                                                                                            <input type="text" class="form-input ui-builder-input" data-key="<%= param %>" data-type="string" value="<%= setting.value[param] %>" style="width: 100%; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 4px;">
                                                                                        <% } %>
                                                                                    </td>
                                                                                </tr>
                                                                            <% }) %>
                                                                        <% } else { %>
                                                                            <tr>
                                                                                <td colspan="2" style="text-align:center; color: #dc2626;">Complex nested JSON structure. Switch to raw JSON editor.</td>
                                                                            </tr>
                                                                        <% } %>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div id="validation_<%= setting.key %>" style="color:red; font-size:0.8rem; margin-top:0.75rem;"></div>
                                                        </div>
                                                    </div>
                                                <% }) %>
                                            <% } %>
`;

content = content.replace(/<% if \(settings\) { %>[\s\S]*?<% } %>/g, replacement);

const scriptToAdd = `
        function switchSystemTab(tabId) {
            document.querySelectorAll('.system-tab-content').forEach(el => el.style.display = 'none');
            document.getElementById('tab-' + tabId).style.display = 'block';
            document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'));
            event.currentTarget.classList.add('active');
        }

        // Sync UI builder back to hidden JSON textareas on change or submit
        function syncUiToJSON() {
            document.querySelectorAll('.ui-builder-table').forEach(table => {
                const targetId = table.getAttribute('data-target');
                const targetTextarea = document.getElementById(targetId);
                if (!targetTextarea) return;
                
                let currentData;
                try {
                    currentData = JSON.parse(targetTextarea.value);
                } catch(e) {
                    currentData = {};
                }

                table.querySelectorAll('.ui-builder-input').forEach(input => {
                    const key = input.getAttribute('data-key');
                    const type = input.getAttribute('data-type');
                    const val = input.value;
                    
                    if (type === 'number') {
                        currentData[key] = Number(val);
                    } else if (type === 'array') {
                        currentData[key] = val.split(',').map(s => s.trim()).filter(s => s);
                    } else {
                        currentData[key] = val;
                    }
                });
                
                targetTextarea.value = JSON.stringify(currentData, null, 2);
            });
        }

        // Intercept form submit to ensure latest UI state is serialized
        document.querySelector('form[action="/settings/system"]').addEventListener('submit', function(e) {
            syncUiToJSON();
        });

        document.querySelectorAll('.ui-builder-input').forEach(input => {
            input.addEventListener('change', syncUiToJSON);
            input.addEventListener('keyup', syncUiToJSON);
        });
`;

content = content.replace('// Simple Client-side JSON Validation Feedback', scriptToAdd + '\n        // Simple Client-side JSON Validation Feedback');

const customStyles = `
            .data-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                overflow: hidden;
            }
            .data-table th, .data-table td {
                padding: 0.75rem 1rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
            }
            .data-table th {
                background-color: #f1f5f9;
                font-weight: 600;
                color: var(--text-secondary);
                text-transform: uppercase;
                font-size: 0.8rem;
                letter-spacing: 0.05em;
            }
`;

content = content.replace('</style>', customStyles + '\n        </style>');
fs.writeFileSync('views/pages/system_settings.ejs', content);
