/**
 * MEP Portal - Central Report Modules Master Data
 * Auto-extracted from index.html during Phase 2 modularization
 */
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
                    { title: 'Daily Production Received Assemble (All)', url: 'daily_production_received_assemble.html' },
                    { title: 'Inter Company Received', url: '#' },
                    { title: 'All Section RM', url: '#' },
                    { title: 'Daily Production Plan', url: 'daily_production_plan.html' },
                    { title: 'Safety Stock SFG', url: '#' },
                    { title: 'Check Floor Stock', url: 'check_floor_stock.html' },
                    { title: 'Fan Damage Calculation Entry', url: 'fan_damage_calculation_entry.html', highlight: true }
                ]
            },
            'mod-03': {
                name: 'Report All Branch Fan',
                badge: '160 Items',
                iconBg: '#dcfce7',
                iconColor: '#16a34a',
                iconSvg: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
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
                    { id: 'closing-all-sfg', title: 'Closing All SFG', url: 'closing_all_sfg.html', defaultDate: '2026-08-20' },
                    { id: 'store-position', title: 'Store Position Report', url: 'store_position_report.html', defaultDate: '2026-08-26' }
                ]
            },
            'mod-05': {
                name: 'All Monthly Report',
                badge: '2 Reports',
                iconBg: '#f3e8ff',
                iconColor: '#9333ea',
                iconSvg: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
                reports: [
                    { title: 'Monthly Production Summary', url: 'monthly_production_summary_physical.html' },
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
                    { title: 'Yearly Production Summary (Physical)', url: 'yearly_production_summary_physical.html' },
                    { title: 'Yearly Production Summary (ERP)', url: 'yearly_production_summary_erp.html' },
                    { title: 'Yearly Damage Summary', url: 'yearly_damage_summary.html' }
                ]
            },
            'mod-07': {
                name: 'Reject Report',
                badge: '2 Reports',
                iconBg: '#ffedd5',
                iconColor: '#ea580c',
                iconSvg: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
                reports: [
                    { title: 'Assemble Reject Monitoring', url: '#' },
                    { title: 'All Section Production Rejection', url: '#' }
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
                iconBg: '#ecfdf5',
                iconColor: '#059669',
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
            'mod-master': {
                name: 'MASTER Central DB',
                badge: 'VIP DB',
                iconBg: '#1e293b',
                iconColor: '#38bdf8',
                iconSvg: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
                reports: [
                    { title: 'Central Item Master Database', url: 'master.html', highlight: true, pill: 'VIP DB' }
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
            }
        };

// Expose globally for portal and hubs
window.REPORT_MODULES_DATA = REPORT_MODULES_DATA;
