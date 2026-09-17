/**
 * MEP FAN REPORTS - Unified Executive Portal Architecture
 * 1. Full-Width Top Navbar with Unified Border across 100vw
 * 2. Left-Corner Title (Module & Report Name)
 * 3. Dedicated Frozen Sidebar showing ONLY the Active Report Module (Zero Cut-Off / Zero Clutter)
 */

(function() {
    // Universal path resolver for portal root navigation
    function getPortalIndexUrl(query) {
        const isSub = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase().includes('/modules/');
        const base = isSub ? '../../index.html' : 'index.html';
        return query ? (base + '?' + query) : base;
    }

    // 0. Session Auth Guard - Strict session validation
    if (typeof window.validateCurrentSession === 'function') {
        if (!window.validateCurrentSession().valid) {
            window.location.replace(getPortalIndexUrl());
            return;
        }
    } else {
        const isAuthed = (sessionStorage.getItem('portal_auth_status') === 'true');
        if (!isAuthed) {
            window.location.replace(getPortalIndexUrl());
            return;
        }
    }

    // 0.1 View-Only Role Page Access Guard with Signature Verification
    const rawPathFile = (window.location.pathname || '').replace(/\\/g, '/').split('/').pop() || '';
    const currentPageFile = decodeURIComponent(rawPathFile).split('?')[0].split('#')[0].toLowerCase();
    
    function isCurrentUserViewOnly() {
        try {
            if (typeof window.validateCurrentSession === 'function') {
                const s = window.validateCurrentSession();
                return s.valid && s.role === 'VIEW';
            }
            const sig = sessionStorage.getItem('portal_auth_sig') || '';
            if (sig === btoa('VIEW:::MEP_SECURE_PORTAL_2026')) return true;
            if (sig === btoa('ADMIN:::MEP_SECURE_PORTAL_2026')) return false;
            const isView = (sessionStorage.getItem('portal_view_only') === 'true');
            const role = (sessionStorage.getItem('portal_auth_role') || '').toUpperCase();
            return isView || role === 'VIEW';
        } catch(e) {
            return false;
        }
    }

    const isViewOnlyUser = isCurrentUserViewOnly();

    function getViewPagePermissions() {
        const raw = localStorage.getItem('portal_view_page_permissions');
        if (raw) {
            try { return JSON.parse(raw); } catch(e) {}
        }
        return null;
    }

    if (isViewOnlyUser && currentPageFile && currentPageFile !== 'index.html') {
        const perms = getViewPagePermissions();
        if (perms && perms[currentPageFile] === false) {
            alert("Access Denied: You do not have permission to view this page.");
            window.location.replace(getPortalIndexUrl());
            return;
        }
    }

        // 1. Module Definition with Bespoke Pastel SVG Icons (Serialized 1 to 12)
    const MEP_NAV_MODULES = [
        {
            id: "mep-acc-bom",
            title: "Bill Of Materials (BOM)",
            badge: "1 Report",
            isBOM: true,
            iconBg: "#e0f2fe",
            iconColor: "#0284c7",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
            items: [
                { name: "BOM VIEW", url: "bom_view.html", highlight: true }
            ]
        },
        {
            id: "mep-acc-02",
            title: "Daily Check Report",
            iconBg: "#fef3c7",
            iconColor: "#d97706",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
            items: [
                { name: "Daily FG Production Entry", url: "daily_fg_production_entry.html" },
                { name: "Daily Production Received Assemble (All)", url: "daily_production_received_assemble.html" },
                { name: "Daily Production Plan", url: "daily_production_plan.html" },
                { name: "Check Floor Stock", url: "check_floor_stock.html" },
                { name: "Fan Damage Calculation Entry", url: "fan_damage_calculation_entry.html" }
            ]
        },
        {
            id: "mep-acc-03",
            title: "Report All Branch Fan",
            iconBg: "#d1fae5",
            iconColor: "#059669",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path><path d="M12 9v-7"></path><path d="M12 15v7"></path><path d="M15 12h7"></path><path d="M9 12h-7"></path></svg>`,
            items: [
                { name: "All Section SFG", url: "report_all_section_sfg.html" }
            ]
        },
        {
            id: "mep-acc-11",
            title: "Individual Check",
            iconBg: "#ecfeff",
            iconColor: "#0891b2",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
            items: [
                { name: "Check FG Need Item", url: "check_fg_need_item.html" },
                { name: "Check RM (Prd. Possible)", url: "check_rm_prd_possible.html" },
                { name: "BOM With SFG", url: "bom_with_sfg.html" }
            ]
        },
        {
            id: "mep-acc-04",
            title: "Closing (ERP)",
            iconBg: "#fee2e2",
            iconColor: "#dc2626",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
            isClosingERP: true,
            items: [
                { name: "Fan Assemble", url: "fan_assemble_erp.html", idKey: "fan-assemble" },
                { name: "Armature & Winding", url: "armature_winding_erp.html", idKey: "armature-winding" },
                { name: "Finish Good (FG)", url: "closing_finish_good_fg.html", idKey: "closing-fg" },
                { name: "Closing All SFG", url: "closing_all_sfg.html", idKey: "closing-all-sfg" },
                { name: "Store Position Report", url: "store_position_report.html", idKey: "store-position" }
            ]
        },
        {
            id: "mep-acc-01",
            title: "All Report Summary",
            iconBg: "#e0f2fe",
            iconColor: "#0284c7",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
            items: [
                { name: "Production Plan", url: "production_plan.html" },
                { name: "Monthly RM Demand Vs Received", url: "monthly_rm_demand_vs_received.html" },
                { name: "Assemble Summary", url: "assemble_summary.html" },
                { name: "Armature Summary", url: "armature_summary.html" },
                { name: "FG Summary", url: "fg_summary.html" },
                { name: "BOM", url: "bom.html" },
                { name: "RM Requirement Summary (BOM)", url: "rm_requirement_summary_bom.html" }
            ]
        },
        {
            id: "mep-acc-05",
            title: "All Monthly Report",
            iconBg: "#f3e8ff",
            iconColor: "#7c3aed",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
            items: [
                { name: "Monthly Production Summary (Physical)", url: "monthly_production_summary_physical.html" },
                { name: "Monthly Damage Summary", url: "monthly_damage_summary.html" }
            ]
        },
        {
            id: "mep-acc-06",
            title: "All Yearly Report",
            iconBg: "#ccfbf1",
            iconColor: "#0d9488",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
            items: [
                { name: "Yearly Production Summary (Physical)", url: "yearly_production_summary_physical.html" },
                { name: "Yearly Production Summary (ERP)", url: "yearly_production_summary_erp.html" },
                { name: "Yearly Damage Summary", url: "yearly_damage_summary.html" }
            ]
        },
        {
            id: "mep-acc-07",
            title: "Reject Report",
            iconBg: "#ffedd5",
            iconColor: "#ea580c",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            items: [
                { name: "Assemble Reject", url: "#" },
                { name: "All Section Reject", url: "#" }
            ]
        },
        {
            id: "mep-acc-backup",
            title: "Data Backup",
            iconBg: "#ecfdf5",
            iconColor: "#059669",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
            items: [
                { name: "Download Full Backup (JSON)", url: "javascript:window.exportSystemDataBackup()" },
                { name: "Data Backup & Recovery Hub", url: "javascript:window.openDataBackupModal()" }
            ]
        },
        {
            id: "mep-acc-master",
            title: "MASTER Central DB",
            iconBg: "#1e293b",
            iconColor: "#38bdf8",
            iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
            items: [
                { name: "Central Item Master Database", url: "master.html" }
            ]
        }
    ];

    // Helper to get current file name
    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().split('?')[0].split('#')[0];
        return page || "index.html";
    }

    // =========================================================================
    // UNIVERSAL PAGE LOCK SYSTEM - CONFIGURATION & CORE ENGINE
    // =========================================================================
    const EDITABLE_PAGES_REGISTRY = [
        'production_plan.html',
        'daily_fg_production_entry.html',
        'fan_damage_calculation_entry.html',
        'fan_assemble_erp.html',
        'armature_winding_erp.html',
        'closing_finish_good_fg.html',
        'closing_all_sfg.html',
        'store_position_report.html',
        'bom_with_sfg.html',
        'bom.html',
        'daily_production_plan.html',
        'daily_production_received_assemble.html',
        'check_floor_stock.html',
        'master.html',
        'rm_requirement_summary_bom.html'
    ];

    function isPageEditable(page) {
        const p = (page || getCurrentPage() || '').toLowerCase().split('?')[0].split('#')[0];
        if (EDITABLE_PAGES_REGISTRY.includes(p)) return true;
        if (document.querySelector('.excel-cell-input, .cell-editable, table.excel-table tbody td input, table.bom-table')) return true;
        return false;
    }

    let isPageLocked = true; // Permanent Standard: Default state is ALWAYS LOCKED on page load/refresh

    function showPageLockToast(msg, type) {
        type = type || 'warn';
        let toast = document.getElementById('smartPageLockToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'smartPageLockToast';
            toast.className = 'smart-page-lock-toast';
            document.body.appendChild(toast);
        }
        toast.className = 'smart-page-lock-toast toast-' + type;
        var iconSvg = '';
        if (type === 'locked') {
            iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
        } else if (type === 'unlocked') {
            iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
        } else {
            iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        }
        toast.innerHTML = iconSvg + '<span>' + msg + '</span>';
        toast.classList.add('show');
        clearTimeout(window._smartPageLockToastTimer);
        window._smartPageLockToastTimer = setTimeout(function() {
            toast.classList.remove('show');
        }, 3200);
    }

    function removePageLockBtns() {
        document.querySelectorAll('.smart-page-lock-btn, #smartPageLockBtn, [data-smart-lock="true"]').forEach(b => b.remove());
    }

    // Central Lock State Resolver (Single Source of Truth: localStorage 'portal_page_lock_states')
    function getCentralPageLockState(page) {
        if (isViewOnlyUser) return true; // View-only accounts are strictly locked under all circumstances
        const raw = (page || getCurrentPage() || '').split('?')[0].split('#')[0];
        const p = decodeURIComponent(raw).toLowerCase().trim();
        try {
            const rawStates = localStorage.getItem('portal_page_lock_states');
            const states = rawStates ? JSON.parse(rawStates) : {};
            // Default rule: Any registered or editable page defaults to LOCKED (true) unless explicitly set to false (Unlocked) by ADMIN in MIS
            return states[p] !== false;
        } catch(e) {
            return true;
        }
    }

    // Auto-discover and register newly created editable pages into central registry
    function registerCurrentPageIfEditable() {
        const curPage = getCurrentPage();
        if (!curPage || curPage === 'index.html') return;
        if (!isPageEditable(curPage)) return;

        try {
            const raw = localStorage.getItem('portal_dynamic_editable_pages');
            let list = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(list)) list = [];

            const exists = list.some(item => (item.file || '').toLowerCase() === curPage.toLowerCase());
            if (!exists) {
                const headingEl = document.querySelector('.nav-brand-title, .module-brand-name, h1');
                const titleText = (headingEl ? headingEl.textContent : document.title).split('|')[0].trim() || curPage;

                list.push({
                    file: curPage,
                    title: titleText,
                    module: 'Production Module',
                    discoveredAt: new Date().toISOString()
                });
                localStorage.setItem('portal_dynamic_editable_pages', JSON.stringify(list));

                // Default new page state to 🔒 LOCKED in central states
                const rawStates = localStorage.getItem('portal_page_lock_states');
                let states = rawStates ? JSON.parse(rawStates) : {};
                if (states[curPage] === undefined) {
                    states[curPage] = true;
                    localStorage.setItem('portal_page_lock_states', JSON.stringify(states));
                }
            }
        } catch(e) {}
    }

    function injectLockedPageBanner(show) {
        let banner = document.getElementById('smartLockedPageBanner');
        if (!show) {
            if (banner) banner.style.display = 'none';
            return;
        }
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'smartLockedPageBanner';
            banner.className = 'smart-locked-page-banner';
            banner.innerHTML = `
                <div class="banner-icon">🔒</div>
                <div class="banner-text">
                    <span class="banner-tag">Locked / Read-Only</span>
                    This page is currently locked by Administrator. All data modifications, entries, additions, and deletions are strictly disabled. To unlock, open <strong>MIS Module &gt; Lock and Unlock Page</strong>.
                </div>
            `;
            const targetContainer = document.querySelector('.report-container, .main-container, .dashboard-container, .container-fluid, .content') || document.body;
            if (targetContainer === document.body) {
                const nav = document.querySelector('.portal-nav, nav, header');
                if (nav && nav.nextSibling) {
                    nav.parentNode.insertBefore(banner, nav.nextSibling);
                } else {
                    document.body.insertBefore(banner, document.body.firstChild);
                }
            } else {
                targetContainer.insertBefore(banner, targetContainer.firstChild);
            }
        }
        banner.style.display = 'flex';
    }

    function enforceDomLockState(isLocked) {
        if (!isPageEditable(getCurrentPage())) return;

        injectLockedPageBanner(isLocked);

        // Freeze / unfreeze data inputs and textareas
        const formFields = document.querySelectorAll('input:not([type="hidden"]), select, textarea, [contenteditable="true"]');
        formFields.forEach(el => {
            if (isSearchOrFilterControl(el)) return; // Never freeze search or filter elements

            if (isLocked) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        el.disabled = true;
                    } else {
                        el.readOnly = true;
                        el.setAttribute('readonly', 'readonly');
                    }
                    el.classList.add('dom-locked-field');
                } else if (el.tagName === 'SELECT') {
                    el.disabled = true;
                    el.classList.add('dom-locked-field');
                } else if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
                    el.setAttribute('contenteditable', 'false');
                    el.setAttribute('data-was-contenteditable', 'true');
                }
            } else {
                if (el.classList.contains('dom-locked-field')) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        if (el.type === 'checkbox' || el.type === 'radio') {
                            el.disabled = false;
                        } else {
                            el.readOnly = false;
                            el.removeAttribute('readonly');
                        }
                    } else if (el.tagName === 'SELECT') {
                        el.disabled = false;
                    }
                    el.classList.remove('dom-locked-field');
                }
                if (el.getAttribute('data-was-contenteditable') === 'true') {
                    el.setAttribute('contenteditable', 'true');
                    el.removeAttribute('data-was-contenteditable');
                }
            }
        });

        // Disable / restore edit action buttons
        const actionButtons = document.querySelectorAll('button, .btn, a.btn, input[type="button"], input[type="submit"]');
        actionButtons.forEach(btn => {
            if (isSearchOrFilterControl(btn)) return;
            if (isEditActionButton(btn)) {
                if (isLocked) {
                    btn.disabled = true;
                    btn.setAttribute('data-dom-locked-btn', 'true');
                } else {
                    if (btn.getAttribute('data-dom-locked-btn') === 'true') {
                        btn.disabled = false;
                        btn.removeAttribute('data-dom-locked-btn');
                    }
                }
            }
        });
    }

    let _lockMutationObserver = null;
    function setupLockMutationObserver() {
        if (_lockMutationObserver || !window.MutationObserver) return;
        _lockMutationObserver = new MutationObserver(function() {
            if (!isPageLocked || !isPageEditable(getCurrentPage())) return;
            clearTimeout(window._lockDomObserverTimer);
            window._lockDomObserverTimer = setTimeout(function() {
                enforceDomLockState(true);
            }, 60);
        });
        if (document.body) {
            _lockMutationObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    function applyCentralLockState() {
        const curPage = getCurrentPage();
        if (!isPageEditable(curPage)) {
            removePageLockBtns();
            return;
        }

        isPageLocked = getCentralPageLockState(curPage);

        if (isPageLocked) {
            if (document.body) {
                document.body.classList.add('page-locked');
                document.body.classList.remove('page-unlocked');
            }
            enforceDomLockState(true);
            setupLockMutationObserver();
        } else {
            if (document.body) {
                document.body.classList.remove('page-locked');
                document.body.classList.add('page-unlocked');
            }
            enforceDomLockState(false);
        }
        removePageLockBtns(); // Ensure zero lock buttons exist in any page header or toolbar
    }

    // Cross-tab and live event synchronization
    window.addEventListener('storage', function(e) {
        if (e.key === 'portal_page_lock_states' || e.key === 'portal_view_only') {
            applyCentralLockState();
        }
    });

    window.addEventListener('portal_lock_change', function() {
        applyCentralLockState();
    });

    window.addEventListener('smart_cloud_sync', function(e) {
        if (e.detail && (e.detail.key === 'portal_page_lock_states' || e.detail.key === 'portal_view_only')) {
            applyCentralLockState();
        }
    });

    function logPageLockAudit(action, page, pageTitle, timeStr) {
        try {
            const raw = localStorage.getItem('mep_page_lock_audit_log');
            let logs = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(logs)) logs = [];
            logs.unshift({
                id: 'lock-' + Date.now(),
                page: page,
                pageTitle: pageTitle,
                action: action,
                user: 'Sayful Islam',
                role: isViewOnlyUser ? 'VIEW' : 'ADMIN',
                timestamp: new Date().toISOString(),
                formattedTime: timeStr
            });
            if (logs.length > 50) logs = logs.slice(0, 50);
            localStorage.setItem('mep_page_lock_audit_log', JSON.stringify(logs));
        } catch(e) {}
    }

    function isSearchOrFilterControl(el) {
        if (!el) return false;
        return !!(
            el.closest('#searchInput') ||
            el.closest('.search-box') ||
            el.closest('#searchBtn') ||
            el.closest('.btn-search') ||
            el.closest('.btn-clear-search') ||
            el.closest('#monthFilter') ||
            el.closest('#yearFilter') ||
            el.closest('.filter-select') ||
            el.closest('.period-select') ||
            el.closest('.filter-date-input') ||
            el.closest('#filterDate') ||
            el.closest('.date-mode-pills') ||
            el.closest('.pagination-bar') ||
            el.closest('.btn-page') ||
            el.closest('.btn-export') ||
            el.closest('.btn-action-export') ||
            el.closest('.btn-print') ||
            el.closest('.btn-action-print') ||
            el.closest('#smartPageLockBtn') ||
            el.closest('.btn-nav-notif') ||
            el.closest('.header-logout-btn') ||
            el.closest('.btn-nav-tab') ||
            el.closest('.btn-header-pill') ||
            el.closest('.frozen-sidebar-wrapper') ||
            el.closest('.portal-nav') ||
            el.closest('.modal-close-btn') ||
            el.closest('.btn-modal-cancel') ||
            el.closest('.btn-close')
        );
    }

    function isEditableDataTarget(el) {
        if (!el) return false;
        if (isSearchOrFilterControl(el)) return false;

        if (el.isContentEditable || el.getAttribute('contenteditable') === 'true' || el.closest('[contenteditable="true"]')) return true;
        if (el.closest('.excel-table tbody, .data-table tbody, table tbody, .data-row, tr.data-row, table.bom-table tbody, .planning-table tbody, .damage-table tbody, #planTable tbody, #damageTable tbody, #entryTable tbody, #masterTable tbody')) return true;
        if (el.matches('.excel-cell-input, .excel-cell-text, .cell-input, .cell-editable, [contenteditable="true"], .plan-input, .damage-input, .bom-input')) return true;

        if (el.closest('.modal-backdrop, .entry-modal, #newEntryModal, #pasteModal, #componentModal, #addMasterModal, #bulkPasteModal, #damageModal, #addDamageModal')) {
            if (el.closest('.modal-close-btn, .btn-modal-cancel, .btn-close')) return false;
            return true;
        }
        return false;
    }

    function isEditActionButton(el) {
        if (!el) return false;
        if (isSearchOrFilterControl(el)) return false;

        const btn = el.closest('button, .btn, a.btn, [role="button"], input[type="button"], input[type="submit"]');
        if (!btn) return false;

        if (btn.matches('.btn-action-export, .btn-export, .btn-print, .btn-action-print, .btn-page, .smart-page-lock-btn, .btn-nav-notif, .header-logout-btn, .btn-nav-tab, .btn-header-pill, .modal-close-btn, .btn-close, .btn-modal-cancel')) {
            return false;
        }

        const text = (btn.textContent || '').trim().toLowerCase();
        if (text.includes('export') || text.includes('print') || text.includes('download') || text.includes('csv') || text.includes('close') || text.includes('cancel')) {
            return false;
        }

        if (btn.matches('.btn-save, .btn-save-plan, .btn-add, .btn-add-item, .btn-paste, .btn-replace, .btn-reset, .btn-action-paste, .btn-action-replace, .btn-action-reset, .btn-action-import, .btn-del-row, .btn-table-del, .btn-row-del, .btn-action-delete, .btn-action-edit, .btn-action-primary, .btn-action-add, .btn-action-purple, .btn-table-action, .btn-delete')) {
            return true;
        }

        const oc = btn.getAttribute('onclick') || '';
        if (/(open.*Modal|save|Save|del|delete|Delete|add|Add|edit|Edit|paste|Paste|import|Import|sync|Sync|replace|Replace|reset|Reset|remove|clear|update)/i.test(oc)) {
            if (!/export|print|download|close|cancel/i.test(oc)) {
                return true;
            }
        }
        return false;
    }

    function initPageLockProtection() {
        const curPage = getCurrentPage();
        if (!isPageEditable(curPage)) {
            removePageLockBtns();
            return;
        }

        // Auto-register future editable pages into central registry
        registerCurrentPageIfEditable();

        // Enforce central lock state from Single Source of Truth
        applyCentralLockState();

        // Global Event Interceptors (Capture Phase)
        document.addEventListener('click', function(e) {
            if (!isPageEditable(getCurrentPage()) || !isPageLocked) return;
            if (isSearchOrFilterControl(e.target)) return;

            if (isEditActionButton(e.target)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (isViewOnlyUser) {
                    showPageLockToast('🔒 View-Only Mode: You cannot add, edit, or save changes on this page.', 'warn');
                } else {
                    showPageLockToast('🔒 Page is Locked (Read-Only). Unlock this page from MIS Module > Lock and Unlock Page to enable editing.', 'warn');
                }
                return false;
            }

            if (isEditableDataTarget(e.target)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (typeof e.target.blur === 'function') e.target.blur();
                if (isViewOnlyUser) {
                    showPageLockToast('🔒 View-Only Mode: Editing is disabled.', 'warn');
                } else {
                    showPageLockToast('🔒 Editing Disabled (Page Locked). Access must be unlocked from MIS Module > Lock and Unlock Page.', 'warn');
                }
                return false;
            }
        }, true);

        document.addEventListener('dblclick', function(e) {
            if (!isPageEditable(getCurrentPage()) || !isPageLocked) return;
            if (isSearchOrFilterControl(e.target)) return;

            if (isEditableDataTarget(e.target) || e.target.closest('td, th, tr')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                showPageLockToast('🔒 Double-click Editing Disabled. Unlock this page from MIS Module > Lock and Unlock Page.', 'warn');
                return false;
            }
        }, true);

        document.addEventListener('keydown', function(e) {
            if (!isPageEditable(getCurrentPage()) || !isPageLocked) return;
            if (isSearchOrFilterControl(e.target)) return;

            const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape', 'PageUp', 'PageDown', 'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta'];
            if (navKeys.includes(e.key)) return;

            if (e.ctrlKey || e.metaKey) {
                if (['c', 'C', 'p', 'P', 'f', 'F'].includes(e.key)) return;
            }

            if (isEditableDataTarget(e.target) || e.target.closest('td, th, tr')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                showPageLockToast('🔒 Keyboard Editing Blocked. Unlock this page from MIS Module > Lock and Unlock Page to edit.', 'warn');
                return false;
            }
        }, true);

        document.addEventListener('paste', function(e) {
            if (!isPageEditable(getCurrentPage()) || !isPageLocked) return;
            if (isSearchOrFilterControl(e.target)) return;

            e.preventDefault();
            e.stopImmediatePropagation();
            showPageLockToast('🔒 Clipboard Paste Blocked. Unlock this page from MIS Module > Lock and Unlock Page to paste.', 'warn');
            return false;
        }, true);

        document.addEventListener('drop', function(e) {
            if (!isPageEditable(getCurrentPage()) || !isPageLocked) return;
            if (isSearchOrFilterControl(e.target)) return;

            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }, true);
    }

    // Expose Global mepPageLock API unconditionally
    window.mepPageLock = {
        isLocked: function(page) {
            const p = (page || getCurrentPage() || '').toLowerCase().split('?')[0].split('#')[0];
            return isPageEditable(p) ? getCentralPageLockState(p) : false;
        },
        getState: function(page) { return getCentralPageLockState(page || getCurrentPage()); },
        sync: applyCentralLockState,
        showToast: showPageLockToast
    };

    // Helper to resolve closing date
    function resolveClosingReportDate(repKey, fallbackDefault) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const keyMap = {
            'fan-assemble': ['mep_fan_assemble_date_interval', 'mep_erp_date_interval', 'closingDate_fan_assemble'],
            'armature-winding': ['mep_armature_winding_date_interval', 'mep_erp_date_interval', 'closingDate_armature_winding'],
            'closing-fg': ['mep_closing_fg_date_interval', 'mep_erp_date_interval', 'closingDate_closing_fg'],
            'closing-all-sfg': ['mep_closing_all_sfg_date_interval', 'mep_erp_date_interval', 'closingDate_closing_all_sfg'],
            'store-position': ['mep_store_position_date', 'mep_store_position_date_interval', 'mep_erp_date_interval', 'closingDate_store_position']
        };
        
        let foundRaw = null;
        const keys = keyMap[repKey] || [];
        for (let k of keys) {
            const val = localStorage.getItem(k);
            if (val && val.trim()) { foundRaw = val.trim(); break; }
        }
        
        let date = fallbackDefault;
        if (foundRaw) {
            const match = foundRaw.match(/(\d{4}-\d{2}-\d{2})\s*$/);
            if (match) date = match[1];
            else {
                const single = foundRaw.match(/(\d{4}-\d{2}-\d{2})/);
                if (single) date = single[1];
            }
        }
        
        const isLive = (date >= todayStr);
        const shortDate = date.length >= 10 ? date.slice(5) : date;
        return { date, shortDate, isLive };
    }

    // Initialize Unified Layout & Sidebar
    function initFrozenSidebar() {
        const currentPage = getCurrentPage();
        if (currentPage === 'index.html' || currentPage === '') {
            return;
        }

        // 1. Find active module & item name (Exact match first, then fallback)
        let activeModule = null;
        let activeItemName = document.title || "Report Detail";

        // Pass 1: Exact match
        for (let i = 0; i < MEP_NAV_MODULES.length; i++) {
            const mod = MEP_NAV_MODULES[i];
            for (let j = 0; j < mod.items.length; j++) {
                const item = mod.items[j];
                if (currentPage === item.url) {
                    activeModule = mod;
                    activeItemName = item.name;
                    break;
                }
            }
            if (activeModule) break;
        }

        // Pass 2: Fallback if no exact match
        if (!activeModule) {
            for (let i = 0; i < MEP_NAV_MODULES.length; i++) {
                const mod = MEP_NAV_MODULES[i];
                for (let j = 0; j < mod.items.length; j++) {
                    const item = mod.items[j];
                    if (item.url !== '#' && (currentPage.startsWith(item.url.replace('.html', '')) || currentPage.includes(item.url.replace('.html', '')))) {
                        activeModule = mod;
                        activeItemName = item.name;
                        break;
                    }
                }
                if (activeModule) break;
            }
        }

        if (!activeModule) {
            const masterMod = MEP_NAV_MODULES.find(m => m.id === "mep-acc-master");
            if (currentPage === 'master.html' && masterMod) {
                activeModule = masterMod;
                activeItemName = "Central Item Master Database";
            } else {
                activeModule = MEP_NAV_MODULES[0];
                activeItemName = "Report Detail";
            }
        }

        // Check custom titles for current page
        try {
            const customTitlesMap = JSON.parse(localStorage.getItem('portal_custom_page_names') || '{}');
            const cleanCurrentPage = (currentPage || '').toLowerCase();
            if (customTitlesMap[cleanCurrentPage] && customTitlesMap[cleanCurrentPage].trim()) {
                activeItemName = customTitlesMap[cleanCurrentPage].trim();
            }
        } catch(e) {}

        // 2. Identify top navbar and clean it up (Insert Home, Dashboard and [S] Sayful Islam)
        const nav = document.querySelector('.portal-nav') || document.querySelector('header');
        if (nav) {
            // Remove old buttons and legacy clocks
            const btnsToRemove = nav.querySelectorAll('.btn-nav-group, .btn-nav-action, .btn-back-portal, .btn-toggle-frozen-sidebar, .btn-portal-back, .nav-live-clock, #liveClock');
            btnsToRemove.forEach(el => el.remove());

            let navLeft = nav.querySelector('.nav-left');
            let navRight = nav.querySelector('.nav-right');

            if (!navLeft) {
                let container = nav.querySelector('.nav-container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'nav-container';
                    nav.appendChild(container);
                }
                navLeft = document.createElement('div');
                navLeft.className = 'nav-left';
                container.insertBefore(navLeft, container.firstChild);
            }
            
            // 1. Clean navLeft of all legacy brands, duplicate titles, and old Link Details button
            navLeft.innerHTML = '';
            navLeft.style.display = 'inline-flex';
            navLeft.style.alignItems = 'center';

            // 2. Permanent Brand Bar - Global Dynamic Module Header (Production Module, HRM Module, etc.)
            let currentModName = 'Production Module';
            try {
                if (typeof getDynamicCurrentModuleName === 'function') {
                    currentModName = getDynamicCurrentModuleName();
                } else if (sessionStorage.getItem('portal_active_erp_module')) {
                    currentModName = sessionStorage.getItem('portal_active_erp_module');
                }
            } catch(e) {}
            const brandCard = document.createElement('div');
            brandCard.className = 'smart-brand-card';
            brandCard.innerHTML = `<span class="smart-brand-text">${currentModName}</span>`;
            navLeft.appendChild(brandCard);

            // 3. Remove Link button from individual report pages per User Requirement #5 (Centralized in MIS "Show & Edit Link")
            document.querySelectorAll('.btn-action-link, #btnLinkDetails').forEach(el => el.remove());

            // 4. Setup Icon-Only Action Buttons & Premium Tooltips across all toolbars (Universal Standard matching Screenshot 3)
            const toolbarSelectors = [
                '.bom-actions-group',
                '.actions-group',
                '.header-actions',
                '.header-action-group',
                '.damage-actions-group',
                '.stock-actions-group',
                '.report-action-buttons',
                '.header-controls',
                '.action-btn-group'
            ];
            document.querySelectorAll(toolbarSelectors.join(', ')).forEach(tb => {
                tb.querySelectorAll('button').forEach(btn => {
                    if (btn.classList.contains('smart-page-lock-btn')) return;

                    const origTitle = btn.getAttribute('title') || '';
                    const rawTxt = btn.textContent.trim();
                    btn.removeAttribute('title'); // Eliminate duplicate browser default black tooltip

                    // Resolve tooltip label
                    let label = btn.getAttribute('data-tooltip') || '';
                    if (!label) {
                        if (rawTxt.includes('Add') || origTitle.includes('Add')) label = 'Add New Item';
                        else if (rawTxt.includes('Save') || origTitle.includes('Save')) label = 'Save Changes';
                        else if (rawTxt.includes('Paste') || origTitle.includes('Paste') || rawTxt.includes('Import') || origTitle.includes('Import')) label = 'Paste Excel Data';
                        else if (rawTxt.includes('Replace') || origTitle.includes('Replace')) label = 'Replace Item';
                        else if (rawTxt.includes('Export') || origTitle.includes('Export') || rawTxt.includes('CSV') || origTitle.includes('CSV')) label = 'Export CSV';
                        else if (rawTxt.includes('Print') || origTitle.includes('Print')) label = 'Print';
                        else if (rawTxt.includes('Reset') || origTitle.includes('Reset')) label = 'Reset Factory Data';
                        else if (rawTxt.includes('Plan') || origTitle.includes('Plan')) label = 'Production Plan';
                        else if (rawTxt.length > 0) label = rawTxt;
                        else if (origTitle.length > 0) label = origTitle;
                    }
                    if (label) {
                        btn.setAttribute('data-tooltip', label);
                        btn.setAttribute('aria-label', label);
                    }

                    // Ensure icon-only: Strip raw text nodes while preserving SVGs
                    Array.from(btn.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                            node.textContent = '';
                        }
                    });
                    btn.querySelectorAll('span:not(.erp-tooltip)').forEach(s => s.style.display = 'none');

                    // Standardize classes matching rm_requirement_summary_bom.html
                    btn.classList.add('btn-action-icon');
                    if (label.includes('Add') || btn.classList.contains('btn-add')) btn.classList.add('btn-add');
                    else if (label.includes('Save') || btn.classList.contains('btn-save')) btn.classList.add('btn-save');
                    else if (label.includes('Paste') || label.includes('Replace') || btn.classList.contains('btn-paste') || btn.classList.contains('btn-replace')) {
                        btn.classList.add('btn-paste');
                    }
                    else if (label.includes('Export') || label.includes('CSV') || btn.classList.contains('btn-export')) btn.classList.add('btn-export');
                    else if (label.includes('Print') || btn.classList.contains('btn-print')) btn.classList.add('btn-print');
                    else if (label.includes('Reset') || btn.classList.contains('btn-reset')) btn.classList.add('btn-reset');
                });
            });

            // 5. Clean up any Company Address / Location Subheadings under Main Headings
            document.querySelectorAll('.location-text, .company-location, .header-title-sub, .company-meta-group .location-text, .company-header-group .company-location').forEach(el => {
                el.remove();
            });

            // Check right corner: Ensure round [Profile Photo] Sayful Islam component exists (NO Bell in Report Header)
            if (!navRight) {
                let container = nav.querySelector('.nav-container') || nav;
                navRight = document.createElement('div');
                navRight.className = 'nav-right';
                container.appendChild(navRight);
            }

            if (navRight) {
                // Remove legacy static text / clocks in navRight
                navRight.querySelectorAll('.nav-live-clock, #liveClock').forEach(el => el.remove());
                Array.from(navRight.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        node.remove();
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.textContent.includes('MEP FAN LTD.') && !node.classList.contains('smart-cloud-status-badge') && !node.classList.contains('user-brand-card')) {
                        node.remove();
                    }
                });

                // Remove any old notification bell if present
                const oldBell = navRight.querySelector('.notif-btn-wrapper, .notif-bell-btn');
                if (oldBell) oldBell.remove();

                // View-Only Mode Status Indicator (Dynamic: Only shown if logged in as View-Only)
                const isViewOnlyMode = (sessionStorage.getItem('portal_view_only') === 'true');
                let viewBadge = navRight.querySelector('.smart-view-only-badge');
                if (isViewOnlyMode) {
                    if (!viewBadge) {
                        viewBadge = document.createElement('div');
                        viewBadge.className = 'smart-view-only-badge';
                        viewBadge.title = 'View-Only Mode: Data entry and editing are disabled';
                        viewBadge.innerHTML = `
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <span>View Only</span>
                        `;
                        navRight.insertBefore(viewBadge, navRight.querySelector('.user-brand-card') || null);
                    } else {
                        viewBadge.style.display = 'inline-flex';
                    }
                } else if (viewBadge) {
                    viewBadge.remove();
                }

                // Zero Lock Buttons on page (Managed Centrally from MIS Module > Lock and Unlock Page)
                removePageLockBtns();
                applyCentralLockState();

                // Ensure Live Clock Badge exists with integrated Realtime Cloud Status
                // Unified Layout: Date   |   Live  07:25:36 PM
                let clockBadge = navRight.querySelector('.live-clock-badge');
                if (!clockBadge) {
                    clockBadge = document.createElement('div');
                    clockBadge.className = 'live-clock-badge';
                    clockBadge.id = 'liveClockBadge';
                    navRight.insertBefore(clockBadge, navRight.querySelector('.user-brand-card') || null);
                }

                // Preserve any existing cloud status class (e.g. online, offline, syncing)
                const existingCloudBadge = navRight.querySelector('.smart-cloud-status-badge');
                const cloudClass = existingCloudBadge ? existingCloudBadge.className : 'smart-cloud-status-badge';
                const cloudText = (existingCloudBadge && existingCloudBadge.querySelector('.cloud-status-text')) ? existingCloudBadge.querySelector('.cloud-status-text').textContent : 'Live';

                clockBadge.title = 'Live System Day & Time';
                clockBadge.innerHTML = `
                    <div class="${cloudClass}" id="smartCloudStatusBadge" title="Realtime System: Live">
                        <span class="cloud-pulse-dot"></span>
                        <span class="cloud-status-text">LIVE</span>
                    </div>
                    <div class="live-clock-info" id="liveClockInfo">
                        <span class="live-day-text" id="liveDayText">Loading date...</span>
                        <span class="live-time-text" id="liveTimeText">--:--:-- --</span>
                    </div>
                `;
                guardLiveTimeElements();
                updateUniversalLiveClock(true);

                let currentProf = { name: 'Sayful Islam', role: 'Senior Supervisor', photo: 'shared/assets/profile.jpg' };
                try {
                    const rawProf = localStorage.getItem('mep_user_profile');
                    if (rawProf) {
                        const parsed = JSON.parse(rawProf);
                        if (parsed.name) currentProf.name = parsed.name;
                        if (parsed.role) currentProf.role = parsed.role;
                        if (parsed.photo) currentProf.photo = parsed.photo;
                    }
                } catch(e) {}

                if (isViewOnlyUser) {
                    currentProf.name = 'View User';
                    currentProf.role = 'Restricted Access';
                    currentProf.photo = 'shared/assets/sayful_logo.png';
                }

                let userBrand = navRight.querySelector('.user-brand-card');
                if (!userBrand) {
                    userBrand = document.createElement('div');
                    userBrand.className = 'user-brand-card';
                    userBrand.title = `${currentProf.name} - ${currentProf.role}`;
                    userBrand.setAttribute('role', 'banner');
                    userBrand.style.cursor = 'default';

                    const isSubModule = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase().includes('/modules/');
                    const rawPhoto = currentProf.photo || 'profile.jpg';
                    let photoSrc = rawPhoto;
                    if (photoSrc && !photoSrc.startsWith('http') && !photoSrc.startsWith('data:') && !photoSrc.startsWith('blob:') && !photoSrc.startsWith('/')) {
                        const cleanPhoto = rawPhoto.replace(/^(\.\.\/)+/, '').replace(/^shared\/assets\//, '');
                        photoSrc = isSubModule ? ('../../shared/assets/' + cleanPhoto) : ('shared/assets/' + cleanPhoto);
                    }
                    const fallbackLogo = isSubModule ? '../../shared/assets/sayful_logo.png' : 'shared/assets/sayful_logo.png';

                    userBrand.innerHTML = `
                        <div class="user-avatar-frame">
                            <img src="${photoSrc}" alt="${currentProf.name}" onerror="this.src='${fallbackLogo}'; this.onerror=function(){this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';};">
                            <div class="user-avatar-fallback" style="display:none; width:100%; height:100%; background:#0284c7; color:#fff; align-items:center; justify-content:center; font-weight:800; font-size:13px;">${currentProf.name.charAt(0) || 'U'}</div>
                        </div>
                        <div class="user-brand-meta">
                            <span class="user-brand-name" style="font-size:0.86rem;">${currentProf.name}</span>
                            <span class="user-brand-role" style="font-size:0.62rem;">${currentProf.role}</span>
                        </div>
                    `;
                    userBrand.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    };
                    navRight.appendChild(userBrand);
                } else {
                    userBrand.removeAttribute('href');
                    userBrand.style.cursor = 'default';
                    userBrand.title = `${currentProf.name} - ${currentProf.role}`;
                    const nEl = userBrand.querySelector('.user-brand-name');
                    if (nEl) nEl.textContent = currentProf.name;
                    const rEl = userBrand.querySelector('.user-brand-role');
                    if (rEl) rEl.textContent = currentProf.role;
                    const imgEl = userBrand.querySelector('img');
                    if (imgEl) imgEl.src = currentProf.photo;
                    userBrand.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    };
                }

                // Notification Bell removed from report headers per User Requirement #6 (Centralized in MIS)
                const existingNotifBtn = navRight.querySelector('.btn-nav-notif, .notif-bell-btn, .notif-btn-wrapper');
                if (existingNotifBtn) existingNotifBtn.remove();

                // Header Top-Right Logout Button (Uniform across all report pages)
                if (!navRight.querySelector('.header-logout-btn')) {
                    const logoutBtn = document.createElement('button');
                    logoutBtn.type = 'button';
                    logoutBtn.className = 'header-logout-btn';
                    logoutBtn.title = 'Logout / Lock Portal';
                    logoutBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    `;
                    logoutBtn.onclick = function() {
                        sessionStorage.clear();
                        localStorage.removeItem('portal_auth_status');
                        localStorage.removeItem('portal_view_only');
                        localStorage.removeItem('portal_auth_role');
                        localStorage.removeItem('portal_auth_sig');
                        localStorage.setItem('portal_logout_broadcast', Date.now().toString());
                        window.location.replace(getPortalIndexUrl());
                    };
                    navRight.appendChild(logoutBtn);
                }
            }
        }

        // 3. Build Full Accordion Sidebar containing ALL Main Headings (Modules)
        let accordionHtml = '';
        const viewPerms = isViewOnlyUser ? getViewPagePermissions() : null;

        MEP_NAV_MODULES.forEach((mod, modIdx) => {
            const isThisActiveModule = (mod.id === activeModule.id);
            const isClosing = !!mod.isClosingERP;

            // Filter items for View-Only users based on admin permissions
            const accessibleItems = mod.items.filter(item => {
                if (!isViewOnlyUser || !viewPerms) return true;
                if (item.url === '#') return true;
                const file = item.url.split('/').pop().split('?')[0].toLowerCase();
                return viewPerms[file] !== false;
            });

            if (isViewOnlyUser && accessibleItems.length === 0) {
                return; // Hide entire module heading if all its reports are restricted
            }

            let subItemsHtml = '';
            accessibleItems.forEach(item => {
                let effectiveUrl = item.url;
                let displayName = item.name;
                try {
                    const clean = (item.url || '').split('/').pop().split('?')[0].toLowerCase();
                    const mappings = JSON.parse(localStorage.getItem('portal_page_link_mappings') || '{}');
                    if (mappings && mappings[clean]) {
                        effectiveUrl = mappings[clean];
                    }
                    const customTitles = JSON.parse(localStorage.getItem('portal_custom_page_names') || '{}');
                    if (customTitles && customTitles[clean] && customTitles[clean].trim()) {
                        displayName = customTitles[clean].trim();
                    }
                } catch(e) {}

                const isActiveItem = (currentPage === item.url || currentPage === effectiveUrl || (activeModule && item.name === activeItemName) || (activeModule && displayName === activeItemName));
                let statusTagHtml = '';
                let dotClass = 'sub-item-dot';

                if (isClosing && item.idKey) {
                    const repInfo = resolveClosingReportDate(item.idKey, '2026-08-25');
                    dotClass += repInfo.isLive ? ' status-updated' : ' status-outdated';
                    statusTagHtml = `<span class="sub-item-status-tag ${repInfo.isLive ? 'tag-updated' : 'tag-outdated'}">${repInfo.shortDate}</span>`;
                }

                subItemsHtml += `
                    <a href="${effectiveUrl}" class="sub-report-item ${isActiveItem ? 'active-page item-highlight-entry' : ''}" style="margin-bottom: 5px; text-decoration: none !important;" title="${displayName}" onclick="handleSubItemClick(this)">
                        <div class="sub-item-left">
                            <span class="${dotClass}" id="mep-dot-${item.idKey || ''}"></span>
                            <span class="sub-item-title">${displayName}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            ${statusTagHtml}
                            <svg class="sub-item-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </a>
                `;
            });

            const badgeText = mod.badge || (isClosing ? 'LIVE ERP' : `${accessibleItems.length} Reports`);

            if (mod.isBOM) {
                accordionHtml += `
                    <div class="mep-module-accordion mep-bom-accordion ${isThisActiveModule ? 'is-open' : ''}" id="mep-acc-group-${mod.id}">
                        <div class="mep-module-heading mep-heading-bom-special mep-heading-${mod.id} ${isThisActiveModule ? 'is-active-module' : ''}" onclick="toggleSidebarModule('${mod.id}')" title="Click to open/collapse ${mod.title}">
                            <div class="mep-mod-left">
                                <div class="mep-bom-icon-badge" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" class="mep-bom-svg" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <div class="mep-mod-info">
                                    <div class="mep-bom-title-text">${mod.title}</div>
                                </div>
                            </div>
                            <div class="mep-mod-chevron">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div class="mep-module-sublist sub-report-list" id="mep-acc-body-${mod.id}">
                            ${subItemsHtml}
                        </div>
                    </div>
                `;
                return;
            }

            accordionHtml += `
                <div class="mep-module-accordion ${isThisActiveModule ? 'is-open' : ''}" id="mep-acc-group-${mod.id}">
                    <!-- Main Heading ("মূল হেডিং") -->
                    <div class="mep-module-heading mep-heading-${mod.id} ${isThisActiveModule ? 'is-active-module' : ''}" onclick="toggleSidebarModule('${mod.id}')" title="Click to open/collapse ${mod.title}">
                        <div class="mep-mod-left">
                            <div class="mep-mod-star mep-mod-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" class="mep-star-svg" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                </svg>
                            </div>
                            <div class="mep-mod-info">
                                <div class="mep-mod-title">${mod.title}</div>
                            </div>
                        </div>
                        <div class="mep-mod-chevron">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>

                    <!-- Sub-Reports List (Files inside this Main Heading) -->
                    <div class="mep-module-sublist sub-report-list" id="mep-acc-body-${mod.id}">
                        ${subItemsHtml}
                    </div>
                </div>
            `;
        });

        // Global accordion collapse handler
        window.collapseAllSidebarModules = function() {
            try {
                document.querySelectorAll('.mep-module-accordion').forEach(grp => {
                    grp.classList.remove('is-open');
                    const h = grp.querySelector('.mep-module-heading');
                    if (h) h.classList.remove('is-active-module');
                });
                document.querySelectorAll('.sub-report-item').forEach(el => {
                    el.classList.remove('active-page');
                    el.classList.remove('item-highlight-entry');
                });
            } catch(e) {
                console.warn('Error collapsing sidebar modules:', e);
            }
        };

        // Global accordion toggle handler
        window.toggleSidebarModule = function(modId) {
            const targetGroup = document.getElementById(`mep-acc-group-${modId}`);
            if (!targetGroup) return;

            const wasOpen = targetGroup.classList.contains('is-open');

            // Collapse all modules
            window.collapseAllSidebarModules();

            // Open clicked module if it was previously closed
            if (!wasOpen) {
                targetGroup.classList.add('is-open');
                const h = targetGroup.querySelector('.mep-module-heading');
                if (h) h.classList.add('is-active-module');
                setTimeout(() => {
                    targetGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 50);
            }
        };

        // Instant click handler for sub-report pages
        window.handleSubItemClick = function(clickedEl) {
            document.querySelectorAll('.sub-report-item').forEach(el => {
                el.classList.remove('active-page');
                el.classList.remove('item-highlight-entry');
            });
            clickedEl.classList.add('active-page');
            clickedEl.classList.add('item-highlight-entry');
        };

        // 4. Create Sidebar matching Accordion Architecture
        const aside = document.createElement('aside');
        aside.id = 'mepFrozenSidebar';
        aside.className = 'mep-frozen-sidebar';
        aside.innerHTML = `
            <div class="mep-sidebar-actions mep-sidebar-actions-dual">
                <!-- Button 1: Dashboard (Premium 3D Icon with Hover Tooltip) -->
                <a href="${getPortalIndexUrl('view=main')}" class="mep-nav-3d-btn mep-btn-3d-dash" aria-label="Dashboard">
                    <span class="nav-3d-icon-wrap">
                        <svg class="nav-3d-icon-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="rsbDashTopGrad" x1="16" y1="3" x2="16" y2="15" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#38bdf8" />
                                    <stop offset="100%" stop-color="#0284c7" />
                                </linearGradient>
                                <linearGradient id="rsbDashLeftGrad" x1="3" y1="9" x2="16" y2="29" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#0369a1" />
                                    <stop offset="100%" stop-color="#075985" />
                                </linearGradient>
                                <linearGradient id="rsbDashRightGrad" x1="16" y1="15" x2="29" y2="29" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#0284c7" />
                                    <stop offset="100%" stop-color="#1e40af" />
                                </linearGradient>
                                <radialGradient id="rsbDashShadow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#0284c7" stop-opacity="0.35" />
                                    <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
                                </radialGradient>
                            </defs>
                            <ellipse cx="16" cy="28.5" rx="12" ry="3.5" fill="url(#rsbDashShadow)" />
                            <polygon points="3,9 16,16 16,26 3,19" fill="url(#rsbDashLeftGrad)" />
                            <polygon points="16,16 29,9 29,19 16,26" fill="url(#rsbDashRightGrad)" />
                            <polygon points="16,2.5 29,9 16,15.5 3,9" fill="url(#rsbDashTopGrad)" stroke="#7dd3fc" stroke-width="0.75" />
                            <ellipse cx="16" cy="9" rx="5.5" ry="2.8" fill="#0c4a6e" stroke="#38bdf8" stroke-width="0.8" />
                            <path d="M12.5 9 C12.5 7.5 19.5 7.5 19.5 9" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" fill="none" />
                            <circle cx="16" cy="9" r="1.2" fill="#38bdf8" />
                            <line x1="20" y1="14.5" x2="20" y2="18.5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
                            <line x1="23.5" y1="12.5" x2="23.5" y2="19.5" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" />
                            <line x1="27" y1="10.5" x2="27" y2="15.5" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" />
                            <line x1="6" y1="15" x2="13" y2="19" stroke="#38bdf8" stroke-opacity="0.8" stroke-width="1.2" stroke-linecap="round" />
                            <line x1="6" y1="18" x2="13" y2="22" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <span class="nav-3d-tooltip">Dashboard</span>
                </a>
                <!-- Button 2: Module (Premium 3D Icon with Hover Tooltip) -->
                <a href="${getPortalIndexUrl('view=modules')}" class="mep-nav-3d-btn mep-btn-3d-mod" aria-label="Module">
                    <span class="nav-3d-icon-wrap">
                        <svg class="nav-3d-icon-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="rsbModTopGrad1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#fb923c" />
                                    <stop offset="100%" stop-color="#ea580c" />
                                </linearGradient>
                                <linearGradient id="rsbModLeftGrad1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#c2410c" />
                                    <stop offset="100%" stop-color="#9a3412" />
                                </linearGradient>
                                <linearGradient id="rsbModRightGrad1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#ea580c" />
                                    <stop offset="100%" stop-color="#c2410c" />
                                </linearGradient>
                                <linearGradient id="rsbModTopGrad2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#38bdf8" />
                                    <stop offset="100%" stop-color="#0284c7" />
                                </linearGradient>
                                <linearGradient id="rsbModLeftGrad2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0369a1" />
                                    <stop offset="100%" stop-color="#075985" />
                                </linearGradient>
                                <linearGradient id="rsbModRightGrad2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0284c7" />
                                    <stop offset="100%" stop-color="#0369a1" />
                                </linearGradient>
                                <radialGradient id="rsbModShadow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#ea580c" stop-opacity="0.32" />
                                    <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
                                </radialGradient>
                            </defs>
                            <ellipse cx="16" cy="28.5" rx="12" ry="3.5" fill="url(#rsbModShadow)" />
                            <polygon points="4,15.5 11,19.5 11,26 4,22" fill="url(#rsbModLeftGrad1)" />
                            <polygon points="11,19.5 18,15.5 18,22 11,26" fill="url(#rsbModRightGrad1)" />
                            <polygon points="11,13 18,15.5 11,19.5 4,15.5" fill="url(#rsbModTopGrad1)" stroke="#fdba74" stroke-width="0.6" />
                            <polygon points="14,15.5 21,19.5 21,26 14,22" fill="url(#rsbModLeftGrad1)" />
                            <polygon points="21,19.5 28,15.5 28,22 21,26" fill="url(#rsbModRightGrad1)" />
                            <polygon points="21,13 28,15.5 21,19.5 14,15.5" fill="url(#rsbModTopGrad1)" stroke="#fdba74" stroke-width="0.6" />
                            <polygon points="9,7.5 16,11.5 16,18 9,14" fill="url(#rsbModLeftGrad2)" />
                            <polygon points="16,11.5 23,7.5 23,14 16,18" fill="url(#rsbModRightGrad2)" />
                            <polygon points="16,2.5 23,7.5 16,11.5 9,7.5" fill="url(#rsbModTopGrad2)" stroke="#7dd3fc" stroke-width="0.75" />
                            <circle cx="16" cy="7.5" r="1.3" fill="#ffffff" />
                            <circle cx="11" cy="16.5" r="1" fill="#fed7aa" />
                            <circle cx="21" cy="16.5" r="1" fill="#fed7aa" />
                        </svg>
                    </span>
                    <span class="nav-3d-tooltip">Module</span>
                </a>
            </div>

                        <div class="mep-sidebar-body" style="padding: 8px 8px 20px; overflow-y: auto;">
                ${accordionHtml}

                <!-- Gorgeous Luxury Module Switcher (Directly below Item 12 - Master DB) -->
                <div class="sidebar-module-switcher" id="sidebarModuleSwitcher">
                    <div class="mod-switcher-inner" id="sidebarSwitcherLinks">
                        <!-- Dynamically populated -->
                    </div>
                </div>
            </div>
        `;

        // 5. Structure Unified DOM Layout
        document.body.classList.add('has-frozen-sidebar');

        if (!document.getElementById('mepLayoutContainer')) {
            const layoutContainer = document.createElement('div');
            layoutContainer.id = 'mepLayoutContainer';
            layoutContainer.className = 'mep-layout-container';

            const pageContent = document.createElement('div');
            pageContent.id = 'mepPageContent';
            pageContent.className = 'mep-page-content';

            // Move all body children except top navbar into pageContent
            const children = Array.from(document.body.childNodes);
            children.forEach(node => {
                if (node !== nav && node !== aside) {
                    pageContent.appendChild(node);
                }
            });

            layoutContainer.appendChild(aside);
            layoutContainer.appendChild(pageContent);

            if (nav) {
                document.body.insertBefore(nav, document.body.firstChild);
                document.body.appendChild(layoutContainer);
            } else {
                document.body.appendChild(layoutContainer);
            }

            setTimeout(() => {
                const activeModEl = document.querySelector('.mep-module-accordion.is-open');
                if (activeModEl) {
                    activeModEl.scrollIntoView({ block: 'nearest' });
                }
            }, 60);

            // Render Dynamic Alternative Modules Switcher (Excluding Current Production Module)
            if (typeof window.renderSidebarDynamicModels === 'function') {
                window.renderSidebarDynamicModels('production');
            } else {
                renderStandaloneDynamicModels('production');
            }
        }

        function renderStandaloneDynamicModels(forcedActiveKey) {
            const container = document.getElementById('sidebarSwitcherLinks');
            if (!container) return;
            const activeKey = forcedActiveKey || 'production';
            const allModules = [
                {
                    key: 'production',
                    name: 'Production Module',
                    subtitle: 'Manufacturing Hub',
                    theme: 'mod-theme-production',
                    iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>',
                    url: getPortalIndexUrl('view=main')
                },
                {
                    key: 'warehouse',
                    name: 'Warehouse Module',
                    subtitle: 'Inventory & Stock Hub',
                    theme: 'mod-theme-warehouse',
                    iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
                    url: getPortalIndexUrl('view=hub')
                },
                {
                    key: 'hrm',
                    name: 'HRM Module',
                    subtitle: 'Human Resource Portal',
                    theme: 'mod-theme-hrm',
                    iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
                    url: getPortalIndexUrl('view=hrm')
                }
            ];
            const altModules = allModules.filter(function(m) { return m.key !== activeKey; });
            let html = '';
            altModules.forEach(function(m) {
                html += '<a href="' + m.url + '" class="mod-switcher-card ' + m.theme + '" title="Switch to ' + m.name + '">' +
                        '  <div class="mod-switcher-icon-wrap">' +
                        '    ' + m.iconSvg +
                        '  </div>' +
                        '  <div class="mod-switcher-meta">' +
                        '    <span class="mod-switcher-title">' + m.name + '</span>' +
                        '    <span class="mod-switcher-sub">' + m.subtitle + '</span>' +
                        '  </div>' +
                        '  <div class="mod-switcher-arrow-pill">' +
                        '    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                        '  </div>' +
                        '</a>';
            });
            container.innerHTML = html;
        }

                // Dynamic Page Title inside Report Header Box (Matches User Screenshot 4)
        const compTitle = document.querySelector('.company-meta-group h1');
        if (compTitle) {
            compTitle.textContent = activeItemName;
            const compSub = document.querySelector('.company-meta-group .location-text');
            if (compSub) {
                compSub.textContent = 'MEP Fan Ltd. â€¢ Gogon Goli, Barishal.';
            }
        }
                // Live System Clock Updater for Sub-Reports
        function runSubReportLiveClock() {
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dayName = days[now.getDay()];
            const dateNum = now.getDate();
            const monthName = months[now.getMonth()];
            const yearNum = now.getFullYear();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedHours = String(hours).padStart(2, '0');

            const dateStr = `${dayName}, ${dateNum} ${monthName} ${yearNum}`;
            const slottedTime = `<span class="t-digit">${formattedHours[0]}</span><span class="t-digit">${formattedHours[1]}</span><span class="t-colon">:</span><span class="t-digit">${minutes[0]}</span><span class="t-digit">${minutes[1]}</span><span class="t-colon">:</span><span class="t-digit">${seconds[0]}</span><span class="t-digit">${seconds[1]}</span> <span class="t-ampm">${ampm}</span>`;

            document.querySelectorAll('.live-day-text').forEach(function(el) { el.innerText = dateStr; });
            document.querySelectorAll('.live-time-text').forEach(function(el) { el.innerHTML = slottedTime; });
        }
        window.runSubReportLiveClock = function() {
            if (typeof updateUniversalLiveClock === 'function') {
                updateUniversalLiveClock();
            }
        };
        window.updateLiveClock = function() {
            if (typeof updateUniversalLiveClock === 'function') {
                updateUniversalLiveClock();
            }
        };

        updateSidebarClosingStatus();
    }

    // Update Closing ERP Date Badges and Red/Green Status
    function updateSidebarClosingStatus() {
        const reportKeys = ['fan-assemble', 'armature-winding', 'closing-fg', 'closing-all-sfg', 'store-position'];
        let anyHasRed = false;

        reportKeys.forEach(key => {
            const repInfo = resolveClosingReportDate(key, '2026-08-25');
            const dotEl = document.getElementById(`mep-dot-${key}`);
            const itemLink = dotEl ? dotEl.closest('.sub-report-item') : null;
            const tagEl = itemLink ? itemLink.querySelector('.sub-item-status-tag') : null;

            if (tagEl) {
                tagEl.textContent = repInfo.shortDate;
                tagEl.className = `sub-item-status-tag ${repInfo.isLive ? 'tag-updated' : 'tag-outdated'}`;
            }

            if (dotEl) {
                dotEl.className = `sub-item-dot ${repInfo.isLive ? 'status-updated' : 'status-outdated'}`;
                dotEl.title = repInfo.isLive ? `Live & Updated (${repInfo.date})` : `Pending Update! (${repInfo.date})`;
                if (!repInfo.isLive) anyHasRed = true;
            }
        });
    }

    // =========================================================================
    // Global Theme Support for Sub-Report Pages (☀️ Light / 🌙 Dark Mode)
    // =========================================================================
    function initThemeSupport() {
        const savedTheme = localStorage.getItem('mep_portal_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (document.body) {
            document.body.setAttribute('data-theme', savedTheme);
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }
    }
    initThemeSupport();

    // =========================================================================
    // Comprehensive Per-Page Link Information Registry
    // =========================================================================
    const PAGE_LINK_REGISTRY = {
        'check_fg_need_item': {
            title: 'Check FG Need Item',
            path: 'Individual Check → Check FG Need Item',
            desc: 'Calculates raw component requirements, physical floor stock, store availability, and net deficit for target FG production assembly.',
            links: [
                {
                    col: 'Floor Stock',
                    sourcePage: 'Assemble Summary',
                    sourcePageUrl: 'assemble_summary.html',
                    sourceCol: 'Bin Closing',
                    matchKey: 'Item Code',
                    desc: 'Real-time assembly bin stock matched by raw material code'
                },
                {
                    col: 'Store Stock',
                    sourcePage: 'Store Position Report',
                    sourcePageUrl: 'store_position_report.html',
                    sourceCol: 'Store Stock / Balance',
                    matchKey: 'FG Code / Item Code',
                    desc: 'Central store balance extracted from Closing ERP'
                },
                {
                    col: 'Pending',
                    sourcePage: 'Check Floor Stock / All Section SFG',
                    sourcePageUrl: 'report_all_section_sfg.html',
                    sourceCol: 'Total Pending / Assemble Short',
                    matchKey: 'Item Code',
                    desc: 'WIP assembly pending units queued in production'
                }
            ],
            calcs: [
                {
                    target: 'Short Floor',
                    formula: 'Short Floor = Need FG − Floor Stock (0 if Floor Stock ≥ Need FG)'
                },
                {
                    target: 'Need',
                    formula: 'Need = Short Floor − Store Stock (0 if Store Stock ≥ Short Floor)'
                },
                {
                    target: 'Warning Status',
                    formula: 'If Need > 0 ➔ CRITICAL SHORTAGE; If Store Stock ≥ Short Floor ➔ STORE AVAILABLE'
                }
            ],
            visualMap: [
                { sourcePage: 'Assemble Summary', sourceCol: 'Bin Closing', key: 'Item Code Match', targetCol: 'Floor Stock' },
                { sourcePage: 'Store Position Report', sourceCol: 'Store Qty', key: 'FG Code Match', targetCol: 'Store Stock' },
                { sourcePage: 'Check Floor Stock', sourceCol: 'Total Pending', key: 'Item Code Match', targetCol: 'Pending' }
            ]
        },
        'fg_summary': {
            title: 'FG Summary',
            path: 'All Report Summary → FG Summary',
            desc: 'Consolidated Finished Goods stock and production movement ledger linked 100% Code-to-Code with Closing ERP → Finish Good FG.',
            links: [
                {
                    col: 'Opening',
                    sourcePage: 'Finish Good (FG)',
                    sourcePageUrl: 'closing_finish_good_fg.html',
                    sourceCol: 'Opening',
                    matchKey: '100% Item Code ↔ Item Code',
                    desc: 'Opening balance linked from Finish Good FG (Opening Column)'
                },
                {
                    col: 'Production Received',
                    sourcePage: 'Finish Good (FG)',
                    sourcePageUrl: 'closing_finish_good_fg.html',
                    sourceCol: 'Other (Receive Other)',
                    matchKey: '100% Item Code ↔ Item Code',
                    desc: 'Direct Code ↔ Code link from Finish Good FG (Receive Other Column between Transfer Total and Total Stock)'
                },
                {
                    col: 'Delivery',
                    sourcePage: 'Finish Good (FG)',
                    sourcePageUrl: 'closing_finish_good_fg.html',
                    sourceCol: 'Transfer (Issue Transfer)',
                    matchKey: '100% Item Code ↔ Item Code',
                    desc: 'Direct Code ↔ Code link from Finish Good FG (Issue Transfer Column between Sales and Issue Other)'
                },
                {
                    col: 'Closing',
                    sourcePage: 'Finish Good (FG)',
                    sourcePageUrl: 'closing_finish_good_fg.html',
                    sourceCol: 'Bin Closing',
                    matchKey: '100% Item Code ↔ Item Code',
                    desc: 'Direct Code ↔ Code link from Finish Good FG (Bin Closing Column)'
                }
            ],
            calcs: [
                {
                    target: '100% Code-to-Code Matching Rule',
                    formula: 'Destination Item Code == Source Item Code ➔ Actual Data, else 0'
                },
                {
                    target: 'Zero-Fill Rule for Missing/New Codes',
                    formula: 'If Item Code does NOT exist in current Month Source ➔ Opening=0, Prod=0, Delivery=0, Closing=0'
                }
            ],
            visualMap: [
                { sourcePage: 'Closing (ERP) Finish Good (FG)', sourceCol: 'Opening', key: '100% Item Code Match', targetCol: 'Opening' },
                { sourcePage: 'Closing (ERP) Finish Good (FG)', sourceCol: 'Other (Receive)', key: '100% Item Code Match', targetCol: 'Production Received' },
                { sourcePage: 'Closing (ERP) Finish Good (FG)', sourceCol: 'Transfer (Issue)', key: '100% Item Code Match', targetCol: 'Delivery' },
                { sourcePage: 'Closing (ERP) Finish Good (FG)', sourceCol: 'Bin Closing', key: '100% Item Code Match', targetCol: 'Closing' }
            ]
        },
        'bom': {
            title: 'BOM (Bill of Materials)',
            path: 'All Report Summary → BOM',
            desc: 'Defines the exact engineering component breakdown and raw material composition for every Finished Good (FG) model.',
            links: [
                {
                    col: 'FG Model Code',
                    sourcePage: 'Master Central DB',
                    sourcePageUrl: 'master.html',
                    sourceCol: 'Product Code',
                    matchKey: 'FG Model Code',
                    desc: 'Standardized model catalog identification'
                },
                {
                    col: 'SFG Component Code',
                    sourcePage: 'Closing All SFG',
                    sourcePageUrl: 'closing_all_sfg.html',
                    sourceCol: 'Item Code',
                    matchKey: 'SFG Code',
                    desc: 'Sub-assembly part identifier (Blade, Body, Armature, Stator)'
                },
                {
                    col: 'Section',
                    sourcePage: 'All Section SFG',
                    sourcePageUrl: 'report_all_section_sfg.html',
                    sourceCol: 'Section Name',
                    matchKey: 'Part Type',
                    desc: 'Production shop floor routing assignment'
                }
            ],
            calcs: [
                {
                    target: 'Required Component Ratio',
                    formula: 'BOM Ratio = Sub-component Quantity / 1 Unit Finished Good'
                },
                {
                    target: 'Assembly Need Calculation',
                    formula: 'Target FG Units × Component Ratio = Total SFG Quantity Required'
                }
            ],
            visualMap: [
                { sourcePage: 'Master Central DB', sourceCol: 'Model Master', key: 'FG Code Match', targetCol: 'BOM Model Header' },
                { sourcePage: 'Closing All SFG', sourceCol: 'Item Code', key: 'SFG Code Match', targetCol: 'Component Mapping' }
            ]
        },
        'store_position_report': {
            title: 'Store Position Report',
            path: 'Closing (ERP) → Store Position Report',
            desc: 'Daily warehouse inventory ledger containing raw materials, semi-finished components, and packaging balances.',
            links: [
                {
                    col: 'Item Code & Description',
                    sourcePage: 'Central SAP / ERP Export',
                    sourcePageUrl: '#',
                    sourceCol: 'Material Number & Text',
                    matchKey: 'ERP Item Code',
                    desc: 'Extracted directly from ERP closing ledger'
                },
                {
                    col: 'Physical Store Stock',
                    sourcePage: 'Store Ledger / ERP Balance',
                    sourcePageUrl: '#',
                    sourceCol: 'Closing Balance Qty',
                    matchKey: 'Numeric Item ID',
                    desc: 'Sanitized inventory balance after group classification'
                }
            ],
            calcs: [
                {
                    target: 'Item Group Filtering',
                    formula: 'Classifies rows into Fan Raw, SFG Blade, Motors, and Packaging groups'
                },
                {
                    target: 'Downstream Consumption',
                    formula: 'Exported live to Check FG Need Item (Store Stock column)'
                }
            ],
            visualMap: [
                { sourcePage: 'ERP System Export', sourceCol: 'Raw Warehouse File', key: 'Paste / Import', targetCol: 'Store Position Ledger' },
                { sourcePage: 'Store Position Report', sourceCol: 'Store Stock', key: 'Item Code Match', targetCol: 'Check FG Need Item' }
            ]
        },
        'check_floor_stock': {
            title: 'Check Floor Stock',
            path: 'Daily Check Report → Check Floor Stock',
            desc: 'Shop floor component audit reconciling WIP buffers and pending line issuances.',
            links: [
                {
                    col: 'Item Code / Name',
                    sourcePage: 'BOM With SFG',
                    sourcePageUrl: 'bom_with_sfg.html',
                    sourceCol: 'Component Code',
                    matchKey: 'Item Code',
                    desc: 'Active assembly component definitions'
                },
                {
                    col: 'Line Available Stock',
                    sourcePage: 'Assemble Summary',
                    sourcePageUrl: 'assemble_summary.html',
                    sourceCol: 'Bin Closing',
                    matchKey: 'Item Code',
                    desc: 'Current bin stock on assembly floor'
                },
                {
                    col: 'Total Pending',
                    sourcePage: 'Daily Production Received Assemble',
                    sourcePageUrl: 'daily_production_received_assemble.html',
                    sourceCol: 'Pending Units',
                    matchKey: 'Item Code',
                    desc: 'Unassembled batches in transit'
                }
            ],
            calcs: [
                {
                    target: 'Effective Floor Balance',
                    formula: 'Floor Balance = Bin Closing − Buffer Requirement'
                },
                {
                    target: 'Safety Alert Status',
                    formula: 'Red Alert triggered if Floor Balance < Minimum Line Threshold'
                }
            ],
            visualMap: [
                { sourcePage: 'Assemble Summary', sourceCol: 'Bin Closing', key: 'Item Code Match', targetCol: 'Floor Balance' },
                { sourcePage: 'Production Received', sourceCol: 'Pending Queue', key: 'Batch Code', targetCol: 'Total Pending' }
            ]
        },
        'assemble_summary': {
            title: 'Assemble Summary',
            path: 'All Report Summary → Assemble Summary',
            desc: 'Consolidated assembly floor inventory ledger tracking opening, received, dispatch, and bin closing balances across Raw Material, Packing Item, 1. CEILING FAN SERIES (17 Items), SFG, and Consumables.',
            links: [
                {
                    col: 'Ceiling Fan Series (17 Items)',
                    sourcePage: 'FG Summary Report / Closing (ERP) FG',
                    sourcePageUrl: 'fg_summary.html',
                    sourceCol: 'Opening, Production, Delivery, Closing',
                    matchKey: 'Code ↔ Code',
                    desc: 'Live linked finished ceiling fan series dynamically synced from FG Summary & Closing FG'
                },
                {
                    col: 'Opening Balance',
                    sourcePage: 'Previous Assemble Summary / Source ERP',
                    sourcePageUrl: 'assemble_summary.html',
                    sourceCol: 'Bin Closing',
                    matchKey: 'Item Code',
                    desc: 'Closing balance of previous production day'
                },
                {
                    col: 'Production Received',
                    sourcePage: 'Daily Production Received Assemble',
                    sourcePageUrl: 'daily_production_received_assemble.html',
                    sourceCol: 'Daily Qty Received',
                    matchKey: 'Item Code',
                    desc: 'Physical units received into assembly floor'
                },
                {
                    col: 'Issue / Transfer',
                    sourcePage: 'Daily Dispatch Log',
                    sourcePageUrl: '#',
                    sourceCol: 'Issued Units',
                    matchKey: 'Item Code',
                    desc: 'Dispatched to packaging or branch transfer'
                }
            ],
            calcs: [
                {
                    target: 'Bin Closing Formula',
                    formula: 'Bin Closing = Opening + Store Receive + Section Receive + Production Receive + Others Receive − Issue To Damage − Consumption'
                },
                {
                    target: 'Ceiling Fan Dynamic Sync',
                    formula: 'Ceiling Fan Opening, Production Receive, Delivery, Closing ➔ Synced Live from FG Summary (Finish Good - FG)'
                },
                {
                    target: 'Downstream Output',
                    formula: 'Feeds Floor Stock column in Check FG Need Item'
                }
            ],
            visualMap: [
                { sourcePage: 'FG Summary', sourceCol: '1. CEILING FAN SERIES', key: 'Code Match', targetCol: 'Assemble Summary (Fan Series)' },
                { sourcePage: 'Daily Prod Received', sourceCol: 'Received Qty', key: 'Item Code Match', targetCol: 'Production Received' },
                { sourcePage: 'Assemble Summary', sourceCol: 'Bin Closing', key: 'Feeds Downstream', targetCol: 'Check FG Need Item' }
            ]
        },
        'report_all_section_sfg': {
            title: 'All Section SFG',
            path: 'Report All Branch Fan → All Section SFG',
            desc: 'Consolidated branch-wide SFG ledger with strict Code ↔ Code matching from Closing ERP ➔ Closing All SFG.',
            links: [
                {
                    col: 'Opening',
                    sourcePage: 'Closing All SFG',
                    sourcePageUrl: 'closing_all_sfg.html',
                    sourceCol: 'Opening',
                    matchKey: 'Item Code ↔ Item Code',
                    desc: 'Code ↔ Code live sync from Closing All SFG'
                },
                {
                    col: 'Production Receive',
                    sourcePage: 'Closing All SFG',
                    sourcePageUrl: 'closing_all_sfg.html',
                    sourceCol: 'Production Receive',
                    matchKey: 'Item Code ↔ Item Code',
                    desc: 'Code ↔ Code live sync from Closing All SFG'
                },
                {
                    col: 'Delivery',
                    sourcePage: 'Closing All SFG',
                    sourcePageUrl: 'closing_all_sfg.html',
                    sourceCol: 'WIP Issue',
                    matchKey: 'Item Code ↔ Item Code',
                    desc: 'Code ↔ Code live sync from Closing All SFG (WIP Issue)'
                },
                {
                    col: 'Closing',
                    sourcePage: 'Closing All SFG',
                    sourcePageUrl: 'closing_all_sfg.html',
                    sourceCol: 'Bin Closing',
                    matchKey: 'Item Code ↔ Item Code',
                    desc: 'Code ↔ Code live sync from Closing All SFG (Bin Closing)'
                }
            ],
            calcs: [],
            visualMap: [
                { sourcePage: 'Closing All SFG', sourceCol: 'Opening, Prod rcv, WIP Issue, Bin Closing', key: 'Item Code ↔ Item Code', targetCol: 'Opening, Production Receive, Delivery, Closing' }
            ]
        }
    };

    // =========================================================================
    // Global Link Details Modal (Page-Specific Mapping & Flow)
    // =========================================================================
    window.openLinkDetailsModal = function(customPage) {
        const page = (customPage || getCurrentPage() || '').replace('.html', '').toLowerCase();
        let reg = null;

        // Check persistent custom data flow edits from MIS module first
        try {
            const customReg = JSON.parse(localStorage.getItem('portal_page_link_flow_registry') || '{}');
            for (let key in customReg) {
                if (page.includes(key) || key.includes(page)) {
                    reg = customReg[key];
                    break;
                }
            }
        } catch(e) {}

        if (!reg) {
            for (let key in PAGE_LINK_REGISTRY) {
                if (page.includes(key)) {
                    reg = PAGE_LINK_REGISTRY[key];
                    break;
                }
            }
        }

        if (!reg) {
            reg = {
                title: page.replace(/_/g, ' ').toUpperCase(),
                path: 'Portal Navigation → ' + page.replace(/_/g, ' ').toUpperCase(),
                desc: 'Standard production and operational reporting linked to the Central Master Database.',
                links: [
                    {
                        col: 'Item Code & Description',
                        sourcePage: 'Master Central DB',
                        sourcePageUrl: 'master.html',
                        sourceCol: 'Master Item Registry',
                        matchKey: 'Item Code',
                        desc: 'Synchronized with primary product master catalog'
                    },
                    {
                        col: 'Daily Quantities',
                        sourcePage: 'Daily Floor Logs',
                        sourcePageUrl: '#',
                        sourceCol: 'Entry Quantities',
                        matchKey: 'Batch / Date',
                        desc: 'Live verified shop floor records'
                    }
                ],
                calcs: [
                    {
                        target: 'Summary Total',
                        formula: 'Sum of active line quantities grouped by model classification'
                    }
                ],
                visualMap: [
                    { sourcePage: 'Master Central DB', sourceCol: 'Item Code', key: 'Code Match', targetCol: 'Active Page Ledger' }
                ]
            };
        }

        // Build Table Rows
        let tableRowsHtml = '';
        reg.links.forEach(l => {
            tableRowsHtml += `
                <tr>
                    <td><span class="col-tag-current">${l.col}</span></td>
                    <td><strong>${l.sourcePage}</strong></td>
                    <td><span class="col-tag-source">${l.sourceCol}</span></td>
                    <td><span class="col-tag-key">${l.matchKey}</span></td>
                    <td style="color:#64748b; font-size:0.80rem;">${l.desc}</td>
                </tr>
            `;
        });

        // Build Calculation Cards
        let calcsHtml = '';
        reg.calcs.forEach(c => {
            calcsHtml += `
                <div class="calc-rule-card">
                    <div class="calc-rule-target">🧮 ${c.target}</div>
                    <div class="calc-rule-formula">${c.formula}</div>
                </div>
            `;
        });

        // Build Visual Map Rows
        let mapHtml = '';
        reg.visualMap.forEach(m => {
            mapHtml += `
                <div class="visual-map-row">
                    <div class="visual-node">
                        <div class="node-page">${m.sourcePage}</div>
                        <div class="node-col">${m.sourceCol}</div>
                    </div>
                    <div class="visual-arrow-bridge">
                        <span class="match-key">${m.key}</span>
                        <div class="arrow-line"></div>
                    </div>
                    <div class="visual-node" style="border-color:#0284c7; background:#f0f9ff;">
                        <div class="node-page" style="color:#0284c7;">Current Page</div>
                        <div class="node-col" style="color:#0369a1;">${m.targetCol}</div>
                    </div>
                </div>
            `;
        });

        let backdrop = document.getElementById('linkDetailsBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'linkDetailsBackdrop';
            backdrop.className = 'link-details-backdrop';
            backdrop.onclick = function(e) {
                if (e.target === backdrop) window.closeLinkDetailsModal();
            };
            document.body.appendChild(backdrop);
        }

        backdrop.innerHTML = `
            <div class="link-details-dialog" role="dialog" aria-modal="true" aria-labelledby="linkDialogTitle">
                <div class="link-details-header">
                    <div class="link-details-title-wrap">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <span class="link-details-title" id="linkDialogTitle">🔗 Page Link Information &amp; Data Flow</span>
                    </div>
                    <button type="button" class="data-flow-close-btn" onclick="window.closeLinkDetailsModal()" title="Close Guide">✕</button>
                </div>
                <div class="link-details-body">
                    <!-- Page Banner -->
                    <div class="link-page-banner">
                        <div>
                            <div style="font-size:1rem; font-weight:800; color:#0f2942;">📄 ${reg.title}</div>
                            <div style="font-size:0.78rem; color:#64748b; margin-top:2px;">${reg.path}</div>
                        </div>
                        <span class="link-page-badge">Active Page Mapping</span>
                    </div>

                    <!-- Description -->
                    <div style="font-size:0.84rem; color:#475569; line-height:1.45; background:#f8fafc; border-left:3px solid #0284c7; padding:8px 12px; border-radius:0 6px 6px 0;">
                        ${reg.desc}
                    </div>

                    <!-- 1. Column-to-Column Mapping Table -->
                    <div>
                        <div class="link-section-title">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0284c7" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            <span>1. Linked Data Sources &amp; Column Mapping</span>
                        </div>
                        <div class="link-table-wrapper">
                            <table class="link-data-table">
                                <thead>
                                    <tr>
                                        <th>Current Page Column</th>
                                        <th>Source Page</th>
                                        <th>Source Column</th>
                                        <th>Matching Criteria</th>
                                        <th>Functional Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 2. Calculation Rules -->
                    <div>
                        <div class="link-section-title">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d97706" stroke-width="2.2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
                            <span>2. Calculation Rules &amp; Formulas</span>
                        </div>
                        <div class="calc-rules-grid">
                            ${calcsHtml}
                        </div>
                    </div>

                    <!-- 3. Visual Relationship Map -->
                    <div>
                        <div class="link-section-title">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" stroke-width="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            <span>3. Visual Data Relationship Map</span>
                        </div>
                        <div class="visual-map-container">
                            ${mapHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        backdrop.style.display = 'flex';
    };

    window.closeLinkDetailsModal = function() {
        const backdrop = document.getElementById('linkDetailsBackdrop');
        if (backdrop) backdrop.style.display = 'none';
    };

    // Backward compatibility alias
    window.openDataFlowModal = function(customPage) {
        window.openLinkDetailsModal(customPage);
    };
    window.closeDataFlowModal = function() {
        window.closeLinkDetailsModal();
    };

    // Dynamically ensure notification_system.js is loaded
    const _isSubMod = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase().includes('/modules/');
    const _sharedJsPrefix = _isSubMod ? '../../shared/js/' : 'shared/js/';

    if (!document.getElementById('smartNotificationScript')) {
        const nScript = document.createElement('script');
        nScript.id = 'smartNotificationScript';
        nScript.src = _sharedJsPrefix + 'notification_system.js';
        document.head.appendChild(nScript);
    }

    // Dynamically ensure smart_firebase_sync.js is loaded
    if (!document.getElementById('smartFirebaseSyncScript')) {
        const fbScript = document.createElement('script');
        fbScript.id = 'smartFirebaseSyncScript';
        fbScript.src = _sharedJsPrefix + 'smart_firebase_sync.js';
        document.head.appendChild(fbScript);
    }

    // Enforce View-Only restrictions when in Viewer mode
    function enforceViewOnlyRestrictions() {
        if (!isCurrentUserViewOnly()) return;

        // Ensure portal-view-only is attached to root and body immediately
        if (document.documentElement) document.documentElement.classList.add('portal-view-only');
        if (document.body) document.body.classList.add('portal-view-only');

        // Function to strip and lock all editing elements in DOM
        function stripAndLockDOM() {
            if (!isCurrentUserViewOnly()) return;

            // 1. Hide/remove any edit/add/delete/save/import/paste/update/reset buttons
            const blockedSelectors = [
                '.btn-add', '.btn-save', '.btn-edit', '.btn-delete', '.btn-import', '.btn-paste',
                '.btn-save-plan', '.btn-add-item', '.btn-new-entry', '.btn-delete-entry',
                '.btn-edit-entry', '.btn-row-delete', '.btn-row-add', '.btn-sync-yearly',
                '.btn-save-stock', '.btn-save-bom', '.action-btn-delete', '.action-btn-edit',
                '.edit-action-btn', '.delete-action-btn', '.action-col', '.col-action',
                '.col-actions', '.th-action', '.td-action', '.th-actions', '.td-actions',
                '.table-action-cell', '.table-actions-cell', '.actions-column', '.actions-col',
                '.actions-cell', '.action-cell', '#settingsTabAccess', '#savePermissionsBtn',
                '.btn-update-entry', '.btn-update', '.btn-reset', '.btn-action.btn-reset',
                '.btn-corp-primary', '.btn-corp-outline', '.btn-action-paste', '.btn-action-purple',
                '.btn-table-edit', '.btn-table-del', '.btn-del-row',
                '.btn-col-settings:not(#btnLinkDetails)', '#btnColSettings',
                '#addItemModal', '#pasteModal', '#addDamageModal', '#bulkPasteModal',
                '#addMasterModal', '#columnSettingsModal',
                'button[onclick*="save" i]', 'button[onclick*="openAdd" i]',
                'button[onclick*="openNew" i]:not([onclick*="openlinkdetails" i]):not([onclick*="opendataflow" i])',
                'button[onclick*="openPaste" i]', 'button[onclick*="openBulk" i]',
                'button[onclick*="openColSettings" i]', 'button[onclick*="openColumnSettings" i]',
                'button[onclick*="handleUpdateClick" i]', 'button[onclick*="update" i]',
                'button[onclick*="reset" i]', 'button[onclick*="sync" i]',
                'button[onclick*="recalculate" i]',
                'button[onclick*="delete" i]', 'button[onclick*="edit" i]',
                'button[onclick*="import" i]', 'button[onclick*="paste" i]',
                'button[onclick*="insert" i]',
                'a[onclick*="save" i]', 'a[onclick*="openAdd" i]',
                'a[onclick*="openNew" i]:not([onclick*="openlinkdetails" i]):not([onclick*="opendataflow" i])',
                'a[onclick*="openPaste" i]', 'a[onclick*="delete" i]', 'a[onclick*="edit" i]',
                '[data-action="edit"]', '[data-action="delete"]', '[data-action="add"]',
                '[data-action="save"]', '[data-action="update"]', '[data-action="reset"]'
            ];

            blockedSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                    el.setAttribute('hidden', 'true');
                    el.setAttribute('disabled', 'true');
                    el.onclick = null;
                });
            });

            // 2. Disable contenteditable cells in tables
            document.querySelectorAll('[contenteditable], [contenteditable="true"], [contenteditable="false"]').forEach(cell => {
                cell.setAttribute('contenteditable', 'false');
                cell.style.cursor = 'default';
                cell.style.userSelect = 'text';
                cell.style.pointerEvents = 'none';
            });

            // 3. Freeze all select dropdowns across the page
            document.querySelectorAll('select').forEach(sel => {
                sel.disabled = true;
                sel.style.pointerEvents = 'none';
                sel.style.cursor = 'not-allowed';
                sel.style.backgroundColor = '#f8fafc';
            });

            // 4. Disable all inputs and textarea fields (except search boxes)
            document.querySelectorAll('input, textarea').forEach(inp => {
                const id = (inp.id || '').toLowerCase();
                const type = (inp.type || '').toLowerCase();
                if (type === 'search' || id.includes('search')) {
                    // allow live table search typing
                    return;
                }
                inp.readOnly = true;
                inp.disabled = true;
                inp.style.cursor = 'not-allowed';
                inp.style.pointerEvents = 'none';
                inp.style.backgroundColor = '#f8fafc';
                inp.style.opacity = '0.9';
            });

            // 5. Page-specific protections for check_fg_need_item.html
            const sfgSelect = document.getElementById('selectSfgCode');
            if (sfgSelect) {
                sfgSelect.disabled = true;
                sfgSelect.style.pointerEvents = 'none';
                sfgSelect.style.cursor = 'not-allowed';
                sfgSelect.style.backgroundColor = '#f8fafc';
                sfgSelect.title = 'SFG Code is locked in View-Only mode';
            }
            const sfgLabel = document.querySelector('.interactive-entry-bar .entry-group:nth-child(1) .entry-label');
            if (sfgLabel && !sfgLabel.querySelector('.view-lock-badge')) {
                sfgLabel.innerHTML = 'SFG Code <span class="view-lock-badge" style="font-size:0.75rem; color:#64748b; font-weight:700;">(🔒 Locked)</span>';
            }

            const qtyInput = document.getElementById('inputQuantity');
            if (qtyInput) {
                qtyInput.readOnly = true;
                qtyInput.disabled = true;
                qtyInput.style.pointerEvents = 'none';
                qtyInput.style.backgroundColor = '#f1f5f9';
                qtyInput.style.cursor = 'not-allowed';
                qtyInput.title = 'Production Quantity is locked in View-Only mode';
            }
            const updateBtn = document.querySelector('.btn-update-entry');
            if (updateBtn) {
                updateBtn.style.setProperty('display', 'none', 'important');
            }
            const colSettingsBtn = document.getElementById('btnColSettings');
            if (colSettingsBtn) {
                colSettingsBtn.style.setProperty('display', 'none', 'important');
            }
            const sfgHeaderTitle = document.querySelector('.top-sfg-title span');
            if (sfgHeaderTitle && sfgHeaderTitle.textContent.includes('Quantity Input')) {
                sfgHeaderTitle.textContent = 'Automatic SFG Code Lookup & BOM Requirements Viewer';
            }
            const prodQtyLabel = document.querySelector('.interactive-entry-bar .entry-group:nth-child(3) .entry-label');
            if (prodQtyLabel && !prodQtyLabel.querySelector('.view-lock-badge')) {
                prodQtyLabel.innerHTML = 'Production Quantity <span class="view-lock-badge" style="font-size:0.75rem; color:#64748b; font-weight:700;">(🔒 Locked: Standard Batch)</span>';
            }
        }

        // Run immediately
        stripAndLockDOM();

        // Tamper-proofing MutationObserver (prevents DevTools class removal or unhiding)
        const securityObserver = new MutationObserver(() => {
            if (document.body && !document.body.classList.contains('portal-view-only')) {
                document.body.classList.add('portal-view-only');
            }
            if (document.documentElement && !document.documentElement.classList.contains('portal-view-only')) {
                document.documentElement.classList.add('portal-view-only');
            }
            stripAndLockDOM();
        });

        if (document.documentElement) {
            securityObserver.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style', 'contenteditable', 'disabled']
            });
        }

        // Capturing Event Interceptors (Zero Execution Guarantee)
        const CAPTURE_BLOCKED_TERMS = [
            'save', 'add', 'delete', 'edit', 'insert', 'import', 'paste', 'remove', 'modify',
            'update', 'reset', 'sync', 'recalculate'
        ];

        window.addEventListener('click', function(e) {
            if (!isCurrentUserViewOnly()) return;

            // Allow navigation in portal navbar, frozen sidebar, user profile modal, notifications, and link details modal
            if (e.target.closest('.portal-nav, #frozenSidebar, .mep-frozen-sidebar, .smart-user-profile-modal, #notificationBackdrop, #linkDetailsBackdrop')) {
                return;
            }

            const target = e.target.closest('button, a, input, select, textarea, [role="button"]');
            if (!target) return;

            const classList = (target.className || '').toLowerCase();
            const onclickAttr = (target.getAttribute('onclick') || '').toLowerCase();
            const id = (target.id || '').toLowerCase();
            const btnText = (target.textContent || '').trim().toLowerCase();
            const actionAttr = (target.getAttribute('data-action') || '').toLowerCase();

            // Safe actions whitelist (exports, downloads, prints, link details modal, modal close, and page navigations)
            const isNavigation = (
                (target.tagName === 'A' && (target.getAttribute('href') || '').trim() && target.getAttribute('href') !== '#') ||
                onclickAttr.includes('location.href') || onclickAttr.includes('window.location') || onclickAttr.includes('navigateto')
            );
            const isSafeAction = (
                isNavigation ||
                classList.includes('btn-export') || classList.includes('btn-print') ||
                classList.includes('btn-export-excel') || id === 'btnexportexcel' ||
                (classList.includes('btn-col-settings') && id === 'btnlinkdetails') ||
                id === 'btnlinkdetails' ||
                onclickAttr.includes('export') || onclickAttr.includes('download') ||
                onclickAttr.includes('print') || onclickAttr.includes('openlinkdetails') ||
                onclickAttr.includes('closelinkdetails') || onclickAttr.includes('modal-close')
            );

            if (isSafeAction) return;

            // Block clicks on selects, inputs, textareas
            if (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                if (target.type === 'search' || id.includes('search')) return;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                showViewOnlyToast();
                return false;
            }

            const isBlocked = CAPTURE_BLOCKED_TERMS.some(term =>
                classList.includes(term) || onclickAttr.includes(term) || btnText.includes(term) || actionAttr.includes(term) || id.includes(term)
            );

            if (isBlocked) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                showViewOnlyToast();
                return false;
            }
        }, true);

        // Block change and input events on non-search elements in capturing mode
        ['change', 'input'].forEach(evtType => {
            window.addEventListener(evtType, function(e) {
                if (!isCurrentUserViewOnly()) return;
                const target = e.target;
                if (!target) return;
                const id = (target.id || '').toLowerCase();
                const type = (target.type || '').toLowerCase();
                if (type === 'search' || id.includes('search')) return;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                showViewOnlyToast();
                return false;
            }, true);
        });

        // Block keyboard modifications in contenteditable cells or disabled inputs
        window.addEventListener('keydown', function(e) {
            if (!isCurrentUserViewOnly()) return;
            const target = e.target;
            if (target && (target.isContentEditable || target.getAttribute('contenteditable') === 'true')) {
                e.preventDefault();
                e.stopPropagation();
                showViewOnlyToast();
                return false;
            }
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                const id = (target.id || '').toLowerCase();
                const type = (target.type || '').toLowerCase();
                const isSafeSearchOrFilter = (type === 'search' || id.includes('search'));
                if (!isSafeSearchOrFilter) {
                    e.preventDefault();
                    e.stopPropagation();
                    showViewOnlyToast();
                    return false;
                }
            }
        }, true);

        // Block paste and drop
        ['paste', 'drop'].forEach(evtType => {
            window.addEventListener(evtType, function(e) {
                if (!isCurrentUserViewOnly()) return;
                const target = e.target;
                const id = (target && target.id ? target.id : '').toLowerCase();
                if (!id.includes('search')) {
                    e.preventDefault();
                    e.stopPropagation();
                    showViewOnlyToast();
                    return false;
                }
            }, true);
        });

        // Global Data-Modifying Function Neutralization
        const PROTECTED_FUNCTIONS = [
            'saveStateToStorage', 'saveBOMData', 'editItem', 'deleteItem', 'saveStockData',
            'saveDataset', 'saveCurrentPlan', 'updateItemField', 'saveNewItem', 'deleteItemRow',
            'updateDamageQty', 'deleteDamageRecord', 'saveDamageData', 'saveItem',
            'saveViewPermissions', 'saveDemandData', 'saveAndSyncToYearlyERP',
            'handleSaveNewEntry', 'deleteEntry', 'saveCustomEntries', 'saveTableData',
            'processBulkPaste', 'saveColumnVisibility', 'openNewEntryModal', 'openPasteModal',
            'openColumnSettingsModal', 'openColSettings',
            'resetToDefaultData', 'resetToDefault', 'resetToBaseline', 'resetDefaults',
            'submitNewItem', 'submitNewDamageEntry', 'openAddItemModal',
            'openAddDamageModal', 'openBulkModal', 'openBulkPasteModal',
            'openAddMasterModal', 'processErpPaste',
            'handleCellEdit', 'handleOpeningEdit', 'onRMCodeInput'
        ];

        PROTECTED_FUNCTIONS.forEach(fn => {
            try {
                Object.defineProperty(window, fn, {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        return function() {
                            console.warn(`🔒 [Security Guard] Blocked execution of ${fn}() in View-Only mode.`);
                            showViewOnlyToast();
                            return false;
                        };
                    },
                    set: function() { /* Prevent override */ }
                });
            } catch(e) {}
        });
    }

    // Run enforceViewOnlyRestrictions and initPageLockProtection immediately on script evaluation
    enforceViewOnlyRestrictions();
    initPageLockProtection();

    function showViewOnlyToast() {
        let toast = document.getElementById('viewOnlyToastAlert');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'viewOnlyToastAlert';
            toast.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#0f2942; color:#ffffff; padding:10px 22px; border-radius:10px; font-size:0.86rem; font-weight:800; z-index:999999; box-shadow:0 8px 24px rgba(15,41,66,0.3); display:flex; align-items:center; gap:8px; pointer-events:none; transition:opacity 0.25s ease; opacity:0;';
            toast.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#38bdf8" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>🔒 View Only Mode: You can view all data, but data entry and editing are disabled.</span>
            `;
            document.body.appendChild(toast);
        }
        toast.style.opacity = '1';
        clearTimeout(window._viewOnlyToastTimeout);
        window._viewOnlyToastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    // Universal Live Clock Engine for Report Pages - Tabular Monospace Zero Jitter Engine
    let _lastClockSecond = -1;
    function updateUniversalLiveClock(force) {
        const now = new Date();
        const curSecond = now.getSeconds();
        if (!force && _lastClockSecond === curSecond) return;
        _lastClockSecond = curSecond;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const formattedHours = String(hours).padStart(2, '0');

        const slottedTime = `<span class="t-digit">${formattedHours[0]}</span><span class="t-digit">${formattedHours[1]}</span><span class="t-colon">:</span><span class="t-digit">${minutes[0]}</span><span class="t-digit">${minutes[1]}</span><span class="t-colon">:</span><span class="t-digit">${seconds[0]}</span><span class="t-digit">${seconds[1]}</span> <span class="t-ampm">${ampm}</span>`;

        document.querySelectorAll('#liveDayText, .live-day-text').forEach(el => {
            if (el.textContent !== dateStr) el.textContent = dateStr;
        });
        document.querySelectorAll('#liveTimeText, .live-time-text, #liveClockText, .live-clock-text').forEach(el => {
            if (el.innerHTML !== slottedTime) el.innerHTML = slottedTime;
        });
    }

    function formatToSlottedTime(val) {
        if (typeof val === 'string' && val.includes(':')) {
            const clean = val.replace(/[\u202F\u00A0]/g, ' ').trim();
            const parts = clean.split(/[:\s]+/);
            if (parts.length >= 3) {
                const hh = parts[0].padStart(2, '0');
                const mm = parts[1].padStart(2, '0');
                const ss = parts[2].padStart(2, '0');
                const ap = (parts[3] || 'AM').toUpperCase();
                return `<span class="t-digit">${hh[0]}</span><span class="t-digit">${hh[1]}</span><span class="t-colon">:</span><span class="t-digit">${mm[0]}</span><span class="t-digit">${mm[1]}</span><span class="t-colon">:</span><span class="t-digit">${ss[0]}</span><span class="t-digit">${ss[1]}</span> <span class="t-ampm">${ap}</span>`;
            }
        }
        return val;
    }

    // Tamper-proof setter protection against legacy scripts setting raw innerText or textContent
    function guardLiveTimeElements() {
        document.querySelectorAll('#liveTimeText, .live-time-text, #liveClockText, .live-clock-text').forEach(el => {
            if (!el._timeGuarded) {
                el._timeGuarded = true;
                Object.defineProperty(el, 'innerText', {
                    configurable: true,
                    enumerable: true,
                    get: function() { return this.textContent; },
                    set: function(val) {
                        const formatted = formatToSlottedTime(val);
                        if (this.innerHTML !== formatted) this.innerHTML = formatted;
                    }
                });
                Object.defineProperty(el, 'textContent', {
                    configurable: true,
                    enumerable: true,
                    get: function() { return this.innerHTML; },
                    set: function(val) {
                        const formatted = formatToSlottedTime(val);
                        if (this.innerHTML !== formatted) this.innerHTML = formatted;
                    }
                });
            }
        });

        document.querySelectorAll('#liveDayText, .live-day-text').forEach(el => {
            if (!el._dayGuarded) {
                el._dayGuarded = true;
                const normalizeDay = function(val) {
                    if (typeof val === 'string') {
                        const shortMap = {
                            'Sun,': 'Sunday,',
                            'Mon,': 'Monday,',
                            'Tue,': 'Tuesday,',
                            'Wed,': 'Wednesday,',
                            'Thu,': 'Thursday,',
                            'Fri,': 'Friday,',
                            'Sat,': 'Saturday,'
                        };
                        for (let k in shortMap) {
                            if (val.startsWith(k)) {
                                return val.replace(k, shortMap[k]);
                            }
                        }
                    }
                    return val;
                };
                Object.defineProperty(el, 'innerText', {
                    configurable: true,
                    enumerable: true,
                    get: function() { return this.textContent; },
                    set: function(val) {
                        this.textContent = normalizeDay(val);
                    }
                });
            }
        });
    }

    // Global neutralization of page-level competing timers & functions
    window.updateUniversalLiveClock = updateUniversalLiveClock;
    window.updateLiveClock = updateUniversalLiveClock;
    window.updateClock = updateUniversalLiveClock;
    window.initLiveClock = function() {
        updateUniversalLiveClock(true);
    };

    function bootAllServices() {
        if (typeof window.exportSystemDataBackup !== 'function' && !document.querySelector('script[src*="data_backup_engine.js"]')) {
            const _sub = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase().includes('/modules/');
            const backupScript = document.createElement('script');
            backupScript.src = (_sub ? '../../shared/js/' : 'shared/js/') + 'data_backup_engine.js';
            document.head.appendChild(backupScript);
        }
        initFrozenSidebar();
        enforceViewOnlyRestrictions();
        initPageLockProtection();
        guardLiveTimeElements();
        if (!window._universalLiveClockInterval) {
            window._universalLiveClockInterval = setInterval(updateUniversalLiveClock, 1000);
        }
        updateUniversalLiveClock();
        setTimeout(guardLiveTimeElements, 500);

        // Realtime sync for centralized lock/unlock changes
        window.addEventListener('storage', function(e) {
            if (e.key === 'portal_page_lock_states' || e.key === 'portal_view_only') {
                applyCentralLockState();
            }
        });
        window.addEventListener('portal_lock_change', function() {
            applyCentralLockState();
        });
        window.addEventListener('smart_cloud_sync', function(e) {
            if (e.detail && (e.detail.key === 'portal_page_lock_states' || e.detail.key === 'portal_view_only')) {
                applyCentralLockState();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootAllServices);
    } else {
        bootAllServices();
    }
})();