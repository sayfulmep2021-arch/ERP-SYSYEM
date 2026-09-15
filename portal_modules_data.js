/**
 * MEP Portal - Central Report Modules Master Data & Dynamic Menus Generator
 * Manages Master Data, Left Sidebar Accordions, and Slide-in Reports Drawer
 */
(function(window) {
    'use strict';

    const REPORT_MODULES_DATA = {
        'mod-01': {
            name: 'All Report Summary',
            badge: '5 Reports',
            iconBg: '#e0f2fe',
            iconColor: '#0284c7',
            iconSvg: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
            reports: [
                { title: 'Production Plan', url: 'production_plan.html', highlight: true },
                { title: 'Monthly RM Demand Vs Received', url: 'monthly_rm_demand_vs_received.html', highlight: true },
                { title: 'Assemble Summary', url: 'assemble_summary.html' },
                { title: 'Armature Summary', url: 'armature_summary.html' },
                { title: 'FG Summary', url: 'fg_summary.html' },
                { title: 'BOM', url: 'bom.html' },
                { title: 'RM Requirement Summary (BOM)', url: 'rm_requirement_summary_bom.html' }
            ]
        },
        'mod-02': {
            name: 'Daily Check Report',
            badge: '8 Reports',
            iconBg: '#fef3c7',
            iconColor: '#d97706',
            iconSvg: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
            reports: [
                { title: 'Daily FG Production Entry', url: 'daily_fg_production_entry.html', highlight: true },
                { title: 'Daily Production Received Assemble (All)', url: 'daily_production_received_assemble.html', highlight: true },
                { title: 'Inter Company Received', url: '#', hideInSidebar: true },
                { title: 'All Section RM', url: '#', hideInSidebar: true },
                { title: 'Daily Production Plan', url: 'daily_production_plan.html', highlight: true },
                { title: 'Safety Stock SFG', url: '#', hideInSidebar: true },
                { title: 'Check Floor Stock', url: 'check_floor_stock.html' },
                { title: 'Fan Damage Calculation Entry', url: 'fan_damage_calculation_entry.html', highlight: true }
            ]
        },
        'mod-03': {
            name: 'Report All Branch Fan',
            badge: '160 Items',
            iconBg: '#d1fae5',
            iconColor: '#059669',
            iconSvg: '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path><path d="M12 9v-7"></path><path d="M12 15v7"></path><path d="M15 12h7"></path><path d="M9 12h-7"></path>',
            reports: [
                { title: 'All Section SFG', url: 'report_all_section_sfg.html', highlight: true, pill: '160 ITEMS' }
            ]
        },
        'mod-04': {
            name: 'Closing (ERP)',
            badge: 'LIVE ERP',
            iconBg: '#fee2e2',
            iconColor: '#dc2626',
            iconSvg: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
            isClosing: true,
            reports: [
                { id: 'fan-assemble', title: 'Fan Assemble', url: 'fan_assemble_erp.html', defaultDate: '2026-08-25' },
                { id: 'armature-winding', title: 'Armature & Winding', url: 'armature_winding_erp.html', defaultDate: '2026-08-26' },
                { id: 'closing-fg', title: 'Finish Good (FG)', url: 'closing_finish_good_fg.html', defaultDate: '2026-08-26', highlight: true },
                { id: 'closing-all-sfg', title: 'Closing All SFG', url: 'closing_all_sfg.html', defaultDate: '2026-08-20', highlight: true },
                { id: 'store-position', title: 'Store Position Report', url: 'store_position_report.html', defaultDate: '2026-08-26', highlight: true }
            ]
        },
        'mod-05': {
            name: 'All Monthly Report',
            badge: '2 Reports',
            iconBg: '#f3e8ff',
            iconColor: '#7c3aed',
            iconSvg: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
            reports: [
                { title: 'Monthly Production Summary', url: 'monthly_production_summary_physical.html', highlight: true },
                { title: 'Monthly Damage Summary', url: 'monthly_damage_summary.html', highlight: true }
            ]
        },
        'mod-06': {
            name: 'All Yearly Report',
            badge: '3 Reports',
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
            iconSvg: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
            reports: [
                { title: 'Yearly Production Summary (Physical)', url: 'yearly_production_summary_physical.html', highlight: true },
                { title: 'Yearly Production Summary (ERP)', url: 'yearly_production_summary_erp.html', highlight: true },
                { title: 'Yearly Damage Summary', url: 'yearly_damage_summary.html', highlight: true }
            ]
        },
        'mod-07': {
            name: 'Reject Report',
            badge: '2 Reports',
            iconBg: '#ffedd5',
            iconColor: '#ea580c',
            iconSvg: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
            reports: [
                { title: 'Assemble Reject', url: '#' },
                { title: 'All Section Reject', url: '#' }
            ]
        },
        'mod-08': {
            name: 'Complete vs Pending',
            badge: '1 Report',
            iconBg: '#e0e7ff',
            iconColor: '#4f46e5',
            iconSvg: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
            reports: [
                { title: 'FG Pending Report', url: 'fg_pending_report.html', highlight: true }
            ]
        },
        'mod-pending': {
            name: 'Complete vs Pending',
            badge: '1 Report',
            iconBg: '#e0e7ff',
            iconColor: '#4f46e5',
            iconSvg: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
            reports: [
                { title: 'FG Pending Report', url: 'fg_pending_report.html', highlight: true }
            ]
        },
        'mod-09': {
            name: 'Fan Floor Closing Report',
            badge: '3 Reports',
            iconBg: '#ecfccb',
            iconColor: '#65a30d',
            iconSvg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
            reports: [
                { title: 'Daily Floor Closing Summary', url: '#' },
                { title: 'Shift Production Reconciliation', url: '#' },
                { title: 'Floor Material Return Report', url: '#' }
            ]
        },
        'mod-10': {
            name: 'Other Reports',
            badge: '3 Reports',
            iconBg: '#f1f5f9',
            iconColor: '#475569',
            iconSvg: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',
            reports: [
                { title: 'Month wish Assemble Summary', url: 'assemble_summary.html' },
                { title: 'Month wish Armature Summary', url: 'armature_summary.html' },
                { title: 'Yearly FG Summary ERP', url: 'yearly_production_summary_erp.html' }
            ]
        },
        'mod-11': {
            name: 'Individual Check',
            badge: '3 Reports',
            iconBg: '#ecfeff',
            iconColor: '#0891b2',
            iconSvg: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
            reports: [
                { title: 'Check FG Need Item', url: 'check_fg_need_item.html', highlight: true },
                { title: 'Check RM (Prd. Possible)', url: 'check_rm_prd_possible.html', highlight: true },
                { title: 'BOM With SFG', url: 'bom_with_sfg.html', highlight: true }
            ]
        },
        'mod-backup': {
            name: 'Data Backup',
            badge: 'Backup & Restore',
            iconBg: '#ecfdf5',
            iconColor: '#059669',
            iconSvg: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>',
            reports: [
                { title: 'Download Full Backup (JSON)', url: 'javascript:window.exportSystemDataBackup()', highlight: true, pill: 'BACKUP' },
                { title: 'Data Backup & Recovery Hub', url: 'javascript:window.openDataBackupModal()', highlight: false }
            ]
        },
        'mod-master': {
            name: 'MASTER Central DB',
            badge: 'VIP DB',
            iconBg: '#1e293b',
            iconColor: '#38bdf8',
            iconSvg: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
            reports: [
                { title: 'Central Item Master Database', url: 'master.html', highlight: true, pill: 'VIP DB' }
            ]
        }
    };

    // Sidebar Accordion Order without serial numbers and with Data Backup above MASTER Central DB
    const SIDEBAR_MODULE_ORDER = [
        { key: 'mod-02', id: 'mep-acc-02', title: 'Daily Check Report' },
        { key: 'mod-03', id: 'mep-acc-03', title: 'Report All Branch Fan' },
        { key: 'mod-11', id: 'mep-acc-11', title: 'Individual Check' },
        { key: 'mod-04', id: 'mep-acc-04', title: 'Closing (ERP)', isClosing: true },
        { key: 'mod-01', id: 'mep-acc-01', title: 'All Report Summary' },
        { key: 'mod-05', id: 'mep-acc-05', title: 'All Monthly Report' },
        { key: 'mod-06', id: 'mep-acc-06', title: 'All Yearly Report' },
        { key: 'mod-07', id: 'mep-acc-07', title: 'Reject Report' },
        { key: 'mod-backup', id: 'mep-acc-backup', title: 'Data Backup' },
        { key: 'mod-master', id: 'mep-acc-master', title: 'MASTER Central DB' }
    ];

    // Drawer Accordion Order matching cleaned sidebar
    const DRAWER_MODULE_ORDER = [
        { key: 'mod-02', suffix: '02' },
        { key: 'mod-03', suffix: '03' },
        { key: 'mod-11', suffix: '11' },
        { key: 'mod-04', suffix: '04' },
        { key: 'mod-01', suffix: '01' },
        { key: 'mod-05', suffix: '05' },
        { key: 'mod-06', suffix: '06' },
        { key: 'mod-07', suffix: '07' },
        { key: 'mod-backup', suffix: 'backup' },
        { key: 'mod-master', suffix: 'master' }
    ];

    /**
     * Helper to resolve closing date & live/outdated condition matching report_sidebar.js
     */
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
            try {
                const val = localStorage.getItem(k);
                if (val && val.trim()) { foundRaw = val.trim(); break; }
            } catch(e) {}
        }
        
        let date = fallbackDefault || todayStr;
        if (foundRaw) {
            const match = foundRaw.match(/(\d{4}-\d{2}-\d{2})\s*$/);
            if (match) date = match[1];
            else {
                const single = foundRaw.match(/(\d{4}-\d{2}-\d{2})/);
                if (single) date = single[1];
            }
        }
        
        const isLive = (date >= todayStr);
        const shortDate = (date && date.length >= 10) ? date.slice(5) : (date || '');
        return { date, shortDate, isLive };
    }

    /**
     * Dynamically Render Left Dashboard Sidebar
     */
    function renderDashboardSidebarMenu(containerId) {
        const container = document.getElementById(containerId || 'dashboardSidebarModulesContainer');
        if (!container) return;

        let html = '';
        SIDEBAR_MODULE_ORDER.forEach(mod => {
            const data = REPORT_MODULES_DATA[mod.key];
            if (!data) return;

            let subItemsHtml = '';
            (data.reports || []).forEach(rep => {
                if (rep.hideInSidebar) return;

                if (mod.isClosing) {
                    const repInfo = resolveClosingReportDate(rep.id, rep.defaultDate || '2026-08-25');
                    const dotClass = 'sub-item-dot ' + (repInfo.isLive ? 'status-updated' : 'status-outdated');
                    const statusTagHtml = `<span class="sub-item-status-tag ${repInfo.isLive ? 'tag-updated' : 'tag-outdated'}" id="sidebar-tag-${rep.id}">${repInfo.shortDate}</span>`;

                    subItemsHtml += `
                        <a href="${rep.url}" class="sub-report-item" style="margin-bottom: 5px; text-decoration: none !important;" title="${rep.title}" onclick="handleSubItemClick(this)">
                            <div class="sub-item-left">
                                <span class="${dotClass}" id="sidebar-dot-${rep.id}"></span>
                                <span class="sub-item-title">${rep.title}</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                ${statusTagHtml}
                                <svg class="sub-item-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </div>
                        </a>
                    `;
                } else {
                    subItemsHtml += `
                        <a href="${rep.url}" class="sub-report-item" style="margin-bottom: 5px; text-decoration: none !important;" title="${rep.title}" onclick="handleSubItemClick(this)">
                            <div class="sub-item-left"><span class="sub-item-dot"></span><span class="sub-item-title">${rep.title}</span></div>
                            <svg class="sub-item-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </a>
                    `;
                }
            });

            html += `
                <div class="mep-module-accordion" id="mep-acc-group-${mod.id}">
                    <div class="mep-module-heading mep-heading-${mod.id}" onclick="toggleSidebarModule('${mod.id}')" title="Click to open/collapse ${mod.title}">
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
                    <div class="mep-module-sublist sub-report-list" id="mep-acc-body-${mod.id}">
                        ${subItemsHtml}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        if (typeof window.collapseAllSidebarModules === 'function') {
            window.collapseAllSidebarModules();
        }
    }

    /**
     * Dynamically Render Slide-in Reports Drawer
     */
    function renderReportsDrawerMenu(containerId) {
        const container = document.getElementById(containerId || 'reportsContainer');
        if (!container) return;

        let html = '';
        DRAWER_MODULE_ORDER.forEach(item => {
            const data = REPORT_MODULES_DATA[item.key];
            if (!data) return;

            if (item.key === 'mod-master') {
                html += `
                    <div class="accordion-card master-menu-card" id="accordion-master" onclick="navigateToReportPage('master.html', event)" role="button" tabindex="0" title="Click to open Central Master Database Management" onkeydown="if(event.key==='Enter'||event.key===' ') navigateToReportPage('master.html', event)">
                        <div class="accordion-header master-header-btn">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span class="master-icon-badge">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                                </span>
                                <div>
                                    <span class="card-title master-title-text">MASTER</span>
                                    <div style="font-size:0.62rem; color:#c7d2fe; font-weight:600;">Central Database &amp; Code Mapping</div>
                                </div>
                            </div>
                            <span class="master-action-tag">Open ›</span>
                        </div>
                    </div>
                `;
                return;
            }

            let subItemsHtml = '';
            (data.reports || []).forEach(rep => {
                if (rep.url && rep.url !== '#') {
                    if (data.isClosing) {
                        const repInfo = resolveClosingReportDate(rep.id, rep.defaultDate || '2026-08-25');
                        const dotClass = 'sub-item-dot ' + (repInfo.isLive ? 'status-updated' : 'status-outdated');
                        subItemsHtml += `
                            <button type="button" class="sub-report-item${rep.highlight ? ' item-highlight-entry' : ''}" onclick="navigateToReportPage('${rep.url}', event)">
                                <div class="sub-item-left">
                                    <span class="${dotClass}" id="dot-${rep.id}"></span>
                                    <span class="sub-item-title">${rep.title}</span>
                                </div>
                                <span class="sub-item-status-tag ${repInfo.isLive ? 'tag-updated' : 'tag-outdated'}" id="tag-${rep.id}">${repInfo.shortDate}</span>
                                <svg class="sub-item-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        `;
                    } else {
                        subItemsHtml += `
                            <button type="button" class="sub-report-item${rep.highlight ? ' item-highlight-entry' : ''}" onclick="navigateToReportPage('${rep.url}', event)">
                                <div class="sub-item-left">
                                    <span class="sub-item-dot"></span>
                                    <span class="sub-item-title">${rep.title}</span>
                                </div>
                                <svg class="sub-item-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        `;
                    }
                } else {
                    subItemsHtml += `
                        <button type="button" class="sub-report-item" onclick="handleSubReportClick('${data.name}', '${rep.title}', event)">
                            <div class="sub-item-left">
                                <span class="sub-item-dot"></span>
                                <span class="sub-item-title">${rep.title}</span>
                            </div>
                            <svg class="sub-item-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    `;
                }
            });

            html += `
                <div class="accordion-card" id="accordion-${item.suffix}">
                    <div class="accordion-header" onclick="toggleAccordion('accordion-${item.suffix}')" role="button" tabindex="0" aria-expanded="false" onkeydown="if(event.key==='Enter'||event.key===' ') toggleAccordion('accordion-${item.suffix}')">
                        <div class="card-title-wrap">
                            <span class="drawer-card-icon" style="background:${data.iconBg}; color:${data.iconColor};">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${data.iconSvg}</svg>
                            </span>
                            <span class="card-title">${data.name}</span>
                            ${data.isClosing ? '<span class="erp-status-indicator outdated" id="closingMasterStatusDot" title="Checking ERP Closing Status..."></span>' : ''}
                        </div>
                        <span class="accordion-chevron" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    </div>
                    <div class="accordion-body">
                        <div class="sub-report-list">
                            ${subItemsHtml}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Auto-mount if containers already exist in DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderDashboardSidebarMenu();
            renderReportsDrawerMenu();
        });
    } else {
        renderDashboardSidebarMenu();
        renderReportsDrawerMenu();
    }

    // Expose globally
    window.REPORT_MODULES_DATA = REPORT_MODULES_DATA;
    window.SIDEBAR_MODULE_ORDER = SIDEBAR_MODULE_ORDER;
    window.DRAWER_MODULE_ORDER = DRAWER_MODULE_ORDER;
    window.renderDashboardSidebarMenu = renderDashboardSidebarMenu;
    window.renderReportsDrawerMenu = renderReportsDrawerMenu;
    window.resolveClosingReportDate = resolveClosingReportDate;

})(typeof window !== 'undefined' ? window : this);
