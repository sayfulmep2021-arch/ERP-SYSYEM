/**
 * MEP Portal - Corporate Authentication, Session & View Routing Engine
 * Credentials validation, role-based views (ADMIN vs View), inactivity tracker, and page routing
 * Auto-extracted from index.html during Phase 3 modularization
 */
        // Official Dynamic Credentials Store
        function getAdminPassword() {
            return localStorage.getItem('portal_auth_admin_password') || "9642";
        }
        function setAdminPassword(val) {
            localStorage.setItem('portal_auth_admin_password', val);
        }

        function getViewPassword() {
            return localStorage.getItem('portal_auth_view_password') || "1234";
        }
        function setViewPassword(val) {
            localStorage.setItem('portal_auth_view_password', val);
        }

        function getMISSecurityPin() {
            return localStorage.getItem('portal_auth_mis_pin') || "96420";
        }
        function setMISSecurityPin(val) {
            localStorage.setItem('portal_auth_mis_pin', val);
        }

        const AUTH_CONFIG = {
            adminUsername: "ADMIN",
            get adminPassword() { return getAdminPassword(); },
            set adminPassword(val) { setAdminPassword(val); },
            viewUsername: "View",
            get viewPassword() { return getViewPassword(); },
            set viewPassword(val) { setViewPassword(val); }
        };

        const STORAGE_KEYS = {
            isAuthenticated: "portal_auth_status",
            lastActivity: "portal_last_active_time"
        };

        function isPageReload() {
            try {
                const nav = performance.getEntriesByType('navigation');
                if (nav && nav.length > 0) {
                    return nav[0].type === 'reload';
                }
                if (performance.navigation) {
                    return performance.navigation.type === 1; // TYPE_RELOAD
                }
            } catch(e) {}
            return false;
        }

        function browseAllReportsAction(event) {
            if (event) event.stopPropagation();
            resetInactivityTimer();

            // Animate department cards on the right with a sequential wave pulse to guide user selection
            const cards = document.querySelectorAll('.dept-card-btn');
            cards.forEach((card, idx) => {
                setTimeout(() => {
                    card.classList.add('dept-card-pulse');
                    setTimeout(() => card.classList.remove('dept-card-pulse'), 700);
                }, idx * 45);
            });

            // Focus on Choose Your Report panel without entering any individual report
            const mainPanel = document.querySelector('.dept-hub-panel');
            if (mainPanel) {
                mainPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            showToast("Please select any report category from the right panel");
        }

        // Universal Master Report Mapping Dictionary
        const REPORT_TITLE_TO_FILE_MAP = {
            'Production Plan': 'production_plan.html',
            'Monthly RM Demand Vs Received': 'monthly_rm_demand_vs_received.html',
            'Assemble Summary': 'assemble_summary.html',
            'Armature Summary': 'armature_summary.html',
            'FG Summary': 'fg_summary.html',
            'BOM': 'bom.html',
            'BOM (Bill of Materials)': 'bom.html',
            'RM Requirement Summary (BOM)': 'rm_requirement_summary_bom.html',
            'BOM With SFG': 'bom_with_sfg.html',
            'Daily FG Production Entry': 'daily_fg_production_entry.html',
            'Daily Production Received Assemble (All)': 'daily_production_received_assemble.html',
            'Daily Production Received Assemble': 'daily_production_received_assemble.html',
            'Daily Production Plan': 'daily_production_plan.html',
            'Check Floor Stock': 'check_floor_stock.html',
            'Fan Damage Calculation Entry': 'fan_damage_calculation_entry.html',
            'All Section SFG': 'report_all_section_sfg.html',
            'Fan Assemble': 'fan_assemble_erp.html',
            'Fan Assemble (Closing ERP)': 'fan_assemble_erp.html',
            'Armature & Winding': 'armature_winding_erp.html',
            'Armature & Winding (Closing ERP)': 'armature_winding_erp.html',
            'Finish Good (FG)': 'closing_finish_good_fg.html',
            'Finish Good FG (Closing ERP)': 'closing_finish_good_fg.html',
            'Closing All SFG': 'closing_all_sfg.html',
            'Closing All SFG (Closing ERP)': 'closing_all_sfg.html',
            'Store Position Report': 'store_position_report.html',
            'Monthly Production Summary (Physical)': 'monthly_production_summary_physical.html',
            'Monthly Production Summary': 'monthly_production_summary_physical.html',
            'Monthly Damage Summary': 'monthly_damage_summary.html',
            'Yearly Production Summary (Physical)': 'yearly_production_summary_physical.html',
            'Yearly Production Summary (ERP)': 'yearly_production_summary_erp.html',
            'Yearly Damage Summary': 'yearly_damage_summary.html',
            'FG Pending Report': 'fg_pending_report.html',
            'Check FG Need Item': 'check_fg_need_item.html',
            'Check RM (Prd. Possible)': 'check_rm_prd_possible.html',
            'Check RM Prd Possible': 'check_rm_prd_possible.html',
            'Master Database': 'master.html',
            'Master': 'master.html',
            'Central Item Master Database': 'master.html'
        };

        window.navigateToReportPage = function(targetUrl, event) {
            if (event) {
                try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
            }
            if (!targetUrl || targetUrl === '#') {
                showToast("ℹ️ This report is currently undergoing scheduled data maintenance.");
                return;
            }

            const cleanFile = targetUrl.split('/').pop().split('?')[0].toLowerCase();

            // Dynamic Link Redirection (from Show & Edit Link manager)
            let effectiveTarget = targetUrl;
            try {
                if (typeof window.getEffectivePageLink === 'function') {
                    effectiveTarget = window.getEffectivePageLink(cleanFile);
                } else {
                    const raw = localStorage.getItem('portal_page_link_mappings');
                    if (raw) {
                        const mappings = JSON.parse(raw);
                        if (mappings && mappings[cleanFile]) {
                            effectiveTarget = mappings[cleanFile];
                        }
                    }
                }
            } catch(e) {}

            const effectiveClean = effectiveTarget.split('/').pop().split('?')[0].toLowerCase();

            // Permission Check for View-Only User
            if (isCurrentUserViewOnly()) {
                const rawPerms = localStorage.getItem('portal_view_page_permissions');
                if (rawPerms) {
                    try {
                        const perms = JSON.parse(rawPerms);
                        if (perms && (perms[cleanFile] === false || perms[effectiveClean] === false)) {
                            alert("Access Denied: You do not have permission to view this report page.");
                            return;
                        }
                    } catch(e) {}
                }
            }

            // Ensure active session timestamp is updated in sessionStorage
            sessionStorage.setItem(STORAGE_KEYS.isAuthenticated, "true");
            sessionStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());

            window.location.href = effectiveTarget;
        };

        window.handleSubReportClick = function(moduleName, reportTitle, event) {
            if (event) {
                try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
            }
            const normalizedTitle = (reportTitle || '').trim();
            const targetUrl = REPORT_TITLE_TO_FILE_MAP[normalizedTitle];
            if (targetUrl) {
                window.navigateToReportPage(targetUrl, event);
            } else {
                showToast(`ℹ️ "${normalizedTitle}" is currently undergoing scheduled data maintenance.`);
            }
        };

        window.openMasterPage = function(event) {
            if (typeof window.navigateToReportPage === 'function') {
                window.navigateToReportPage('master.html', event);
            } else {
                window.location.href = 'master.html';
            }
        };

        /**
         * Initialize & check session on page load
         * Checks both sessionStorage and localStorage for seamless cross-tab & direct file launch support
         */
        function initSession() {
            // STRICT SECURITY: Only valid active session in sessionStorage is accepted!
            // No persistent localStorage auto-login permitted.
            const isAuth = (sessionStorage.getItem(STORAGE_KEYS.isAuthenticated) === "true");
            const storedRole = (sessionStorage.getItem('portal_auth_role') || '').toUpperCase();
            const sig = sessionStorage.getItem('portal_auth_sig') || '';
            const expectedSig = (storedRole === 'VIEW')
                ? btoa('VIEW:::MEP_SECURE_PORTAL_2026')
                : btoa('ADMIN:::MEP_SECURE_PORTAL_2026');

            if (isAuth && (storedRole === 'ADMIN' || storedRole === 'VIEW') && sig === expectedSig) {
                const isViewOnly = (storedRole === 'VIEW') || (sessionStorage.getItem('portal_view_only') === 'true');
                sessionStorage.setItem('portal_auth_role', storedRole);
                sessionStorage.setItem('portal_view_only', isViewOnly ? "true" : "false");
                sessionStorage.setItem('portal_auth_sig', sig);
                sessionStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());

                const urlParams = new URLSearchParams(window.location.search);
                const viewParam = urlParams.get('view');
                const currentView = sessionStorage.getItem('portal_current_view');
                const targetMod = urlParams.get('mod') || sessionStorage.getItem('portal_hub_module');

                if (viewParam === 'main' || viewParam === 'production') {
                    sessionStorage.setItem('portal_current_view', 'main');
                    switchToMainInterfaceView();
                } else if (viewParam === 'dashboard') {
                    sessionStorage.setItem('portal_current_view', 'main');
                    switchToMainInterfaceView();
                } else if (viewParam === 'hub') {
                    sessionStorage.setItem('portal_current_view', 'hub');
                    switchToDepartmentHub(targetMod);
                } else if (viewParam === 'modules') {
                    sessionStorage.setItem('portal_current_view', 'modules');
                    switchToModuleSelectionView();
                } else if (viewParam === 'mis') {
                    if (typeof isMISPinVerified === 'function' && isMISPinVerified()) {
                        sessionStorage.setItem('portal_current_view', 'mis');
                        switchToMISSelectionView();
                    } else {
                        sessionStorage.setItem('portal_current_view', 'modules');
                        switchToModuleSelectionView();
                        if (typeof openMISPinSecurityModal === 'function') {
                            openMISPinSecurityModal();
                        }
                    }
                } else if (viewParam === 'hrm') {
                    sessionStorage.setItem('portal_current_view', 'hrm');
                    const sub = urlParams.get('sub') || (urlParams.get('page') === 'new_entry' ? 'new_entry' : 'dashboard');
                    switchToHRMModuleView(sub);
                } else if (viewParam === 'warehouse') {
                    sessionStorage.setItem('portal_current_view', 'warehouse');
                    switchToWarehouseModuleView();
                } else if (viewParam === 'user') {
                    sessionStorage.setItem('portal_current_view', 'user');
                    const tab = urlParams.get('tab') || 'profile';
                    switchToUserModuleView(tab);
                } else if (currentView === 'main') {
                    switchToMainInterfaceView();
                } else if (currentView === 'hub') {
                    switchToDepartmentHub(targetMod);
                } else if (currentView === 'warehouse') {
                    switchToWarehouseModuleView();
                } else if (currentView === 'modules') {
                    switchToModuleSelectionView();
                } else if (currentView === 'mis') {
                    if (typeof isMISPinVerified === 'function' && isMISPinVerified()) {
                        switchToMISSelectionView();
                    } else {
                        sessionStorage.setItem('portal_current_view', 'modules');
                        switchToModuleSelectionView();
                        if (typeof openMISPinSecurityModal === 'function') {
                            openMISPinSecurityModal();
                        }
                    }
                } else if (currentView === 'hrm') {
                    switchToHRMModuleView();
                } else if (currentView === 'user') {
                    switchToUserModuleView();
                } else {
                    // Default view upon successful entry is the 5-Module Selection Screen!
                    switchToModuleSelectionView();
                }
                applyViewOnlyStateUI();

                var misOpt = urlParams.get('misOpt');
                if (misOpt && typeof openMISOption === 'function') {
                    setTimeout(function() { openMISOption(misOpt); }, 200);
                }
            } else {
                // Not authenticated: clear any partial or expired session and display Lock Screen
                sessionStorage.removeItem(STORAGE_KEYS.isAuthenticated);
                sessionStorage.removeItem('portal_auth_role');
                sessionStorage.removeItem('portal_view_only');
                sessionStorage.removeItem('portal_auth_sig');
                showLoginView();
            }
            initNotificationState();
        }

        /**
         * Switch UI to Dashboard
         */
        function showDashboardView() {
            var loginView = document.getElementById('loginView');
            var hubView = document.getElementById('departmentHubView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var warehouseView = document.getElementById('warehouseModuleView');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'flex', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');
        }

        function showLoginView() {
            var dashView = document.getElementById('dashboardView');
            var hubView = document.getElementById('departmentHubView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var warehouseView = document.getElementById('warehouseModuleView');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');
            var loginView = document.getElementById('loginView');

            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');
            if (loginView) loginView.style.setProperty('display', 'flex', 'important');

            // Default to ADMIN role
            if (typeof selectRole === 'function') {
                selectRole('ADMIN');
            } else {
                const usernameInput = document.getElementById('username');
                if (usernameInput) usernameInput.value = 'ADMIN';
            }

            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.classList.remove('input-error');
                setTimeout(() => passwordInput.focus(), 120);
            }

            const errorBox = document.getElementById('loginError');
            if (errorBox) errorBox.classList.remove('show');
        }

        function updateNavState(activeView) {
            const isMain = (activeView === 'main');
            const isHub = (activeView === 'hub');
            const isDash = (activeView === 'dashboard');
            const isModules = (activeView === 'modules');

            document.querySelectorAll('.btn-nav-main, .btn-rail-main, .mep-btn-main, .mep-btn-3d-dash').forEach(el => {
                if (isMain) el.classList.add('active');
                else el.classList.remove('active');
            });
            document.querySelectorAll('.btn-nav-home, .btn-rail-home, .mep-btn-menu').forEach(el => {
                if (isHub) el.classList.add('active');
                else el.classList.remove('active');
            });
            document.querySelectorAll('.btn-nav-dash, .btn-rail-dash').forEach(el => {
                if (isDash) el.classList.add('active');
                else el.classList.remove('active');
            });
            document.querySelectorAll('.btn-nav-modules, .mep-btn-portal, .mep-btn-3d-mod').forEach(el => {
                if (isModules) el.classList.add('active');
                else el.classList.remove('active');
            });
        }

        function getDynamicCurrentModuleName() {
            try {
                const stored = sessionStorage.getItem('portal_active_erp_module');
                if (stored) return stored;
            } catch(e) {}

            const path = (window.location.pathname || '').toLowerCase();
            const query = (window.location.search || '').toLowerCase();

            if (path.includes('hrm') || query.includes('view=hrm')) return 'HRM Module';
            if (path.includes('user') || query.includes('view=user')) return 'User Module';
            if (path.includes('mis') || query.includes('view=mis')) return 'MIS Module';
            if (path.includes('warehouse') || query.includes('view=warehouse')) return 'Warehouse Module';

            const currentView = (sessionStorage.getItem('portal_current_view') || '').toLowerCase();
            if (currentView === 'hrm') return 'HRM Module';
            if (currentView === 'user') return 'User Module';
            if (currentView === 'mis') return 'MIS Module';
            if (currentView === 'hub') return 'Warehouse Module';

            return 'Production Module';
        }

        function updateDynamicModuleHeader(moduleName) {
            if (!moduleName) {
                moduleName = getDynamicCurrentModuleName();
            }
            try {
                sessionStorage.setItem('portal_active_erp_module', moduleName);
            } catch(e) {}

            document.querySelectorAll('.smart-brand-text').forEach(function(el) {
                el.textContent = moduleName;
            });

            if (typeof window.renderSidebarDynamicModels === 'function') {
                window.renderSidebarDynamicModels();
            }
        }

        /**
         * System-Wide Helper: Collapse all sidebar module accordions and sub-item highlights.
         * Ensures entering or re-entering Production Module always shows ONLY main headings.
         */
        function collapseAllSidebarModules() {
            try {
                var accordions = document.querySelectorAll('.mep-module-accordion');
                accordions.forEach(function(grp) {
                    grp.classList.remove('is-open');
                    var h = grp.querySelector('.mep-module-heading');
                    if (h) h.classList.remove('is-active-module');
                });
                var subItems = document.querySelectorAll('.sub-report-item');
                subItems.forEach(function(el) {
                    el.classList.remove('active-page');
                    el.classList.remove('item-highlight-entry');
                });
                var drawerCards = document.querySelectorAll('#reportsContainer .accordion-card');
                drawerCards.forEach(function(c) {
                    c.classList.remove('expanded');
                    var h = c.querySelector('.accordion-header');
                    if (h) h.setAttribute('aria-expanded', 'false');
                });
            } catch(e) {
                console.warn('Error collapsing sidebar modules:', e);
            }
        }
        window.collapseAllSidebarModules = collapseAllSidebarModules;

        function switchToMainInterfaceView() {
            resetInactivityTimer();
            sessionStorage.setItem('portal_current_view', 'main');
            sessionStorage.removeItem('portal_hub_module');
            updateDynamicModuleHeader('Production Module');
            var loginView = document.getElementById('loginView');
            var hubView = document.getElementById('departmentHubView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var userView = document.getElementById('userModuleView');
            var warehouseView = document.getElementById('warehouseModuleView');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (userView) userView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'flex', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');

            updateNavState('main');

            // Collapse all sidebar modules so headings start closed when entering Production Module
            collapseAllSidebarModules();

            if (typeof renderProductionPerformanceDashboard === 'function') {
                renderProductionPerformanceDashboard();
            }

            applyViewOnlyStateUI();

            if (window.location.search) {
                try {
                    window.history.replaceState(null, '', window.location.pathname);
                } catch(e) {}
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function switchToDashboardView() {
            window.location.href = 'fg_pending_report.html';
        }

        function switchToDepartmentHub(targetModuleId) {
            resetInactivityTimer();
            collapseAllSidebarModules();
            sessionStorage.setItem('portal_current_view', 'hub');
            updateDynamicModuleHeader('Warehouse Module');
            var loginView = document.getElementById('loginView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var hubView = document.getElementById('departmentHubView');
            var moduleView = document.getElementById('moduleSelectionView');
            var misView = document.getElementById('misSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var userView = document.getElementById('userModuleView');
            var warehouseView = document.getElementById('warehouseModuleView');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (userView) userView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'flex', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');

            updateNavState('hub');
            applyViewOnlyStateUI();

            if (targetModuleId) {
                selectDepartmentModule(targetModuleId);
            } else {
                sessionStorage.removeItem('portal_hub_module');
                document.querySelectorAll('.dept-card-btn').forEach(function(card) {
                    card.classList.remove('active-dept');
                });
                var emptyState = document.getElementById('hubEmptyState');
                var container = document.getElementById('hubActiveModuleContainer');
                if (emptyState) {
                    emptyState.classList.remove('is-hidden');
                    emptyState.style.setProperty('display', 'flex', 'important');
                }
                if (container) {
                    container.classList.add('is-hidden');
                    container.style.setProperty('display', 'none', 'important');
                    container.innerHTML = '';
                }
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /**
         * Switch UI to 5-Module Department Selection Screen (Default Gateway View)
         */
        function switchToModuleSelectionView() {
            resetInactivityTimer();
            collapseAllSidebarModules();
            sessionStorage.setItem('portal_current_view', 'modules');
            sessionStorage.removeItem('portal_hub_module');
            sessionStorage.removeItem('mis_pin_verified');

            var loginView = document.getElementById('loginView');
            var hubView = document.getElementById('departmentHubView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var userView = document.getElementById('userModuleView');
            var warehouseView = document.getElementById('warehouseModuleView');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (userView) userView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'flex', 'important');

            updateNavState('modules');
            applyViewOnlyStateUI();
            updateModuleHeaderState();

            if (window.location.search && !window.location.search.includes('view=modules')) {
                try {
                    window.history.replaceState(null, '', window.location.pathname);
                } catch(e) {}
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /**
         * Switch UI to Premium MIS Option Selection Screen (Select Your Option)
         */
        function switchToMISSelectionView() {
            if (typeof isMISPinVerified === 'function' && !isMISPinVerified()) {
                if (typeof openMISPinSecurityModal === 'function') {
                    openMISPinSecurityModal();
                }
                return;
            }
            resetInactivityTimer();
            collapseAllSidebarModules();
            sessionStorage.setItem('portal_current_view', 'mis');
            sessionStorage.removeItem('portal_hub_module');
            updateDynamicModuleHeader('MIS Module');

            var loginView = document.getElementById('loginView');
            var hubView = document.getElementById('departmentHubView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var userView = document.getElementById('userModuleView');
            var warehouseView = document.getElementById('warehouseModuleView');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (userView) userView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'flex', 'important');

            updateNavState('mis');
            applyViewOnlyStateUI();
            updateModuleHeaderState();

            if (window.location.search && !window.location.search.includes('view=mis')) {
                try {
                    window.history.replaceState(null, '', window.location.pathname + '?view=mis');
                } catch(e) {}
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /**
         * Production Module Click Handler -> Opens the complete rearranged Dashboard
         */
        function switchToProductionModule(event) {
            if (event) {
                try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
            }
            collapseAllSidebarModules();
            switchToMainInterfaceView();
        }

        function openModuleNotice(moduleName, moduleDesc) {
            // Toast alert removed per user requirement
        }

        function openModuleWarehouseAction(event) {
            if (event) {
                try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
            }
            switchToWarehouseModuleView();
        }

        function switchToWarehouseModuleView(subPage) {
            resetInactivityTimer();
            collapseAllSidebarModules();
            sessionStorage.setItem('portal_current_view', 'warehouse');
            sessionStorage.setItem('portal_active_erp_module', 'warehouse');
            sessionStorage.removeItem('portal_hub_module');
            updateDynamicModuleHeader('Warehouse Module');
            var loginView = document.getElementById('loginView');
            var hubView = document.getElementById('departmentHubView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var userView = document.getElementById('userModuleView');
            var warehouseView = document.getElementById('warehouseModuleView');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (userView) userView.style.setProperty('display', 'none', 'important');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'flex', 'important');

            updateNavState('warehouse');
            applyViewOnlyStateUI();

            if (typeof window.renderSidebarDynamicModels === 'function') {
                window.renderSidebarDynamicModels('warehouse');
            }

            if (window.WAREHOUSE_ENGINE && typeof window.WAREHOUSE_ENGINE.init === 'function') {
                window.WAREHOUSE_ENGINE.init();
            }

            if (window.location.search && !window.location.search.includes('view=warehouse')) {
                try {
                    window.history.replaceState(null, '', window.location.pathname + '?view=warehouse');
                } catch(e) {}
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function switchToHRMModuleView(subPage) {
            resetInactivityTimer();
            collapseAllSidebarModules();
            sessionStorage.setItem('portal_current_view', 'hrm');
            sessionStorage.removeItem('portal_hub_module');
            updateDynamicModuleHeader('HRM Module');
            var loginView = document.getElementById('loginView');
            var hubView = document.getElementById('departmentHubView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var userView = document.getElementById('userModuleView');
            var warehouseView = document.getElementById('warehouseModuleView');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (userView) userView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');
            if (hrmView) hrmView.style.setProperty('display', 'flex', 'important');

            updateNavState('hrm');
            applyViewOnlyStateUI();

            if (window.HRM_ENGINE) {
                window.HRM_ENGINE.switchPage(subPage || 'dashboard');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function openModuleHRMAction(event) {
            if (event) {
                try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
            }
            switchToHRMModuleView();
        }

        /**
         * Switch UI to User & Security Management Module (Profile & Privacy/Security Hub)
         */
        function switchToUserModuleView(defaultTab) {
            resetInactivityTimer();
            collapseAllSidebarModules();
            sessionStorage.setItem('portal_current_view', 'user');
            sessionStorage.removeItem('portal_hub_module');
            updateDynamicModuleHeader('User Module');

            var loginView = document.getElementById('loginView');
            var hubView = document.getElementById('departmentHubView');
            var dashView = document.getElementById('dashboardView');
            var mainView = document.getElementById('mainInterfaceView');
            var moduleView = document.getElementById('moduleSelectionView');
            var hrmView = document.getElementById('hrmModuleView');
            var misView = document.getElementById('misSelectionView');
            var userView = document.getElementById('userModuleView');
            var warehouseView = document.getElementById('warehouseModuleView');

            if (loginView) loginView.style.setProperty('display', 'none', 'important');
            if (hubView) hubView.style.setProperty('display', 'none', 'important');
            if (dashView) dashView.style.setProperty('display', 'none', 'important');
            if (mainView) mainView.style.setProperty('display', 'none', 'important');
            if (moduleView) moduleView.style.setProperty('display', 'none', 'important');
            if (hrmView) hrmView.style.setProperty('display', 'none', 'important');
            if (misView) misView.style.setProperty('display', 'none', 'important');
            if (warehouseView) warehouseView.style.setProperty('display', 'none', 'important');
            if (userView) userView.style.setProperty('display', 'flex', 'important');

            updateNavState('user');
            applyViewOnlyStateUI();
            updateModuleHeaderState();
            loadUserProfileIntoForm();
            switchUserModuleTab(defaultTab || 'profile');

            if (window.location.search && !window.location.search.includes('view=user')) {
                try {
                    window.history.replaceState(null, '', window.location.pathname + '?view=user');
                } catch(e) {}
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function switchUserModuleTab(tabKey) {
            const paneProfile = document.getElementById('paneUserProfileManagement');
            if (paneProfile) paneProfile.style.display = 'block';
        }

        // =========================================================================
        // USER PROFILE & IDENTITY MANAGEMENT (SINGLE SOURCE OF TRUTH)
        // Total Service is dynamically calculated in Years, Months, and Days from Join Date
        // =========================================================================
        function calculateServiceDuration(dateInput) {
            let joinDate = null;
            if (dateInput instanceof Date) {
                joinDate = dateInput;
            } else if (typeof dateInput === 'string' && dateInput.trim()) {
                const s = dateInput.trim();
                const dmmmy = s.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,})[-/ ](\d{4})$/);
                if (dmmmy) {
                    const d = parseInt(dmmmy[1], 10);
                    const mName = dmmmy[2].toLowerCase().substring(0, 3);
                    const y = parseInt(dmmmy[3], 10);
                    const mMap = {
                        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
                        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
                    };
                    if (mMap[mName] !== undefined) {
                        joinDate = new Date(y, mMap[mName], d);
                    }
                } else {
                    const parsed = new Date(s);
                    if (!isNaN(parsed.getTime())) {
                        joinDate = parsed;
                    }
                }
            }

            if (!joinDate || isNaN(joinDate.getTime())) {
                joinDate = new Date(2021, 1, 1); // Default: 01-Feb-2021
            }

            const today = new Date();
            if (joinDate > today) {
                return "0 Years, 0 Months, 0 Days";
            }

            let years = today.getFullYear() - joinDate.getFullYear();
            let months = today.getMonth() - joinDate.getMonth();
            let days = today.getDate() - joinDate.getDate();

            if (days < 0) {
                months -= 1;
                const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
                days += prevMonthDays;
            }

            if (months < 0) {
                years -= 1;
                months += 12;
            }

            const yText = `${years} Year${years !== 1 ? 's' : ''}`;
            const mText = `${months} Month${months !== 1 ? 's' : ''}`;
            const dText = `${days} Day${days !== 1 ? 's' : ''}`;

            return `${yText}, ${mText}, ${dText}`;
        }

        const DEFAULT_USER_PROFILE = {
            name: "Sayful Islam",
            role: "Senior Supervisor",
            idNumber: "10676",
            phone: "01796444132",
            section: "Fan Assemble (ERP)",
            joinDate: "01-Feb-2021",
            totalService: "5 Years, 7 Months, 9 Days",
            photo: "profile.jpg"
        };

        function getUserProfile() {
            try {
                const raw = localStorage.getItem('mep_user_profile');
                if (raw) {
                    const data = JSON.parse(raw);
                    const jDate = data.joinDate || DEFAULT_USER_PROFILE.joinDate;
                    return {
                        name: data.name || DEFAULT_USER_PROFILE.name,
                        role: data.role || DEFAULT_USER_PROFILE.role,
                        idNumber: data.idNumber || DEFAULT_USER_PROFILE.idNumber,
                        phone: data.phone || DEFAULT_USER_PROFILE.phone,
                        section: data.section || DEFAULT_USER_PROFILE.section,
                        joinDate: jDate,
                        totalService: calculateServiceDuration(jDate),
                        photo: data.photo || DEFAULT_USER_PROFILE.photo
                    };
                }
            } catch(e) {}
            return { 
                ...DEFAULT_USER_PROFILE,
                totalService: calculateServiceDuration(DEFAULT_USER_PROFILE.joinDate)
            };
        }

        function saveUserProfile(profile) {
            if (isCurrentUserViewOnly()) {
                showToast("Access Denied: View-Only accounts cannot edit user profile.", "error");
                return false;
            }
            const jDate = (profile.joinDate || '').trim() || DEFAULT_USER_PROFILE.joinDate;
            const cleanProfile = {
                name: (profile.name || '').trim() || DEFAULT_USER_PROFILE.name,
                role: (profile.role || '').trim() || DEFAULT_USER_PROFILE.role,
                idNumber: (profile.idNumber || '').trim() || DEFAULT_USER_PROFILE.idNumber,
                phone: (profile.phone || '').trim() || DEFAULT_USER_PROFILE.phone,
                section: (profile.section || '').trim() || DEFAULT_USER_PROFILE.section,
                joinDate: jDate,
                totalService: calculateServiceDuration(jDate),
                photo: profile.photo || DEFAULT_USER_PROFILE.photo
            };

            try {
                localStorage.setItem('mep_user_profile', JSON.stringify(cleanProfile));
                syncAllProfileNameplates(cleanProfile);

                if (typeof window.logSystemAudit === 'function') {
                    try {
                        window.logSystemAudit({
                            pageName: 'User Module',
                            actionType: 'Profile Synchronized',
                            targetItem: 'Executive Identity',
                            fieldName: 'User Profile Data',
                            previousValue: 'Previous Profile',
                            newValue: 'Updated Profile',
                            description: `Admin profile successfully updated for ${cleanProfile.name} (${cleanProfile.role}).`
                        });
                    } catch(err) {}
                }
                return true;
            } catch(e) {
                console.error("Failed to save profile", e);
                return false;
            }
        }

        function updateServiceDuration(customDate) {
            const prof = getUserProfile();
            const dateStr = (customDate !== undefined && customDate !== null) ? customDate : (document.getElementById('editProfJoinDate') ? document.getElementById('editProfJoinDate').value : prof.joinDate);
            const duration = calculateServiceDuration(dateStr);

            const el = document.getElementById('editProfTotalService');
            if (el) {
                el.value = duration;
            }
            document.querySelectorAll('.dynamic-profile-service, .profileServiceDuration, #profileServiceDuration, #moduleProfileDropdownService, #misProfileDropdownService').forEach(s => {
                s.textContent = duration;
            });
            return duration;
        }

        function syncAllProfileNameplates(customProfile) {
            const isViewOnly = isCurrentUserViewOnly();
            const prof = customProfile || getUserProfile();

            const name = isViewOnly ? "View User" : prof.name;
            const role = isViewOnly ? "Restricted Access" : prof.role;
            const idNum = isViewOnly ? "VIEW-01" : prof.idNumber;
            const phone = isViewOnly ? "N/A" : prof.phone;
            const section = isViewOnly ? "Restricted Access" : prof.section;
            const joinDate = isViewOnly ? "N/A" : prof.joinDate;
            const service = isViewOnly ? "Restricted Access" : calculateServiceDuration(prof.joinDate);
            const photo = isViewOnly ? "sayful_logo.png" : (prof.photo || "profile.jpg");

            // Text nameplates across headers and dropdowns
            document.querySelectorAll('.dynamic-profile-name').forEach(el => el.textContent = name);
            document.querySelectorAll('.dynamic-profile-role').forEach(el => el.textContent = role);
            document.querySelectorAll('.dynamic-profile-id').forEach(el => el.textContent = idNum);
            document.querySelectorAll('.dynamic-profile-phone').forEach(el => el.textContent = phone);
            document.querySelectorAll('.dynamic-profile-section').forEach(el => el.textContent = section);
            document.querySelectorAll('.dynamic-profile-joindate').forEach(el => el.textContent = joinDate);
            document.querySelectorAll('.dynamic-profile-service, .profileServiceDuration, #profileServiceDuration, #moduleProfileDropdownService, #misProfileDropdownService').forEach(el => el.textContent = service);

            // Dynamic photo updates
            document.querySelectorAll('.dynamic-profile-img').forEach(el => {
                el.src = photo;
            });

            // Specific header dropdown elements
            const modName = document.getElementById('moduleProfileName');
            if (modName) modName.textContent = name;
            const modRole = document.getElementById('moduleProfileRole');
            if (modRole) modRole.textContent = role;

            const misName = document.getElementById('misProfileName');
            if (misName) misName.textContent = name;
            const misRole = document.getElementById('misProfileRole');
            if (misRole) misRole.textContent = role;

            const modDropTitle = document.getElementById('moduleProfileDropdownTitle');
            if (modDropTitle) modDropTitle.textContent = name;
            const modDropRole = document.getElementById('moduleProfileDropdownRole');
            if (modDropRole) modDropRole.textContent = role;

            const misDropTitle = document.getElementById('misProfileDropdownTitle');
            if (misDropTitle) misDropTitle.textContent = name;
            const misDropRole = document.getElementById('misProfileDropdownRole');
            if (misDropRole) misDropRole.textContent = role;

            // Report headers
            document.querySelectorAll('.user-brand-card').forEach(card => {
                const n = card.querySelector('.user-brand-name');
                if (n) n.textContent = name;
                const r = card.querySelector('.user-brand-role');
                if (r) r.textContent = role;
                const img = card.querySelector('img');
                if (img) img.src = photo;
            });

            updateServiceDuration();
        }

        function isUserProfileLocked() {
            try {
                const raw = localStorage.getItem('portal_page_lock_states');
                if (raw) {
                    const map = JSON.parse(raw);
                    if (map['user_profile_management'] !== undefined) {
                        return map['user_profile_management'] === true;
                    }
                }
            } catch (e) {}
            return true; // Default locked as per system security policy
        }

        function updateUserProfileLockBanner(locked) {
            const pane = document.getElementById('paneUserProfileManagement');
            if (!pane) return;
            let banner = document.getElementById('userProfileLockedBanner');
            if (locked) {
                if (!banner) {
                    banner = document.createElement('div');
                    banner.id = 'userProfileLockedBanner';
                    banner.className = 'smart-locked-page-banner';
                    banner.style.cssText = 'background:#fff1f2; border:1px solid #fecdd3; border-left:5px solid #e11d48; padding:10px 16px; border-radius:8px; margin-bottom:14px; display:flex; align-items:center; gap:10px; color:#9f1239; font-family:"Times New Roman", serif;';
                    banner.innerHTML = `
                        <span style="font-size:1.3rem;">🔒</span>
                        <div>
                            <strong style="font-size:14px; letter-spacing:0.5px;">PAGE ACCESS LOCKED (READ-ONLY)</strong>
                            <div style="font-size:12px; color:#881337; margin-top:2px;">User Profile & Security Access is in read-only mode. Updating profile information, changing photo, or changing credentials/PIN is prohibited until unlocked from <strong>MIS Module > Option 5</strong>.</div>
                        </div>
                    `;
                    pane.insertBefore(banner, pane.firstChild);
                }
            } else {
                if (banner) banner.remove();
            }
        }

        function loadUserProfileIntoForm() {
            const prof = getUserProfile();
            const isViewOnly = isCurrentUserViewOnly();
            const isPageLocked = isUserProfileLocked();

            const nameInp = document.getElementById('editProfName');
            const roleInp = document.getElementById('editProfRole');
            const idInp = document.getElementById('editProfId');
            const phoneInp = document.getElementById('editProfPhone');
            const sectionInp = document.getElementById('editProfSection');
            const joinDateInp = document.getElementById('editProfJoinDate');
            const totalServiceInp = document.getElementById('editProfTotalService');
            const saveBtn = document.getElementById('btnSaveUserProfile');
            const resetBtn = document.getElementById('btnResetProfDefault');
            const photoBtn = document.getElementById('btnChangeAvatarPhoto');

            if (nameInp) nameInp.value = isViewOnly ? "View User" : prof.name;
            if (roleInp) roleInp.value = isViewOnly ? "Restricted Access" : prof.role;
            if (idInp) idInp.value = isViewOnly ? "VIEW-01" : prof.idNumber;
            if (phoneInp) phoneInp.value = isViewOnly ? "N/A" : prof.phone;
            if (sectionInp) sectionInp.value = isViewOnly ? "Restricted Access" : prof.section;
            if (joinDateInp) joinDateInp.value = isViewOnly ? "N/A" : prof.joinDate;

            // Total service dynamically calculated in Years, Months, and Days
            if (totalServiceInp) {
                totalServiceInp.value = calculateServiceDuration(prof.joinDate);
                totalServiceInp.readOnly = true;
                totalServiceInp.disabled = false;
            }

            const preview = document.getElementById('userProfilePhotoPreview');
            if (preview) preview.src = isViewOnly ? 'sayful_logo.png' : (prof.photo || 'profile.jpg');

            // Banner injection for locked user module
            updateUserProfileLockBanner(isPageLocked);

            if (isViewOnly || isPageLocked) {
                [nameInp, roleInp, idInp, phoneInp, sectionInp, joinDateInp].forEach(inp => {
                    if (inp) {
                        inp.disabled = true;
                        inp.classList.add('user-field-locked');
                    }
                });
                if (saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.style.opacity = '0.5';
                    saveBtn.style.cursor = 'not-allowed';
                    saveBtn.title = isPageLocked ? "Locked (Read-Only) from MIS Option 5" : "View-Only users cannot edit profile";
                }
                if (resetBtn) {
                    resetBtn.disabled = true;
                    resetBtn.style.opacity = '0.5';
                    resetBtn.style.cursor = 'not-allowed';
                    resetBtn.title = isPageLocked ? "Locked (Read-Only) from MIS Option 5" : "View-Only users cannot reset profile";
                }
                if (photoBtn) {
                    photoBtn.style.display = 'none';
                }
            } else {
                [nameInp, roleInp, idInp, phoneInp, sectionInp, joinDateInp].forEach(inp => {
                    if (inp) {
                        inp.disabled = false;
                        inp.classList.remove('user-field-locked');
                    }
                });
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.style.opacity = '1';
                    saveBtn.style.cursor = 'pointer';
                    saveBtn.title = "";
                }
                if (resetBtn) {
                    resetBtn.disabled = false;
                    resetBtn.style.opacity = '1';
                    resetBtn.style.cursor = 'pointer';
                }
                if (photoBtn) {
                    photoBtn.style.display = 'flex';
                }
            }

            // Also lock or unlock the 3 credential buttons in user module
            document.querySelectorAll('.btn-sec-action').forEach(btn => {
                if (isViewOnly || isPageLocked) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                    btn.title = isPageLocked ? "Locked (Read-Only) from MIS Option 5" : "View-Only users cannot change credentials";
                } else {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.title = "";
                }
            });

            syncAllProfileNameplates(prof);
        }

        function saveUserProfileFromForm(event) {
            if (event) event.preventDefault();
            if (isCurrentUserViewOnly()) {
                showToast("Access Denied: View-Only accounts cannot save profile changes.", "error");
                return;
            }
            if (isUserProfileLocked()) {
                showToast("This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.", "error");
                return;
            }

            const current = getUserProfile();
            const nameInp = document.getElementById('editProfName');
            const roleInp = document.getElementById('editProfRole');
            const idInp = document.getElementById('editProfId');
            const phoneInp = document.getElementById('editProfPhone');
            const sectionInp = document.getElementById('editProfSection');
            const joinDateInp = document.getElementById('editProfJoinDate');
            const joinDateVal = joinDateInp ? joinDateInp.value.trim() : current.joinDate;

            const updatedProfile = {
                name: nameInp ? nameInp.value.trim() : current.name,
                role: roleInp ? roleInp.value.trim() : current.role,
                idNumber: idInp ? idInp.value.trim() : current.idNumber,
                phone: phoneInp ? phoneInp.value.trim() : current.phone,
                section: sectionInp ? sectionInp.value.trim() : current.section,
                joinDate: joinDateVal,
                totalService: calculateServiceDuration(joinDateVal),
                photo: current.photo || 'profile.jpg'
            };

            if (saveUserProfile(updatedProfile)) {
                // Subtle inline visual feedback on Save button without popping up obstructive bottom toast
                const saveBtn = document.getElementById('btnSaveUserProfile');
                if (saveBtn) {
                    const originalHtml = saveBtn.innerHTML;
                    saveBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Saved!</span>
                    `;
                    saveBtn.style.backgroundColor = '#16a34a';
                    saveBtn.style.borderColor = '#16a34a';
                    setTimeout(() => {
                        saveBtn.innerHTML = originalHtml;
                        saveBtn.style.backgroundColor = '';
                        saveBtn.style.borderColor = '';
                    }, 1800);
                }
            }
        }

        function resetUserProfileToDefault() {
            if (isCurrentUserViewOnly()) {
                showToast("Access Denied: View-Only accounts cannot reset profile.", "error");
                return;
            }
            if (isUserProfileLocked()) {
                showToast("This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.", "error");
                return;
            }
            if (confirm("Reset profile details back to default values?")) {
                localStorage.removeItem('mep_user_profile');
                loadUserProfileIntoForm();
            }
        }

        function handleProfilePhotoUpload(event) {
            if (isCurrentUserViewOnly()) {
                showToast("Access Denied: View-Only accounts cannot upload photo.", "error");
                return;
            }
            if (isUserProfileLocked()) {
                showToast("This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.", "error");
                return;
            }
            const file = event.target && event.target.files && event.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large! Please choose an image under 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;
                const current = getUserProfile();
                current.photo = base64;
                saveUserProfile(current);
                const preview = document.getElementById('userProfilePhotoPreview');
                if (preview) preview.src = base64;
            };
            reader.readAsDataURL(file);
        }

        // =========================================================================
        // PRIVACY & SECURITY HUB: CREDENTIAL MANAGEMENT MODAL CONTROLLER
        // Passwords & PIN change with masked inputs, eye toggle, and immediate revocation
        // =========================================================================

        function syncSecurityStatusDisplays() {
            // Future credential extension hook
        }

        function openChangeCredentialModal(credType) {
            if (isCurrentUserViewOnly()) {
                showToast("Access Denied: View-Only accounts cannot modify system credentials.", "error");
                return;
            }
            if (isUserProfileLocked()) {
                showToast("This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.", "error");
                return;
            }

            const modal = document.getElementById('changeCredentialModal');
            if (!modal) return;

            const typeInput = document.getElementById('credModalType');
            const titleEl = document.getElementById('credModalTitle');
            const subEl = document.getElementById('credModalSubtitle');
            const iconEl = document.getElementById('credModalIconBadge');
            const curLabel = document.getElementById('credCurrentLabel');
            const newLabel = document.getElementById('credNewLabel');
            const confirmLabel = document.getElementById('credConfirmLabel');
            const alertBox = document.getElementById('credModalAlert');

            const curVal = document.getElementById('credCurrentValue');
            const newVal = document.getElementById('credNewValue');
            const confirmVal = document.getElementById('credConfirmValue');

            if (typeInput) typeInput.value = credType;
            if (alertBox) {
                alertBox.style.display = 'none';
                alertBox.textContent = '';
            }

            [curVal, newVal, confirmVal].forEach(inp => {
                if (inp) {
                    inp.value = '';
                    inp.type = 'password';
                }
            });

            document.querySelectorAll('.cred-eye-toggle').forEach(btn => {
                btn.textContent = '👁️';
            });

            if (credType === 'admin') {
                if (titleEl) titleEl.textContent = 'Change Admin Master Password';
                if (subEl) subEl.textContent = 'Enter current Admin password and specify a new secure Admin password';
                if (iconEl) iconEl.textContent = '🛡️';
                if (curLabel) curLabel.textContent = 'Current Admin Password *';
                if (newLabel) newLabel.textContent = 'New Admin Password *';
                if (confirmLabel) confirmLabel.textContent = 'Confirm New Admin Password *';
                if (newVal) newVal.removeAttribute('maxlength');
                if (confirmVal) confirmVal.removeAttribute('maxlength');
            } else if (credType === 'view') {
                if (titleEl) titleEl.textContent = 'Change View User Password';
                if (subEl) subEl.textContent = 'Enter current View password or Admin password to authorize change';
                if (iconEl) iconEl.textContent = '🔑';
                if (curLabel) curLabel.textContent = 'Current Password (View or Admin) *';
                if (newLabel) newLabel.textContent = 'New View User Password *';
                if (confirmLabel) confirmLabel.textContent = 'Confirm New View Password *';
                if (newVal) newVal.removeAttribute('maxlength');
                if (confirmVal) confirmVal.removeAttribute('maxlength');
            } else if (credType === 'mis_pin') {
                if (titleEl) titleEl.textContent = 'Change MIS Module Security PIN';
                if (subEl) subEl.textContent = 'Specify a new 5-digit numeric PIN for the MIS Module access gate';
                if (iconEl) iconEl.textContent = '🔢';
                if (curLabel) curLabel.textContent = 'Current MIS PIN (or Admin Password) *';
                if (newLabel) newLabel.textContent = 'New 5-Digit PIN (Digits Only) *';
                if (confirmLabel) confirmLabel.textContent = 'Confirm New 5-Digit PIN *';
                if (newVal) newVal.setAttribute('maxlength', '5');
                if (confirmVal) confirmVal.setAttribute('maxlength', '5');
            }

            modal.style.display = 'flex';
            setTimeout(() => {
                if (curVal) curVal.focus();
            }, 80);
        }

        function closeChangeCredentialModal() {
            const modal = document.getElementById('changeCredentialModal');
            if (modal) modal.style.display = 'none';
        }

        function toggleCredentialInputVisibility(inputId, btnEl) {
            const input = document.getElementById(inputId);
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                if (btnEl) btnEl.textContent = '🔒';
            } else {
                input.type = 'password';
                if (btnEl) btnEl.textContent = '👁️';
            }
        }

        function confirmAndSaveCredential() {
            if (isCurrentUserViewOnly()) {
                showToast("Access Denied: View-Only accounts cannot modify system credentials.", "error");
                return;
            }
            if (isUserProfileLocked()) {
                showToast("This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.", "error");
                return;
            }

            const type = (document.getElementById('credModalType')?.value || 'admin');
            const curVal = (document.getElementById('credCurrentValue')?.value || '').trim();
            const newVal = (document.getElementById('credNewValue')?.value || '').trim();
            const confirmVal = (document.getElementById('credConfirmValue')?.value || '').trim();
            const alertBox = document.getElementById('credModalAlert');

            function showError(msg) {
                if (alertBox) {
                    alertBox.textContent = msg;
                    alertBox.style.display = 'block';
                }
            }

            const activeAdminPass = getAdminPassword();
            const activeViewPass = getViewPassword();
            const activeMISPin = getMISSecurityPin();

            if (type === 'admin') {
                if (curVal !== activeAdminPass) {
                    showError("Incorrect current Admin password!");
                    return;
                }
            } else if (type === 'view') {
                if (curVal !== activeViewPass && curVal !== activeAdminPass) {
                    showError("Incorrect current password! Enter current View password or Admin password.");
                    return;
                }
            } else if (type === 'mis_pin') {
                if (curVal !== activeMISPin && curVal !== activeAdminPass) {
                    showError("Incorrect current PIN! Enter current 5-digit PIN or Admin password.");
                    return;
                }
            }

            if (!newVal) {
                showError("New credential cannot be empty!");
                return;
            }
            if (newVal.length < 3) {
                showError("New credential must be at least 3 characters long!");
                return;
            }
            if (newVal !== confirmVal) {
                showError("New credential and confirmation do not match!");
                return;
            }

            if (type === 'mis_pin') {
                if (!/^\d{5}$/.test(newVal)) {
                    showError("MIS Security PIN must consist of exactly 5 numeric digits (0-9)!");
                    return;
                }
            }

            if (newVal === curVal) {
                showError("New credential cannot be identical to the current one!");
                return;
            }

            const typeLabel = type === 'admin' ? 'Admin Master Password' : (type === 'view' ? 'View User Password' : 'MIS Module Security PIN');

            if (!confirm(`Are you sure you want to update the ${typeLabel}? The old credential will stop functioning immediately.`)) {
                return;
            }

            if (type === 'admin') {
                setAdminPassword(newVal);
            } else if (type === 'view') {
                setViewPassword(newVal);
            } else if (type === 'mis_pin') {
                setMISSecurityPin(newVal);
                sessionStorage.removeItem('mis_pin_verified');
            }

            if (typeof window.logSystemAudit === 'function') {
                try {
                    window.logSystemAudit({
                        pageName: 'Privacy and Security Hub',
                        actionType: 'Credential Modified',
                        targetItem: typeLabel,
                        fieldName: 'Access Credential',
                        previousValue: '••••••••',
                        newValue: '••••••••',
                        description: `${typeLabel} updated and synchronized. Previous credential revoked immediately.`
                    });
                } catch(e) {}
            }

            closeChangeCredentialModal();
            showToast(`✓ ${typeLabel} successfully updated! Old credential has been revoked.`);
        }

        function toggleModuleProfileDropdown(event) {
            if (event) {
                try { event.stopPropagation(); } catch(e) {}
            }
            if (typeof resetInactivityTimer === 'function') resetInactivityTimer();
            if (typeof updateServiceDuration === 'function') updateServiceDuration();

            const menu = document.getElementById('moduleProfileDropdownMenu');
            const btn = document.getElementById('moduleUserProfileBtn');
            if (!menu) return;

            const isShown = menu.classList.contains('show');
            if (typeof closeProfileDropdown === 'function') {
                closeProfileDropdown();
            } else {
                document.querySelectorAll('.profile-dropdown-menu').forEach(function(m) {
                    m.classList.remove('show');
                });
            }

            if (!isShown) {
                menu.classList.add('show');
                if (btn) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-expanded', 'true');
                }
            }
        }

        function closeModuleProfileDropdown(event) {
            if (event) {
                try { event.stopPropagation(); } catch(e) {}
            }
            const menu = document.getElementById('moduleProfileDropdownMenu');
            const btn = document.getElementById('moduleUserProfileBtn');
            if (menu) menu.classList.remove('show');
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        }

        function openModuleUserAction(event) {
            if (event) {
                try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
            }
            switchToUserModuleView('profile');
        }

        // =========================================================================
        // MIS MODULE — 5-Digit Enterprise Security PIN Verification Controller
        // Auto-verifying on 5th digit against dynamic central credential store
        // =========================================================================

        function isMISPinVerified() {
            return sessionStorage.getItem('mis_pin_verified') === 'true';
        }

        function openMISPinSecurityModal() {
            const modal = document.getElementById('misPinSecurityModal');
            if (!modal) return;
            modal.style.display = 'flex';
            clearMISPinInputs();
            resetMISPinStatus();
            setTimeout(function() {
                const first = document.getElementById('misPin0');
                if (first) {
                    first.focus();
                    first.select();
                }
            }, 60);
        }

        function closeMISPinSecurityModal() {
            const modal = document.getElementById('misPinSecurityModal');
            if (modal) {
                modal.style.display = 'none';
            }
            clearMISPinInputs();
            resetMISPinStatus();
        }

        function clearMISPinInputs() {
            for (let i = 0; i < 5; i++) {
                const inp = document.getElementById('misPin' + i);
                if (inp) {
                    inp.value = '';
                    inp.disabled = false;
                    inp.classList.remove('is-filled', 'is-error', 'is-success');
                }
            }
            const container = document.getElementById('misPinInputsContainer');
            if (container) {
                container.classList.remove('error-shake');
            }
        }

        function resetMISPinStatus() {
            const msg = document.getElementById('misPinStatusMsg');
            if (msg) {
                msg.textContent = '';
                msg.className = 'mis-pin-status-msg';
            }
        }

        function checkMISPinComplete() {
            let pin = '';
            for (let i = 0; i < 5; i++) {
                const inp = document.getElementById('misPin' + i);
                if (!inp || !inp.value) return false;
                pin += inp.value;
            }

            if (pin.length === 5) {
                verifyMISPin(pin);
                return true;
            }
            return false;
        }

        function verifyMISPin(pin) {
            const container = document.getElementById('misPinInputsContainer');
            const statusMsg = document.getElementById('misPinStatusMsg');
            const inputs = document.querySelectorAll('.mis-pin-digit');
            const currentPin = getMISSecurityPin();

            if (pin === currentPin) {
                // Correct PIN
                inputs.forEach(function(inp) {
                    inp.classList.remove('is-error');
                    inp.classList.add('is-success');
                    inp.disabled = true;
                });

                if (statusMsg) {
                    statusMsg.textContent = '✓ Access Authorized — Unlocking MIS Module...';
                    statusMsg.className = 'mis-pin-status-msg is-success';
                }

                sessionStorage.setItem('mis_pin_verified', 'true');

                if (typeof window.logSystemAudit === 'function') {
                    try {
                        window.logSystemAudit({
                            pageName: 'MIS Module Selection Screen',
                            actionType: 'Security Gate Passed',
                            targetItem: 'MIS Module Access Gate',
                            fieldName: '5-Digit Security PIN',
                            previousValue: 'Protected Gate',
                            newValue: 'Access Granted',
                            description: '5-Digit Security PIN (•••••) successfully verified. MIS Interface unlocked.'
                        });
                    } catch(err) {}
                }

                setTimeout(function() {
                    closeMISPinSecurityModal();
                    switchToMISSelectionView();
                }, 260);

            } else {
                // Incorrect PIN
                inputs.forEach(function(inp) {
                    inp.classList.remove('is-success');
                    inp.classList.add('is-error');
                });

                if (container) {
                    container.classList.remove('error-shake');
                    void container.offsetWidth;
                    container.classList.add('error-shake');
                }

                if (statusMsg) {
                    statusMsg.textContent = '✕ Incorrect Security PIN. Please try again.';
                    statusMsg.className = 'mis-pin-status-msg is-error';
                }

                setTimeout(function() {
                    clearMISPinInputs();
                    const first = document.getElementById('misPin0');
                    if (first) {
                        first.focus();
                    }
                }, 450);
            }
        }

        function setupMISPinListeners() {
            const inputs = document.querySelectorAll('.mis-pin-digit');
            if (!inputs.length) return;

            inputs.forEach(function(input) {
                const index = parseInt(input.dataset.index, 10);

                input.addEventListener('input', function(e) {
                    const raw = this.value;
                    const digit = raw.replace(/\D/g, '').slice(-1);
                    this.value = digit;

                    if (digit) {
                        this.classList.add('is-filled');
                        if (index < 4) {
                            const next = document.getElementById('misPin' + (index + 1));
                            if (next) {
                                next.focus();
                                next.select();
                            }
                        }
                    } else {
                        this.classList.remove('is-filled');
                    }

                    checkMISPinComplete();
                });

                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace') {
                        if (!this.value && index > 0) {
                            e.preventDefault();
                            const prev = document.getElementById('misPin' + (index - 1));
                            if (prev) {
                                prev.value = '';
                                prev.classList.remove('is-filled', 'is-error', 'is-success');
                                prev.focus();
                            }
                        } else if (this.value) {
                            this.value = '';
                            this.classList.remove('is-filled');
                            e.preventDefault();
                        }
                    } else if (e.key === 'ArrowLeft' && index > 0) {
                        const prev = document.getElementById('misPin' + (index - 1));
                        if (prev) prev.focus();
                    } else if (e.key === 'ArrowRight' && index < 4) {
                        const next = document.getElementById('misPin' + (index + 1));
                        if (next) next.focus();
                    } else if (e.key === 'Escape') {
                        closeMISPinSecurityModal();
                    }
                });

                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const clipboardData = e.clipboardData || window.clipboardData;
                    if (!clipboardData) return;
                    const pastedText = clipboardData.getData('text') || '';
                    const digits = pastedText.replace(/\D/g, '').slice(0, 5);
                    if (!digits) return;

                    clearMISPinInputs();
                    for (let i = 0; i < digits.length; i++) {
                        const inp = document.getElementById('misPin' + i);
                        if (inp) {
                            inp.value = digits[i];
                            inp.classList.add('is-filled');
                        }
                    }

                    if (digits.length < 5) {
                        const next = document.getElementById('misPin' + digits.length);
                        if (next) next.focus();
                    } else {
                        checkMISPinComplete();
                    }
                });
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupMISPinListeners);
        } else {
            setupMISPinListeners();
        }

        function openModuleMISAction(event) {
            if (event) {
                try { event.preventDefault(); event.stopPropagation(); } catch(e) {}
            }
            if (isMISPinVerified()) {
                switchToMISSelectionView();
            } else {
                openMISPinSecurityModal();
            }
        }

        function toggleMISProfileDropdown(event) {
            if (event) {
                try { event.stopPropagation(); } catch(e) {}
            }
            const menu = document.getElementById('misProfileDropdownMenu');
            const btn = document.getElementById('misUserProfileBtn');
            if (!menu || !btn) return;
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !isExpanded);
            btn.classList.toggle('active', !isExpanded);
            menu.classList.toggle('show', !isExpanded);
        }

        function closeMISProfileDropdown(event) {
            if (event) {
                try { event.stopPropagation(); } catch(e) {}
            }
            const menu = document.getElementById('misProfileDropdownMenu');
            const btn = document.getElementById('misUserProfileBtn');
            if (menu) menu.classList.remove('show');
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        }

        function updateModuleHeaderState() {
            const role = (sessionStorage.getItem('portal_auth_role') || 'ADMIN').toUpperCase();
            const isViewOnly = isCurrentUserViewOnly();
            const nameEl = document.getElementById('moduleProfileName');
            const roleEl = document.getElementById('moduleProfileRole');
            const dropTitle = document.getElementById('moduleProfileDropdownTitle');
            const dropRole = document.getElementById('moduleProfileDropdownRole');
            const dropId = document.getElementById('moduleProfileDropdownId');

            const misNameEl = document.getElementById('misProfileName');
            const misRoleEl = document.getElementById('misProfileRole');
            const misDropTitle = document.getElementById('misProfileDropdownTitle');
            const misDropRole = document.getElementById('misProfileDropdownRole');
            const misDropId = document.getElementById('misProfileDropdownId');

            if (isViewOnly || role === 'VIEW') {
                if (nameEl) nameEl.textContent = "View User";
                if (roleEl) roleEl.textContent = "Restricted Access";
                if (dropTitle) dropTitle.textContent = "View User";
                if (dropRole) dropRole.textContent = "Restricted Access";
                if (dropId) dropId.textContent = "VIEW-01";

                if (misNameEl) misNameEl.textContent = "View User";
                if (misRoleEl) misRoleEl.textContent = "Restricted Access";
                if (misDropTitle) misDropTitle.textContent = "View User";
                if (misDropRole) misDropRole.textContent = "Restricted Access";
                if (misDropId) misDropId.textContent = "VIEW-01";
            } else {
                if (nameEl) nameEl.textContent = "Sayful Islam";
                if (roleEl) roleEl.textContent = "Senior Supervisor";
                if (dropTitle) dropTitle.textContent = "Sayful Islam";
                if (dropRole) dropRole.textContent = "Senior Supervisor";
                if (dropId) dropId.textContent = "10676";

                if (misNameEl) misNameEl.textContent = "Sayful Islam";
                if (misRoleEl) misRoleEl.textContent = "Senior Supervisor";
                if (misDropTitle) misDropTitle.textContent = "Sayful Islam";
                if (misDropRole) misDropRole.textContent = "Senior Supervisor";
                if (misDropId) misDropId.textContent = "10676";
            }
        }

        function initNotificationState() {
            const isRead = localStorage.getItem('mep_notif_read_v1') === 'true';
            document.querySelectorAll('.notif-badge-dot').forEach(el => {
                el.style.display = isRead ? 'none' : 'block';
            });
        }

        function toggleNotificationPanel() {
            const panel = document.getElementById('notificationPanel');
            if (!panel) return;
            const isActive = panel.classList.contains('active');
            if (isActive) {
                panel.classList.remove('active');
            } else {
                panel.classList.add('active');
                localStorage.setItem('mep_notif_read_v1', 'true');
                document.querySelectorAll('.notif-badge-dot').forEach(el => {
                    el.style.display = 'none';
                });
            }
        }

        function closeNotificationPanel() {
            const panel = document.getElementById('notificationPanel');
            if (panel) panel.classList.remove('active');
        }

        /**
         * Toggle Password Visibility (Show / Hide)
         */
        function togglePasswordVisibility() {
            const pwdInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eyeIcon');
            const eyeOffIcon = document.getElementById('eyeOffIcon');

            if (!pwdInput) return;
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                if (eyeIcon) eyeIcon.style.display = 'none';
                if (eyeOffIcon) eyeOffIcon.style.display = 'block';
            } else {
                pwdInput.type = 'password';
                if (eyeIcon) eyeIcon.style.display = 'block';
                if (eyeOffIcon) eyeOffIcon.style.display = 'none';
            }
        }

        /**
         * Toggle Username / Role Dropdown Menu
         */
        function toggleRoleDropdown(forceClose = false) {
            const menu = document.getElementById('roleDropdownMenu');
            const btn = document.getElementById('roleSelectorBtn');
            if (!menu || !btn) return;

            const isOpen = forceClose ? false : !menu.classList.contains('show');
            if (isOpen) {
                menu.classList.add('show');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                menu.classList.remove('show');
                btn.setAttribute('aria-expanded', 'false');
            }
        }

        // Close dropdown when user clicks outside
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('userRoleDropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                toggleRoleDropdown(true);
            }
        });

        /**
         * Select User Role (ADMIN vs View)
         */
        function selectRole(role) {
            const usernameInput = document.getElementById('username');
            const roleNameEl = document.getElementById('activeRoleName');
            const roleTagEl = document.getElementById('activeRoleTag');
            const roleIconBox = document.getElementById('activeRoleIcon');
            const itemAdmin = document.getElementById('roleItemAdmin');
            const itemView = document.getElementById('roleItemView');
            const checkAdmin = document.getElementById('checkAdmin');
            const checkView = document.getElementById('checkView');
            const pwdRoleHint = document.getElementById('pwdRoleHint');
            const pwdInput = document.getElementById('password');

            if (usernameInput) usernameInput.value = role;

            if (role === 'View') {
                if (roleNameEl) roleNameEl.textContent = 'View';
                if (roleTagEl) roleTagEl.textContent = 'Visitor / View Only (Read-Only Portal)';
                if (roleIconBox) {
                    roleIconBox.className = 'role-icon-box view-mode';
                    roleIconBox.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
                }
                if (itemAdmin) itemAdmin.classList.remove('active');
                if (itemView) itemView.classList.add('active');
                if (checkAdmin) checkAdmin.style.display = 'none';
                if (checkView) checkView.style.display = 'inline';
                if (pwdRoleHint) pwdRoleHint.textContent = 'View PIN';
            } else {
                // ADMIN
                if (roleNameEl) roleNameEl.textContent = 'ADMIN';
                if (roleTagEl) roleTagEl.textContent = 'System Administrator (Full Edit Access)';
                if (roleIconBox) {
                    roleIconBox.className = 'role-icon-box';
                    roleIconBox.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
                }
                if (itemAdmin) itemAdmin.classList.add('active');
                if (itemView) itemView.classList.remove('active');
                if (checkAdmin) checkAdmin.style.display = 'inline';
                if (checkView) checkView.style.display = 'none';
                if (pwdRoleHint) pwdRoleHint.textContent = 'Admin PIN';
            }

            toggleRoleDropdown(true);

            // Clear password and focus
            if (pwdInput) {
                pwdInput.value = '';
                pwdInput.classList.remove('input-error');
                setTimeout(() => pwdInput.focus(), 80);
            }

            const errorBox = document.getElementById('loginError');
            if (errorBox) errorBox.classList.remove('show');
        }

        /**
         * Handle Login Submission
         */
        function handleLogin(event) {
            if (event) event.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const errorBox = document.getElementById('loginError');
            const errorMsg = document.getElementById('loginErrorMsg');
            const loginCard = document.querySelector('.auth-split-card') || document.getElementById('loginView');

            const selectedRole = usernameInput ? usernameInput.value.trim() : 'ADMIN';
            const enteredPass = passwordInput ? passwordInput.value.trim() : '';

            // Password strictly required: no empty logins permitted
            if (!enteredPass) {
                if (errorBox) errorBox.classList.add('show');
                if (errorMsg) errorMsg.textContent = 'Please enter password to login!';
                if (passwordInput) {
                    passwordInput.classList.add('input-error');
                    passwordInput.focus();
                }
                if (loginCard) {
                    loginCard.classList.remove('shake-effect');
                    void loginCard.offsetWidth;
                    loginCard.classList.add('shake-effect');
                }
                return;
            }

            let isValid = false;
            let isViewOnly = false;

            const currentAdminPass = AUTH_CONFIG.adminPassword;
            const currentViewPass = AUTH_CONFIG.viewPassword;

            if (selectedRole === 'ADMIN') {
                if (enteredPass === currentAdminPass) {
                    isValid = true;
                    isViewOnly = false;
                }
            } else if (selectedRole === 'View') {
                if (enteredPass === currentViewPass) {
                    isValid = true;
                    isViewOnly = true;
                }
            } else {
                // Fallback username check
                if (enteredPass === currentAdminPass) {
                    isValid = true;
                    isViewOnly = false;
                } else if (enteredPass === currentViewPass) {
                    isValid = true;
                    isViewOnly = true;
                }
            }

            if (isValid) {
                const role = isViewOnly ? 'VIEW' : 'ADMIN';
                const sessionSig = btoa(role + ':::MEP_SECURE_PORTAL_2026');
                // Active session lives strictly in sessionStorage for true session lifecycle
                sessionStorage.setItem(STORAGE_KEYS.isAuthenticated, "true");
                sessionStorage.setItem('portal_auth_role', role);
                sessionStorage.setItem('portal_view_only', isViewOnly ? "true" : "false");
                sessionStorage.setItem('portal_auth_sig', sessionSig);
                sessionStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());

                // Remove any old permanent flags from localStorage to avoid persistent bypass
                localStorage.removeItem(STORAGE_KEYS.isAuthenticated);
                localStorage.removeItem('portal_auth_role');
                localStorage.removeItem('portal_view_only');
                localStorage.removeItem('portal_auth_sig');

                if (errorBox) errorBox.classList.remove('show');
                if (passwordInput) {
                    passwordInput.classList.remove('input-error');
                    passwordInput.value = '';
                }

                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('view') === 'main' || urlParams.get('view') === 'production') {
                    switchToMainInterfaceView();
                } else if (urlParams.get('view') === 'hub') {
                    switchToDepartmentHub();
                } else if (urlParams.get('view') === 'dashboard') {
                    switchToDashboardView();
                } else {
                    // NEW FLOW: Successful login routes to the 5-Module Department Selection Screen!
                    switchToModuleSelectionView();
                }
                applyViewOnlyStateUI();
            } else {
                // Invalid credentials
                if (errorBox) errorBox.classList.add('show');
                if (errorMsg) {
                    errorMsg.textContent = selectedRole === 'ADMIN' 
                        ? 'Invalid ADMIN Password! Please try again.' 
                        : 'Invalid View Password! Please try again.';
                }
                if (passwordInput) {
                    passwordInput.classList.add('input-error');
                    passwordInput.value = '';
                    passwordInput.focus();
                }

                if (loginCard) {
                    loginCard.classList.remove('shake-effect');
                    void loginCard.offsetWidth;
                    loginCard.classList.add('shake-effect');
                }
            }
        }

        /**
         * Handle View-Only Access (Visitor / Guest Mode)
         */
        function handleViewOnlyAccess() {
            selectRole('View');
            const pwdInput = document.getElementById('password');
            if (pwdInput) pwdInput.focus();
        }

        function isCurrentUserViewOnly() {
            try {
                const sig = sessionStorage.getItem('portal_auth_sig') || '';
                if (sig === btoa('VIEW:::MEP_SECURE_PORTAL_2026')) return true;
                if (sig === btoa('ADMIN:::MEP_SECURE_PORTAL_2026')) return false;
                const isView = (sessionStorage.getItem('portal_view_only') === 'true');
                const role = (sessionStorage.getItem('portal_auth_role') || '').toUpperCase();
                const localRole = (localStorage.getItem('portal_auth_role') || '').toUpperCase();
                return isView || role === 'VIEW' || localRole === 'VIEW';
            } catch(e) {
                return false;
            }
        }

        function applyViewOnlyStateUI() {
            const isViewOnly = isCurrentUserViewOnly();
            document.querySelectorAll('.smart-view-only-badge').forEach(el => {
                el.style.setProperty('display', isViewOnly ? 'inline-flex' : 'none', 'important');
            });
            if (isViewOnly) {
                document.body.classList.add('portal-view-only');
                document.documentElement.classList.add('portal-view-only');
                const rawPerms = localStorage.getItem('portal_view_page_permissions');
                if (rawPerms) {
                    try {
                        const perms = JSON.parse(rawPerms);
                        document.querySelectorAll('a[href]').forEach(a => {
                            const href = a.getAttribute('href') || '';
                            const file = href.split('/').pop().split('?')[0].toLowerCase();
                            if (file.endsWith('.html') && perms[file] === false) {
                                a.style.display = 'none';
                            }
                        });
                        document.querySelectorAll('.dept-card-btn, .quick-card-btn, .portal-nav-card').forEach(card => {
                            const link = (card.getAttribute('onclick') || '').toLowerCase();
                            ALL_PORTAL_PAGES.forEach(p => {
                                if (perms[p.file] === false && link.includes(p.file.toLowerCase())) {
                                    card.style.display = 'none';
                                }
                            });
                        });
                        document.querySelectorAll('.sub-report-item').forEach(item => {
                            const onclickStr = (item.getAttribute('onclick') || '').toLowerCase();
                            const hrefStr = (item.getAttribute('href') || '').toLowerCase();
                            ALL_PORTAL_PAGES.forEach(p => {
                                const target = p.file.toLowerCase();
                                if (perms[p.file] === false && (onclickStr.includes(target) || hrefStr.includes(target))) {
                                    item.style.display = 'none';
                                }
                            });
                        });
                    } catch(e) {}
                }
            } else {
                document.body.classList.remove('portal-view-only');
                document.documentElement.classList.remove('portal-view-only');
                document.querySelectorAll('a[href], .dept-card-btn, .quick-card-btn, .portal-nav-card, .sub-report-item').forEach(a => {
                    a.style.display = '';
                });
            }
        }

        /**
         * Terminate Active Session
         */
        function handleLogout() {
            collapseAllSidebarModules();
            sessionStorage.removeItem(STORAGE_KEYS.isAuthenticated);
            sessionStorage.removeItem(STORAGE_KEYS.lastActivity);
            sessionStorage.removeItem('portal_view_only');
            sessionStorage.removeItem('portal_auth_role');
            sessionStorage.removeItem('portal_auth_sig');
            sessionStorage.removeItem('portal_current_view');
            sessionStorage.removeItem('portal_hub_module');
            sessionStorage.removeItem('mis_pin_verified');

            localStorage.removeItem(STORAGE_KEYS.isAuthenticated);
            localStorage.removeItem(STORAGE_KEYS.lastActivity);
            localStorage.removeItem('portal_view_only');
            localStorage.removeItem('portal_auth_role');
            localStorage.removeItem('portal_auth_sig');
            localStorage.removeItem('portal_current_view');
            localStorage.removeItem('portal_hub_module');
            localStorage.removeItem('mis_pin_verified');

            // Broadcast logout event across all open tabs immediately
            localStorage.setItem('portal_logout_broadcast', Date.now().toString());

            // Ensure any active notification toast is completely hidden
            const toast = document.getElementById('notification-toast');
            if (toast) toast.classList.remove('show');

            showLoginView();
        }

        /**
         * Reset user inactivity timer on activity
         */
        function resetInactivityTimer() {
            if (sessionStorage.getItem(STORAGE_KEYS.isAuthenticated) === "true") {
                sessionStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());
            }
        }

        /**
         * Show bottom notification toast message
         */
        function showToast(message) {
            const toast = document.getElementById('notification-toast');
            const toastMsg = document.getElementById('toast-message');
            if (!toast || !toastMsg) return;

            toastMsg.innerText = message;
            toast.classList.add('show');

            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        }

        // =========================================================================
        // Anti-Tamper DevTools Security Guard:
        // Automatically prevents unhiding internal views if not authenticated
        // =========================================================================
        function setupAntiTamperGuard() {
            var targets = ['mainInterfaceView', 'departmentHubView', 'dashboardView'];
            var observer = new MutationObserver(function() {
                var isAuth = (sessionStorage.getItem(STORAGE_KEYS.isAuthenticated) === "true");
                if (!isAuth) {
                    targets.forEach(function(id) {
                        var el = document.getElementById(id);
                        if (el && el.style.display !== 'none') {
                            el.style.setProperty('display', 'none', 'important');
                        }
                    });
                    var login = document.getElementById('loginView');
                    if (login && login.style.display === 'none') {
                        login.style.setProperty('display', 'flex', 'important');
                    }
                }

                // MIS Module Route Guard: Prevent unhiding misSelectionView without PIN verification
                var misEl = document.getElementById('misSelectionView');
                if (misEl && misEl.style.display !== 'none' && !isMISPinVerified()) {
                    misEl.style.setProperty('display', 'none', 'important');
                    if (isAuth && typeof openMISPinSecurityModal === 'function') {
                        openMISPinSecurityModal();
                    }
                }
            });

            targets.forEach(function(id) {
                var el = document.getElementById(id);
                if (el) {
                    observer.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
                }
            });
            var login = document.getElementById('loginView');
            if (login) {
                observer.observe(login, { attributes: true, attributeFilter: ['style', 'class'] });
            }
            var misView = document.getElementById('misSelectionView');
            if (misView) {
                observer.observe(misView, { attributes: true, attributeFilter: ['style', 'class'] });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupAntiTamperGuard);
        } else {
            setupAntiTamperGuard();
        }

// Expose globally for portal and hubs
window.AUTH_CONFIG = AUTH_CONFIG;
window.STORAGE_KEYS = STORAGE_KEYS;
window.isPageReload = isPageReload;
window.browseAllReportsAction = browseAllReportsAction;
window.REPORT_TITLE_TO_FILE_MAP = REPORT_TITLE_TO_FILE_MAP;
window.navigateToReportPage = navigateToReportPage;
window.handleSubReportClick = handleSubReportClick;
window.openMasterPage = openMasterPage;
window.initSession = initSession;
window.showDashboardView = showDashboardView;
window.showLoginView = showLoginView;
window.updateNavState = updateNavState;
window.switchToMainInterfaceView = switchToMainInterfaceView;
window.switchToDashboardView = switchToDashboardView;
window.switchToDepartmentHub = switchToDepartmentHub;
window.initNotificationState = initNotificationState;
window.toggleNotificationPanel = toggleNotificationPanel;
window.closeNotificationPanel = closeNotificationPanel;
window.togglePasswordVisibility = togglePasswordVisibility;
window.toggleRoleDropdown = toggleRoleDropdown;
window.selectRole = selectRole;
window.handleLogin = handleLogin;
window.handleViewOnlyAccess = handleViewOnlyAccess;
window.isCurrentUserViewOnly = isCurrentUserViewOnly;
window.applyViewOnlyStateUI = applyViewOnlyStateUI;
window.handleLogout = handleLogout;
window.resetInactivityTimer = resetInactivityTimer;
window.showToast = showToast;
window.collapseAllSidebarModules = collapseAllSidebarModules;
window.switchToModuleSelectionView = switchToModuleSelectionView;
window.switchToProductionModule = switchToProductionModule;
window.openModuleWarehouseAction = openModuleWarehouseAction;
window.switchToWarehouseModuleView = switchToWarehouseModuleView;
window.openModuleHRMAction = openModuleHRMAction;
window.switchToHRMModuleView = switchToHRMModuleView;
window.toggleModuleProfileDropdown = toggleModuleProfileDropdown;
window.closeModuleProfileDropdown = closeModuleProfileDropdown;
window.openModuleNotice = openModuleNotice;
window.openModuleUserAction = openModuleUserAction;
window.openModuleMISAction = openModuleMISAction;
window.switchToMISSelectionView = switchToMISSelectionView;
window.toggleMISProfileDropdown = toggleMISProfileDropdown;
window.closeMISProfileDropdown = closeMISProfileDropdown;
window.updateModuleHeaderState = updateModuleHeaderState;
window.getMISSecurityPin = getMISSecurityPin;
window.setMISSecurityPin = setMISSecurityPin;
window.getAdminPassword = getAdminPassword;
window.setAdminPassword = setAdminPassword;
window.getViewPassword = getViewPassword;
window.setViewPassword = setViewPassword;
window.AUTH_CONFIG = AUTH_CONFIG;
Object.defineProperty(window, 'MIS_SECURITY_PIN', {
    get: function() { return getMISSecurityPin(); },
    configurable: true
});
window.isMISPinVerified = isMISPinVerified;
window.openMISPinSecurityModal = openMISPinSecurityModal;
window.closeMISPinSecurityModal = closeMISPinSecurityModal;
window.verifyMISPin = verifyMISPin;
window.clearMISPinInputs = clearMISPinInputs;

// User Module & Privacy/Security Hub Exports
window.switchToUserModuleView = switchToUserModuleView;
window.switchUserModuleTab = switchUserModuleTab;
window.getUserProfile = getUserProfile;
window.saveUserProfile = saveUserProfile;
window.loadUserProfileIntoForm = loadUserProfileIntoForm;
window.saveUserProfileFromForm = saveUserProfileFromForm;
window.resetUserProfileToDefault = resetUserProfileToDefault;
window.handleProfilePhotoUpload = handleProfilePhotoUpload;
window.syncAllProfileNameplates = syncAllProfileNameplates;
window.updateServiceDuration = updateServiceDuration;
window.calculateServiceDuration = calculateServiceDuration;
window.openChangeCredentialModal = openChangeCredentialModal;
window.closeChangeCredentialModal = closeChangeCredentialModal;
window.toggleCredentialInputVisibility = toggleCredentialInputVisibility;
window.confirmAndSaveCredential = confirmAndSaveCredential;
window.syncSecurityStatusDisplays = syncSecurityStatusDisplays;
window.getDynamicCurrentModuleName = getDynamicCurrentModuleName;
window.updateDynamicModuleHeader = updateDynamicModuleHeader;

window.isUserProfileLocked = isUserProfileLocked;
window.updateUserProfileLockBanner = updateUserProfileLockBanner;

// Listen for lock state changes broadcasted from MIS Option 5 or cross-tab storage
window.addEventListener('portal_lock_change', function(e) {
    if (!e.detail || e.detail.file === 'user_profile_management') {
        const userView = document.getElementById('userModuleView');
        if (userView && userView.style.display !== 'none') {
            loadUserProfileIntoForm();
        }
    }
});

window.addEventListener('storage', function(e) {
    if (e.key === 'portal_page_lock_states') {
        const userView = document.getElementById('userModuleView');
        if (userView && userView.style.display !== 'none') {
            loadUserProfileIntoForm();
        }
    }
});

// Auto-initialize Dynamic Module Header on Load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        updateDynamicModuleHeader();
    });
} else {
    updateDynamicModuleHeader();
}


