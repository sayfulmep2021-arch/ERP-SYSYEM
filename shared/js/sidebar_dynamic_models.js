/**
 * =========================================================================
 * Gorgeous Luxury Module Switcher (Directly below Item 12 - Master DB)
 * Strictly excludes MIS Module AND User Module ("user module এখানে আসবে না").
 * Only switches between the 3 core departmental operational modules:
 * 1. Production Module  2. Warehouse Module  3. HRM Module
 * Displays exactly TWO (2) gorgeous, full-premium cards at any time.
 * =========================================================================
 */
(function(window) {
    'use strict';

    // Universal path resolver for portal root navigation
    function getPortalIndexUrl(query) {
        const isSub = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase().includes('/modules/');
        const base = isSub ? '../../index.html' : 'index.html';
        return query ? (base + '?' + query) : base;
    }

    // 1. Core Operating Modules (MIS & User Module are strictly excluded)
    const CORE_MODULES = [
        {
            key: 'production',
            name: 'Production Module',
            subtitle: 'Manufacturing Hub',
            theme: 'mod-theme-production',
            iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>',
            action: function(e) {
                if (typeof window.switchToProductionModule === 'function') {
                    window.switchToProductionModule(e);
                } else {
                    window.location.href = getPortalIndexUrl('view=main');
                }
            }
        },
        {
            key: 'warehouse',
            name: 'Warehouse Module',
            subtitle: 'Inventory & Stock Hub',
            theme: 'mod-theme-warehouse',
            iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
            action: function(e) {
                if (typeof window.openModuleWarehouseAction === 'function') {
                    window.openModuleWarehouseAction(e);
                } else {
                    window.location.href = getPortalIndexUrl('view=warehouse');
                }
            }
        },
        {
            key: 'hrm',
            name: 'HRM Module',
            subtitle: 'Human Resource Portal',
            theme: 'mod-theme-hrm',
            iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            action: function(e) {
                if (typeof window.openModuleHRMAction === 'function') {
                    window.openModuleHRMAction(e);
                } else {
                    window.location.href = getPortalIndexUrl('view=hrm');
                }
            }
        }
    ];

    // 2. Resolve Current Active Module
    function resolveCurrentActiveModule() {
        try {
            const activeErp = (sessionStorage.getItem('portal_active_erp_module') || '').toLowerCase();
            if (activeErp.includes('hrm')) return 'hrm';
            if (activeErp.includes('warehouse') || activeErp.includes('hub')) return 'warehouse';
            if (activeErp.includes('production')) return 'production';

            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = (urlParams.get('view') || '').toLowerCase();
            const curView = (sessionStorage.getItem('portal_current_view') || '').toLowerCase();

            if (viewParam === 'hrm' || curView === 'hrm') return 'hrm';
            if (viewParam === 'hub' || curView === 'hub' || curView === 'warehouse' || viewParam === 'warehouse') return 'warehouse';
            
            // Standalone report pages check
            if (path.includes('warehouse') || path.includes('stock') || path.includes('intersales') || path.includes('received') || path.includes('spare')) return 'warehouse';
            if (path.includes('user')) return 'user';

            // Default: Production Module
            return 'production';
        } catch(e) {
            return 'production';
        }
    }

    // 3. Render the TWO Alternative Core Modules in Gorgeous Full-Premium Cards
    function renderSidebarDynamicModels(forcedActiveKey) {
        const activeKey = forcedActiveKey || resolveCurrentActiveModule();
        
        // Strictly exclude Current Module, MIS Module AND User Module
        const alternativeModules = CORE_MODULES.filter(function(m) { return m.key !== activeKey; });

        // Ensure any old headers are eliminated
        const headers = document.querySelectorAll('.mod-switcher-header');
        headers.forEach(function(h) { h.remove(); });

        const targets = document.querySelectorAll('#sidebarSwitcherLinks, .mod-switcher-inner');
        if (!targets || targets.length === 0) return;

        let html = '';
        alternativeModules.forEach(function(m) {
            html += '<a href="javascript:void(0)" class="mod-switcher-card ' + m.theme + '" onclick="window.handleSidebarModuleSwitch(\'' + m.key + '\', event)" role="button" tabindex="0" title="Switch to ' + m.name + '">' +
                    '  <div class="mod-switcher-icon-wrap">' +
                    '    ' + m.iconSvg +
                    '  </div>' +
                    '  <div class="mod-switcher-meta">' +
                    '    <span class="mod-switcher-title" style="font-family:\'Times New Roman\', Times, serif !important; font-size:13.5px !important; font-weight:700 !important;">' + m.name + '</span>' +
                    '  </div>' +
                    '  <div class="mod-switcher-arrow-pill">' +
                    '    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                    '  </div>' +
                    '</a>';
        });

        targets.forEach(function(target) {
            target.innerHTML = html;
        });
    }

    // 4. Handle Module Switch Click
    function handleSidebarModuleSwitch(moduleKey, event) {
        if (event) {
            try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
        }
        const module = CORE_MODULES.find(function(m) { return m.key === moduleKey; });
        if (module && typeof module.action === 'function') {
            module.action(event);
        }
        // Auto-refresh switcher to exclude the newly active module
        setTimeout(function() {
            renderSidebarDynamicModels(moduleKey);
        }, 60);
    }

    // 5. Initialize on DOM ready & listen for view transitions
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                renderSidebarDynamicModels();
            });
        } else {
            renderSidebarDynamicModels();
        }

        window.addEventListener('storage', function(e) {
            if (e.key === 'portal_current_view' || e.key === 'portal_active_erp_module') {
                renderSidebarDynamicModels();
            }
        });
    }

    // Expose Globally
    window.CORE_MODULES = CORE_MODULES;
    window.NON_MIS_MODULES = CORE_MODULES; // Backward compatibility
    window.renderSidebarDynamicModels = renderSidebarDynamicModels;
    window.handleSidebarModuleSwitch = handleSidebarModuleSwitch;
    window.handleSidebarModelCardClick = handleSidebarModuleSwitch; // Backward compatibility
    window.resolveCurrentActiveModule = resolveCurrentActiveModule;

})(window);
