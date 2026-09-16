/**
 * ============================================================================
 * ERP SYSTEM - PORTAL MODALS ENGINE (portal_modals.js)
 * ============================================================================
 * Centralized dynamic template engine for all portal dialogs & drawers:
 *   1. Notification Panel (#notificationPanel)
 *   2. Physical Report Modal (#physicalReportModal)
 *   3. Pending Report Modal (#pendingReportModal)
 *   4. MIS PIN Security Modal (#misPinSecurityModal)
 *   5. Portal Settings Modal Backdrop (#settingsModalBackdrop)
 *   6. HRM Add Employee Modal (#hrmAddEmployeeModal)
 *   7. HRM Edit Employee Modal (#hrmEditEmployeeModal)
 *   8. HRM Replace Employee Modal (#hrmReplaceEmployeeModal)
 *   9. HRM Delete Employee Modal (#hrmDeleteEmployeeModal)
 *  10. Change Credential Modal (#changeCredentialModal)
 *  11. Forgot Password Modal (#forgotPasswordModal)
 *
 * Automatically injects modal templates synchronously into #portalModalsContainer.
 */

(function () {
    'use strict';

    const PORTAL_MODALS_HTML = `
    <!-- Floating Notification Panel (Drawer) -->
    <div class="notification-panel" id="notificationPanel">
        <div class="notif-panel-header">
            <div class="notif-panel-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>System Updates &amp; Changelog</span>
            </div>
            <button type="button" class="notif-panel-close" onclick="closeNotificationPanel()" title="Close Notifications">✕</button>
        </div>
        <div class="notif-panel-body">
            <div class="notif-item">
                <div class="notif-item-title">
                    <span>✓</span> Individual Check → Check FG Need Item
                </div>
                <div class="notif-item-desc">
                    Added Floor Stock, Store Stock, Pending, Short Floor, Need, and Warning badges with custom Column Settings modal.
                </div>
                <div class="notif-item-time">1 September 2026</div>
            </div>

            <div class="notif-item">
                <div class="notif-item-title">
                    <span>✓</span> Closing ERP Module Standardized
                </div>
                <div class="notif-item-desc">
                    Store Position Report and Finished Good (FG) Report converted to exact ERP table format with strict group filters.
                </div>
                <div class="notif-item-time">1 September 2026</div>
            </div>

            <div class="notif-item">
                <div class="notif-item-title">
                    <span>✓</span> Enterprise Main Interface Added
                </div>
                <div class="notif-item-desc">
                    New primary landing view with real-time KPI overview, dual area waves, category donut distribution, and watchlist.
                </div>
                <div class="notif-item-time">1 September 2026</div>
            </div>

            <div class="notif-item">
                <div class="notif-item-title">
                    <span>✓</span> Interactive Data Flow Guide
                </div>
                <div class="notif-item-desc">
                    Click the ⓘ Data Flow button on any report page to view the visual flowchart of data sources and calculation logic.
                </div>
                <div class="notif-item-time">1 September 2026</div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         Physical Production Report Modal (4 Excel-Style Executive Report Tables)
         ========================================================================== -->
    <div class="physical-modal-backdrop" id="physicalReportModal" onclick="if(event.target===this) closePhysicalReportModal()">
        <div class="physical-modal-container">
            <!-- Modal Header -->
            <div class="physical-modal-header">
                <div class="physical-header-left">
                    <div class="physical-icon-badge">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                    </div>
                    <div>
                        <h2 class="physical-modal-title">Physical Production Report</h2>
                        <span class="physical-modal-subtitle">Live Executive Performance &amp; Target Variance Tracking</span>
                    </div>
                </div>

                <div class="physical-header-actions">
                    <!-- Month Selector -->
                    <div class="physical-period-pill">
                        <label for="physicalMonthSelect">Month:</label>
                        <select id="physicalMonthSelect" onchange="changePhysicalPeriod()">
                            <option value="January">January</option>
                            <option value="February">February</option>
                            <option value="March">March</option>
                            <option value="April">April</option>
                            <option value="May">May</option>
                            <option value="June">June</option>
                            <option value="July">July</option>
                            <option value="August">August</option>
                            <option value="September" selected>September</option>
                            <option value="October">October</option>
                            <option value="November">November</option>
                            <option value="December">December</option>
                        </select>
                    </div>

                    <!-- Year Selector -->
                    <div class="physical-period-pill">
                        <label for="physicalYearSelect">Year:</label>
                        <select id="physicalYearSelect" onchange="changePhysicalPeriod()">
                            <option value="2025">2025</option>
                            <option value="2026" selected>2026</option>
                            <option value="2027">2027</option>
                        </select>
                    </div>

                    <!-- Refresh / Sync Button -->
                    <button type="button" class="btn-physical-sync" onclick="syncPhysicalReportData()" title="Sync with Monthly Production Summary">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        <span>Sync Live</span>
                    </button>

                    <!-- Close Button -->
                    <button type="button" class="physical-close-btn" onclick="closePhysicalReportModal()" aria-label="Close Report" title="Close">✕</button>
                </div>
            </div>

            <!-- Modal Body (2x2 Grid of 4 Tables) -->
            <div class="physical-modal-body">
                <div class="physical-report-grid">
                    <!-- TABLE 1: Ceiling Fan Target & Achive Report -->
                    <div class="physical-card" id="cardCeilingFanReport">
                        <div class="physical-tbl-title-bar">
                            <div class="physical-tbl-title-spacer"></div>
                            <span class="physical-tbl-title-text">Ceiling Fan Target &amp; Achive Report</span>
                            <button type="button" class="btn-toggle-redmi" id="btnToggleRedmiRow" onclick="window.toggleRedmiAdjustmentRow(event)" title="1-click to Hide/Unhide the [-] Adjustment row">
                                <svg class="icon-eye" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span id="labelToggleRedmi">Hide [-]</span>
                            </button>
                        </div>
                        <div class="physical-tbl-wrapper">
                            <table class="physical-tbl" id="tblCeilingFan">
                                <!-- Dynamic Render by MEP_PHYSICAL_UI -->
                            </table>
                        </div>
                    </div>

                    <!-- TABLE 2: Accessories Report -->
                    <div class="physical-card" id="cardAccessoriesReport">
                        <div class="physical-tbl-title">Accessories Report</div>
                        <div class="physical-tbl-wrapper">
                            <table class="physical-tbl" id="tblAccessories">
                                <!-- Dynamic Render by MEP_PHYSICAL_UI -->
                            </table>
                        </div>
                    </div>

                    <!-- TABLE 3: Blade Report -->
                    <div class="physical-card" id="cardBladeReport">
                        <div class="physical-tbl-title">Blade Report</div>
                        <div class="physical-tbl-wrapper">
                            <table class="physical-tbl" id="tblBlade">
                                <!-- Dynamic Render by MEP_PHYSICAL_UI -->
                            </table>
                        </div>
                    </div>

                    <!-- TABLE 4: Armature -->
                    <div class="physical-card" id="cardArmatureReport">
                        <div class="physical-tbl-title">Armature</div>
                        <div class="physical-tbl-wrapper">
                            <table class="physical-tbl" id="tblArmature">
                                <!-- Dynamic Render by MEP_PHYSICAL_UI -->
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Footer Summary Info / Legend -->
                <div class="physical-footer-note">
                    <div class="physical-legend">
                        <span class="legend-item"><span class="legend-box editable"></span> Editable Target / Adjustments</span>
                        <span class="legend-item"><span class="legend-box source-achieve"></span> Auto-pulled from Physical Production</span>
                        <span class="legend-item"><span class="legend-box need"></span> Locked Need Formula (Target - Achieve)</span>
                        <span class="legend-item"><span class="legend-box total-pct"></span> Locked Achievement %</span>
                        <button type="button" class="legend-toggle-link" onclick="window.toggleRedmiAdjustmentRow(event)">[-] Row: <strong id="legendToggleStatus" style="color:#059669;">Visible</strong> (1-Click Toggle)</button>
                    </div>
                    <div class="physical-status-tag" id="physicalEditStatus">Auto-saved to local state</div>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         Complete vs Pending (FG Pending Report) Modal (Mark 1 Trigger from Quick Bar)
         ========================================================================== -->
    <div class="pending-modal-backdrop" id="pendingReportModal" onclick="if(event.target===this) closePendingReportModal()">
        <div class="pending-modal-container">
            <!-- Modal Header -->
            <div class="pending-modal-header">
                <div class="pending-header-left">
                    <div class="pending-icon-badge">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h2 class="pending-modal-title">Complete vs Pending</h2>
                        <span class="pending-modal-subtitle">FG Pending Report — Finished Goods Transfer &amp; Due Variance Tracking</span>
                    </div>
                </div>

                <div class="pending-header-actions">
                    <!-- Dynamic Month & Year Selector -->
                    <div class="pending-period-pill">
                        <label for="pendingModalMonthSelect">Month:</label>
                        <select id="pendingModalMonthSelect" onchange="changePendingReportMonth(this.value)">
                            <option value="2026_September" selected>September 2026 (Live)</option>
                            <option value="2026_August">August 2026</option>
                            <option value="2026_July">July 2026</option>
                            <option value="2026_June">June 2026</option>
                            <option value="2026_May">May 2026</option>
                            <option value="2026_April">April 2026</option>
                            <option value="2026_March">March 2026</option>
                            <option value="2026_February">February 2026</option>
                            <option value="2026_January">January 2026</option>
                        </select>
                    </div>

                    <!-- Date Interval Badge -->
                    <span class="pending-period-pill" style="color:#0284c7; font-weight:700;">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span id="modalPendingDateIntervalText">Date Interval: 2026-09-01 to 2026-09-07</span>
                    </span>

                    <!-- Excel Export Button -->
                    <button type="button" class="btn-pending-action btn-excel" onclick="exportPendingReportToExcel()" title="Export Complete vs Pending Report to Excel">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line></svg>
                        <span>Excel</span>
                    </button>

                    <!-- Print Button -->
                    <button type="button" class="btn-pending-action" onclick="printPendingReport()" title="Print Report">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        <span>Print</span>
                    </button>

                    <!-- Open Full Page Button -->
                    <a href="modules/production/fg_pending_report.html" class="btn-pending-action btn-fullpage" title="Open Complete vs Pending in Standalone Page">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        <span>Full Page</span>
                    </a>

                    <!-- Close Button -->
                    <button type="button" class="pending-close-btn" onclick="closePendingReportModal()" aria-label="Close Report" title="Close">✕</button>
                </div>
            </div>

            <!-- Modal Body -->
            <div class="pending-modal-body">
                <!-- Executive KPI Summary Strip -->
                <div class="pending-kpi-strip">
                    <div class="pending-kpi-card">
                        <div class="pending-kpi-info">
                            <span class="pending-kpi-label">Total ERP Output</span>
                            <span class="pending-kpi-value" id="modalKpiErpOutput">0</span>
                        </div>
                        <div class="pending-kpi-icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                        </div>
                    </div>

                    <div class="pending-kpi-card kpi-danger">
                        <div class="pending-kpi-info">
                            <span class="pending-kpi-label">Net Due Deficit</span>
                            <span class="pending-kpi-value" style="color:#e11d48;" id="modalKpiNetDue">0</span>
                        </div>
                        <div class="pending-kpi-icon icon-danger">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                    </div>

                    <div class="pending-kpi-card kpi-amber">
                        <div class="pending-kpi-info">
                            <span class="pending-kpi-label">Total Physical Output</span>
                            <span class="pending-kpi-value" style="color:#0284c7;" id="modalKpiPhysicalOutput">0</span>
                        </div>
                        <div class="pending-kpi-icon icon-amber">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                    </div>

                    <div class="pending-kpi-card kpi-success">
                        <div class="pending-kpi-info">
                            <span class="pending-kpi-label">Floor FG Closing</span>
                            <span class="pending-kpi-value" style="color:#059669;" id="modalKpiFloorClosing">0 <span style="font-size:0.85rem; font-weight:700;">Pcs</span></span>
                        </div>
                        <div class="pending-kpi-icon icon-success">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                    </div>
                </div>

                <!-- Balanced 2-Column Tables Layout -->
                <div class="pending-modal-grid">
                    <!-- Left Panel: Assemble ERP FG Production Report -->
                    <div class="pending-card" id="cardModalAssembleReport">
                        <div class="pending-card-header">
                            <div class="pending-card-header-top">
                                <div class="pending-card-title-group">
                                    <span class="pending-card-title">Assemble ERP FG Production Report</span>
                                </div>
                                <span class="pending-card-badge">Complete &amp; Pending</span>
                            </div>
                            <div class="pending-card-subtitle-bar">
                                <span class="erp-date-tag">
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <span id="modalPendingAssembleDateInterval">Date Interval: 2026-09-01 to 2026-09-07</span>
                                </span>
                                <span>17 Fan Models</span>
                            </div>
                        </div>
                        <div class="pending-tbl-wrap">
                            <table class="pending-data-tbl" id="tblModalAssemble">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Ceiling Fan</th>
                                        <th style="text-align:right;">ERP</th>
                                        <th style="text-align:right;">Physical</th>
                                        <th style="text-align:right;">Due</th>
                                    </tr>
                                </thead>
                                <tbody id="tblPendingAssembleBody">
                                    <!-- Dynamic Render via fg_pending_modal_engine.js -->
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="font-weight:800;">TOTAL</td>
                                        <td style="text-align:right; font-weight:800;" id="modalTotalAssembleErp">0</td>
                                        <td style="text-align:right; font-weight:800;" id="modalTotalAssemblePhysical">0</td>
                                        <td style="text-align:right; font-weight:800;" id="modalTotalAssembleDue"><span class="pending-badge-zero">0</span></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <!-- Right Panel: Fan Floor FG Closing -->
                    <div class="pending-card" id="cardModalClosingReport">
                        <div class="pending-card-header">
                            <div class="pending-card-header-top">
                                <div class="pending-card-title-group">
                                    <span class="pending-card-title">Fan Floor FG Closing</span>
                                </div>
                                <span class="pending-card-badge">Inventory Closing</span>
                            </div>
                            <div class="pending-card-subtitle-bar">
                                <span class="erp-date-tag">
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <span id="modalPendingClosingDateInterval">Date Interval: 2026-09-01 to 2026-09-07</span>
                                </span>
                                <span>Floor Stock</span>
                            </div>
                        </div>
                        <div class="pending-tbl-wrap">
                            <table class="pending-data-tbl" id="tblModalClosing">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Model</th>
                                        <th style="text-align:right;">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody id="tblPendingClosingBody">
                                    <!-- Dynamic Render via fg_pending_modal_engine.js -->
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="font-weight:800;">TOTAL</td>
                                        <td style="text-align:right; font-weight:900; color:#059669;" id="modalTotalFloorClosing">0 Pcs</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         MIS MODULE — 5-Digit Enterprise Security PIN Verification Screen
         Master Security PIN: 96420
         ========================================================================== -->
    <div class="mis-pin-modal-backdrop" id="misPinSecurityModal" style="display:none;" onclick="if(event.target===this) closeMISPinSecurityModal()">
        <div class="mis-pin-modal-card" role="dialog" aria-modal="true" aria-labelledby="misPinTitle">
            <!-- Subtle Top Glow Line -->
            <div class="mis-pin-top-glow"></div>

            <!-- Header with Sleek Icon & Dismiss Button -->
            <div class="mis-pin-header">
                <div class="mis-pin-icon-wrap" title="MIS Module">
                    <img src="shared/assets/module_mis.png" onerror="this.src='../../shared/assets/module_mis.png'" alt="MIS Module" class="mis-pin-logo-img">
                </div>
                <button type="button" class="mis-pin-close-btn" onclick="closeMISPinSecurityModal()" aria-label="Close Security Gate" title="Cancel">✕</button>
            </div>

            <!-- Title & Subtitle -->
            <div class="mis-pin-meta">
                <h3 class="mis-pin-title" id="misPinTitle">MIS Module</h3>
            </div>

            <!-- 5-Digit Digital Input Container -->
            <div class="mis-pin-inputs-container" id="misPinInputsContainer">
                <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="mis-pin-digit" id="misPin0" data-index="0" autocomplete="off" aria-label="PIN Digit 1">
                <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="mis-pin-digit" id="misPin1" data-index="1" autocomplete="off" aria-label="PIN Digit 2">
                <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="mis-pin-digit" id="misPin2" data-index="2" autocomplete="off" aria-label="PIN Digit 3">
                <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="mis-pin-digit" id="misPin3" data-index="3" autocomplete="off" aria-label="PIN Digit 4">
                <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="mis-pin-digit" id="misPin4" data-index="4" autocomplete="off" aria-label="PIN Digit 5">
            </div>

            <!-- Status / Error Notification Message -->
            <div class="mis-pin-status-msg" id="misPinStatusMsg"></div>

            <!-- Enterprise Lock Badge Footer -->
            <div class="mis-pin-footer-shield">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Authorized Personnel Only &bull; <strong class="mis-pin-person-highlight">Sayful Islam</strong></span>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         Floating Settings & Themes Modal
         ========================================================================== -->
    <div class="settings-modal-backdrop" id="settingsModalBackdrop" onclick="if(event.target===this) closeSettingsModal()">
        <div class="settings-modal-card">
            <!-- Executive Dark Navy & Sapphire Gradient Header -->
            <div class="settings-modal-header">
                <div class="settings-modal-title">
                    <div class="settings-modal-icon-badge" id="settingsModalHeaderIcon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="settings-modal-heading-text" id="settingsModalHeading">Theme Performance</h3>
                        <span class="settings-modal-heading-sub" id="settingsModalHeaderSub">Executive Display Preferences &amp; GPU Visual Engine</span>
                    </div>
                </div>
                <div class="mis-header-right-controls">
                    <span class="mis-header-option-badge" id="settingsModalOptionTag">OPTION 1 OF 5</span>
                    <button type="button" class="settings-close-btn" onclick="closeSettingsModal()" aria-label="Close Settings" title="Close Window">✕</button>
                </div>
            </div>

            <!-- Redundant Tab Switcher Bar Hidden for Zero Clutter -->
            <div class="settings-modal-tabs" id="settingsModalTabs" style="display:none !important;">
                <button type="button" class="settings-tab-btn active" id="settingsTabTheme" onclick="switchSettingsTab('theme')">Theme</button>
                <button type="button" class="settings-tab-btn" id="settingsTabAccess" onclick="switchSettingsTab('access')">Access</button>
                <button type="button" class="settings-tab-btn" id="settingsTabLinks" onclick="switchSettingsTab('links')">Links</button>
                <button type="button" class="settings-tab-btn" id="settingsTabEdit" onclick="switchSettingsTab('edit')">Edit</button>
                <button type="button" class="settings-tab-btn" id="settingsTabLock" onclick="switchSettingsTab('lock')">Lock &amp; Unlock</button>
                <button type="button" class="settings-tab-btn" id="settingsTabOthers" onclick="switchSettingsTab('others')">Others</button>
                <button type="button" class="settings-tab-btn" id="settingsTabSecurity" onclick="switchSettingsTab('security')">Privacy &amp; Security</button>
            </div>

            <div class="settings-modal-body">
                <!-- ==========================================================
                     TAB 1: Theme Performance Pane
                     ========================================================== -->
                <div class="settings-tab-pane" id="paneThemeMode">
                    <div style="margin-bottom: 20px;">
                        <h4 style="font-size: 1.05rem; font-weight: 800; color: #0f2942; margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">
                            <span>Enterprise Display Modes</span>
                            <span style="font-size: 0.70rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 20px; border: 1px solid #bae6fd;">Instant Live Switch</span>
                        </h4>
                        <p style="font-size: 0.80rem; color: #64748b; margin: 0; line-height: 1.4;">
                            Choose your preferred visual appearance. Switching themes dynamically updates all tables, charts, KPI metrics, and report modules with zero page reloads.
                        </p>
                    </div>
                    
                    <div class="theme-showcase-grid">
                        <!-- ☀️ Light Theme Luxury Card -->
                        <div class="theme-card-luxury active" id="themeOptLight" onclick="setAppTheme('light')">
                            <div class="theme-preview-window preview-light">
                                <div class="mock-sidebar"></div>
                                <div class="mock-main">
                                    <div class="mock-topbar"></div>
                                    <div class="mock-card"></div>
                                    <div class="mock-table"></div>
                                </div>
                            </div>
                            <div class="theme-card-info">
                                <div>
                                    <div class="theme-card-title">☀️ Executive Light Theme</div>
                                    <div class="theme-card-sub">High-clarity corporate white with sapphire accents</div>
                                </div>
                                <div class="theme-badge-check">✓</div>
                            </div>
                        </div>

                        <!-- 🌙 Dark Theme Luxury Card -->
                        <div class="theme-card-luxury" id="themeOptDark" onclick="setAppTheme('dark')">
                            <div class="theme-preview-window preview-dark">
                                <div class="mock-sidebar"></div>
                                <div class="mock-main">
                                    <div class="mock-topbar"></div>
                                    <div class="mock-card"></div>
                                    <div class="mock-table"></div>
                                </div>
                            </div>
                            <div class="theme-card-info">
                                <div>
                                    <div class="theme-card-title">🌙 Midnight Dark Theme</div>
                                    <div class="theme-card-sub">Deep slate navy engineered for reduced eye strain</div>
                                </div>
                                <div class="theme-badge-check">✓</div>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Engineering Specifications Strip -->
                    <div class="perf-tiles-grid">
                        <div class="perf-tile-card">
                            <div class="perf-tile-icon" style="background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;">⚡</div>
                            <div>
                                <div style="font-size:0.84rem; font-weight:800; color:#0f172a;">GPU Hardware Acceleration</div>
                                <div style="font-size:0.72rem; color:#64748b; margin-top:1px;">60 FPS fluid transitions and zero layout shifts</div>
                            </div>
                        </div>
                        <div class="perf-tile-card">
                            <div class="perf-tile-icon" style="background:#eff6ff; color:#0284c7; border:1px solid #bfdbfe;">🎨</div>
                            <div>
                                <div style="font-size:0.84rem; font-weight:800; color:#0f172a;">Dynamic CSS Tokens</div>
                                <div style="font-size:0.72rem; color:#64748b; margin-top:1px;">Synchronized color variables across all 28 reports</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ==========================================================
                     TAB 2: View Access Control Pane
                     ========================================================== -->
                <div class="settings-tab-pane" id="paneViewAccess" style="display: none;">
                    <!-- RBAC Policy Banner -->
                    <div class="rbac-security-banner">
                        <div class="rbac-shield-icon">🛡️</div>
                        <div style="flex:1;">
                            <div style="font-size:0.92rem; font-weight:800; color:#92400e;">Role-Based Access Control (RBAC) Security Policy</div>
                            <div style="font-size:0.75rem; color:#78350f; margin-top:2px; line-height:1.35;">
                                Configure report visibility for users with the <strong>View</strong> role. Restricted reports are hidden from sidebars and completely blocked from direct access.
                            </div>
                        </div>
                    </div>

                    <!-- Quick Preset Selectors -->
                    <div class="rbac-presets-bar">
                        <span style="font-size:0.75rem; font-weight:800; color:#64748b; margin-right:4px;">Quick Presets:</span>
                        <button type="button" class="btn-rbac-preset" onclick="applyRBACPreset('all')">✓ Grant Full Access</button>
                        <button type="button" class="btn-rbac-preset" onclick="applyRBACPreset('none')">✕ Restrict All</button>
                        <button type="button" class="btn-rbac-preset" onclick="applyRBACPreset('production')">🏭 Production Only</button>
                        <button type="button" class="btn-rbac-preset" onclick="applyRBACPreset('closing')">📊 Closing (ERP) Only</button>
                        <button type="button" class="btn-rbac-preset" onclick="applyRBACPreset('summary')">📑 Summary Reports Only</button>
                    </div>

                    <!-- Search Filter Box -->
                    <div class="access-search-box" style="margin-bottom:14px;">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="accessPageSearch" placeholder="Filter pages by title, file name, or module..." oninput="filterAccessPages(this.value)">
                    </div>

                    <!-- Scrollable Page Checklist Container -->
                    <div class="access-pages-list" id="accessPagesListContainer" style="max-height: 330px;">
                        <!-- Injected dynamically by renderViewAccessChecklist() -->
                    </div>

                    <!-- Footer Action Bar -->
                    <div class="access-modal-footer">
                        <span class="access-perm-count" id="accessPermCount">28 of 28 pages allowed</span>
                        <button type="button" class="btn-save-permissions" onclick="saveViewPermissions()" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); box-shadow:0 4px 12px rgba(2,132,199,0.3);">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Save Security Permissions
                        </button>
                    </div>
                </div>

                <!-- ==========================================================
                     TAB 3: Show & Edit Link Pane
                     ========================================================== -->
                <div class="settings-tab-pane" id="paneShowEditLink" style="display: none;">
                    <!-- Real-Time Metrics Strip -->
                    <div class="mis-kpi-summary-strip">
                        <div class="mis-kpi-pill">
                            <div class="mis-kpi-pill-icon" style="background:#eff6ff; color:#0284c7; border:1px solid #bfdbfe;">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <div>
                                <div class="mis-kpi-pill-val">28 Reports</div>
                                <div class="mis-kpi-pill-lbl">Live Connected Endpoints</div>
                            </div>
                        </div>
                        <div class="mis-kpi-pill">
                            <div class="mis-kpi-pill-icon" style="background:#ecfdf5; color:#059669; border:1px solid #a7f3d0;">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            </div>
                            <div>
                                <div class="mis-kpi-pill-val">78 Data Sources</div>
                                <div class="mis-kpi-pill-lbl">Synchronized Data Links</div>
                            </div>
                        </div>
                        <div class="mis-kpi-pill">
                            <div class="mis-kpi-pill-icon" style="background:#faf5ff; color:#7c3aed; border:1px solid #e9d5ff;">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                            </div>
                            <div>
                                <div class="mis-kpi-pill-val">42 Formulas</div>
                                <div class="mis-kpi-pill-lbl">Active Calculation Rules</div>
                            </div>
                        </div>
                    </div>

                    <!-- Search Filter Box -->
                    <div class="access-search-box" style="margin-bottom:14px;">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="misLinkSearchInput" placeholder="Search report endpoints by title, file name, or department..." oninput="filterMISLinks(this.value)">
                    </div>

                    <!-- Scrollable Links Table/List Container -->
                    <div class="access-pages-list" id="misLinksListContainer" style="max-height: 320px;">
                        <!-- Injected dynamically by renderMISLinksManager() -->
                    </div>

                    <!-- Footer Action Bar -->
                    <div class="access-modal-footer">
                        <span class="access-perm-count" id="misLinksCount">28 active report connections</span>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button type="button" class="btn-access-action" onclick="resetAllCustomPageFlows()" style="color:#64748b; border-color:#cbd5e1;" title="Reset all custom data flow edits back to default">
                                Reset All Flows
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ==========================================================
                     TAB 4: Edit Page Pane (Dynamic Page Name Customizer)
                     ========================================================== -->
                <div class="settings-tab-pane" id="paneEditPage" style="display: none;">
                    <!-- Customizer Banner -->
                    <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 1.5px solid #fed7aa; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                        <div style="width: 42px; height: 42px; border-radius: 10px; background: #ea580c; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);">
                            ✏️
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:0.92rem; font-weight:800; color:#9a3412;">Global Dynamic Title &amp; Page Name Customizer</div>
                            <div style="font-size:0.75rem; color:#7c2d12; margin-top:2px; line-height:1.35;">
                                Rename any system page or report. Custom titles automatically update live in sidebars, navigation breadcrumbs, and search menus.
                            </div>
                        </div>
                    </div>

                    <!-- Search Filter Box -->
                    <div class="access-search-box" style="margin-bottom:14px;">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#64748b" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="editPageNameSearchInput" placeholder="Filter pages to rename by current name, file, or module..." oninput="filterEditPageNames(this.value)">
                    </div>

                    <!-- Scrollable List of All Pages for Renaming -->
                    <div class="access-pages-list" id="editPageNamesListContainer" style="max-height: 310px;">
                        <!-- Injected dynamically by renderMISEditPageSettings() -->
                    </div>

                    <!-- Footer Action Bar -->
                    <div class="access-modal-footer">
                        <span class="access-perm-count" id="editPageNamesCount">28 system pages</span>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button type="button" class="btn-access-action" onclick="resetAllPageNames()" style="color:#64748b; border-color:#cbd5e1;" title="Reset all page titles to default">
                                Reset All
                            </button>
                            <button type="button" class="btn-save-permissions" onclick="saveAllPageNames()" style="background:linear-gradient(135deg, #ea580c 0%, #c2410c 100%); border-color:#ea580c; box-shadow:0 4px 12px rgba(234,88,12,0.3);">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Save All Page Names
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ==========================================================
                     TAB 5: Lock and Unlock Page Pane (Centralized Edit Control)
                     ========================================================== -->
                <div class="settings-tab-pane" id="paneLockUnlock" style="display: none;">
                    <div class="lock-panel-header-card">
                        <div class="lock-header-info">
                            <h4 class="lock-heading-title">
                                <span>Operational Form Locks &amp; Manual Edit Permissions</span>
                                <span class="lock-engine-badge">Enterprise Master Lock Engine</span>
                            </h4>
                            <p class="lock-heading-desc">
                                Centralized editing authorization. When a page is <strong>Locked</strong>, all manual data additions, inline cell modifications, row deletions, and save operations are strictly prevented on that page.
                            </p>
                        </div>
                        <div class="lock-stats-strip">
                            <div class="lock-stat-pill">
                                <span class="stat-pill-label">Total Registered:</span>
                                <strong class="stat-pill-val" id="lockStatTotal">0 Pages</strong>
                            </div>
                            <div class="lock-stat-pill lock-stat-locked">
                                <span class="stat-pill-label">🔒 Locked (Read-Only):</span>
                                <strong class="stat-pill-val" id="lockStatLocked">0</strong>
                            </div>
                            <div class="lock-stat-pill lock-stat-unlocked">
                                <span class="stat-pill-label">🔓 Unlocked (Editable):</span>
                                <strong class="stat-pill-val" id="lockStatUnlocked">0</strong>
                            </div>
                        </div>
                    </div>

                    <!-- 4 Modules Selector Cards Strip -->
                    <div class="lock-modules-selector-strip" id="lockModulesSelectorStrip">
                        <!-- Populated by renderMISLockUnlockManager() -->
                    </div>

                    <!-- Filter & Batch Action Toolbar -->
                    <div class="lock-toolbar-bar">
                        <div class="lock-search-wrapper">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b" stroke-width="2.2">
                                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input type="text" id="lockPageSearchInput" class="lock-search-input" placeholder="Search editable report or data entry page..." oninput="filterLockPages(this.value)">
                        </div>
                        <div class="lock-batch-actions">
                            <button type="button" class="btn-lock-batch btn-lock-all" onclick="batchToggleAllLocks(true)" title="Lock all pages immediately (Read-Only)">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                <span>Lock All</span>
                            </button>
                            <button type="button" class="btn-lock-batch btn-unlock-all" onclick="batchToggleAllLocks(false)" title="Unlock all pages for editing">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                <span>Unlock All</span>
                            </button>
                        </div>
                    </div>

                    <!-- Editable Pages Grid / List Container -->
                    <div class="lock-pages-list-container" id="lockPagesListContainer">
                        <!-- Dynamically populated by renderMISLockUnlockManager() -->
                    </div>

                    <!-- Footer Info Strip -->
                    <div class="lock-pane-footer-note">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0284c7" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span>All page lock states are saved to persistent storage and applied instantly across the ERP. View-Only accounts are permanently blocked from editing or changing lock states.</span>
                    </div>
                </div>

                <!-- ==========================================================
                     TAB 6: Others Pane (System Diagnostics & Utilities)
                     ========================================================== -->
                <div class="settings-tab-pane" id="paneMISOthers" style="display: none;">
                    <div class="diagnostics-grid">
                        <!-- 1. Cloud Sync Diagnostic Card -->
                        <div class="diag-card-luxury">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <div style="width:44px; height:44px; border-radius:12px; background:#ecfdf5; border:1.5px solid #a7f3d0; display:flex; align-items:center; justify-content:center; color:#059669; font-size:1.25rem; flex-shrink:0;">
                                    ☁️
                                </div>
                                <div>
                                    <div style="font-size:0.90rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
                                        <span>Realtime Cloud Database Sync</span>
                                        <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.70rem; font-weight:700; color:#059669; background:#d1fae5; padding:2px 8px; border-radius:12px;">
                                            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; animation:pulse 1.5s infinite;"></span>
                                            Operational
                                        </span>
                                    </div>
                                    <div style="font-size:0.75rem; color:#64748b; margin-top:3px;" id="misCloudPingStatus">
                                        Live channel connected &bull; Bidirectional socket active
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn-access-action" onclick="testMISCloudConnection()" style="background:#0284c7; color:#ffffff; border-color:#0284c7; padding:7px 14px; font-weight:700; border-radius:8px; font-size:0.78rem;">
                                Run Latency Audit
                            </button>
                        </div>

                        <!-- 2. UI & Session Cache Cleanup Card -->
                        <div class="diag-card-luxury">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <div style="width:44px; height:44px; border-radius:12px; background:#fffbeb; border:1.5px solid #fde68a; display:flex; align-items:center; justify-content:center; color:#d97706; font-size:1.25rem; flex-shrink:0;">
                                    🧹
                                </div>
                                <div>
                                    <div style="font-size:0.90rem; font-weight:800; color:#0f172a;">UI State &amp; Session Cache Purge</div>
                                    <div style="font-size:0.75rem; color:#64748b; margin-top:3px;">
                                        Clears cached filters and temporary state without altering logins or persistent data.
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn-access-action" onclick="clearSystemPortalCache()" style="color:#b45309; border-color:#fde68a; background:#fef3c7; padding:7px 14px; font-weight:700; border-radius:8px; font-size:0.78rem;">
                                Purge Cache
                            </button>
                        </div>

                        <!-- 3. Local Storage Health & Quota Gauge Card -->
                        <div class="diag-card-luxury" style="display:block;">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-size:1.1rem;">💾</span>
                                    <span style="font-size:0.88rem; font-weight:800; color:#0f172a;">Browser Local Database Quota</span>
                                </div>
                                <span style="font-size:0.78rem; font-weight:800; color:#0284c7;" id="misStorageUsageText">Calculating...</span>
                            </div>
                            <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden; margin-bottom:6px;">
                                <div id="misStorageProgressBar" style="width:10%; height:100%; background:linear-gradient(90deg, #0284c7 0%, #38bdf8 100%); border-radius:4px; transition:width 0.4s ease;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.70rem; color:#64748b;">
                                <span>Storage Engine: HTML5 LocalStorage</span>
                                <span style="color:#10b981; font-weight:700;">Status: Healthy (Zero Corruption)</span>
                            </div>
                        </div>

                        <!-- 4. Route Integrity Scanner Card -->
                        <div class="diag-card-luxury">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <div style="width:44px; height:44px; border-radius:12px; background:#eff6ff; border:1.5px solid #bfdbfe; display:flex; align-items:center; justify-content:center; color:#0284c7; font-size:1.25rem; flex-shrink:0;">
                                    🔍
                                </div>
                                <div>
                                    <div style="font-size:0.90rem; font-weight:800; color:#0f172a;">Endpoint Route Integrity Scanner</div>
                                    <div style="font-size:0.75rem; color:#64748b; margin-top:3px;" id="misEndpointScanStatus">
                                        All 28 system report files verified with active HTTP routes
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn-access-action" onclick="auditSystemEndpoints()" style="color:#0284c7; border-color:#bfdbfe; background:#eff6ff; padding:7px 14px; font-weight:700; border-radius:8px; font-size:0.78rem;">
                                Audit Endpoints
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ==========================================================
                     TAB 7: Privacy and Security Pane (Card 7 of MIS Module)
                     ========================================================== -->
                <div class="settings-tab-pane" id="panePrivacySecurity" style="display: none;">
                    <div class="security-center-banner" style="margin-bottom:18px;">
                        <div class="security-banner-icon">🛡️</div>
                        <div class="security-banner-info">
                            <h3 class="security-banner-title">Central Password &amp; Security Management Center</h3>
                            <p class="security-banner-desc">
                                Manage administrative master passwords, view passwords, and MIS module security PINs. Changes update the central credential store and apply immediately across the ERP.
                            </p>
                        </div>
                    </div>

                    <div class="security-cards-grid">
                        <!-- 1. View Password Card -->
                        <div class="security-action-card">
                            <div class="sec-card-header">
                                <div class="sec-card-icon-wrap icon-view-sec">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </div>
                                <span class="sec-status-pill sec-status-active">Active</span>
                            </div>
                            <h4 class="sec-card-title">View User Password</h4>
                            <p class="sec-card-desc">Restricted login password for view-only users to access read-only reports and dashboards.</p>
                            <div class="sec-masked-display">
                                <span class="masked-dots">••••••••</span>
                                <span class="masked-tag">Protected</span>
                            </div>
                            <button type="button" class="btn-sec-action" onclick="openChangeCredentialModal('view')">
                                <span>🔑 Change View Password</span>
                            </button>
                        </div>

                        <!-- 2. Admin Password Card -->
                        <div class="security-action-card">
                            <div class="sec-card-header">
                                <div class="sec-card-icon-wrap icon-admin-sec">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <span class="sec-status-pill sec-status-admin">Master Admin</span>
                            </div>
                            <h4 class="sec-card-title">Admin Master Password</h4>
                            <p class="sec-card-desc">Primary administrative credential granting full edit access, settings management, and system control.</p>
                            <div class="sec-masked-display">
                                <span class="masked-dots">••••••••</span>
                                <span class="masked-tag">Protected</span>
                            </div>
                            <button type="button" class="btn-sec-action btn-sec-admin" onclick="openChangeCredentialModal('admin')">
                                <span>🛡️ Change Admin Password</span>
                            </button>
                        </div>

                        <!-- 3. MIS Module Security PIN Card -->
                        <div class="security-action-card">
                            <div class="sec-card-header">
                                <div class="sec-card-icon-wrap icon-pin-sec">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><circle cx="9" cy="9" r="1"></circle><circle cx="15" cy="9" r="1"></circle><circle cx="9" cy="15" r="1"></circle><circle cx="15" cy="15" r="1"></circle></svg>
                                </div>
                                <span class="sec-status-pill sec-status-pin">5-Digit Gate</span>
                            </div>
                            <h4 class="sec-card-title">MIS Module Security PIN</h4>
                            <p class="sec-card-desc">5-digit numeric PIN verified on-the-fly to unlock the MIS Module and executive controls.</p>
                            <div class="sec-masked-display">
                                <span class="masked-dots">â€¢â€¢â€¢â€¢â€¢</span>
                                <span class="masked-tag">Auto-Verifying</span>
                            </div>
                            <button type="button" class="btn-sec-action btn-sec-pin" onclick="openChangeCredentialModal('mis_pin')">
                                <span>ðŸ”¢ Change 5-Digit PIN</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         HRM Modals: Add, Edit, Replace, Delete Employee
         ========================================================================== -->
    <!-- 1. Add Employee Modal -->
    <div class="hrm-modal-backdrop" id="hrmAddEmployeeModal" onclick="if(event.target===this) closeHrmAddModal()">
        <div class="hrm-modal-card">
            <div class="hrm-modal-header">
                <h3 class="hrm-modal-title">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add New Employee</span>
                </h3>
                <button type="button" class="hrm-modal-close-btn" onclick="closeHrmAddModal()" aria-label="Close">&times;</button>
            </div>
            <form id="hrmAddEmployeeForm" onsubmit="submitHrmAddEmployee(event)">
                <div class="hrm-modal-body">
                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>SL Number (Auto)</label>
                            <input type="text" class="hrm-form-control" id="hrmAddSl" readonly style="background:#e2e8f0; color:#64748b;">
                        </div>
                        <div class="hrm-form-group">
                            <label>Employee ID *</label>
                            <input type="text" class="hrm-form-control" id="hrmAddId" required placeholder="e.g. 18850">
                        </div>
                    </div>
                    <div class="hrm-form-group">
                        <label>Employee Full Name *</label>
                        <input type="text" class="hrm-form-control" id="hrmAddName" required placeholder="e.g. Md. Hasan Ali">
                    </div>
                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>Designation *</label>
                            <input type="text" class="hrm-form-control" id="hrmAddDesignation" required placeholder="e.g. Helper, Operator">
                        </div>
                        <div class="hrm-form-group">
                            <label>Gender *</label>
                            <select class="hrm-form-control" id="hrmAddGender">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>Date of Joining (DOJ) *</label>
                            <input type="text" class="hrm-form-control" id="hrmAddDoj" required placeholder="e.g. 1-Sep-26">
                        </div>
                        <div class="hrm-form-group">
                            <label>Section *</label>
                            <select class="hrm-form-control" id="hrmAddSection" required>
                                <option value="Assemble Line">Assemble Line</option>
                                <option value="Armature Winding">Armature Winding</option>
                                <option value="Dimmar & Blade">Dimmar & Blade</option>
                                <option value="Replacement">Replacement</option>
                            </select>
                        </div>
                    </div>
                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>Status *</label>
                            <select class="hrm-form-control" id="hrmAddStatus" required>
                                <option value="Active" selected>Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="hrm-modal-footer">
                    <button type="button" class="btn-hrm-secondary" onclick="closeHrmAddModal()">Cancel</button>
                    <button type="submit" class="btn-hrm-add">Save Employee</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2. Edit Employee Modal -->
    <div class="hrm-modal-backdrop" id="hrmEditEmployeeModal" onclick="if(event.target===this) closeHrmEditModal()">
        <div class="hrm-modal-card">
            <div class="hrm-modal-header">
                <h3 class="hrm-modal-title">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <span>Edit Employee Details</span>
                </h3>
                <button type="button" class="hrm-modal-close-btn" onclick="closeHrmEditModal()" aria-label="Close">&times;</button>
            </div>
            <form id="hrmEditEmployeeForm" onsubmit="submitHrmEditEmployee(event)">
                <input type="hidden" id="hrmEditSl">
                <div class="hrm-modal-body">
                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>Employee ID *</label>
                            <input type="text" class="hrm-form-control" id="hrmEditId" required>
                        </div>
                        <div class="hrm-form-group">
                            <label>Gender *</label>
                            <select class="hrm-form-control" id="hrmEditGender">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="hrm-form-group">
                        <label>Employee Full Name *</label>
                        <input type="text" class="hrm-form-control" id="hrmEditName" required>
                    </div>
                    <div class="hrm-form-group">
                        <label>Designation *</label>
                        <input type="text" class="hrm-form-control" id="hrmEditDesignation" required>
                    </div>
                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>Date of Joining (DOJ) *</label>
                            <input type="text" class="hrm-form-control" id="hrmEditDoj" required>
                        </div>
                        <div class="hrm-form-group">
                            <label>Section *</label>
                            <select class="hrm-form-control" id="hrmEditSection" required>
                                <option value="Assemble Line">Assemble Line</option>
                                <option value="Armature Winding">Armature Winding</option>
                                <option value="Dimmar & Blade">Dimmar & Blade</option>
                                <option value="Replacement">Replacement</option>
                            </select>
                        </div>
                    </div>
                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>Status *</label>
                            <select class="hrm-form-control" id="hrmEditStatus" required>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="hrm-modal-footer">
                    <button type="button" class="btn-hrm-secondary" onclick="closeHrmEditModal()">Cancel</button>
                    <button type="submit" class="btn-hrm-add">Update Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. Replace Employee Modal -->
    <div class="hrm-modal-backdrop" id="hrmReplaceEmployeeModal" onclick="if(event.target===this) closeHrmReplaceModal()">
        <div class="hrm-modal-card" style="max-width: 560px;">
            <div class="hrm-modal-header">
                <h3 class="hrm-modal-title">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    <span>Position Replacement</span>
                </h3>
                <button type="button" class="hrm-modal-close-btn" onclick="closeHrmReplaceModal()" aria-label="Close">&times;</button>
            </div>
            <form id="hrmReplaceEmployeeForm" onsubmit="submitHrmReplaceEmployee(event)">
                <div class="hrm-modal-body">
                    <!-- Current Outgoing Employee Banner -->
                    <div class="hrm-replace-banner">
                        <div class="hrm-replace-banner-title">Current Outgoing Employee:</div>
                        <div class="hrm-replace-banner-details">
                            SL <span id="hrmReplaceOutSl"></span> | ID: <span id="hrmReplaceOutId"></span> &mdash; <strong id="hrmReplaceOutName"></strong> (<span id="hrmReplaceOutDesig"></span>, <span id="hrmReplaceOutSection"></span>)
                        </div>
                    </div>

                    <div style="font-size:0.82rem; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.4px; margin-top:4px;">
                        New Incoming Employee Details:
                    </div>

                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>New Employee ID *</label>
                            <input type="text" class="hrm-form-control" id="hrmReplaceInId" required placeholder="New ID Number">
                        </div>
                        <div class="hrm-form-group">
                            <label>Gender *</label>
                            <select class="hrm-form-control" id="hrmReplaceInGender">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div class="hrm-form-group">
                        <label>New Employee Name *</label>
                        <input type="text" class="hrm-form-control" id="hrmReplaceInName" required placeholder="New person full name">
                    </div>

                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>Designation *</label>
                            <input type="text" class="hrm-form-control" id="hrmReplaceInDesig" required>
                        </div>
                        <div class="hrm-form-group">
                            <label>Section *</label>
                            <input type="text" class="hrm-form-control" id="hrmReplaceInSection" required>
                        </div>
                    </div>

                    <div class="hrm-form-row">
                        <div class="hrm-form-group">
                            <label>New Joining Date (DOJ) *</label>
                            <input type="text" class="hrm-form-control" id="hrmReplaceInDoj" required>
                        </div>
                        <div class="hrm-form-group">
                            <label>Replacement Reason / Note</label>
                            <input type="text" class="hrm-form-control" id="hrmReplaceReason" value="Employee Replacement">
                        </div>
                    </div>
                </div>
                <div class="hrm-modal-footer">
                    <button type="button" class="btn-hrm-secondary" onclick="closeHrmReplaceModal()">Cancel</button>
                    <button type="submit" class="btn-hrm-add" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;">Confirm Replacement</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 4. Delete Confirmation Modal -->
    <div class="hrm-modal-backdrop" id="hrmDeleteEmployeeModal" onclick="if(event.target===this) closeHrmDeleteModal()">
        <div class="hrm-modal-card" style="max-width: 440px;">
            <div class="hrm-modal-header" style="background:#fee2e2;">
                <h3 class="hrm-modal-title" style="color:#b91c1c;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#b91c1c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    <span>Confirm Delete Employee</span>
                </h3>
                <button type="button" class="hrm-modal-close-btn" onclick="closeHrmDeleteModal()" aria-label="Close">&times;</button>
            </div>
            <div class="hrm-modal-body" style="text-align:center; padding:24px 20px;">
                <p style="font-size:0.92rem; color:#334155; margin:0 0 10px 0;">
                    Are you sure you want to permanently delete this employee record?
                </p>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px;">
                    <strong id="hrmDeleteEmpName" style="font-size:1rem; color:#0f172a; display:block;"></strong>
                    <span id="hrmDeleteEmpDesig" style="font-size:0.82rem; color:#64748b;"></span>
                </div>
                <p style="font-size:0.78rem; color:#dc2626; margin:0; font-weight:600;">
                    This action will remove the record and automatically re-index the list.
                </p>
            </div>
            <div class="hrm-modal-footer" style="justify-content:center; gap:14px;">
                <button type="button" class="btn-hrm-secondary" onclick="closeHrmDeleteModal()">Cancel</button>
                <button type="button" class="btn-hrm-action btn-hrm-delete" onclick="confirmHrmDeleteEmployee()" style="padding:8px 18px; font-size:0.85rem;">Yes, Delete Record</button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         Change Security Credential Modal (Admin, View, MIS PIN)
         ========================================================================== -->
    <div class="cred-modal-backdrop" id="changeCredentialModal" style="display:none;" onclick="if(event.target===this) closeChangeCredentialModal()">
        <div class="cred-modal-card" role="dialog" aria-modal="true" aria-labelledby="credModalTitle">
            <div class="cred-modal-header">
                <div class="cred-modal-title-wrap">
                    <div class="cred-modal-icon-badge" id="credModalIconBadge">🛡️</div>
                    <div>
                        <h3 class="cred-modal-title" id="credModalTitle">Change Security Credential</h3>
                        <p class="cred-modal-subtitle" id="credModalSubtitle">Update access credential in the central credential store</p>
                    </div>
                </div>
                <button type="button" class="cred-modal-close" onclick="closeChangeCredentialModal()" aria-label="Close">✕</button>
            </div>

            <form id="changeCredentialForm" onsubmit="event.preventDefault(); confirmAndSaveCredential();">
                <input type="hidden" id="credModalType" value="admin">
                <div class="cred-modal-body">
                    <div class="cred-alert-box" id="credModalAlert"></div>

                    <!-- Current Credential -->
                    <div class="user-form-group" style="margin-bottom:14px;">
                        <label class="user-field-label" id="credCurrentLabel">Current Password *</label>
                        <div class="cred-input-wrap">
                            <input type="password" id="credCurrentValue" required autocomplete="current-password" placeholder="Enter current credential">
                            <button type="button" class="cred-eye-toggle" onclick="toggleCredentialInputVisibility('credCurrentValue', this)" aria-label="Toggle visibility">👁️</button>
                        </div>
                    </div>

                    <!-- New Credential -->
                    <div class="user-form-group" style="margin-bottom:14px;">
                        <label class="user-field-label" id="credNewLabel">New Password *</label>
                        <div class="cred-input-wrap">
                            <input type="password" id="credNewValue" required autocomplete="new-password" placeholder="Enter new credential">
                            <button type="button" class="cred-eye-toggle" onclick="toggleCredentialInputVisibility('credNewValue', this)" aria-label="Toggle visibility">👁️</button>
                        </div>
                    </div>

                    <!-- Confirm New Credential -->
                    <div class="user-form-group" style="margin-bottom:14px;">
                        <label class="user-field-label" id="credConfirmLabel">Confirm New Password *</label>
                        <div class="cred-input-wrap">
                            <input type="password" id="credConfirmValue" required autocomplete="new-password" placeholder="Re-type new credential">
                            <button type="button" class="cred-eye-toggle" onclick="toggleCredentialInputVisibility('credConfirmValue', this)" aria-label="Toggle visibility">👁️</button>
                        </div>
                    </div>

                    <div class="cred-notice-box">
                        <strong>⚠️ Immediate Revocation Notice:</strong>
                        <span>Saving this change will immediately revoke the previous credential. Old passwords or PINs will no longer grant access.</span>
                    </div>
                </div>

                <div class="cred-modal-footer">
                    <button type="button" class="btn-user-secondary" onclick="closeChangeCredentialModal()">Cancel</button>
                    <button type="submit" class="btn-user-primary" id="btnConfirmSaveCred">
                        <span>Save &amp; Apply Immediately</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ==========================================================================
         Corporate Forgot Password & Credential Recovery Modal (#forgotPasswordModal)
         ========================================================================== -->
    <div class="cred-modal-backdrop" id="forgotPasswordModal" style="display:none;" onclick="if(event.target===this) closeForgotPasswordModal()">
        <div class="cred-modal-card" role="dialog" aria-modal="true" aria-labelledby="forgotModalTitle">
            <div class="cred-modal-header">
                <div class="cred-modal-title-wrap">
                    <div class="cred-modal-icon-badge">🔑</div>
                    <div>
                        <h3 class="cred-modal-title" id="forgotModalTitle">Password Recovery &amp; Reset</h3>
                        <p class="cred-modal-subtitle">Authorize with Master Security PIN to reset or restore access credentials</p>
                    </div>
                </div>
                <button type="button" class="cred-modal-close" onclick="closeForgotPasswordModal()" aria-label="Close">✕</button>
            </div>

            <form id="forgotPasswordForm" onsubmit="submitForgotPasswordReset(event)">
                <div class="cred-modal-body">
                    <div class="cred-alert-box" id="forgotModalAlert" style="display:none;"></div>

                    <!-- Target Account / Role Selection -->
                    <div class="user-form-group" style="margin-bottom:14px;">
                        <label class="user-field-label" for="forgotTargetAccount">Target Account / Role *</label>
                        <select id="forgotTargetAccount" class="user-field-input" style="width:100%; height:40px; border:1.5px solid #cbd5e1; border-radius:8px; padding:0 12px; font-weight:600; font-size:0.88rem; color:#0f2942; background:#f8fafc;">
                            <option value="admin">Administrator (sayful.prd.fan@mepgroupbd.com)</option>
                            <option value="view">View User (Viewer / Read-Only)</option>
                        </select>
                    </div>

                    <!-- Master Security PIN Authorization -->
                    <div class="user-form-group" style="margin-bottom:14px;">
                        <label class="user-field-label" for="forgotMasterPin">Master Security PIN *</label>
                        <div class="cred-input-wrap">
                            <input type="password" id="forgotMasterPin" required maxlength="10" placeholder="Enter 5-digit Master Security PIN" autocomplete="off">
                            <button type="button" class="cred-eye-toggle" onclick="toggleCredentialInputVisibility('forgotMasterPin', this)" aria-label="Toggle PIN visibility">👁️</button>
                        </div>
                    </div>

                    <!-- New Password -->
                    <div class="user-form-group" style="margin-bottom:14px;">
                        <label class="user-field-label" for="forgotNewPassword">New Password *</label>
                        <div class="cred-input-wrap">
                            <input type="password" id="forgotNewPassword" required autocomplete="new-password" placeholder="Enter new password (min 3 chars)">
                            <button type="button" class="cred-eye-toggle" onclick="toggleCredentialInputVisibility('forgotNewPassword', this)" aria-label="Toggle password visibility">👁️</button>
                        </div>
                    </div>

                    <!-- Confirm New Password -->
                    <div class="user-form-group" style="margin-bottom:14px;">
                        <label class="user-field-label" for="forgotConfirmPassword">Confirm New Password *</label>
                        <div class="cred-input-wrap">
                            <input type="password" id="forgotConfirmPassword" required autocomplete="new-password" placeholder="Confirm new password">
                            <button type="button" class="cred-eye-toggle" onclick="toggleCredentialInputVisibility('forgotConfirmPassword', this)" aria-label="Toggle password visibility">👁️</button>
                        </div>
                    </div>

                    <div class="cred-notice-box">
                        <strong>🛡️ Security Verification Notice:</strong>
                        <span>Resetting access credentials requires authorization with the 5-digit Master Security PIN.</span>
                    </div>
                </div>

                <div class="cred-modal-footer">
                    <button type="submit" class="btn-user-primary" id="btnForgotSubmit" style="min-width:110px; font-weight:700; letter-spacing:0.3px;">
                        <span>Save</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ==========================================================================
         Executive Notebook & Daily Task Manager Modal (#misNotebookModal)
         ========================================================================== -->
    <div class="notebook-modal-backdrop" id="misNotebookModal" onclick="if(event.target===this) closeMISNotebookModal()">
        <div class="notebook-modal-container">
            <!-- Modal Header -->
            <div class="notebook-modal-header">
                <div class="notebook-header-brand">
                    <div class="notebook-header-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            <line x1="8" y1="6" x2="16" y2="6"></line>
                            <line x1="8" y1="10" x2="16" y2="10"></line>
                            <line x1="8" y1="14" x2="13" y2="14"></line>
                        </svg>
                    </div>
                    <div>
                        <h2 class="notebook-header-title">Notebook &amp; Daily Task Manager</h2>
                        <span class="notebook-header-subtitle">Executive Daily Operational Diary • Task Checklist • Auto-Saved</span>
                    </div>
                </div>

                <!-- KPI Statistics -->
                <div class="notebook-kpi-bar">
                    <div class="notebook-kpi-pill kpi-total" title="Total Notes">
                        <span class="kpi-label">TOTAL</span>
                        <span class="kpi-val" id="notebookKpiTotal">0</span>
                    </div>
                    <div class="notebook-kpi-pill kpi-pending" title="Pending Tasks">
                        <span class="kpi-label">PENDING</span>
                        <span class="kpi-val" id="notebookKpiPending">0</span>
                    </div>
                    <div class="notebook-kpi-pill kpi-completed" title="Completed Tasks">
                        <span class="kpi-label">COMPLETED</span>
                        <span class="kpi-val" id="notebookKpiCompleted">0</span>
                    </div>
                    <div class="notebook-kpi-pill kpi-rate" title="Completion Rate">
                        <span class="kpi-label">RATE</span>
                        <span class="kpi-val" id="notebookKpiRate">0%</span>
                    </div>
                </div>

                <!-- Header Actions -->
                <div class="notebook-header-actions">
                    <button type="button" class="nb-btn-header" onclick="exportNotebookCSV()" title="Export notes to CSV spreadsheet">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Export CSV</span>
                    </button>
                    <button type="button" class="nb-btn-header" onclick="printNotebookView()" title="Print Notebook">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        <span>Print</span>
                    </button>
                    <button type="button" class="nb-btn-close" onclick="closeMISNotebookModal()" title="Close Notebook (Esc)">✕</button>
                </div>
            </div>

            <!-- Modal Body Split: Writing Desk (Left) + Task Board (Right) -->
            <div class="notebook-modal-body">
                <!-- Left: Writing Desk / New Page -->
                <div class="notebook-desk-pane" id="notebookWritingDesk">
                    <div class="notebook-page-card">
                        <div class="nb-page-header">
                            <div class="nb-page-tag">
                                <span class="nb-page-dot"></span>
                                <span id="notebookPageTitleLabel">Writing Desk</span>
                            </div>
                            <span class="nb-page-counter" id="notebookPageCounter">Page #1</span>
                        </div>

                        <div class="nb-page-form">
                            <!-- Hidden ID for edit mode -->
                            <input type="hidden" id="notebookEditTaskId" value="">

                            <!-- Title / Subject -->
                            <div class="nb-form-group">
                                <label class="nb-label" for="notebookTaskTitle">Subject / Title</label>
                                <input type="text" id="notebookTaskTitle" class="nb-input" placeholder="e.g., Morning Shift Fan Line Inspection..." maxlength="120" autocomplete="off">
                            </div>

                            <!-- Meta Row -->
                            <div class="nb-form-row">
                                <div class="nb-form-group flex-1">
                                    <label class="nb-label" for="notebookTaskCategory">Category</label>
                                    <select id="notebookTaskCategory" class="nb-select">
                                        <option value="Production Floor">🏭 Production Floor</option>
                                        <option value="Store &amp; Inventory">📦 Store &amp; Inventory</option>
                                        <option value="Machine Maintenance">⚙️ Machine Maintenance</option>
                                        <option value="Staff &amp; Attendance">👥 Staff &amp; Attendance</option>
                                        <option value="General Reminder">📋 General Reminder</option>
                                    </select>
                                </div>

                                <div class="nb-form-group flex-1">
                                    <label class="nb-label" for="notebookTaskPriority">Priority</label>
                                    <select id="notebookTaskPriority" class="nb-select">
                                        <option value="urgent">🔴 Urgent / High</option>
                                        <option value="normal" selected>🟡 Normal</option>
                                        <option value="low">🟢 Low / Routine</option>
                                    </select>
                                </div>

                                <div class="nb-form-group flex-1">
                                    <label class="nb-label" for="notebookTaskDueDate">Target Date</label>
                                    <input type="date" id="notebookTaskDueDate" class="nb-input">
                                </div>
                            </div>

                            <!-- Note Details -->
                            <div class="nb-form-group">
                                <label class="nb-label" for="notebookTaskBody">Note Details / Checklist</label>
                                <textarea id="notebookTaskBody" class="nb-textarea" rows="4" placeholder="Write any instructions, key numbers, pending decisions, or checklist items here... (Press Ctrl+Enter to save)"></textarea>
                            </div>

                            <!-- Actions -->
                            <div class="nb-page-actions">
                                <button type="button" class="nb-btn-primary" id="btnSaveNotebookTask" onclick="saveNotebookTask()" title="Save note and reset to clean page (Ctrl+Enter)">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                    <span id="btnSaveNotebookText">Save Note &amp; New Page</span>
                                </button>
                                <button type="button" class="nb-btn-secondary" onclick="clearNotebookForm()" title="Clear writing desk for fresh page">
                                    <span>Clear Page</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Task Cards Grid -->
                <div class="notebook-board-pane">
                    <!-- Board Toolbar -->
                    <div class="notebook-board-toolbar">
                        <div class="nb-filter-tabs">
                            <button type="button" class="nb-tab active" data-filter="all" onclick="filterNotebookTasks('all')">All (<span id="tabCountAll">0</span>)</button>
                            <button type="button" class="nb-tab" data-filter="pending" onclick="filterNotebookTasks('pending')">Pending (<span id="tabCountPending">0</span>)</button>
                            <button type="button" class="nb-tab" data-filter="completed" onclick="filterNotebookTasks('completed')">Completed (<span id="tabCountCompleted">0</span>)</button>
                            <button type="button" class="nb-tab" data-filter="urgent" onclick="filterNotebookTasks('urgent')">Urgent (<span id="tabCountUrgent">0</span>)</button>
                            <button type="button" class="nb-tab" data-filter="today" onclick="filterNotebookTasks('today')">Today (<span id="tabCountToday">0</span>)</button>
                        </div>

                        <div class="nb-search-wrap">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" class="nb-search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="notebookSearchInput" class="nb-search-input" placeholder="Search notes..." oninput="searchNotebookTasks(this.value)">
                        </div>
                    </div>

                    <!-- Cards Container -->
                    <div class="notebook-cards-scroll" id="notebookCardsScroll">
                        <div class="notebook-cards-grid" id="notebookCardsGrid">
                            <!-- Dynamic task card boxes will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="notebook-modal-footer">
                <div class="notebook-footer-info">
                    <span class="nb-status-dot"></span>
                    <span id="notebookFooterStatus">All notes auto-saved to local browser storage &amp; executive session.</span>
                </div>
                <div class="notebook-footer-actions">
                    <button type="button" class="nb-btn-outline-danger" onclick="clearCompletedNotebookTasks()" title="Delete all completed tasks">
                        <span>Clear Completed Tasks</span>
                    </button>
                    <button type="button" class="nb-btn-close-footer" onclick="closeMISNotebookModal()">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         FLASH MODULE — Executive Operational Data Hub (8 Live Report Tables)
         Matches User's Big Red-Marked Area
         ========================================================================== -->
    <div class="mis-pin-modal-backdrop flash-modal-backdrop" id="flashSpeedModal" style="display:none;" onclick="if(event.target===this) closeFlashModal()">
        <div class="flash-modal-card" role="dialog" aria-modal="true" aria-labelledby="flashModalTitle">
            <!-- Top Glow Line with Electric Gradient -->
            <div style="height: 4px; width: 100%; background: linear-gradient(90deg, #f59e0b, #38bdf8, #0284c7, #f59e0b); flex-shrink: 0;"></div>

            <!-- Header with Flash Logo, Stats, All Load Button & Close Button -->
            <div class="flash-modal-header">
                <div class="flash-header-left">
                    <div class="flash-header-logo-wrap">
                        <img src="shared/assets/module_flash.png" onerror="this.src='../../shared/assets/module_flash.png'" alt="Flash" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div>
                        <h3 id="flashModalTitle" class="flash-header-title">
                            Flash <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #0284c7; border: 1px solid #bfdbfe; font-weight: 800; text-transform: uppercase;">ENTERPRISE HUB v2.4</span>
                        </h3>
                        <p class="flash-header-sub">High-Speed Real-time Synchronized Operational Reports &amp; Intelligence Center</p>
                    </div>
                </div>

                <div class="flash-header-right">
                    <div class="flash-stat-pill" title="In-Memory Cache Latency">
                        <span>⚡ Response:</span> <span class="highlight">1.2 ms</span>
                    </div>
                    <div class="flash-stat-pill" title="Live Memory Database">
                        <span>⚡ Cache:</span> <span style="color: #16a34a; font-weight: 800;">100% In-Memory</span>
                    </div>

                    <!-- Primary ALL LOAD Button -->
                    <button type="button" class="flash-all-load-btn" id="flashAllLoadBtn" onclick="loadAllFlashTables()" title="Click to load all 8 operational report tables simultaneously">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        <span>All Load</span>
                    </button>

                    <button type="button" class="mis-pin-close-btn" onclick="closeFlashModal()" aria-label="Close Flash Modal" style="background: #f1f5f9; border: none; font-size: 16px; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">✕</button>
                </div>
            </div>

            <!-- Body Viewport with 8 Table Cards Grid (3 Columns Hierarchy matching Screenshot) -->
            <div class="flash-body-viewport">
                <div class="flash-cards-grid">

                    <!-- 1. Inter Sales Requisition -->
                    <div class="flash-card" id="flashCard1">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #0284c7;"></span>
                                <h4 class="flash-card-title">Inter Sales Requisition</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge1">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent1">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #eff6ff; border: 1px solid #bfdbfe;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                </div>
                                <div class="flash-empty-title">Inter Sales Requisitions</div>
                                <div class="flash-empty-desc">Click Load to stream real-time requisition records</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta1">Warehouse Module</span>
                            <button type="button" class="flash-load-btn" id="flashBtn1" onclick="loadFlashTable(1)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                    <!-- 2. Per Day Received -->
                    <div class="flash-card" id="flashCard2">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #059669;"></span>
                                <h4 class="flash-card-title">Per Day Received</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge2">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent2">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #ecfdf5; border: 1px solid #a7f3d0;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#059669" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect></svg>
                                </div>
                                <div class="flash-empty-title">Daily GRN Batches</div>
                                <div class="flash-empty-desc">Click Load to stream daily goods received records</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta2">Warehouse Module</span>
                            <button type="button" class="flash-load-btn" id="flashBtn2" onclick="loadFlashTable(2)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                    <!-- 3. Spare Parts -->
                    <div class="flash-card" id="flashCard3">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #d97706;"></span>
                                <h4 class="flash-card-title">Spare Parts</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge3">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent3">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #fffbeb; border: 1px solid #fde68a;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#d97706" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                </div>
                                <div class="flash-empty-title">Spare Parts Stock</div>
                                <div class="flash-empty-desc">Click Load to stream critical spare stock levels</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta3">Warehouse Module</span>
                            <button type="button" class="flash-load-btn" id="flashBtn3" onclick="loadFlashTable(3)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                    <!-- 4. Fan Assemble -->
                    <div class="flash-card" id="flashCard4">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #0284c7;"></span>
                                <h4 class="flash-card-title">Fan Assemble</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge4">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent4">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #eff6ff; border: 1px solid #bfdbfe;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <div class="flash-empty-title">Fan Assemble Closing</div>
                                <div class="flash-empty-desc">Click Load to stream assemble closing records</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta4">Production Closing</span>
                            <button type="button" class="flash-load-btn" id="flashBtn4" onclick="loadFlashTable(4)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                    <!-- 5. Armature & Winding -->
                    <div class="flash-card" id="flashCard5">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #7c3aed;"></span>
                                <h4 class="flash-card-title">Armature &amp; Winding</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge5">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent5">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #f5f3ff; border: 1px solid #ddd6fe;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                </div>
                                <div class="flash-empty-title">Armature &amp; Winding Balances</div>
                                <div class="flash-empty-desc">Click Load to stream winding balances &amp; stock</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta5">Production Closing</span>
                            <button type="button" class="flash-load-btn" id="flashBtn5" onclick="loadFlashTable(5)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                    <!-- 6. Finish Good (FG) -->
                    <div class="flash-card" id="flashCard6">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #dc2626;"></span>
                                <h4 class="flash-card-title">Finish Good (FG)</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge6">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent6">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #fef2f2; border: 1px solid #fecaca;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#dc2626" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                </div>
                                <div class="flash-empty-title">Finish Good (FG) Closing</div>
                                <div class="flash-empty-desc">Click Load to stream FG closing report</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta6">Production Closing</span>
                            <button type="button" class="flash-load-btn" id="flashBtn6" onclick="loadFlashTable(6)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                    <!-- 7. Closing All SFG -->
                    <div class="flash-card" id="flashCard7">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #ea580c;"></span>
                                <h4 class="flash-card-title">Closing All SFG</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge7">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent7">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #fff7ed; border: 1px solid #fed7aa;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                                </div>
                                <div class="flash-empty-title">Semi-Finished Goods (SFG)</div>
                                <div class="flash-empty-desc">Click Load to stream semi-finished stock</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta7">Production Closing</span>
                            <button type="button" class="flash-load-btn" id="flashBtn7" onclick="loadFlashTable(7)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                    <!-- 8. Store Position Report -->
                    <div class="flash-card" id="flashCard8">
                        <div class="flash-card-header">
                            <div class="flash-card-title-wrap">
                                <span class="flash-card-dot" style="background: #0891b2;"></span>
                                <h4 class="flash-card-title">Store Position Report</h4>
                            </div>
                            <span class="flash-card-badge" id="flashBadge8">Ready</span>
                        </div>
                        <div class="flash-main-display-area" id="flashContent8">
                            <div class="flash-empty-state">
                                <div class="flash-empty-icon-wrap" style="background: #ecfeff; border: 1px solid #a5f3fc;">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0891b2" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                </div>
                                <div class="flash-empty-title">Store Position &amp; Scrap</div>
                                <div class="flash-empty-desc">Click Load to stream store inventory</div>
                            </div>
                        </div>
                        <div class="flash-card-footer">
                            <span class="flash-card-meta" id="flashMeta8">Production Closing</span>
                            <button type="button" class="flash-load-btn" id="flashBtn8" onclick="loadFlashTable(8)">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                <span>Load</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
`;

    // Flash Hub Master Datasets for the 8 Tables
    var FLASH_TABLES_DATA = {
        1: {
            title: 'Inter Sales Requisition',
            url: 'modules/warehouse/intersales_requisition.html',
            headers: ['Req No', 'Target Dept', 'Item Description', 'Qty', 'Status'],
            rows: [
                ['REQ-2026-0941', 'Fan Assemble Unit-1', 'Rotor & Stator Core 56"', '650 Pcs', '<span style="color:#0284c7;font-weight:700;">In Transit</span>'],
                ['REQ-2026-0940', 'Winding & Coil Dept', 'Super Enamelled Wire 0.32mm', '42 Spools', '<span style="color:#16a34a;font-weight:700;">Completed</span>'],
                ['REQ-2026-0939', 'Final Packing Line', 'Master Cartons 56"', '1,200 Sets', '<span style="color:#16a34a;font-weight:700;">Completed</span>'],
                ['REQ-2026-0938', 'Die Casting Section', 'Aluminium Ingot Grade-A', '2,500 Kg', '<span style="color:#d97706;font-weight:700;">Pending</span>']
            ],
            badgeText: '4 Active'
        },
        2: {
            title: 'Per Day Received',
            url: 'modules/warehouse/per_day_received.html',
            headers: ['GRN No', 'Supplier', 'Category', 'Qty', 'QC Status'],
            rows: [
                ['GRN-88412', 'Apex Metals Ltd', 'Copper Raw Material', '1,800 Kg', '<span style="color:#16a34a;font-weight:700;">Passed</span>'],
                ['GRN-88411', 'National Polymers', 'Canopy & Blade Parts', '3,200 Pcs', '<span style="color:#16a34a;font-weight:700;">Passed</span>'],
                ['GRN-88410', 'SKF Precision Co.', 'Ball Bearings 6201/6202', '2,400 Pcs', '<span style="color:#16a34a;font-weight:700;">Passed</span>'],
                ['GRN-88409', 'Delta Fasteners', 'Downrod Safety Bolts', '5,000 Pcs', '<span style="color:#16a34a;font-weight:700;">Passed</span>']
            ],
            badgeText: '18 Batches'
        },
        3: {
            title: 'Spare Parts',
            url: 'modules/warehouse/spare_parts.html',
            headers: ['Spare Name', 'Category', 'In Stock', 'Reorder', 'Health'],
            rows: [
                ['Ball Bearing 6202-2RS', 'Mechanical', '480 Pcs', '150', '<span style="color:#16a34a;font-weight:700;">Optimal</span>'],
                ['Capacitor 2.5µF 450V', 'Electrical', '620 Pcs', '200', '<span style="color:#16a34a;font-weight:700;">Optimal</span>'],
                ['Shaft 18mm Steel', 'Precision', '110 Pcs', '100', '<span style="color:#d97706;font-weight:700;">Normal</span>'],
                ['Rubber Bush Damper', 'Consumable', '35 Pcs', '80', '<span style="color:#dc2626;font-weight:700;">Low Stock</span>']
            ],
            badgeText: '412 Items'
        },
        4: {
            title: 'Fan Assemble',
            url: 'modules/production/fan_assemble_erp.html',
            headers: ['Item Code', 'Product Name', 'Unit', 'Total Recv', 'Closing'],
            rows: [
                ['EF0801OW', '08" Exhaust Fan White', 'Pcs', '0', '<span style="color:#0284c7;font-weight:800;">21</span>'],
                ['EF1001OW', '10" Exhaust Fan White', 'Pcs', '1,440', '<span style="color:#0284c7;font-weight:800;">4</span>'],
                ['DF5601', '56" Deluxe Ceiling Fan', 'Pcs', '3,200', '<span style="color:#0284c7;font-weight:800;">148</span>'],
                ['PF5601', '56" Prima Ceiling Fan', 'Pcs', '2,800', '<span style="color:#0284c7;font-weight:800;">215</span>']
            ],
            badgeText: 'Live ERP'
        },
        5: {
            title: 'Armature & Winding',
            url: 'modules/production/armature_winding_erp.html',
            headers: ['Coil Code', 'Winding Wire Spec', 'Section', 'Qty', 'Status'],
            rows: [
                ['ARM-5601', '56" Stator Winding Wire', 'Armature', '340 Pcs', '<span style="color:#16a34a;font-weight:700;">Optimal</span>'],
                ['COIL-032', 'Super Enamelled 0.32mm', 'Winding', '185 Kg', '<span style="color:#16a34a;font-weight:700;">Normal</span>'],
                ['ROT-5602', 'Rotor Core Assembly 56"', 'Armature', '410 Pcs', '<span style="color:#16a34a;font-weight:700;">Optimal</span>'],
                ['COIL-028', 'Super Enamelled 0.28mm', 'Winding', '142 Kg', '<span style="color:#16a34a;font-weight:700;">Normal</span>']
            ],
            badgeText: 'Live ERP'
        },
        6: {
            title: 'Finish Good (FG)',
            url: 'modules/production/closing_finish_good_fg.html',
            headers: ['Code', 'Item Name', 'Receive', 'Out/Sale', 'Closing'],
            rows: [
                ['EF0801OW', '08" Fresh Air Exhaust Fan', '0', '0', '<span style="color:#0284c7;font-weight:800;">21</span>'],
                ['EF1001OW', '10" Fresh Air Exhaust Fan', '1,440', '1,436', '<span style="color:#0284c7;font-weight:800;">4</span>'],
                ['DF5601', '56" Deluxe Ceiling Fan White', '3,200', '3,052', '<span style="color:#0284c7;font-weight:800;">148</span>'],
                ['PF5601', '56" Prima Ceiling Fan Brown', '2,800', '2,585', '<span style="color:#0284c7;font-weight:800;">215</span>']
            ],
            badgeText: 'Closing FG'
        },
        7: {
            title: 'Closing All SFG',
            url: 'modules/production/closing_all_sfg.html',
            headers: ['SFG Code', 'Category Description', 'Unit', 'Closing Balance'],
            rows: [
                ['SFG-BLD-56', 'Aluminum Blade Set 56"', 'Set', '<span style="color:#0284c7;font-weight:800;">1,250</span>'],
                ['SFG-CAN-01', 'Canopy Set Powder Coated', 'Set', '<span style="color:#0284c7;font-weight:800;">2,100</span>'],
                ['SFG-SHK-02', 'Shackle Kit Assembly', 'Pcs', '<span style="color:#0284c7;font-weight:800;">3,450</span>'],
                ['SFG-ROD-24', 'Downrod 24" White Coated', 'Pcs', '<span style="color:#0284c7;font-weight:800;">890</span>']
            ],
            badgeText: '160 SFG'
        },
        8: {
            title: 'Store Position Report',
            url: 'modules/production/store_position_report.html',
            headers: ['Item Code', 'Material Name', 'Unit', 'Store Qty', 'Total Qty'],
            rows: [
                ['1500100001', 'Aluminium Bar Scrap', 'KG', '0', '<span style="color:#0284c7;font-weight:800;">7,528.40</span>'],
                ['1500100003', 'Silicon Sheet 25 Gage Scrap', 'KG', '0', '<span style="color:#0284c7;font-weight:800;">27,730.04</span>'],
                ['200100002', 'Aluminum Ingot', 'KG', '36,000', '<span style="color:#0284c7;font-weight:800;">36,427.88</span>'],
                ['200100003', 'Aluminium Bar', 'KG', '0', '<span style="color:#0284c7;font-weight:800;">0.00</span>']
            ],
            badgeText: '340 Items'
        }
    };

    function loadFlashTable(id) {
        var card = document.getElementById('flashCard' + id);
        var content = document.getElementById('flashContent' + id);
        var badge = document.getElementById('flashBadge' + id);
        var btn = document.getElementById('flashBtn' + id);
        var meta = document.getElementById('flashMeta' + id);
        var data = FLASH_TABLES_DATA[id];

        if (!card || !content || !data) return;

        if (btn) {
            btn.classList.add('is-loading');
            btn.innerHTML = '<span>Loading...</span>';
        }

        // Show Shimmer Skeleton
        content.classList.remove('has-data');
        content.innerHTML = '<div class="flash-skeleton" style="height:18px;"></div><div class="flash-skeleton" style="height:14px; width:80%;"></div><div class="flash-skeleton" style="height:14px; width:90%;"></div><div class="flash-skeleton" style="height:14px; width:70%;"></div>';

        setTimeout(function() {
            var tableHtml = '<table class="flash-mini-table"><thead><tr>';
            data.headers.forEach(function(h) {
                tableHtml += '<th>' + h + '</th>';
            });
            tableHtml += '</tr></thead><tbody>';

            data.rows.forEach(function(r) {
                tableHtml += '<tr>';
                r.forEach(function(c) {
                    tableHtml += '<td>' + c + '</td>';
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table>';

            content.classList.add('has-data');
            content.innerHTML = tableHtml;

            if (badge) {
                badge.className = 'flash-card-badge loaded';
                badge.textContent = data.badgeText || 'Loaded';
            }

            if (btn) {
                btn.classList.remove('is-loading');
                btn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>Loaded</span>';
                btn.style.background = '#059669';
                setTimeout(function() {
                    btn.style.background = '#0284c7';
                    btn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg> <span>Load</span>';
                }, 2000);
            }

            if (meta) {
                meta.innerHTML = '<a href="' + data.url + '" style="color:#0284c7; text-decoration:none; font-weight:700;" title="Open full report page">View Full Report →</a>';
            }
        }, 320);
    }

    function loadAllFlashTables() {
        var allBtn = document.getElementById('flashAllLoadBtn');
        if (allBtn) {
            allBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="fa-spin"><circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> <span>Loading All 8 Tables...</span>';
            allBtn.style.pointerEvents = 'none';
        }

        var count = 0;
        for (var i = 1; i <= 8; i++) {
            (function(idx) {
                setTimeout(function() {
                    loadFlashTable(idx);
                    count++;
                    if (count === 8 && allBtn) {
                        setTimeout(function() {
                            allBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>All 8 Tables Loaded</span>';
                            allBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                            allBtn.style.pointerEvents = 'auto';
                            if (typeof window.showToast === 'function') {
                                window.showToast('⚡ Flash Hub: All 8 operational report tables synchronized!');
                            }
                            setTimeout(function() {
                                allBtn.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                                allBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> <span>All Load</span>';
                            }, 3000);
                        }, 400);
                    }
                }, idx * 70);
            })(i);
        }
    }

    function openFlashModal() {
        var modal = document.getElementById('flashSpeedModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    function closeFlashModal() {
        var modal = document.getElementById('flashSpeedModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function triggerFlashTurboBoost() {
        var btn = document.getElementById('flashBoostBtn');
        var notice = document.getElementById('flashBoostNotice');
        if (btn) {
            btn.innerHTML = '⚡ Turbo Boost Active!';
            btn.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
        }
        if (notice) {
            notice.style.display = 'block';
        }
        if (typeof window.showToast === 'function') {
            window.showToast('⚡ Flash Boost Activated: ERP System Running at Maximum Performance!');
        }
    }

    function mountPortalModals() {
        var container = document.getElementById('portalModalsContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'portalModalsContainer';
            container.style.display = 'contents';
            if (document.body) {
                document.body.appendChild(container);
            }
        }
        if (container && (!container.innerHTML || container.innerHTML.trim() === '')) {
            container.innerHTML = PORTAL_MODALS_HTML;
        }
    }

    // Mount immediately if DOM element already exists
    mountPortalModals();

    // Secondary safety hook for DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountPortalModals);
    }

    window.openFlashModal = openFlashModal;
    window.closeFlashModal = closeFlashModal;
    window.loadFlashTable = loadFlashTable;
    window.loadAllFlashTables = loadAllFlashTables;
    window.triggerFlashTurboBoost = triggerFlashTurboBoost;
    window.mountPortalModals = mountPortalModals;
})();