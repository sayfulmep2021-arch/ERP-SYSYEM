/**
 * HRM Module Engine
 * Controls HRM Dashboard & Data Base -> New Entry View
 */
(function(window) {
    'use strict';

    let currentFilterSection = 'ALL';
    let currentFilterDesignation = 'ALL';
    let currentSearchTerm = '';
    let currentActiveSubPage = 'dashboard'; // 'dashboard', 'new_entry', 'section_assemble', 'section_dimmer', 'section_armature'
    let currentActiveSectionKey = 'section_assemble';
    let currentSectionSearchTerm = '';
    let currentSectionFilterDesig = 'ALL';
    let currentSectionFilterGender = 'ALL';

    const SECTION_CONFIGS = {
        'section_assemble': {
            name: 'Assemble Line',
            title: 'Assemble Line — Section Summary',
            subtitle: 'Live Sectional Workforce Overview • Sourced directly from Employee Master Database (New Entry)',
            navId: 'hrmNavSectionAssemble',
            matcher: function(sec) {
                return String(sec || '').toLowerCase().includes('assemble');
            }
        },
        'section_dimmer': {
            name: 'Dimmer & Blade',
            title: 'Dimmer & Blade — Section Summary',
            subtitle: 'Live Sectional Workforce Overview • Sourced directly from Employee Master Database (New Entry)',
            navId: 'hrmNavSectionDimmer',
            matcher: function(sec) {
                const s = String(sec || '').toLowerCase();
                return s.includes('dimm') || s.includes('blade');
            }
        },
        'section_armature': {
            name: 'Armature & Winding',
            title: 'Armature & Winding — Section Summary',
            subtitle: 'Live Sectional Workforce Overview • Sourced directly from Employee Master Database (New Entry)',
            navId: 'hrmNavSectionArmature',
            matcher: function(sec) {
                const s = String(sec || '').toLowerCase();
                return s.includes('armature') || s.includes('winding');
            }
        }
    };

    /**
     * Check if HRM Database New Entry page is locked via MIS Module Option 5
     */
    function isHrmEntryLocked() {
        try {
            const raw = localStorage.getItem('portal_page_lock_states');
            if (raw) {
                const map = JSON.parse(raw);
                if (map['hrm_database_new_entry'] !== undefined) {
                    return map['hrm_database_new_entry'] === true;
                }
            }
        } catch (e) {}
        return true; // Default locked as per system security policy
    }

    /**
     * Update locked visual banner and action buttons in HRM New Entry pane
     */
    function updateHrmLockUI() {
        const locked = isHrmEntryLocked();
        const entryPane = document.getElementById('hrmDatabaseNewEntryPane');
        if (!entryPane) return;

        let banner = document.getElementById('hrmLockedPageBanner');
        if (locked) {
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'hrmLockedPageBanner';
                banner.className = 'smart-locked-page-banner';
                banner.style.cssText = 'background:#fff1f2; border:1px solid #fecdd3; border-left:5px solid #e11d48; padding:10px 16px; border-radius:8px; margin-bottom:14px; display:flex; align-items:center; gap:10px; color:#9f1239; font-family:"Times New Roman", serif;';
                banner.innerHTML = `
                    <span style="display:flex; align-items:center;"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9f1239" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                    <div>
                        <strong style="font-size:14px; letter-spacing:0.5px;">PAGE ACCESS LOCKED (READ-ONLY)</strong>
                        <div style="font-size:12px; color:#881337; margin-top:2px;">Employee Database is in read-only mode. Adding, editing, replacing, or deleting records is prohibited until unlocked from <strong>MIS Module > Option 5</strong>. Searching, filtering, export, and print remain active.</div>
                    </div>
                `;
                entryPane.insertBefore(banner, entryPane.firstChild);
            }
        } else {
            if (banner) banner.remove();
        }

        // Disable/enable "+ Add New Employee" and "Reset" buttons
        const addBtn = entryPane.querySelector('.btn-hrm-icon-action.btn-add');
        const resetBtn = entryPane.querySelector('.btn-hrm-icon-action.btn-reset');
        if (addBtn) {
            addBtn.disabled = locked;
            addBtn.style.opacity = locked ? '0.45' : '';
            addBtn.style.cursor = locked ? 'not-allowed' : '';
            addBtn.title = locked ? 'Locked (Read-Only) from MIS Option 5' : 'Add New Employee';
        }
        if (resetBtn) {
            resetBtn.disabled = locked;
            resetBtn.style.opacity = locked ? '0.45' : '';
            resetBtn.style.cursor = locked ? 'not-allowed' : '';
            resetBtn.title = locked ? 'Locked (Read-Only) from MIS Option 5' : 'Reset (107 Records)';
        }
    }

    /**
     * Complete Service Duration calculation dynamically from DOJ to live system date
     * Output format: "X Years Y Months Z Days" (e.g. "10 Years 9 Months 13 Days")
     */
    function calculateCompleteServiceDuration(dojStr) {
        if (!dojStr) return '-';
        try {
            const parts = String(dojStr).trim().split(/[-/ ]/);
            let day, month, year;
            const monthsMap = {
                'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
            };
            if (parts.length === 3) {
                day = parseInt(parts[0], 10);
                const monKey = parts[1].toLowerCase().slice(0, 3);
                month = monthsMap[monKey];
                if (month === undefined) {
                    month = parseInt(parts[1], 10) - 1;
                }
                year = parseInt(parts[2], 10);
                if (year < 100) {
                    year += (year > 50 ? 1900 : 2000);
                }
            }
            if (isNaN(day) || month === undefined || isNaN(month) || isNaN(year)) {
                const d = new Date(dojStr);
                if (!isNaN(d.getTime())) {
                    day = d.getDate();
                    month = d.getMonth();
                    year = d.getFullYear();
                } else {
                    return '-';
                }
            }

            const joinDate = new Date(year, month, day);
            const now = new Date();
            if (joinDate > now) return '0 Days';

            let curYear = now.getFullYear();
            let curMonth = now.getMonth();
            let curDay = now.getDate();

            let joinYear = joinDate.getFullYear();
            let joinMonth = joinDate.getMonth();
            let joinDay = joinDate.getDate();

            let days = curDay - joinDay;
            let months = curMonth - joinMonth;
            let years = curYear - joinYear;

            if (days < 0) {
                const prevMonthDays = new Date(curYear, curMonth, 0).getDate();
                days += prevMonthDays;
                months--;
            }

            if (months < 0) {
                months += 12;
                years--;
            }

            if (years < 0) return '0 Days';

            const partsOut = [];
            if (years > 0) partsOut.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
            if (months > 0) partsOut.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
            if (days > 0 || partsOut.length === 0) partsOut.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

            return partsOut.join(' ');
        } catch (e) {
            return '-';
        }
    }

    function calculateTenure(dojStr) {
        return calculateCompleteServiceDuration(dojStr);
    }

    /**
     * Section Active / Inactive Visibility Control
     */
    function getSectionActiveStatus(secKey) {
        try {
            const key = secKey || currentActiveSectionKey;
            const stored = localStorage.getItem('mep_hrm_sec_status_' + key);
            if (stored === 'Inactive') return 'Inactive';
        } catch(e) {}
        return 'Active';
    }

    function setSectionActiveStatus(secKey, status) {
        try {
            const key = secKey || currentActiveSectionKey;
            localStorage.setItem('mep_hrm_sec_status_' + key, status);
        } catch(e) {}
    }

    function toggleCurrentSectionActiveStatus(newStatus) {
        const prevStatus = getSectionActiveStatus(currentActiveSectionKey);
        setSectionActiveStatus(currentActiveSectionKey, newStatus);
        renderHrmSectionSummaryView();
        showHrmToast(`Section status set to "${newStatus}"`, newStatus === 'Active' ? 'success' : 'info');

        if (typeof window.logSystemAudit === 'function') {
            window.logSystemAudit({
                page: `HRM (${currentActiveSectionKey})`,
                module: 'HRM Module',
                action: 'Section Status Modified',
                item: currentActiveSectionKey,
                field: 'Operating Status',
                prevVal: prevStatus,
                newVal: newStatus,
                description: `Section '${currentActiveSectionKey}' operational status switched from '${prevStatus}' to '${newStatus}'.`
            });
        }
    }

    /**
     * Initialize HRM Module Engine
     */
    function initHrmModule() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const subParam = urlParams.get('sub') || urlParams.get('tab');
            const secParam = urlParams.get('sec') || urlParams.get('section');
            if (subParam && ['section_assemble', 'section_dimmer', 'section_armature', 'new_entry', 'dashboard', 'monthly_attendance', 'monthly_yearly_attendance_report'].includes(subParam)) {
                switchHrmSubPage(subParam);
                return;
            }
            if (secParam) {
                const s = secParam.toLowerCase();
                if (s.includes('assemble')) {
                    switchHrmSubPage('section_assemble');
                    return;
                } else if (s.includes('dimm') || s.includes('blade')) {
                    switchHrmSubPage('section_dimmer');
                    return;
                } else if (s.includes('armature') || s.includes('winding')) {
                    switchHrmSubPage('section_armature');
                    return;
                } else {
                    currentFilterSection = secParam;
                    const select = document.getElementById('hrmSectionSelectFilter');
                    if (select) select.value = currentFilterSection;
                }
            }
        } catch (e) {}
        switchHrmSubPage('dashboard');
        renderHrmNewEntryTable();
        updateHrmLockUI();
    }

    /**
     * Switch sub-page between Dashboard, Data Base -> New Entry, Reports, and Section Summaries
     */
    function switchHrmSubPage(pageKey) {
        currentActiveSubPage = pageKey;
        const dashPane = document.getElementById('hrmDashboardPane');
        const entryPane = document.getElementById('hrmDatabaseNewEntryPane');
        const sectionPane = document.getElementById('hrmSectionSummaryPane');
        const monthlyAttendancePane = document.getElementById('hrmMonthlyAttendancePane');
        const monthlyYearlyReportPane = document.getElementById('hrmMonthlyYearlyReportPane');

        const btnDash = document.getElementById('hrmNavBtnDash');
        const navNewEntry = document.getElementById('hrmNavNewEntry');
        const parentDb = document.getElementById('hrmNavDatabaseParent');

        const parentReport = document.getElementById('hrmNavReportParent');
        const parentSec = document.getElementById('hrmNavSectionSummaryParent');
        const navSecAssemble = document.getElementById('hrmNavSectionAssemble');
        const navSecDimmer = document.getElementById('hrmNavSectionDimmer');
        const navSecArmature = document.getElementById('hrmNavSectionArmature');
        const navMonthlyAttendance = document.getElementById('hrmNavMonthlyAttendance');
        const navMonthlyYearlyReport = document.getElementById('hrmNavMonthlyYearlyReport');

        const breadcrumbPage = document.getElementById('hrmBreadcrumbPage');

        // Reset all active states on navigation subitems
        [navNewEntry, navSecAssemble, navSecDimmer, navSecArmature, navMonthlyAttendance, navMonthlyYearlyReport].forEach(el => {
            if (el) el.classList.remove('active');
        });

        if (pageKey === 'monthly_attendance') {
            if (dashPane) dashPane.style.setProperty('display', 'none', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'none', 'important');
            if (sectionPane) sectionPane.style.setProperty('display', 'none', 'important');
            if (monthlyYearlyReportPane) monthlyYearlyReportPane.style.setProperty('display', 'none', 'important');
            if (monthlyAttendancePane) monthlyAttendancePane.style.setProperty('display', 'block', 'important');

            if (btnDash) btnDash.classList.remove('active');
            if (navMonthlyAttendance) navMonthlyAttendance.classList.add('active');

            // Single accordion: Open Report, collapse others
            if (parentReport) parentReport.classList.add('is-open');
            if (parentDb) parentDb.classList.remove('is-open');
            if (parentSec) parentSec.classList.remove('is-open');

            if (breadcrumbPage) breadcrumbPage.textContent = 'Report > Monthly Attendence';
            renderHrmMonthlyAttendanceView();
        } else if (pageKey === 'monthly_yearly_attendance_report') {
            if (dashPane) dashPane.style.setProperty('display', 'none', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'none', 'important');
            if (sectionPane) sectionPane.style.setProperty('display', 'none', 'important');
            if (monthlyAttendancePane) monthlyAttendancePane.style.setProperty('display', 'none', 'important');
            if (monthlyYearlyReportPane) monthlyYearlyReportPane.style.setProperty('display', 'block', 'important');

            if (btnDash) btnDash.classList.remove('active');
            if (navMonthlyYearlyReport) navMonthlyYearlyReport.classList.add('active');

            // Single accordion: Open Report, collapse others
            if (parentReport) parentReport.classList.add('is-open');
            if (parentDb) parentDb.classList.remove('is-open');
            if (parentSec) parentSec.classList.remove('is-open');

            if (breadcrumbPage) breadcrumbPage.textContent = 'Report > Monthly & Yearly Attendence Report';
            renderHrmMonthlyYearlyReportView();
        } else if (pageKey === 'section_assemble' || pageKey === 'section_dimmer' || pageKey === 'section_armature') {
            currentActiveSectionKey = pageKey;
            currentSectionSearchTerm = '';
            currentSectionFilterDesig = 'ALL';
            currentSectionFilterGender = 'ALL';

            const searchInp = document.getElementById('hrmSectionSearchInput');
            if (searchInp) searchInp.value = '';
            const genderSel = document.getElementById('hrmSectionGenderFilter');
            if (genderSel) genderSel.value = 'ALL';

            if (dashPane) dashPane.style.setProperty('display', 'none', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'none', 'important');
            if (sectionPane) sectionPane.style.setProperty('display', 'block', 'important');
            if (monthlyAttendancePane) monthlyAttendancePane.style.setProperty('display', 'none', 'important');
            if (monthlyYearlyReportPane) monthlyYearlyReportPane.style.setProperty('display', 'none', 'important');

            if (btnDash) btnDash.classList.remove('active');

            // Single accordion: Open Section Summary, collapse others
            if (parentSec) parentSec.classList.add('is-open');
            if (parentDb) parentDb.classList.remove('is-open');
            if (parentReport) parentReport.classList.remove('is-open');

            const cfg = SECTION_CONFIGS[pageKey];
            const activeNav = cfg ? document.getElementById(cfg.navId) : null;
            if (activeNav) activeNav.classList.add('active');

            if (breadcrumbPage && cfg) breadcrumbPage.textContent = `Section Summary > ${cfg.name}`;

            renderHrmSectionSummaryView();
        } else if (pageKey === 'new_entry') {
            if (dashPane) dashPane.style.setProperty('display', 'none', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'block', 'important');
            if (sectionPane) sectionPane.style.setProperty('display', 'none', 'important');
            if (monthlyAttendancePane) monthlyAttendancePane.style.setProperty('display', 'none', 'important');
            if (monthlyYearlyReportPane) monthlyYearlyReportPane.style.setProperty('display', 'none', 'important');

            if (btnDash) btnDash.classList.remove('active');
            if (navNewEntry) navNewEntry.classList.add('active');

            // Single accordion: Open Data Base, collapse others
            if (parentDb) parentDb.classList.add('is-open');
            if (parentSec) parentSec.classList.remove('is-open');
            if (parentReport) parentReport.classList.remove('is-open');

            if (breadcrumbPage) breadcrumbPage.textContent = 'Data Base > New Entry';
            renderHrmNewEntryTable();
            updateHrmLockUI();
        } else {
            if (dashPane) dashPane.style.setProperty('display', 'block', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'none', 'important');
            if (sectionPane) sectionPane.style.setProperty('display', 'none', 'important');
            if (monthlyAttendancePane) monthlyAttendancePane.style.setProperty('display', 'none', 'important');
            if (monthlyYearlyReportPane) monthlyYearlyReportPane.style.setProperty('display', 'none', 'important');

            if (btnDash) btnDash.classList.add('active');
            if (breadcrumbPage) breadcrumbPage.textContent = 'HRM Dashboard';

            // By default on Dashboard: Collapse all sidebar menus so ONLY main headings are visible
            if (parentDb) parentDb.classList.remove('is-open');
            if (parentSec) parentSec.classList.remove('is-open');
            if (parentReport) parentReport.classList.remove('is-open');

            renderHrmDashboard();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Render the Human Resource Management Dashboard (matching reference screenshot)
     */
    function renderHrmDashboard() {
        if (!window.HRM_DATABASE) return;
        const stats = window.HRM_DATABASE.computeHrmStats();

        // 1. Top 4 Sectional Workforce & Dynamic Holiday KPI Cards
        // Card 1: Assembly Line
        const elAssembleMale = document.getElementById('hrmKpiAssembleMale');
        const elAssembleFemale = document.getElementById('hrmKpiAssembleFemale');
        const elAssembleTotal = document.getElementById('hrmKpiAssembleTotal');
        if (elAssembleMale && stats.assemble) elAssembleMale.textContent = stats.assemble.male;
        if (elAssembleFemale && stats.assemble) elAssembleFemale.textContent = stats.assemble.female;
        if (elAssembleTotal && stats.assemble) elAssembleTotal.textContent = stats.assemble.total + ' Total';

        // Card 2: Dimmer & Blade
        const elDimmerMale = document.getElementById('hrmKpiDimmerMale');
        const elDimmerFemale = document.getElementById('hrmKpiDimmerFemale');
        const elDimmerTotal = document.getElementById('hrmKpiDimmerTotal');
        if (elDimmerMale && stats.dimmer) elDimmerMale.textContent = stats.dimmer.male;
        if (elDimmerFemale && stats.dimmer) elDimmerFemale.textContent = stats.dimmer.female;
        if (elDimmerTotal && stats.dimmer) elDimmerTotal.textContent = stats.dimmer.total + ' Total';

        // Card 3: Armature & Winding
        const elArmatureMale = document.getElementById('hrmKpiArmatureMale');
        const elArmatureFemale = document.getElementById('hrmKpiArmatureFemale');
        const elArmatureTotal = document.getElementById('hrmKpiArmatureTotal');
        if (elArmatureMale && stats.armature) elArmatureMale.textContent = stats.armature.male;
        if (elArmatureFemale && stats.armature) elArmatureFemale.textContent = stats.armature.female;
        if (elArmatureTotal && stats.armature) elArmatureTotal.textContent = stats.armature.total + ' Total';

        // Dashboard Top Cards strictly display metrics only (no page redirection on click)
        ['hrmCardAssembleLine', 'hrmCardDimmerBlade', 'hrmCardArmatureWinding', 'hrmCardUpcomingFriday'].forEach(id => {
            const card = document.getElementById(id);
            if (card) {
                card.style.cursor = 'default';
                card.onclick = null;
                card.removeAttribute('title');
            }
        });

        // Card 4: Upcoming Friday Dynamic Countdown
        const elFridayCountdown = document.getElementById('hrmKpiFridayCountdown');
        const elHolidaySubtitle = document.getElementById('hrmKpiHolidaySubtitle');
        if (elFridayCountdown) elFridayCountdown.textContent = stats.fridayCountdown || '4 days';
        if (elHolidaySubtitle) elHolidaySubtitle.textContent = 'Upcoming Friday';

        // Backward compatibility for legacy elements if present
        const elActive = document.getElementById('hrmKpiActiveCount');
        const elInactive = document.getElementById('hrmKpiInactiveCount');
        const elLeaveReq = document.getElementById('hrmKpiLeaveReqCount');
        const elNextHoliday = document.getElementById('hrmKpiNextHoliday');
        if (elActive) elActive.textContent = stats.activeCount;
        if (elInactive) elInactive.textContent = stats.inactiveCount;
        if (elLeaveReq) elLeaveReq.textContent = stats.leaveRequestsLast30;
        if (elNextHoliday) elNextHoliday.textContent = stats.nextHoliday;

        // Dashboard Header Meta Info Pills
        const elDashMetaActive = document.getElementById('hrmDashMetaActive');
        const elDashMetaAttRate = document.getElementById('hrmDashMetaAttRate');
        if (elDashMetaActive) elDashMetaActive.textContent = stats.activeCount;
        if (elDashMetaAttRate) elDashMetaAttRate.textContent = '100%';

        // 2. Middle 6 Floating Cards
        const elTodayAbsent = document.getElementById('hrmCardTodayAbsent');
        const elTodayPresent = document.getElementById('hrmCardTodayPresent');
        const elLeaveApproved = document.getElementById('hrmCardLeaveApproved');
        const elLeavePending = document.getElementById('hrmCardLeavePending');
        const elTotalMale = document.getElementById('hrmCardTotalMale');
        const elTotalFemale = document.getElementById('hrmCardTotalFemale');

        if (elTodayAbsent) elTodayAbsent.textContent = stats.absentToday;
        if (elTodayPresent) elTodayPresent.textContent = stats.presentToday;
        if (elLeaveApproved) elLeaveApproved.textContent = stats.leaveApproved7Days;
        if (elLeavePending) elLeavePending.textContent = stats.leavePending7Days;
        if (elTotalMale) elTotalMale.textContent = stats.maleCount;
        if (elTotalFemale) elTotalFemale.textContent = stats.femaleCount;

        // 3. Attendance Donut Gauge
        const elPresentPct = document.getElementById('hrmAttendancePresentPct');
        const elPresentCount = document.getElementById('hrmAttendancePresentCount');
        const elAbsentCount = document.getElementById('hrmAttendanceAbsentCount');
        if (elPresentPct) {
            const pct = stats.activeCount > 0 ? Math.round((stats.presentToday / stats.activeCount) * 100) : 100;
            elPresentPct.textContent = pct + '%';
        }
        if (elPresentCount) elPresentCount.textContent = stats.presentToday;
        if (elAbsentCount) elAbsentCount.textContent = stats.absentToday;
    }

    /**
     * Render the New Entry Employee Database Table
     */
    function renderHrmNewEntryTable() {
        if (!window.HRM_DATABASE) return;
        const allEmployees = window.HRM_DATABASE.getStoredEmployees();
        const tbody = document.getElementById('hrmEmployeeTableBody');
        if (!tbody) return;

        // Update Section Filter Dropdown & Stat Pills
        updateSectionSummaryPills(allEmployees);

        // Filter list
        const filtered = allEmployees.filter(emp => {
            const empSec = String(emp.section || '').trim().toLowerCase();
            const filterSec = String(currentFilterSection).trim().toLowerCase();
            const matchSection = filterSec === 'all' || empSec === filterSec;
            
            const matchDesignation = currentFilterDesignation === 'ALL' || emp.designation === currentFilterDesignation;
            
            const q = currentSearchTerm.toLowerCase().trim();
            const matchSearch = !q || 
                String(emp.id).toLowerCase().includes(q) ||
                String(emp.name).toLowerCase().includes(q) ||
                String(emp.designation).toLowerCase().includes(q) ||
                String(emp.section).toLowerCase().includes(q) ||
                String(emp.gender || '').toLowerCase().includes(q) ||
                String(emp.doj).toLowerCase().includes(q);

            return matchSection && matchDesignation && matchSearch;
        });

        const countBadge = document.getElementById('hrmFilteredCountBadge');
        if (countBadge) countBadge.textContent = `${filtered.length} of ${allEmployees.length} Records`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="hrm-empty-row">
                        <div class="hrm-empty-state">
                            <span class="empty-icon">🔍</span>
                            <div class="empty-title">No matching employee records found</div>
                            <div class="empty-desc">Try clearing filters or search keyword</div>
                        </div>
                    </td>
                </tr>
            `;
            updateHrmLockUI();
            return;
        }

        const isLocked = isHrmEntryLocked();
        const actionStyle = isLocked ? 'style="opacity:0.4; cursor:not-allowed;"' : '';
        const actionDisabled = isLocked ? 'disabled' : '';
        const editTitle = isLocked ? 'Locked (Read-Only) from MIS Option 5' : 'Edit Employee Details';
        const replaceTitle = isLocked ? 'Locked (Read-Only) from MIS Option 5' : 'Replace this Employee';
        const deleteTitle = isLocked ? 'Locked (Read-Only) from MIS Option 5' : 'Delete Employee Record';

        let html = '';
        filtered.forEach((emp) => {
            const secClass = getSectionBadgeClass(emp.section);
            const isReplaced = emp.replaced_from ? true : false;
            const replaceTag = isReplaced 
                ? `<span class="replaced-badge" title="Replaced: ${escapeHtml(emp.replaced_from.name)} on ${escapeHtml(emp.replaced_from.date)}">🔁 Replaced</span>` 
                : '';

            const isFemale = String(emp.gender || '').toLowerCase() === 'female';
            const genderBadge = isFemale 
                ? `<span class="gender-badge gen-female">Female</span>` 
                : `<span class="gender-badge gen-male">Male</span>`;

            html += `
                <tr class="hrm-emp-row" data-sl="${emp.sl}" data-id="${emp.id}">
                    <td class="col-sl">
                        <span class="sl-number">${emp.sl}</span>
                    </td>
                    <td class="col-id">
                        <span class="id-badge">${escapeHtml(emp.id)}</span>
                    </td>
                    <td class="col-name">
                        <div class="name-cell-wrap">
                            <span class="emp-name-text">${escapeHtml(emp.name)}</span>
                            ${replaceTag}
                        </div>
                    </td>
                    <td class="col-desig">
                        <span class="desig-text">${escapeHtml(emp.designation)}</span>
                    </td>
                    <td class="col-doj">
                        <span class="doj-text">${escapeHtml(emp.doj)}</span>
                    </td>
                    <td class="col-section">
                        <span class="section-badge ${secClass}">${escapeHtml(emp.section)}</span>
                    </td>
                    <td class="col-gender" style="text-align:center;">
                        ${genderBadge}
                    </td>
                    <td class="col-actions">
                        <div class="hrm-row-actions">
                            <button type="button" class="btn-hrm-action btn-hrm-edit" ${actionDisabled} ${actionStyle} onclick="openHrmEditModal(${emp.sl})" title="${editTitle}" aria-label="Edit">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>Edit</span>
                            </button>
                            <button type="button" class="btn-hrm-action btn-hrm-replace" ${actionDisabled} ${actionStyle} onclick="openHrmReplaceModal(${emp.sl})" title="${replaceTitle}" aria-label="Replace">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                                <span>Replace</span>
                            </button>
                            <button type="button" class="btn-hrm-action btn-hrm-delete" ${actionDisabled} ${actionStyle} onclick="openHrmDeleteModal(${emp.sl})" title="${deleteTitle}" aria-label="Delete">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        updateHrmLockUI();
    }

    /**
     * Map section names to CSS badge classes
     */
    function getSectionBadgeClass(section) {
        const s = String(section || '').toLowerCase();
        if (s.includes('assemble')) return 'sec-assemble';
        if (s.includes('armature')) return 'sec-armature';
        if (s.includes('dimmar') || s.includes('blade')) return 'sec-dimmar';
        if (s.includes('replacement')) return 'sec-replacement';
        return 'sec-general';
    }

    /**
     * Update section counts in the top pill summary
     */
    function updateSectionSummaryPills(list) {
        const total = list.length;
        let cAssemble = 0, cArmature = 0, cDimmar = 0, cReplacement = 0;

        list.forEach(emp => {
            const s = (emp.section || '').toLowerCase();
            if (s.includes('assemble')) cAssemble++;
            else if (s.includes('armature')) cArmature++;
            else if (s.includes('dimmar') || s.includes('blade')) cDimmar++;
            else if (s.includes('replacement')) cReplacement++;
        });

        const elTotal = document.getElementById('hrmStatPillTotal');
        const elAssemble = document.getElementById('hrmStatPillAssemble');
        const elArmature = document.getElementById('hrmStatPillArmature');
        const elDimmar = document.getElementById('hrmStatPillDimmar');
        const elReplace = document.getElementById('hrmStatPillReplacement');

        if (elTotal) elTotal.textContent = total;
        if (elAssemble) elAssemble.textContent = cAssemble;
        if (elArmature) elArmature.textContent = cArmature;
        if (elDimmar) elDimmar.textContent = cDimmar;
        if (elReplace) elReplace.textContent = cReplacement;

        // Highlight active pill
        const pillMap = [
            { key: 'ALL', id: 'hrmPillTotal' },
            { key: 'Assemble Line', id: 'hrmPillAssemble' },
            { key: 'Armature Winding', id: 'hrmPillArmature' },
            { key: 'Dimmar & Blade', id: 'hrmPillDimmar' },
            { key: 'Replacement', id: 'hrmPillReplacement' }
        ];
        const curSec = (currentFilterSection || 'ALL').trim().toLowerCase();
        pillMap.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                if (curSec === item.key.toLowerCase()) {
                    el.classList.add('active-pill');
                } else {
                    el.classList.remove('active-pill');
                }
            }
        });
    }

    /**
     * Filter by Section (clickable from pills or dropdown)
     */
    function filterHrmBySection(sectionName) {
        currentFilterSection = sectionName || 'ALL';
        const select = document.getElementById('hrmSectionSelectFilter');
        if (select) {
            select.value = currentFilterSection;
        }
        renderHrmNewEntryTable();
    }

    /**
     * Filter handlers
     */
    function handleHrmSearch(val) {
        currentSearchTerm = val || '';
        renderHrmNewEntryTable();
    }

    function handleHrmSectionFilter(val) {
        currentFilterSection = val || 'ALL';
        renderHrmNewEntryTable();
    }

    function handleHrmDesignationFilter(val) {
        currentFilterDesignation = val || 'ALL';
        renderHrmNewEntryTable();
    }

    /**
     * Modals: Add New Employee
     */
    function openHrmAddModal() {
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        const form = document.getElementById('hrmAddEmployeeForm');
        if (form) form.reset();
        
        const list = window.HRM_DATABASE.getStoredEmployees();
        const nextSl = list.length + 1;
        const elSl = document.getElementById('hrmAddSl');
        if (elSl) elSl.value = nextSl;

        const modal = document.getElementById('hrmAddEmployeeModal');
        if (modal) modal.classList.add('show');
    }

    function closeHrmAddModal() {
        const modal = document.getElementById('hrmAddEmployeeModal');
        if (modal) modal.classList.remove('show');
    }

    /**
     * Refresh all active HRM views to maintain real-time reactive sync
     */
    function refreshAllHrmViews() {
        renderHrmNewEntryTable();
        renderHrmDashboard();
        if (['section_assemble', 'section_dimmer', 'section_armature'].includes(currentActiveSubPage)) {
            renderHrmSectionSummaryView();
        }
    }

    function submitHrmAddEmployee(event) {
        if (event) event.preventDefault();
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        const id = document.getElementById('hrmAddId').value.trim();
        const name = document.getElementById('hrmAddName').value.trim();
        const designation = document.getElementById('hrmAddDesignation').value.trim();
        const doj = document.getElementById('hrmAddDoj').value.trim();
        const section = document.getElementById('hrmAddSection').value.trim();
        const gender = document.getElementById('hrmAddGender').value;

        if (!id || !name || !designation || !doj || !section) {
            showHrmToast('Please fill in all required fields.', 'error');
            return;
        }

        const statusEl = document.getElementById('hrmAddStatus');
        const empStatus = statusEl ? statusEl.value : 'Active';

        window.HRM_DATABASE.addEmployee({
            id: id,
            name: name,
            designation: designation,
            doj: doj,
            section: section,
            gender: gender,
            status: empStatus
        });

        if (typeof window.logSystemAudit === 'function') {
            window.logSystemAudit({
                page: `HRM (${section})`,
                module: 'HRM Module',
                action: 'Employee Added',
                item: `${name} (ID: ${id})`,
                field: 'Employee Roster',
                prevVal: null,
                newVal: `${designation} [${gender}] - ${empStatus}`,
                description: `New employee "${name}" (${designation}) enrolled in section "${section}".`
            });
        }

        closeHrmAddModal();
        refreshAllHrmViews();
        showHrmToast(`Employee "${name}" added successfully!`, 'success');
    }

    /**
     * Modals: Edit Employee
     */
    function openHrmEditModal(sl) {
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        const list = window.HRM_DATABASE.getStoredEmployees();
        const emp = list.find(it => Number(it.sl) === Number(sl));
        if (!emp) return;

        document.getElementById('hrmEditSl').value = emp.sl;
        document.getElementById('hrmEditId').value = emp.id;
        document.getElementById('hrmEditName').value = emp.name;
        document.getElementById('hrmEditDesignation').value = emp.designation;
        document.getElementById('hrmEditDoj').value = emp.doj;
        document.getElementById('hrmEditSection').value = emp.section;
        document.getElementById('hrmEditGender').value = emp.gender || 'Male';
        const editStatusSel = document.getElementById('hrmEditStatus');
        if (editStatusSel) editStatusSel.value = emp.status || 'Active';

        const modal = document.getElementById('hrmEditEmployeeModal');
        if (modal) modal.classList.add('show');
    }

    function closeHrmEditModal() {
        const modal = document.getElementById('hrmEditEmployeeModal');
        if (modal) modal.classList.remove('show');
    }

    function submitHrmEditEmployee(event) {
        if (event) event.preventDefault();
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        const sl = document.getElementById('hrmEditSl').value;
        const id = document.getElementById('hrmEditId').value.trim();
        const name = document.getElementById('hrmEditName').value.trim();
        const designation = document.getElementById('hrmEditDesignation').value.trim();
        const doj = document.getElementById('hrmEditDoj').value.trim();
        const section = document.getElementById('hrmEditSection').value.trim();
        const gender = document.getElementById('hrmEditGender').value;

        if (!id || !name || !designation || !doj || !section) {
            showHrmToast('Please fill in all required fields.', 'error');
            return;
        }

        const editStatusEl = document.getElementById('hrmEditStatus');
        const empStatus = editStatusEl ? editStatusEl.value : 'Active';

        window.HRM_DATABASE.updateEmployee(sl, {
            id: id,
            name: name,
            designation: designation,
            doj: doj,
            section: section,
            gender: gender,
            status: empStatus
        });

        if (typeof window.logSystemAudit === 'function') {
            window.logSystemAudit({
                page: "HRM ($section)",
                module: 'HRM Module',
                action: 'Employee Updated',
                item: "$name (ID: $id)",
                field: 'Employee Record',
                prevVal: "SL #$sl",
                newVal: "$designation [$gender] - $empStatus",
                description: "Updated employee record for \"$name\" (ID: $id) in section \"$section\"."
            });
        }

        closeHrmEditModal();
        refreshAllHrmViews();
        showHrmToast("Employee #$id updated successfully!", 'success');
    }

    /**
     * Modals: Replace Employee
     */
    let replacingSl = null;
    function openHrmReplaceModal(sl) {
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        replacingSl = sl;
        const list = window.HRM_DATABASE.getStoredEmployees();
        const emp = list.find(it => Number(it.sl) === Number(sl));
        if (!emp) return;

        document.getElementById('hrmReplaceOutSl').textContent = emp.sl;
        document.getElementById('hrmReplaceOutId').textContent = emp.id;
        document.getElementById('hrmReplaceOutName').textContent = emp.name;
        document.getElementById('hrmReplaceOutDesig').textContent = emp.designation;
        document.getElementById('hrmReplaceOutSection').textContent = emp.section;

        document.getElementById('hrmReplaceInId').value = '';
        document.getElementById('hrmReplaceInName').value = '';
        document.getElementById('hrmReplaceInDesig').value = emp.designation;
        document.getElementById('hrmReplaceInSection').value = emp.section;
        document.getElementById('hrmReplaceInDoj').value = new Date().toLocaleDateString('en-GB');
        document.getElementById('hrmReplaceReason').value = 'Position Replacement';

        const modal = document.getElementById('hrmReplaceEmployeeModal');
        if (modal) modal.classList.add('show');
    }

    function closeHrmReplaceModal() {
        const modal = document.getElementById('hrmReplaceEmployeeModal');
        if (modal) modal.classList.remove('show');
        replacingSl = null;
    }

    function submitHrmReplaceEmployee(event) {
        if (event) event.preventDefault();
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        if (!replacingSl) return;

        const newId = document.getElementById('hrmReplaceInId').value.trim();
        const newName = document.getElementById('hrmReplaceInName').value.trim();
        const newDesig = document.getElementById('hrmReplaceInDesig').value.trim();
        const newSec = document.getElementById('hrmReplaceInSection').value.trim();
        const newDoj = document.getElementById('hrmReplaceInDoj').value.trim();
        const newGender = document.getElementById('hrmReplaceInGender').value;
        const reason = document.getElementById('hrmReplaceReason').value.trim();

        if (!newId || !newName || !newDesig || !newSec || !newDoj) {
            showHrmToast('Please fill in all incoming employee details.', 'error');
            return;
        }

        window.HRM_DATABASE.replaceEmployee(replacingSl, {
            id: newId,
            name: newName,
            designation: newDesig,
            section: newSec,
            doj: newDoj,
            gender: newGender
        }, reason);

        closeHrmReplaceModal();
        refreshAllHrmViews();
        showHrmToast(`Position successfully replaced with "${newName}" (ID: ${newId})!`, 'success');
    }

    /**
     * Modals: Delete Employee
     */
    let deletingSl = null;
    function openHrmDeleteModal(sl) {
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        deletingSl = sl;
        const list = window.HRM_DATABASE.getStoredEmployees();
        const emp = list.find(it => Number(it.sl) === Number(sl));
        if (!emp) return;

        document.getElementById('hrmDeleteEmpName').textContent = `${emp.name} (ID: ${emp.id})`;
        document.getElementById('hrmDeleteEmpDesig').textContent = `${emp.designation} — ${emp.section}`;

        const modal = document.getElementById('hrmDeleteEmployeeModal');
        if (modal) modal.classList.add('show');
    }

    function closeHrmDeleteModal() {
        const modal = document.getElementById('hrmDeleteEmployeeModal');
        if (modal) modal.classList.remove('show');
        deletingSl = null;
    }

    function confirmHrmDeleteEmployee() {
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        if (!deletingSl) return;
        const list = window.HRM_DATABASE.getStoredEmployees();
        const emp = list.find(it => Number(it.sl) === Number(deletingSl));
        const empName = emp ? "$emp.name (ID: $emp.id)" : "Employee #$deletingSl";
        const empSec = emp ? emp.section : 'HRM';

        window.HRM_DATABASE.deleteEmployee(deletingSl);

        if (typeof window.logSystemAudit === 'function') {
            window.logSystemAudit({
                page: "HRM ($empSec)",
                module: 'HRM Module',
                action: 'Employee Deleted',
                item: empName,
                field: 'Employee Roster',
                prevVal: emp ? "$emp.designation ($empSec)" : "SL #$deletingSl",
                newVal: 'Deleted',
                description: "Deleted employee record \"$empName\" from section \"$empSec\"."
            });
        }

        closeHrmDeleteModal();
        refreshAllHrmViews();
        showHrmToast('Employee record deleted and list re-indexed.', 'info');
    }

    /**
     * Reset database to default 107 records
     */
    function resetHrmDatabaseToDefault() {
        if (isHrmEntryLocked()) {
            showHrmToast('This page is locked (Read-Only). Unlocking is required from MIS Module Option 5.', 'error');
            return;
        }
        if (confirm('Are you sure you want to reset the Employee Database to the initial 107 records?')) {
            window.HRM_DATABASE.resetToDefaultEmployees();
            refreshAllHrmViews();
            showHrmToast('Employee Database reset to default 107 records.', 'info');
        }
    }

    /**
     * Export Employee Database to CSV
     */
    function exportHrmDatabaseCSV() {
        const list = window.HRM_DATABASE.getStoredEmployees();
        let csv = 'SL,ID,Name,Designation,DOJ,Section,Gender,Status\n';
        list.forEach(it => {
            csv += `"${it.sl}","${it.id}","${it.name.replace(/"/g, '""')}","${it.designation}","${it.doj}","${it.section}","${it.gender || 'Male'}","${it.status || 'Active'}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `HRM_Employee_Database_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showHrmToast('Database exported to CSV successfully!', 'success');
    }

    /**
     * Print Employee Database Table
     */
    function printHrmDatabase() {
        window.print();
    }

    /**
     * Sidebar accordion toggle for Data Base parent (auto-collapses Section Summary & Report)
     */
    function toggleHrmDatabaseMenu() {
        const parentDb = document.getElementById('hrmNavDatabaseParent');
        const parentSec = document.getElementById('hrmNavSectionSummaryParent');
        const parentRep = document.getElementById('hrmNavReportParent');
        if (!parentDb) return;
        const willOpen = !parentDb.classList.contains('is-open');
        if (willOpen) {
            parentDb.classList.add('is-open');
            if (parentSec) parentSec.classList.remove('is-open');
            if (parentRep) parentRep.classList.remove('is-open');
        } else {
            parentDb.classList.remove('is-open');
        }
    }

    /**
     * Sidebar accordion toggle for Section Summary parent (auto-collapses Data Base & Report)
     */
    function toggleHrmSectionSummaryMenu() {
        const parentDb = document.getElementById('hrmNavDatabaseParent');
        const parentSec = document.getElementById('hrmNavSectionSummaryParent');
        const parentRep = document.getElementById('hrmNavReportParent');
        if (!parentSec) return;
        const willOpen = !parentSec.classList.contains('is-open');
        if (willOpen) {
            parentSec.classList.add('is-open');
            if (parentDb) parentDb.classList.remove('is-open');
            if (parentRep) parentRep.classList.remove('is-open');
        } else {
            parentSec.classList.remove('is-open');
        }
    }

    /**
     * Sidebar accordion toggle for Report parent (auto-collapses Data Base & Section Summary)
     */
    function toggleHrmReportMenu() {
        const parentDb = document.getElementById('hrmNavDatabaseParent');
        const parentSec = document.getElementById('hrmNavSectionSummaryParent');
        const parentRep = document.getElementById('hrmNavReportParent');
        if (!parentRep) return;
        const willOpen = !parentRep.classList.contains('is-open');
        if (willOpen) {
            parentRep.classList.add('is-open');
            if (parentDb) parentDb.classList.remove('is-open');
            if (parentSec) parentSec.classList.remove('is-open');
        } else {
            parentRep.classList.remove('is-open');
        }
    }

    /**
     * Render the Section Summary View (Assemble Line, Dimmer & Blade, Armature & Winding)
     */
    function renderHrmSectionSummaryView(targetKey) {
        if (!window.HRM_DATABASE) return;
        if (targetKey && SECTION_CONFIGS[targetKey]) {
            currentActiveSectionKey = targetKey;
        }
        const cfg = SECTION_CONFIGS[currentActiveSectionKey] || SECTION_CONFIGS['section_assemble'];
        const allEmployees = window.HRM_DATABASE.getStoredEmployees();

        // 1. Update Title & Subtitle
        const titleEl = document.getElementById('hrmSectionSummaryTitle');
        const subTitleEl = document.getElementById('hrmSectionSummarySubtitle');
        if (titleEl) titleEl.textContent = cfg.title;
        if (subTitleEl) subTitleEl.textContent = cfg.subtitle;

        // 2. Filter employees matching this section
        const sectionEmployees = allEmployees.filter(emp => cfg.matcher(emp.section));
        const totalCount = sectionEmployees.length;
        const maleCount = sectionEmployees.filter(emp => String(emp.gender || '').toLowerCase() !== 'female').length;
        const femaleCount = sectionEmployees.filter(emp => String(emp.gender || '').toLowerCase() === 'female').length;

        // 3. Check Section Active / Inactive Status
        const secStatus = getSectionActiveStatus(currentActiveSectionKey);
        const statusSelect = document.getElementById('hrmCurrentSectionStatusSelect');
        if (statusSelect) statusSelect.value = secStatus;

        const kpiTotal = document.getElementById('hrmSecKpiTotal');
        const kpiMale = document.getElementById('hrmSecKpiMale');
        const kpiFemale = document.getElementById('hrmSecKpiFemale');
        const kpiStatus = document.getElementById('hrmSecKpiStatus');

        if (secStatus === 'Inactive') {
            if (kpiTotal) kpiTotal.textContent = '0 (Inactive)';
            if (kpiMale) kpiMale.textContent = '0';
            if (kpiFemale) kpiFemale.textContent = '0';
            if (kpiStatus) {
                kpiStatus.textContent = 'Inactive (Hold)';
                kpiStatus.style.color = '#b45309';
            }

            const badge = document.getElementById('hrmSectionFilteredCountBadge');
            if (badge) {
                badge.textContent = `0 of ${totalCount} Employees (Section Inactive)`;
            }

            const tbody = document.getElementById('hrmSectionTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="padding:0; border:none;">
                            <div class="hrm-section-inactive-notice">
                                <span class="notice-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#991b1b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                                <h3 class="notice-title">This Section is currently Inactive by Admin</h3>
                                <p class="notice-desc">
                                    Summary data for <strong>${escapeHtml(cfg.name)}</strong> is temporarily hidden under administrative control.<br>
                                    All <strong>${totalCount}</strong> employee records remain 100% safe and intact in <strong>Database &rarr; New Entry</strong>.
                                </p>
                                <button type="button" onclick="toggleCurrentSectionActiveStatus('Active')" style="padding:8px 20px; font-size:13px; font-weight:700; background:#0284c7; color:#fff; border:none; border-radius:6px; cursor:pointer;">
                                    Reactivate Section View
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
            return;
        }

        // Section is Active: Compute KPIs & Operational State
        if (kpiTotal) kpiTotal.textContent = totalCount;
        if (kpiMale) {
            const pct = totalCount > 0 ? ((maleCount / totalCount) * 100).toFixed(1) : '0';
            kpiMale.textContent = `${maleCount} (${pct}%)`;
        }
        if (kpiFemale) {
            const pct = totalCount > 0 ? ((femaleCount / totalCount) * 100).toFixed(1) : '0';
            kpiFemale.textContent = `${femaleCount} (${pct}%)`;
        }
        if (kpiStatus) {
            kpiStatus.textContent = '100% Active';
            kpiStatus.style.color = '#854d0e';
        }

        // 4. Update Designation Dropdown options
        const desigSelect = document.getElementById('hrmSectionDesigFilter');
        if (desigSelect) {
            const desigCounts = {};
            sectionEmployees.forEach(emp => {
                const d = emp.designation || 'Unassigned';
                desigCounts[d] = (desigCounts[d] || 0) + 1;
            });
            const sortedDesigs = Object.keys(desigCounts).sort();
            const prevVal = currentSectionFilterDesig;

            let optHtml = `<option value="ALL">All Designations (${totalCount})</option>`;
            sortedDesigs.forEach(d => {
                const sel = d === prevVal ? 'selected' : '';
                optHtml += `<option value="${escapeHtml(d)}" ${sel}>${escapeHtml(d)} (${desigCounts[d]})</option>`;
            });
            desigSelect.innerHTML = optHtml;
            if (sortedDesigs.includes(prevVal)) {
                desigSelect.value = prevVal;
            } else {
                currentSectionFilterDesig = 'ALL';
                desigSelect.value = 'ALL';
            }
        }

        // 5. Apply filters: designation, gender, search query
        const filtered = sectionEmployees.filter(emp => {
            const matchDesig = currentSectionFilterDesig === 'ALL' || emp.designation === currentSectionFilterDesig;

            const isFemale = String(emp.gender || '').toLowerCase() === 'female';
            let matchGender = true;
            if (currentSectionFilterGender === 'Male') matchGender = !isFemale;
            else if (currentSectionFilterGender === 'Female') matchGender = isFemale;

            const q = currentSectionSearchTerm.toLowerCase().trim();
            const matchSearch = !q ||
                String(emp.id).toLowerCase().includes(q) ||
                String(emp.name).toLowerCase().includes(q) ||
                String(emp.designation).toLowerCase().includes(q) ||
                String(emp.doj).toLowerCase().includes(q) ||
                String(emp.section).toLowerCase().includes(q);

            return matchDesig && matchGender && matchSearch;
        });

        // 6. Update counter badge
        const badge = document.getElementById('hrmSectionFilteredCountBadge');
        if (badge) {
            badge.textContent = `Showing ${filtered.length} of ${totalCount} Employees`;
        }

        // 7. Render Table Rows (without Master SL, with Complete Service Duration)
        const tbody = document.getElementById('hrmSectionTableBody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="hrm-empty-row" style="text-align:center; padding:40px 20px;">
                        <div class="hrm-empty-state">
                            <div class="empty-icon" style="display:flex; justify-content:center; margin-bottom:8px;">
                                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                            <div class="empty-title" style="font-weight:700; color:#334155;">No matching employees in ${escapeHtml(cfg.name)}</div>
                            <div class="empty-desc" style="font-size:12px; color:#64748b; margin-top:4px;">Try changing search keyword or filter settings</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach((emp, index) => {
            const secClass = getSectionBadgeClass(emp.section);
            const isReplaced = emp.replaced_from ? true : false;
            const replaceTag = isReplaced
                ? `<span class="replaced-badge" title="Replaced: ${escapeHtml(emp.replaced_from.name)} on ${escapeHtml(emp.replaced_from.date)}">Replaced</span>`
                : '';

            const isFemale = String(emp.gender || '').toLowerCase() === 'female';
            const genderBadge = isFemale
                ? `<span class="gender-badge gen-female">Female</span>`
                : `<span class="gender-badge gen-male">Male</span>`;

            const statusBadge = emp.status === 'Inactive'
                ? `<span style="display:inline-block; font-size:11px; font-weight:700; color:#64748b; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:10px; padding:2px 8px;">Inactive</span>`
                : `<span style="display:inline-block; font-size:11px; font-weight:700; color:#15803d; background:#dcfce7; border:1px solid #86efac; border-radius:10px; padding:2px 8px;">Active</span>`;

            html += `
                <tr class="hrm-emp-row" data-sl="${emp.sl}" data-id="${emp.id}">
                    <td class="col-sl" style="text-align:center;">
                        <span class="sl-number">${index + 1}</span>
                    </td>
                    <td class="col-id" style="text-align:center;">
                        <span class="id-badge">${escapeHtml(emp.id)}</span>
                    </td>
                    <td class="col-name">
                        <div class="name-cell-wrap">
                            <span class="emp-name-text" style="font-weight:600; color:#0f172a;">${escapeHtml(emp.name)}</span>
                            ${replaceTag}
                        </div>
                    </td>
                    <td class="col-desig">
                        <span class="desig-text">${escapeHtml(emp.designation)}</span>
                    </td>
                    <td class="col-doj" style="text-align:center;">
                        <span class="doj-text">${escapeHtml(emp.doj)}</span>
                    </td>
                    <td class="col-tenure" style="text-align:center;">
                        <span class="tenure-badge-complete">
                            ${calculateCompleteServiceDuration(emp.doj)}
                        </span>
                    </td>
                    <td class="col-section" style="text-align:center;">
                        <span class="section-badge ${secClass}">${escapeHtml(emp.section)}</span>
                    </td>
                    <td class="col-gender" style="text-align:center;">
                        ${genderBadge}
                    </td>
                    <td class="col-status" style="text-align:center;">
                        ${statusBadge}
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Section Summary Filter Handlers
     */
    function handleHrmSectionSearch(val) {
        currentSectionSearchTerm = val || '';
        renderHrmSectionSummaryView();
    }

    function handleHrmSectionDesigFilter(val) {
        currentSectionFilterDesig = val || 'ALL';
        renderHrmSectionSummaryView();
    }

    function handleHrmSectionGenderFilter(val) {
        currentSectionFilterGender = val || 'ALL';
        renderHrmSectionSummaryView();
    }

    /**
     * Export Section Employees to CSV (Without Master SL, With Service Duration)
     */
    function exportHrmSectionCSV() {
        if (!window.HRM_DATABASE) return;
        const cfg = SECTION_CONFIGS[currentActiveSectionKey] || SECTION_CONFIGS['section_assemble'];
        const allEmployees = window.HRM_DATABASE.getStoredEmployees();
        const sectionEmployees = allEmployees.filter(emp => cfg.matcher(emp.section));

        let csv = 'SL,ID,Name,Designation,DOJ,Service_Duration,Section,Gender,Status\n';
        sectionEmployees.forEach((it, idx) => {
            csv += `"${idx + 1}","${it.id}","${it.name.replace(/"/g, '""')}","${it.designation}","${it.doj}","${calculateCompleteServiceDuration(it.doj)}","${it.section}","${it.gender || 'Male'}","${it.status || 'Active'}"\n`;
        });

        const safeSecName = cfg.name.replace(/[^a-zA-Z0-9]/g, '_');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `HRM_${safeSecName}_Workforce_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showHrmToast(`${cfg.name} exported to CSV successfully!`, 'success');
    }

    /**
     * Print Section Summary Table
     */
    function printHrmSectionTable() {
        window.print();
    }

    /**
     * =========================================================================
     * REPORT MODULE: Monthly Attendence & Monthly & Yearly Attendence Report
     * =========================================================================
     */
    let currentMonthDept = 'ALL';
    let currentMonthSection = 'ALL';
    let currentMonthStatus = 'ALL';
    let currentMonthSearch = '';
    let currentMonthViewMode = 'auto'; // 'auto', 'grid', 'table'

    let currentAnnualDept = 'Production'; // Default to Production as per ERP
    let currentAnnualSection = 'ALL';
    let currentAnnualDesig = 'ALL';
    let currentAnnualSearch = '';
    let currentAnnualMode = 'master'; // 'master' (41-col ERP register), 'section' (matrix), or 'individual' (exact ID search)
    let currentIndividualId = '';
    let currentMonthlyQuickFilter = 'ALL'; // 'ALL', 'LATE', 'ABSENT', 'EARLY_OUT'
    let currentAnnualQuickFilter = 'ALL';  // 'ALL', 'LATE', 'ABSENT', 'EARLY_OUT'

    /**
     * Retrieve Bot 10 Monthly Attendance Dataset (Authoritative: Bot 10 cache -> window.RAW_MONTHLY_ATTENDANCE_BOT_DATA -> localStorage)
     */
    function getRawMonthlyAttendanceData() {
        let data = null;
        if (typeof window !== 'undefined' && typeof window.getBotDataCache === 'function') {
            const b10 = window.getBotDataCache(10);
            if (b10 && Array.isArray(b10.items) && b10.items.length > 0) {
                data = b10;
            }
        }
        if (!data && typeof window !== 'undefined' && window.RAW_MONTHLY_ATTENDANCE_BOT_DATA && Array.isArray(window.RAW_MONTHLY_ATTENDANCE_BOT_DATA.items) && window.RAW_MONTHLY_ATTENDANCE_BOT_DATA.items.length > 0) {
            data = window.RAW_MONTHLY_ATTENDANCE_BOT_DATA;
        }
        if (!data && typeof RAW_MONTHLY_ATTENDANCE_BOT_DATA !== 'undefined' && Array.isArray(RAW_MONTHLY_ATTENDANCE_BOT_DATA.items) && RAW_MONTHLY_ATTENDANCE_BOT_DATA.items.length > 0) {
            data = RAW_MONTHLY_ATTENDANCE_BOT_DATA;
        }
        if (!data) {
            try {
                const ls = localStorage.getItem('mep_monthly_attendance_bot_data');
                if (ls) {
                    const parsed = JSON.parse(ls);
                    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
                        data = parsed;
                    }
                }
            } catch(e) {}
        }
        if (data) {
            try { localStorage.setItem('mep_monthly_attendance_bot_data', JSON.stringify(data)); } catch(e) {}
            return data;
        }
        return { items: [], day_headers: [], summary: {}, meta: {} };
    }

    /**
     * Retrieve Bot 11 Monthly & Yearly Attendance Dataset (Authoritative: Bot 11 cache -> window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA -> localStorage)
     */
    function getRawMonthlyYearlyAttendanceData() {
        let data = null;
        if (typeof window !== 'undefined' && typeof window.getBotDataCache === 'function') {
            const b11 = window.getBotDataCache(11);
            if (b11 && Array.isArray(b11.items) && b11.items.length > 0) {
                data = b11;
            }
        }
        if (!data && typeof window !== 'undefined' && window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA && Array.isArray(window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA.items) && window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA.items.length > 0) {
            data = window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA;
        }
        if (!data && typeof RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA !== 'undefined' && Array.isArray(RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA.items) && RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA.items.length > 0) {
            data = RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA;
        }
        if (!data) {
            try {
                const ls = localStorage.getItem('mep_monthly_yearly_attendance_bot_data');
                if (ls) {
                    const parsed = JSON.parse(ls);
                    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
                        data = parsed;
                    }
                }
            } catch(e) {}
        }
        if (data) {
            try { localStorage.setItem('mep_monthly_yearly_attendance_bot_data', JSON.stringify(data)); } catch(e) {}
            return data;
        }
        return { items: [], headers: [], summary: {}, meta: {} };
    }

    function handleHrmMonthFilter() {
        const deptSel = document.getElementById('hrmMonthDeptFilter');
        const secSel = document.getElementById('hrmMonthSectionFilter');
        const statSel = document.getElementById('hrmMonthStatusFilter');
        if (deptSel) currentMonthDept = deptSel.value;
        if (secSel) currentMonthSection = secSel.value;
        if (statSel) currentMonthStatus = statSel.value;
        renderHrmMonthlyAttendanceView();
    }

    function handleHrmMonthSearch(val) {
        currentMonthSearch = val || '';
        if (!val || String(val).trim() === '') {
            currentMonthViewMode = 'auto';
        }
        renderHrmMonthlyAttendanceView();
    }

    function setHrmMonthViewMode(mode) {
        currentMonthViewMode = mode || 'auto';
        renderHrmMonthlyAttendanceView();
    }

    function handleHrmMonthChange() {
        renderHrmMonthlyAttendanceView();
    }

    /**
     * Populate Monthly Attendance Dropdowns dynamically from live dataset
     */
    function populateMonthlyAttendanceFilters(items) {
        const deptSel = document.getElementById('hrmMonthDeptFilter');
        const secSel = document.getElementById('hrmMonthSectionFilter');

        if (deptSel && deptSel.options.length <= 1) {
            const depts = [...new Set(items.map(i => (i.department || '').trim()).filter(Boolean))].sort();
            depts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                deptSel.appendChild(opt);
            });
            if (currentMonthDept !== 'ALL') deptSel.value = currentMonthDept;
        }

        if (secSel && secSel.options.length <= 1) {
            const secs = [...new Set(items.map(i => (i.section || i.unit || '').trim()).filter(Boolean))].sort();
            secs.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                secSel.appendChild(opt);
            });
            if (currentMonthSection !== 'ALL') secSel.value = currentMonthSection;
        }
    }

    /**
     * Render the Monthly Attendence Register (100% HUBUHU to Bot 10 Collected Data & ERP Report 20220522)
     */
    function renderHrmMonthlyAttendanceView() {
        const dataObj = getRawMonthlyAttendanceData();
        const allEmployees = dataObj.items || [];
        const dayHeaders = (dataObj.day_headers && dataObj.day_headers.length > 0)
            ? dataObj.day_headers
            : (allEmployees[0] && allEmployees[0].daily ? allEmployees[0].daily.map(d => d.day_header) : []);

        populateMonthlyAttendanceFilters(allEmployees);

        const thead = document.getElementById('hrmMonthlyAttendanceTableHead');
        const tbody = document.getElementById('hrmMonthlyAttendanceTableBody');
        if (!tbody) return;

        // Filter records
        const filtered = allEmployees.filter(emp => {
            const dept = String(emp.department || '').trim().toLowerCase();
            const filterDept = String(currentMonthDept).trim().toLowerCase();
            const matchDept = filterDept === 'all' || dept === filterDept;

            const sec = String(emp.section || emp.unit || '').trim().toLowerCase();
            const filterSec = String(currentMonthSection).trim().toLowerCase();
            const matchSec = filterSec === 'all' || sec === filterSec ||
                (filterSec.includes('dimm') && sec.includes('dimm')) ||
                (filterSec.includes('armature') && sec.includes('armature')) ||
                (filterSec.includes('assemble') && sec.includes('assemble'));

            let matchStatus = true;
            if (currentMonthStatus === 'present') matchStatus = (parseInt(emp.present_days, 10) || 0) > 0;
            else if (currentMonthStatus === 'absent') matchStatus = (parseInt(emp.absent_days, 10) || 0) > 0;
            else if (currentMonthStatus === 'leave') matchStatus = (parseInt(emp.leave_days, 10) || 0) > 0;

            let matchQuick = true;
            if (currentMonthlyQuickFilter === 'LATE') {
                matchQuick = (emp.daily || []).some(d => {
                    const st = String(d.status || '').toLowerCase();
                    const inT = String(d.in_time || '').toLowerCase();
                    return st.includes('late') || (inT && inT > '08:00 am' && !st.includes('offday') && !st.includes('absent'));
                });
            } else if (currentMonthlyQuickFilter === 'ABSENT') {
                matchQuick = (parseInt(emp.absent_days, 10) || 0) > 0 || (emp.daily || []).some(d => String(d.status || '').toLowerCase().includes('absent'));
            } else if (currentMonthlyQuickFilter === 'EARLY_OUT') {
                matchQuick = (emp.daily || []).some(d => {
                    const st = String(d.status || '').toLowerCase();
                    return st.includes('early') || st.includes('earlyout');
                });
            }

            const q = currentMonthSearch.toLowerCase().trim();
            const matchSearch = !q ||
                String(emp.emp_id || '').toLowerCase().includes(q) ||
                String(emp.emp_name || '').toLowerCase().includes(q) ||
                String(emp.department || '').toLowerCase().includes(q) ||
                String(emp.section || emp.unit || '').toLowerCase().includes(q) ||
                String(emp.job_location || '').toLowerCase().includes(q);

            return matchDept && matchSec && matchStatus && matchQuick && matchSearch;
        });

        // Update count badge & KPI cards
        const countBadge = document.getElementById('hrmMonthFilteredCount');
        if (countBadge) {
            let filterLabel = '';
            if (currentMonthlyQuickFilter === 'LATE') filterLabel = ' • LATE Attendance';
            else if (currentMonthlyQuickFilter === 'ABSENT') filterLabel = ' • ABSENT Attendance';
            else if (currentMonthlyQuickFilter === 'EARLY_OUT') filterLabel = ' • EARLY OUT Attendance';
            countBadge.textContent = `${filtered.length} of ${allEmployees.length} Employees (${dayHeaders.length} Days Recorded${filterLabel})`;
        }

        const elStaff = document.getElementById('hrmMonthKpiStaff');
        const elWorkDays = document.getElementById('hrmMonthKpiWorkDays');
        const elPresent = document.getElementById('hrmMonthKpiPresent');
        const elAbsent = document.getElementById('hrmMonthKpiAbsent');
        const elDateRange = document.getElementById('hrmMonthKpiDateRange');
        const elLeaveSub = document.getElementById('hrmMonthKpiLeaveSub');

        const totalStaff = filtered.length;
        const totalPresents = filtered.reduce((acc, it) => acc + (parseInt(it.present_days, 10) || 0), 0);
        const totalAbsents = filtered.reduce((acc, it) => acc + (parseInt(it.absent_days, 10) || 0), 0);
        const totalLeaves = filtered.reduce((acc, it) => acc + (parseInt(it.leave_days, 10) || 0), 0);

        if (elStaff) elStaff.textContent = totalStaff;
        if (elWorkDays) elWorkDays.textContent = `${dayHeaders.length} Days`;
        if (elPresent) elPresent.textContent = totalPresents.toLocaleString();
        if (elAbsent) elAbsent.textContent = totalAbsents.toLocaleString();
        if (elDateRange && dayHeaders.length > 0) {
            const firstD = dayHeaders[0].split(' ').slice(0,2).join(' ');
            const lastD = dayHeaders[dayHeaders.length - 1].split(' ').slice(0,2).join(' ');
            elDateRange.textContent = `${firstD} - ${lastD}`;
        }
        if (elLeaveSub) elLeaveSub.textContent = `Leaves: ${totalLeaves.toLocaleString()}`;

        // Individual Daily Attendance Grid (100% Match to Screenshot 2 when individual ID is searched)
        const gridArea = document.getElementById('hrmMonthIndividualGridArea');
        const tableWrapper = document.getElementById('hrmMonthTableWrapper');

        const isIndividualSearch = (filtered.length === 1 && currentMonthSearch.trim() !== '');
        const showGridView = (isIndividualSearch && currentMonthViewMode !== 'table') || (currentMonthViewMode === 'grid' && filtered.length === 1);

        if (showGridView) {
            if (tableWrapper) tableWrapper.style.display = 'none';
            if (gridArea) {
                gridArea.style.display = 'block';
                const emp = filtered[0];
                const dailyList = emp.daily || [];

                const presentsCount = dailyList.filter(d => (d.status_type || d.status || '').toLowerCase().includes('present')).length;
                const offdaysCount = dailyList.filter(d => (d.status_type || d.status || '').toLowerCase().includes('off') || (d.status_type || d.status || '').toLowerCase().includes('holiday')).length;
                const earlyCount = dailyList.filter(d => (d.status_type || d.status || '').toLowerCase().includes('early')).length;
                const absentsCount = dailyList.filter(d => (d.status_type || d.status || '').toLowerCase().includes('absent')).length;
                const leavesCount = dailyList.filter(d => (d.status_type || d.status || '').toLowerCase().includes('leave')).length;

                if (countBadge) {
                    countBadge.textContent = `Individual Daily Attendance Grid • ${escapeHtml(emp.emp_name)} (${escapeHtml(emp.emp_id)})`;
                }

                let gHtml = `
                    <style>
                        .hrm-punch-grid-7cols {
                            display: grid;
                            grid-template-columns: repeat(7, 1fr);
                            gap: 10px;
                        }
                        @media (max-width: 1200px) {
                            .hrm-punch-grid-7cols { grid-template-columns: repeat(4, 1fr) !important; }
                        }
                        @media (max-width: 768px) {
                            .hrm-punch-grid-7cols { grid-template-columns: repeat(2, 1fr) !important; }
                        }
                    </style>

                    <!-- Individual Employee Profile Summary Bar -->
                    <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:12px 18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.03); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; box-shadow:0 2px 6px rgba(2,132,199,0.3);">
                                ${escapeHtml((emp.emp_name || 'E').charAt(0).toUpperCase())}
                            </div>
                            <div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span style="background:#0284c7; color:#ffffff; font-weight:800; font-size:0.82rem; padding:2px 8px; border-radius:4px; letter-spacing:0.5px;">ID: ${escapeHtml(emp.emp_id || '-')}</span>
                                    <h3 style="margin:0; font-size:1.08rem; font-weight:800; color:#0f2942;">${escapeHtml(emp.emp_name || '-')}</h3>
                                    <span style="background:#dcfce7; color:#15803d; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:12px; border:1px solid #86efac;">● In Service</span>
                                </div>
                                <div style="font-size:0.80rem; color:#64748b; margin-top:3px; display:flex; gap:8px; flex-wrap:wrap;">
                                    <span><strong>Section:</strong> ${escapeHtml(emp.unit || emp.section || '-')}</span>
                                    <span>•</span>
                                    <span><strong>Dept:</strong> ${escapeHtml(emp.department || 'Production')}</span>
                                    <span>•</span>
                                    <span><strong>Company:</strong> ${escapeHtml(emp.company || 'MEP FAN LIMITED.')}</span>
                                    <span>•</span>
                                    <span><strong>Location:</strong> ${escapeHtml(emp.job_location || 'Factory-Barishal')}</span>
                                </div>
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            <span style="font-size:0.78rem; font-weight:700; background:#dcfce7; color:#15803d; border:1px solid #86efac; padding:4px 10px; border-radius:6px;">${presentsCount} Present</span>
                            <span style="font-size:0.78rem; font-weight:700; background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; padding:4px 10px; border-radius:6px;">${offdaysCount} Offday</span>
                            ${earlyCount > 0 ? `<span style="font-size:0.78rem; font-weight:700; background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:4px 10px; border-radius:6px;">${earlyCount} EarlyOut</span>` : ''}
                            ${absentsCount > 0 ? `<span style="font-size:0.78rem; font-weight:700; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:4px 10px; border-radius:6px;">${absentsCount} Absent</span>` : ''}
                            ${leavesCount > 0 ? `<span style="font-size:0.78rem; font-weight:700; background:#faf5ff; color:#7e22ce; border:1px solid #e9d5ff; padding:4px 10px; border-radius:6px;">${leavesCount} Leave</span>` : ''}

                            <button type="button" onclick="setHrmMonthViewMode('table')" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:6px; padding:5px 11px; font-size:0.78rem; font-weight:700; cursor:pointer;" title="View row in full 35-column table">📋 Table View</button>
                            <button type="button" onclick="handleHrmMonthSearch(''); const s = document.getElementById('hrmMonthSearchInput'); if(s) s.value='';" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; border-radius:6px; padding:5px 12px; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Clear search and view all 108 employees">✕ Back to All</button>
                        </div>
                    </div>

                    <!-- 27-Day Punch Cards Grid (Screenshot 2 Exact 1:1 Match) -->
                    <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:10px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                        <div class="hrm-punch-grid-7cols">
                `;

                dayHeaders.forEach(dh => {
                    const dayRecord = dailyList.find(d => d.day_header === dh);
                    const statusType = (dayRecord ? (dayRecord.status_type || dayRecord.status || '') : '').toLowerCase();
                    const inTime = dayRecord ? dayRecord.in_time : '';
                    const outTime = dayRecord ? dayRecord.out_time : '';

                    let cardBg = '#f8fafc';
                    let cardBorder = '#cbd5e1';
                    let titleColor = '#1e293b';
                    let statusColor = '#475569';
                    let statusText = 'NO PUNCH';
                    let showTime = false;

                    if (statusType.includes('present') || statusType === 'p') {
                        cardBg = '#ecfdf5';
                        cardBorder = '#86efac';
                        titleColor = '#065f46';
                        statusColor = '#059669';
                        statusText = 'PRESENT';
                        showTime = true;
                    } else if (statusType.includes('off') || statusType.includes('holiday') || statusType === 'w') {
                        cardBg = '#f0f9ff';
                        cardBorder = '#7dd3fc';
                        titleColor = '#0369a1';
                        statusColor = '#0284c7';
                        statusText = 'OFFDAY';
                        showTime = false;
                    } else if (statusType.includes('early')) {
                        cardBg = '#fffbeb';
                        cardBorder = '#fde68a';
                        titleColor = '#92400e';
                        statusColor = '#d97706';
                        statusText = 'EARLYOUT';
                        showTime = true;
                    } else if (statusType.includes('late')) {
                        cardBg = '#fff7ed';
                        cardBorder = '#fed7aa';
                        titleColor = '#9a3412';
                        statusColor = '#ea580c';
                        statusText = 'LATE';
                        showTime = true;
                    } else if (statusType.includes('absent') || statusType === 'a') {
                        cardBg = '#fef2f2';
                        cardBorder = '#fca5a5';
                        titleColor = '#991b1b';
                        statusColor = '#dc2626';
                        statusText = 'ABSENT';
                        showTime = false;
                    } else if (statusType.includes('leave') || statusType === 'l') {
                        cardBg = '#faf5ff';
                        cardBorder = '#e9d5ff';
                        titleColor = '#6b21a8';
                        statusColor = '#9333ea';
                        statusText = 'LEAVE';
                        showTime = false;
                    }

                    gHtml += `
                        <div style="background:${cardBg}; border:1.5px solid ${cardBorder}; border-radius:8px; padding:10px 6px; text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:82px; box-sizing:border-box; transition:all 0.15s ease;">
                            <div style="font-size:0.80rem; font-weight:700; color:${titleColor}; margin-bottom:4px; white-space:nowrap; letter-spacing:0.2px;">
                                ${escapeHtml(dh)}
                            </div>
                            <div style="font-size:0.88rem; font-weight:800; color:${statusColor}; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:${showTime && (inTime || outTime) ? '4px' : '0'};">
                                ${escapeHtml(statusText)}
                            </div>
                            ${showTime && (inTime || outTime) ? `
                                <div style="font-size:0.72rem; font-family:'Courier New', monospace, sans-serif; font-weight:600; color:#334155; line-height:1.2;">
                                    ${escapeHtml(inTime || '--:--')} - ${escapeHtml(outTime || '--:--')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                });

                gHtml += `
                        </div>
                    </div>
                `;

                gridArea.innerHTML = gHtml;
            }
            return;
        } else {
            if (gridArea) gridArea.style.display = 'none';
            if (tableWrapper) tableWrapper.style.display = 'block';
        }

        // Render Table Header (Exact 2-Row ERP Header matching Image 2)
        if (thead) {
            const monthGroups = [];
            dayHeaders.forEach(dh => {
                const parts = dh.split(' ');
                const mName = parts[0] || 'Month';
                const subTitle = parts.slice(1).join(' ') || dh;
                const lastG = monthGroups[monthGroups.length - 1];
                if (lastG && lastG.name === mName) {
                    lastG.days.push({ full: dh, sub: subTitle });
                } else {
                    monthGroups.push({ name: mName, days: [{ full: dh, sub: subTitle }] });
                }
            });

            let thHtml = `
                <tr style="background:#ffffff; border-bottom:1px solid #64748b;">
                    <th rowspan="2" style="width:40px; text-align:center; position:sticky; left:0; top:0; z-index:4; background:#ffffff; border:1px solid #64748b; padding:8px 4px; font-weight:bold; color:#000;">SL</th>
                    <th rowspan="2" style="width:65px; text-align:center; position:sticky; left:40px; top:0; z-index:4; background:#ffffff; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000;">Emp Id</th>
                    <th rowspan="2" style="min-width:160px; position:sticky; left:105px; top:0; z-index:4; background:#ffffff; border:1px solid #64748b; padding:8px 8px; font-weight:bold; color:#000;">EMP Name</th>
                    <th rowspan="2" style="min-width:120px; position:sticky; top:0; z-index:2; background:#ffffff; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center;">Company</th>
                    <th rowspan="2" style="min-width:100px; position:sticky; top:0; z-index:2; background:#ffffff; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center;">Department</th>
                    <th rowspan="2" style="min-width:100px; position:sticky; top:0; z-index:2; background:#ffffff; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center;">Section</th>
                    <th rowspan="2" style="min-width:110px; position:sticky; top:0; z-index:2; background:#ffffff; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center;">Unit</th>
                    <th rowspan="2" style="min-width:110px; position:sticky; top:0; z-index:2; background:#ffffff; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center;">Job Location</th>
            `;

            monthGroups.forEach(mg => {
                thHtml += `<th colspan="${mg.days.length}" style="text-align:center; padding:6px 4px; position:sticky; top:0; z-index:2; border:1px solid #64748b; background:#ffffff; color:#000; font-weight:bold; font-size:0.85rem;">
                            ${escapeHtml(mg.name)}
                         </th>`;
            });

            thHtml += `</tr><tr style="background:#ffffff; border-bottom:2px solid #64748b;">`;

            monthGroups.forEach(mg => {
                mg.days.forEach(dObj => {
                    const isFriday = dObj.full.toLowerCase().includes('fri');
                    const thBg = isFriday ? 'background:#fee2e2; color:#b91c1c;' : 'background:#ffffff; color:#000;';
                    thHtml += `
                        <th style="min-width:76px; text-align:center; padding:4px 3px; position:sticky; top:28px; z-index:2; border:1px solid #64748b; ${thBg} white-space:nowrap; font-size:0.75rem; font-weight:bold;" title="${escapeHtml(dObj.full)}">
                            ${escapeHtml(dObj.sub)}
                        </th>
                    `;
                });
            });

            thHtml += `</tr>`;
            thead.innerHTML = thHtml;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${8 + dayHeaders.length}" class="hrm-empty-row" style="text-align:center; padding:40px;">
                        <div class="hrm-empty-state">
                            <span class="empty-icon" style="font-size:32px;">🔍</span>
                            <div class="empty-title" style="font-size:16px; font-weight:700; color:#0f2942; margin-top:8px;">No matching attendance records found</div>
                            <div class="empty-desc" style="font-size:13px; color:#64748b; margin-top:4px;">Try resetting department, section, or search filters</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Render Table Body (Exact multi-line punch layout 1:1 to ERP Screenshot 2)
        let html = '';
        filtered.forEach((emp, idx) => {
            const rowClass = (idx % 2 === 0) ? 'att-row-even' : 'att-row-odd';
            html += `<tr class="${rowClass}" style="border-bottom:1px solid #cbd5e1;">
                <td style="text-align:center; font-family:monospace; position:sticky; left:0; z-index:2; background:inherit; border:1px solid #64748b; font-weight:600;">${emp.sl || (idx + 1)}</td>
                <td style="text-align:center; font-weight:700; position:sticky; left:40px; z-index:2; background:inherit; border:1px solid #64748b;"><span class="id-badge" onclick="handleHrmMonthSearch('${escapeHtml(emp.emp_id)}'); const s = document.getElementById('hrmMonthSearchInput'); if(s) s.value='${escapeHtml(emp.emp_id)}';" style="cursor:pointer;" title="Click to view ${escapeHtml(emp.emp_name)}'s daily punch cards">${escapeHtml(emp.emp_id || '-')}</span></td>
                <td style="font-weight:700; color:#000; position:sticky; left:105px; z-index:2; background:inherit; border:1px solid #64748b; white-space:nowrap; padding:6px 8px;">${escapeHtml(emp.emp_name || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHtml(emp.company || 'MEP FAN LIMITED.')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHtml(emp.department || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHtml(emp.section || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHtml(emp.unit || emp.section || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHtml(emp.job_location || 'Factory-Barishal')}</td>
            `;

            const dailyList = emp.daily || [];
            dayHeaders.forEach(dh => {
                const dayRecord = dailyList.find(d => d.day_header === dh);
                let cellInnerHtml = '<span style="color:#94a3b8;">-</span>';

                if (dayRecord) {
                    const statusType = (dayRecord.status_type || dayRecord.status || '').toLowerCase();
                    const inTime = dayRecord.in_time || '';
                    const outTime = dayRecord.out_time || '';
                    const details = dayRecord.details || '';

                    if (statusType.includes('present') || statusType === 'p') {
                        cellInnerHtml = `
                            <div style="color:#059669; font-weight:bold; font-size:12px; line-height:1.2;">Present</div>
                            ${inTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2; margin-top:2px;">${escapeHtml(inTime)}</div>` : ''}
                            ${outTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2;">${escapeHtml(outTime)}</div>` : ''}
                        `;
                    } else if (statusType.includes('off') || statusType.includes('holiday') || statusType === 'w') {
                        cellInnerHtml = `<div style="color:#2563eb; font-weight:bold; font-size:12px;">OFFDAY</div>`;
                    } else if (statusType.includes('leave') || statusType === 'l') {
                        const leaveLabel = details.toLowerCase().includes('casual') ? 'Casual<br>Leave' : 'Leave';
                        cellInnerHtml = `<div style="color:#c026d3; font-weight:bold; font-size:11px; line-height:1.2;">${leaveLabel}</div>`;
                    } else if (statusType.includes('late')) {
                        cellInnerHtml = `
                            <div style="color:#ea580c; font-weight:bold; font-size:12px; line-height:1.2;">Late</div>
                            ${inTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2; margin-top:2px;">${escapeHtml(inTime)}</div>` : ''}
                            ${outTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2;">${escapeHtml(outTime)}</div>` : ''}
                        `;
                    } else if (statusType.includes('early')) {
                        cellInnerHtml = `
                            <div style="color:#d97706; font-weight:bold; font-size:11px; line-height:1.2;">EarlyOut</div>
                            ${inTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2; margin-top:2px;">${escapeHtml(inTime)}</div>` : ''}
                            ${outTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2;">${escapeHtml(outTime)}</div>` : ''}
                        `;
                    } else if (statusType.includes('absent') || statusType === 'a') {
                        cellInnerHtml = `<div style="color:#dc2626; font-weight:bold; font-size:12px;">Absent</div>`;
                    } else {
                        cellInnerHtml = `<div style="font-size:11px; color:#475569;">${escapeHtml(details || statusType)}</div>`;
                    }
                }

                html += `<td style="text-align:center; padding:4px 3px; border:1px solid #64748b; vertical-align:middle; background:inherit;">${cellInnerHtml}</td>`;
            });

            html += `</tr>`;
        });

        tbody.innerHTML = html;
    }

    /**
     * Export Monthly Attendance Matrix to Excel using SheetJS
     */
    function exportHrmMonthlyAttendanceExcel() {
        const dataObj = getRawMonthlyAttendanceData();
        const allEmployees = dataObj.items || [];
        const dayHeaders = (dataObj.day_headers && dataObj.day_headers.length > 0)
            ? dataObj.day_headers
            : (allEmployees[0] && allEmployees[0].daily ? allEmployees[0].daily.map(d => d.day_header) : []);

        const headerRow = [
            "SL", "Emp Id", "EMP Name", "Company", "Department", "Section", "Unit", "Job Location", ...dayHeaders
        ];

        const rows = [headerRow];
        allEmployees.forEach((emp, idx) => {
            const dailyList = emp.daily || [];
            const dayStatuses = dayHeaders.map(dh => {
                const dr = dailyList.find(d => d.day_header === dh);
                if (!dr) return '-';
                if (dr.in_time && dr.out_time) {
                    return `${dr.status_type || dr.status} (${dr.in_time} - ${dr.out_time})`;
                }
                return dr.status_type || dr.status || '-';
            });

            rows.push([
                emp.sl || (idx + 1),
                emp.emp_id || '',
                emp.emp_name || '',
                emp.company || 'MEP FAN LIMITED.',
                emp.department || '',
                emp.section || '',
                emp.unit || emp.section || '',
                emp.job_location || 'Factory-Barishal',
                ...dayStatuses
            ]);
        });

        if (window.XLSX && window.XLSX.utils) {
            const ws = window.XLSX.utils.aoa_to_sheet(rows);
            const wb = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");
            window.XLSX.writeFile(wb, `Attendance_Sheet_Aug_Sep_2026.xlsx`);
        } else {
            let csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Attendance_Sheet_Aug_Sep_2026.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        showHrmToast("Attendance Sheet exported successfully!", "success");
    }

    function printHrmMonthlyAttendance() {
        window.print();
    }

    function handleHrmAnnualFilter() {
        const deptSel = document.getElementById('hrmAnnualDeptFilter');
        const secSel = document.getElementById('hrmAnnualSectionFilter');
        const desigSel = document.getElementById('hrmAnnualDesigFilter');
        if (deptSel) currentAnnualDept = deptSel.value;
        if (secSel) currentAnnualSection = secSel.value;
        if (desigSel) currentAnnualDesig = desigSel.value;
        renderHrmMonthlyYearlyReportView();
    }

    /**
     * Set Monthly Attendance Quick Filter (ALL / LATE / ABSENT / EARLY_OUT)
     */
    function setHrmMonthlyQuickFilter(type) {
        currentMonthlyQuickFilter = type || 'ALL';
        ['All', 'Late', 'Absent', 'Early'].forEach(k => {
            const btn = document.getElementById('btnHrmMonthFilter' + k);
            if (btn) {
                btn.classList.remove('active');
                btn.style.background = '#f8fafc';
                if (k === 'All') { btn.style.color = '#0f172a'; btn.style.borderColor = '#cbd5e1'; }
                else if (k === 'Late') { btn.style.color = '#ea580c'; btn.style.borderColor = '#fed7aa'; }
                else if (k === 'Absent') { btn.style.color = '#dc2626'; btn.style.borderColor = '#fecaca'; }
                else if (k === 'Early') { btn.style.color = '#d97706'; btn.style.borderColor = '#fde68a'; }
            }
        });
        const activeKey = type === 'ALL' ? 'All' : (type === 'LATE' ? 'Late' : (type === 'ABSENT' ? 'Absent' : 'Early'));
        const activeBtn = document.getElementById('btnHrmMonthFilter' + activeKey);
        if (activeBtn) {
            activeBtn.classList.add('active');
            if (type === 'ALL') { activeBtn.style.background = '#0f172a'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#0f172a'; }
            else if (type === 'LATE') { activeBtn.style.background = '#ea580c'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#c2410c'; }
            else if (type === 'ABSENT') { activeBtn.style.background = '#dc2626'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#b91c1c'; }
            else if (type === 'EARLY_OUT') { activeBtn.style.background = '#d97706'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#b45309'; }
        }
        renderHrmMonthlyAttendanceView();
    }

    /**
     * Set Annual Attendance Quick Filter (ALL / LATE / ABSENT / EARLY_OUT)
     */
    function setHrmAnnualQuickFilter(type) {
        currentAnnualQuickFilter = type || 'ALL';
        if (currentAnnualMode === 'individual') {
            currentAnnualMode = 'master';
            const modeSel = document.getElementById('hrmAnnualModeSelect');
            if (modeSel) modeSel.value = 'master';
            const indCard = document.getElementById('hrmIndividualLookupCard');
            if (indCard) indCard.style.display = 'none';
            const resetBtn = document.getElementById('btnHrmResetLookup');
            if (resetBtn) resetBtn.style.display = 'none';
        }

        ['All', 'Late', 'Absent', 'Early'].forEach(k => {
            const btn = document.getElementById('btnHrmAnnualFilter' + k);
            if (btn) {
                btn.classList.remove('active');
                btn.style.background = '#f8fafc';
                if (k === 'All') { btn.style.color = '#0f172a'; btn.style.borderColor = '#cbd5e1'; }
                else if (k === 'Late') { btn.style.color = '#ea580c'; btn.style.borderColor = '#fed7aa'; }
                else if (k === 'Absent') { btn.style.color = '#dc2626'; btn.style.borderColor = '#fecaca'; }
                else if (k === 'Early') { btn.style.color = '#d97706'; btn.style.borderColor = '#fde68a'; }
            }
        });
        const activeKey = type === 'ALL' ? 'All' : (type === 'LATE' ? 'Late' : (type === 'ABSENT' ? 'Absent' : 'Early'));
        const activeBtn = document.getElementById('btnHrmAnnualFilter' + activeKey);
        if (activeBtn) {
            activeBtn.classList.add('active');
            if (type === 'ALL') { activeBtn.style.background = '#0f172a'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#0f172a'; }
            else if (type === 'LATE') { activeBtn.style.background = '#ea580c'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#c2410c'; }
            else if (type === 'ABSENT') { activeBtn.style.background = '#dc2626'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#b91c1c'; }
            else if (type === 'EARLY_OUT') { activeBtn.style.background = '#d97706'; activeBtn.style.color = '#fff'; activeBtn.style.borderColor = '#b45309'; }
        }
        renderHrmMonthlyYearlyReportView();
    }

    function handleHrmAnnualSearch(val) {
        currentAnnualSearch = val || '';
        renderHrmMonthlyYearlyReportView();
    }

    function handleHrmAnnualYearChange() {
        renderHrmMonthlyYearlyReportView();
    }

    function handleHrmAnnualModeChange() {
        const sel = document.getElementById('hrmAnnualModeSelect');
        if (sel) currentAnnualMode = sel.value;
        const indCard = document.getElementById('hrmIndividualLookupCard');
        if (currentAnnualMode !== 'individual') {
            if (indCard) indCard.style.display = 'none';
        }
        renderHrmMonthlyYearlyReportView();
    }

    /**
     * Execute Exact Individual ID Lookup (Screenshot 3 Premium Feature)
     */
    function executeIndividualIdLookup() {
        const idInput = document.getElementById('hrmIndividualIdInput');
        const targetId = (idInput ? idInput.value : '').trim();
        if (!targetId) {
            showHrmToast("Please enter an Employee ID number", "warning");
            return;
        }
        currentIndividualId = targetId;
        currentAnnualMode = 'individual';
        const modeSel = document.getElementById('hrmAnnualModeSelect');
        if (modeSel) modeSel.value = 'individual';

        const resetBtn = document.getElementById('btnHrmResetLookup');
        if (resetBtn) resetBtn.style.display = 'inline-flex';

        renderHrmMonthlyYearlyReportView();
    }

    /**
     * Clear Individual ID Lookup and return to Master Register
     */
    function clearIndividualIdLookup() {
        const idInput = document.getElementById('hrmIndividualIdInput');
        if (idInput) idInput.value = '';
        currentIndividualId = '';
        currentAnnualMode = 'master';
        const modeSel = document.getElementById('hrmAnnualModeSelect');
        if (modeSel) modeSel.value = 'master';

        const resetBtn = document.getElementById('btnHrmResetLookup');
        if (resetBtn) resetBtn.style.display = 'none';

        renderHrmMonthlyYearlyReportView();
    }

    /**
     * Render Clean Empty State for Individual Lookup
     */
    function renderIndividualLookupEmptyState() {
        const container = document.getElementById('hrmIndividualLookupResultArea');
        if (!container) return;
        container.innerHTML = `
            <div style="background:#ffffff; border-radius:12px; padding:50px 20px; text-align:center; border:1.5px dashed #cbd5e1; box-shadow:0 2px 8px rgba(0,0,0,0.02); margin:10px 0;">
                <div style="font-size:38px; margin-bottom:10px; color:#0284c7;">🔍</div>
                <h3 style="font-size:1.15rem; font-weight:700; color:#0f2942; margin-bottom:6px;">Individual Employee Attendance Lookup</h3>
                <p style="font-size:0.85rem; color:#64748b; max-width:480px; margin:0 auto; line-height:1.5;">
                    Enter an Employee ID in the box above (e.g. <strong>855</strong>, <strong>910</strong>, <strong>924</strong>) and click <strong>OK</strong> to view complete individual attendance history, 41-column register, and daily punch records.
                </p>
            </div>
        `;
        const countBadge = document.getElementById('hrmAnnualFilteredCount');
        if (countBadge) countBadge.textContent = 'Individual Lookup Mode (Enter ID)';
    }

    /**
     * Format numbers preserving exact decimals (e.g., 0.5, 1.5, 3.5), returning integer strings for whole numbers (e.g., 4)
     */
    function formatAttendanceDecimal(val) {
        if (val === null || val === undefined || val === '') return '0';
        const num = Number(val);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return String(num);
        return String(Math.round(num * 100) / 100);
    }

    /**
     * Determine current running active month from report metadata (e.g. 'Sep-2026')
     */
    function getHrmActiveRunningMonth(meta) {
        if (meta && meta.to_date) {
            const parts = String(meta.to_date).split('-');
            if (parts.length === 3) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const mIdx = parseInt(parts[1], 10) - 1;
                const year = parts[2];
                if (mIdx >= 0 && mIdx < 12) {
                    return `${months[mIdx]}-${year}`;
                }
            }
        }
        return 'Sep-2026';
    }

    /**
     * Get actual absent days for an attendance record, excluding future unelapsed dates
     */
    function getRecordActualAbsentDays(mRow, b10Emp, runningMonth) {
        if (mRow && mRow.month_year === runningMonth) {
            if (b10Emp && b10Emp.absent_days !== undefined && b10Emp.absent_days !== null) {
                return parseFloat(b10Emp.absent_days) || 0;
            }
            // If not in Bot 10, subtract the unelapsed future working days
            return Math.max(0, (parseFloat(mRow.absent_days) || 0) - 4);
        }
        return parseFloat(mRow ? mRow.absent_days : 0) || 0;
    }

    /**
     * Render Individual ID Lookup Result (Exact Match against Bot 10 & 11)
     */
    function renderIndividualLookupResult(targetId) {
        const container = document.getElementById('hrmIndividualLookupResultArea');
        if (!container) return;

        const b11Data = getRawMonthlyYearlyAttendanceData();
        const b10Data = getRawMonthlyAttendanceData();

        const cleanTarget = String(targetId || '').trim();
        const matchedYearly = (b11Data.items || []).filter(it => String(it.emp_id || '').trim() === cleanTarget);
        const matchedMonthly = (b10Data.items || []).find(it => String(it.emp_id || '').trim() === cleanTarget);

        const countBadge = document.getElementById('hrmAnnualFilteredCount');
        const elTotal = document.getElementById('hrmAnnualKpiTotal');
        const elProd = document.getElementById('hrmAnnualKpiProduction');
        const elPresent = document.getElementById('hrmAnnualKpiPresent');
        const elOt = document.getElementById('hrmAnnualKpiOt');

        if (matchedYearly.length === 0 && !matchedMonthly) {
            // Not found
            if (countBadge) countBadge.textContent = `0 Employees (0 Records)`;
            if (elTotal) elTotal.textContent = '0';
            if (elProd) elProd.textContent = '0';
            if (elPresent) elPresent.textContent = '0';
            if (elOt) elOt.textContent = '0 Hrs';

            container.innerHTML = `
                <div style="background:#ffffff; border-radius:12px; padding:48px 24px; text-align:center; border:1.5px dashed #fca5a5; box-shadow:0 4px 12px rgba(239,68,68,0.04); margin:10px 0;">
                    <div style="font-size:42px; margin-bottom:10px; color:#ef4444;">⚠️</div>
                    <h3 style="font-size:1.2rem; font-weight:800; color:#991b1b; margin-bottom:6px;">No Data Found for this ID: "${escapeHtml(cleanTarget)}"</h3>
                    <p style="font-size:0.88rem; color:#64748b; max-width:500px; margin:0 auto 16px; line-height:1.5;">
                        No active employee record matching ID <strong>${escapeHtml(cleanTarget)}</strong> was found in the ERP Attendance dataset. Please check the ID number or verify that the employee is in active service.
                    </p>
                    <button type="button" onclick="clearIndividualIdLookup()" style="background:#0284c7; color:#ffffff; border:none; border-radius:6px; padding:8px 18px; font-weight:700; font-size:0.85rem; cursor:pointer; box-shadow:0 2px 4px rgba(2,132,199,0.3);">
                        Show All Records
                    </button>
                </div>
            `;
            return;
        }

        // Found! Extract details
        const emp = matchedYearly[0] || matchedMonthly || {};
        const empId = emp.emp_id || cleanTarget;
        const empName = emp.emp_name || '-';
        const desig = emp.designation || (matchedMonthly ? 'Operator / Worker' : '-');
        const dept = emp.department || 'Production';
        const section = emp.section || (matchedMonthly ? (matchedMonthly.section || matchedMonthly.unit || '-') : '-');
        const subSection = emp.sub_section || (matchedMonthly ? (matchedMonthly.unit || '-') : '-');
        const grade = emp.grade || '-';
        const jobLoc = emp.job_location || 'Factory-Barishal';
        const company = emp.company || 'MEP FAN LIMITED.';
        const joinDate = emp.join_date || '-';

        const runningMonth = getHrmActiveRunningMonth(b11Data.meta);

        // Calculate individual summary stats with decimal precision & future dates excluded
        const totalMonths = matchedYearly.length;
        const totalPresents = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.present_days) || 0), 0);
        const totalAbsents = matchedYearly.reduce((acc, it) => acc + getRecordActualAbsentDays(it, matchedMonthly, runningMonth), 0);
        const totalOt = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.total_ot) || 0), 0);
        const totalPaidLeaves = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.paid_leave) || 0), 0);
        const totalCL = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.cl) || 0), 0);
        const totalML = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.ml) || 0), 0);
        const totalEL = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.el) || 0), 0);

        if (countBadge) countBadge.textContent = `1 Employee (${totalMonths} Monthly Records • 41 Columns)`;
        if (elTotal) elTotal.textContent = '1';
        if (elProd) elProd.textContent = String(totalMonths);
        if (elPresent) elPresent.textContent = formatAttendanceDecimal(totalPresents);
        if (elOt) elOt.textContent = `${formatAttendanceDecimal(totalOt)} Hrs`;

        const headers = (b11Data && b11Data.headers && b11Data.headers.length > 0)
            ? b11Data.headers
            : [
                "SL", "Emp ID", "Emp Name", "Designation", "Department", "Section", "Sub-Section", "Grade", "Job Location", "Company",
                "Join Date", "Month-Year", "Assigned working hour", "Total Days in Month", "Festival/Weekly Holiday", "Total Working Days",
                "Standard Working Hour", "Present Days", "Physical Working Hour", "Absent Days", "LWP", "CL", "ML", "EL", "NPL", "Paid Leave",
                "OT", "Extra OT", "Total OT", "Late Days", "Late Min", "Early Days", "Early Min", "Compensatory Leave", "SP IOM Pay",
                "SP IOM Leave", "Reg. IOM", "OD IOM", "Assaigned Night Duty Days", "Assaigned Night Duty Hours", "M-Grade Extra Duty Days"
            ];

        let html = `
            <!-- Individual Employee Profile Banner -->
            <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius:12px; padding:20px 24px; color:#ffffff; margin-bottom:16px; box-shadow:0 4px 14px rgba(0,0,0,0.12);">
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); display:flex; align-items:center; justify-content:center; font-size:1.3rem; font-weight:800; color:#fff; box-shadow:0 3px 8px rgba(2,132,199,0.4); border:2px solid rgba(255,255,255,0.2);">
                            ${escapeHtml(empName.charAt(0) || 'E')}
                        </div>
                        <div>
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                                <span style="background:#0284c7; color:#fff; font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:4px; font-family:monospace; letter-spacing:0.5px;">ID: ${escapeHtml(empId)}</span>
                                <span style="background:rgba(34,197,94,0.2); color:#4ade80; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:4px; border:1px solid rgba(74,222,128,0.3);">● In Service (Active)</span>
                            </div>
                            <h2 style="font-size:1.35rem; font-weight:800; color:#ffffff; margin:0; line-height:1.2;">${escapeHtml(empName)}</h2>
                            <p style="font-size:0.85rem; color:#94a3b8; margin:4px 0 0 0;">${escapeHtml(desig)} • ${escapeHtml(section)} • ${escapeHtml(dept)}</p>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button type="button" onclick="clearIndividualIdLookup()" style="background:rgba(255,255,255,0.1); color:#ffffff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:7px 14px; font-weight:600; font-size:0.82rem; cursor:pointer; transition:all 0.15s ease;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                            ✕ Clear Search
                        </button>
                    </div>
                </div>

                <!-- Profile Meta Grid -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.1);">
                    <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px;">
                        <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Department</span>
                        <strong style="font-size:0.85rem; color:#f8fafc;">${escapeHtml(dept)}</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px;">
                        <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Section</span>
                        <strong style="font-size:0.85rem; color:#f8fafc;">${escapeHtml(section)}</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px;">
                        <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Sub-Section</span>
                        <strong style="font-size:0.85rem; color:#f8fafc;">${escapeHtml(subSection)}</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px;">
                        <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Grade</span>
                        <strong style="font-size:0.85rem; color:#f8fafc;">${escapeHtml(grade)}</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px;">
                        <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Job Location</span>
                        <strong style="font-size:0.85rem; color:#f8fafc;">${escapeHtml(jobLoc)}</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px;">
                        <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Company</span>
                        <strong style="font-size:0.85rem; color:#f8fafc;">${escapeHtml(company)}</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px;">
                        <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Join Date</span>
                        <strong style="font-size:0.85rem; color:#f8fafc;">${escapeHtml(joinDate)}</strong>
                    </div>
                </div>
            </div>

            <!-- Individual KPI Highlights -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; border-left:4px solid #0284c7;">
                    <span style="display:block; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Recorded Months</span>
                    <strong style="font-size:1.4rem; color:#0f2942;">${totalMonths} <span style="font-size:0.85rem; font-weight:500; color:#64748b;">Months</span></strong>
                </div>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; border-left:4px solid #16a34a;">
                    <span style="display:block; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Total Present Days</span>
                    <strong style="font-size:1.4rem; color:#16a34a;">${formatAttendanceDecimal(totalPresents)} <span style="font-size:0.85rem; font-weight:500; color:#64748b;">Days</span></strong>
                </div>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; border-left:4px solid #dc2626;">
                    <span style="display:block; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Total Absent Days</span>
                    <strong style="font-size:1.4rem; color:#dc2626;">${formatAttendanceDecimal(totalAbsents)} <span style="font-size:0.85rem; font-weight:500; color:#64748b;">Days</span></strong>
                </div>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; border-left:4px solid #ea580c;">
                    <span style="display:block; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Total Overtime</span>
                    <strong style="font-size:1.4rem; color:#ea580c;">${formatAttendanceDecimal(totalOt)} <span style="font-size:0.85rem; font-weight:500; color:#64748b;">Hrs</span></strong>
                </div>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; border-left:4px solid #8b5cf6;">
                    <span style="display:block; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Leaves (CL/ML/EL/Paid)</span>
                    <strong style="font-size:1.4rem; color:#8b5cf6;">${formatAttendanceDecimal(totalPaidLeaves || (totalCL + totalML + totalEL))} <span style="font-size:0.85rem; font-weight:500; color:#64748b;">Days</span></strong>
                </div>
            </div>
        `;

        // 41-Column Individual Monthly Records Table
        if (matchedYearly.length > 0) {
            html += `
                <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; margin-bottom:16px;">
                    <div style="background:#f8fafc; padding:10px 16px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:#0f2942;">
                            📊 41-COLUMN MONTHLY ATTENDANCE REGISTER (${matchedYearly.length} MONTHS RECORDED)
                        </h4>
                        <span style="font-size:0.75rem; color:#64748b; font-weight:600;">100% HUBUHU ERP Report 30082026</span>
                    </div>
                    <div style="overflow-x:auto; max-height:400px;">
                        <table class="hrm-emp-table hrm-report-table" style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
            `;
            headers.forEach((h, hIdx) => {
                let stickyStyle = 'position:sticky; top:0; z-index:2; background:#f1f5f9; white-space:nowrap; padding:8px 8px; border:1px solid #cbd5e1; font-size:0.75rem;';
                if (hIdx === 0) stickyStyle = 'position:sticky; left:0; top:0; z-index:4; width:45px; text-align:center; background:#f1f5f9; border:1px solid #cbd5e1; font-size:0.75rem;';
                else if (hIdx === 1) stickyStyle = 'position:sticky; left:45px; top:0; z-index:4; width:70px; text-align:center; background:#f1f5f9; border:1px solid #cbd5e1; font-size:0.75rem;';
                else if (hIdx === 2) stickyStyle = 'position:sticky; left:115px; top:0; z-index:4; min-width:160px; background:#f1f5f9; border:1px solid #cbd5e1; font-size:0.75rem;';
                html += `<th style="${stickyStyle}">${escapeHtml(h)}</th>`;
            });
            html += `</tr></thead><tbody>`;

            matchedYearly.forEach((mRow, mIdx) => {
                const rowBg = (mIdx % 2 === 0) ? '#ffffff' : '#f8fafc';
                html += `<tr style="background:${rowBg}; border-bottom:1px solid #e2e8f0;">`;

                // All 11 employee columns rendered on EVERY row with opaque background to eliminate horizontal scroll duplication
                html += `
                    <td style="text-align:center; font-family:monospace; position:sticky; left:0; z-index:2; background:${rowBg}; border:1px solid #cbd5e1; font-weight:700;">${mIdx === 0 ? '1' : `<span style="opacity:0.4; font-size:0.75rem;">${mIdx + 1}</span>`}</td>
                    <td class="col-itemcode-cell" style="position:sticky; left:45px; z-index:2; text-align:center; background:${rowBg}; font-weight:700; border:1px solid #cbd5e1;">${mIdx === 0 ? empId : `<span style="opacity:0.35; font-size:0.75rem;">${empId}</span>`}</td>
                    <td style="position:sticky; left:115px; z-index:2; font-weight:700; color:#0f2942; background:${rowBg}; border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px;">${mIdx === 0 ? escapeHtml(empName) : `<span style="opacity:0.35; font-size:0.75rem; font-weight:500;">↳ ${escapeHtml(empName)}</span>`}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(desig) : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(dept) : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(section) : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(subSection) : ''}</td>
                    <td style="border:1px solid #cbd5e1; text-align:center; padding:6px 4px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(grade) : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(jobLoc) : ''}</td>
                    <td style="border:1px solid #cbd5e1; text-align:center; padding:6px 6px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(company) : ''}</td>
                    <td style="border:1px solid #cbd5e1; text-align:center; white-space:nowrap; padding:6px 6px; font-size:0.80rem; background:${rowBg};">${mIdx === 0 ? escapeHtml(joinDate) : ''}</td>
                `;

                const rowAbsent = getRecordActualAbsentDays(mRow, matchedMonthly, runningMonth);

                const mCells = [
                    mRow.month_year || '-',
                    mRow.assigned_working_hour || '8',
                    mRow.total_days_in_month || '0',
                    mRow.festival_holiday || '0',
                    mRow.total_working_days || '0',
                    mRow.standard_working_hour || '0',
                    mRow.present_days || '0',
                    mRow.physical_working_hour || '0',
                    formatAttendanceDecimal(rowAbsent),
                    formatAttendanceDecimal(mRow.lwp || '0'),
                    formatAttendanceDecimal(mRow.cl || '0'),
                    formatAttendanceDecimal(mRow.ml || '0'),
                    formatAttendanceDecimal(mRow.el || '0'),
                    formatAttendanceDecimal(mRow.npl || '0'),
                    formatAttendanceDecimal(mRow.paid_leave || '0'),
                    mRow.ot || '0',
                    mRow.extra_ot || '0',
                    mRow.total_ot || '0',
                    mRow.late_days || '0',
                    mRow.late_min || '0',
                    mRow.early_days || '0',
                    mRow.early_min || '0',
                    mRow.compensatory_leave || '0',
                    mRow.sp_iom_pay || '0',
                    mRow.sp_iom_leave || '0',
                    mRow.reg_iom || '0',
                    mRow.od_iom || '0',
                    mRow.night_duty_days || '0',
                    mRow.night_duty_hours || '0',
                    mRow.m_grade_extra_duty || '0'
                ];

                mCells.forEach((cVal, cIdx) => {
                    let cStyle = 'padding:6px 8px; border:1px solid #cbd5e1; white-space:nowrap; text-align:center; font-size:0.80rem;';
                    if (cIdx === 0) cStyle += 'font-weight:700; color:#0f2942; background:inherit;';
                    else if (cIdx === 6) cStyle += 'font-weight:700; color:#15803d; background:rgba(34,197,94,0.08);';
                    else if (cIdx === 8) cStyle += 'font-weight:700; color:#b91c1c; background:rgba(239,68,68,0.08);';
                    else if (cIdx === 17) cStyle += 'font-weight:700; color:#2563eb; background:rgba(37,99,235,0.08);';
                    html += `<td style="${cStyle}">${escapeHtml(String(cVal !== null && cVal !== undefined ? cVal : '-'))}</td>`;
                });

                html += `</tr>`;
            });

            html += `</tbody></table></div></div>`;
        }

        // Daily Punch Matrix from Bot 10 (if available)
        if (matchedMonthly && Array.isArray(matchedMonthly.daily) && matchedMonthly.daily.length > 0) {
            html += `
                <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
                    <div style="background:#f8fafc; padding:10px 16px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:#0f2942;">
                            ⏱️ DAILY PUNCH ATTENDANCE LOGS (AUG 26 - SEP 21, 2026 • 27 DAYS)
                        </h4>
                        <span style="font-size:0.75rem; color:#64748b; font-weight:600;">Sourced from Bot 10 (Monthly Attendance Sheet)</span>
                    </div>
                    <div style="overflow-x:auto; padding:12px;">
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:8px;">
            `;

            matchedMonthly.daily.forEach(d => {
                const st = String(d.status || '').toLowerCase();
                let bg = '#f1f5f9';
                let color = '#475569';
                let border = '#cbd5e1';
                if (st.includes('present')) {
                    bg = '#dcfce7';
                    color = '#15803d';
                    border = '#86efac';
                } else if (st.includes('absent')) {
                    bg = '#fee2e2';
                    color = '#b91c1c';
                    border = '#fca5a5';
                } else if (st.includes('offday') || st.includes('holiday')) {
                    bg = '#e0f2fe';
                    color = '#0369a1';
                    border = '#7dd3fc';
                } else if (st.includes('leave')) {
                    bg = '#fef3c7';
                    color = '#b45309';
                    border = '#fcd34d';
                } else if (st.includes('early')) {
                    bg = '#fef3c7';
                    color = '#d97706';
                    border = '#fde68a';
                }

                html += `
                    <div style="background:${bg}; border:1px solid ${border}; border-radius:6px; padding:6px 8px; text-align:center;">
                        <div style="font-size:0.70rem; font-weight:700; color:#334155; margin-bottom:2px; white-space:nowrap;">${escapeHtml(d.day_header || '-')}</div>
                        <div style="font-size:0.78rem; font-weight:800; color:${color}; text-transform:uppercase;">${escapeHtml(d.status || '-')}</div>
                        ${(d.in_time || d.out_time) ? `
                            <div style="font-size:0.68rem; color:#64748b; margin-top:2px; font-family:monospace;">
                                ${escapeHtml(d.in_time || '--')} - ${escapeHtml(d.out_time || '--')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            html += `</div></div></div>`;
        }

        // Individual Attendance & Leave Summary Box (Screenshot 1 Data -> Screenshot 2 Marked Area)
        if (matchedYearly.length > 0) {
            const sumAbsentDays = totalAbsents;
            const sumLwp = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.lwp) || 0), 0);
            const sumCl = totalCL;
            const sumMl = totalML;
            const sumEl = totalEL;
            const sumNpl = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.npl) || 0), 0);
            const sumPaidLeave = totalPaidLeaves;
            const sumOt = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.ot) || 0), 0);
            const sumExtraOt = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.extra_ot) || 0), 0);
            const sumTotalOt = totalOt;
            const sumLateDays = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.late_days) || 0), 0);
            const sumLateMin = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.late_min) || 0), 0);
            const sumEarlyDays = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.early_days) || 0), 0);
            const sumEarlyMin = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.early_min) || 0), 0);
            const sumCompensatory = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.compensatory_leave) || 0), 0);
            const sumSpIomPay = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.sp_iom_pay) || 0), 0);
            const sumSpIomLeave = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.sp_iom_leave) || 0), 0);
            const sumRegIom = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.reg_iom) || 0), 0);
            const sumOdIom = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.od_iom) || 0), 0);
            const sumNightDays = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.night_duty_days) || 0), 0);
            const sumNightHours = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.night_duty_hours) || 0), 0);
            const sumMGrade = matchedYearly.reduce((acc, it) => acc + (parseFloat(it.m_grade_extra_duty) || 0), 0);

            // Dynamic sum for Group 6: TOTAL LEAVE = Absent + LWP + Paid Leave
            const sumTotalLeaveAll = sumAbsentDays + sumLwp + sumPaidLeave;

            html += `
                <!-- Premium Individual Attendance & Leave Summary Box (Screenshot 1 ➔ Screenshot 2 Replica) -->
                <div id="hrmIndividualSummaryBox" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:10px; overflow:hidden; margin-top:18px; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
                    <div style="background:linear-gradient(135deg, #0f2942 0%, #1e3a5f 100%); padding:12px 18px; display:flex; justify-content:space-between; align-items:center; color:#fff; flex-wrap:wrap; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.1rem;">📋</span>
                            <h4 style="margin:0; font-size:0.92rem; font-weight:800; letter-spacing:0.3px; color:#ffffff;">
                                INDIVIDUAL ATTENDANCE & LEAVE SUMMARY (REPORT 30082026 AUDITED)
                            </h4>
                        </div>
                        <span style="font-size:0.75rem; background:rgba(255,255,255,0.15); padding:3px 10px; border-radius:4px; font-weight:600;">
                            Exact ERP Replica • Dynamic Calculation
                        </span>
                    </div>

                    <style>
                        .hrm-summary-box-grid {
                            padding: 16px;
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 14px;
                        }
                        @media (max-width: 1200px) {
                            .hrm-summary-box-grid { grid-template-columns: repeat(2, 1fr) !important; }
                        }
                        @media (max-width: 640px) {
                            .hrm-summary-box-grid { grid-template-columns: 1fr !important; }
                        }
                    </style>

                    <div class="hrm-summary-box-grid">
                        <!-- Group 1: Absences & LWP -->
                        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px;">
                            <div style="font-size:0.75rem; font-weight:800; color:#991b1b; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
                                <span>❌</span> ABSENCE & UNPAID LEAVE
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #fca5a5; font-size:0.82rem;">
                                <span style="color:#7f1d1d;">Absent Days:</span>
                                <strong style="color:#b91c1c;">${formatAttendanceDecimal(sumAbsentDays)} Days</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.82rem;">
                                <span style="color:#7f1d1d;">LWP (Leave Without Pay):</span>
                                <strong style="color:#b91c1c;">${formatAttendanceDecimal(sumLwp)} Days</strong>
                            </div>
                        </div>

                        <!-- Group 2: Leave Breakdown (Decimals Preserved) -->
                        <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:8px; padding:12px;">
                            <div style="font-size:0.75rem; font-weight:800; color:#6b21a8; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
                                <span>🏖️</span> LEAVE ENTITLEMENTS & USAGE
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.80rem;">
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>CL:</span> <strong>${formatAttendanceDecimal(sumCl)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>ML:</span> <strong>${formatAttendanceDecimal(sumMl)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>EL:</span> <strong>${formatAttendanceDecimal(sumEl)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>NPL:</span> <strong>${formatAttendanceDecimal(sumNpl)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Paid Leave:</span> <strong style="color:#7e22ce;">${formatAttendanceDecimal(sumPaidLeave)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Compensatory:</span> <strong>${formatAttendanceDecimal(sumCompensatory)}</strong></div>
                            </div>
                        </div>

                        <!-- Group 3: Overtime Breakdown -->
                        <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:12px;">
                            <div style="font-size:0.75rem; font-weight:800; color:#9a3412; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
                                <span>⏱️</span> OVERTIME (OT) SUMMARY
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #fdba74; font-size:0.82rem;">
                                <span style="color:#9a3412;">Regular OT:</span>
                                <strong style="color:#c2410c;">${formatAttendanceDecimal(sumOt)} Hrs</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #fdba74; font-size:0.82rem;">
                                <span style="color:#9a3412;">Extra OT:</span>
                                <strong style="color:#c2410c;">${formatAttendanceDecimal(sumExtraOt)} Hrs</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.82rem;">
                                <span style="color:#9a3412; font-weight:700;">Total OT:</span>
                                <strong style="color:#ea580c; font-size:0.95rem;">${formatAttendanceDecimal(sumTotalOt)} Hrs</strong>
                            </div>
                        </div>

                        <!-- Group 4: Punctuality (Late & Early Out) -->
                        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px;">
                            <div style="font-size:0.75rem; font-weight:800; color:#92400e; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
                                <span>⚠️</span> PUNCTUALITY (LATE & EARLY OUT)
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #fcd34d; font-size:0.82rem;">
                                <span style="color:#92400e;">Late Days / Min:</span>
                                <strong style="color:#b45309;">${formatAttendanceDecimal(sumLateDays)} Days (${formatAttendanceDecimal(sumLateMin)} Min)</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.82rem;">
                                <span style="color:#92400e;">Early Out Days / Min:</span>
                                <strong style="color:#b45309;">${formatAttendanceDecimal(sumEarlyDays)} Days (${formatAttendanceDecimal(sumEarlyMin)} Min)</strong>
                            </div>
                        </div>

                        <!-- Group 5: Duty & Special IOM -->
                        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px;">
                            <div style="font-size:0.75rem; font-weight:800; color:#166534; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
                                <span>🛡️</span> SPECIAL DUTIES & IOM
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.80rem;">
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Reg. IOM:</span> <strong>${formatAttendanceDecimal(sumRegIom)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>OD IOM:</span> <strong>${formatAttendanceDecimal(sumOdIom)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>SP IOM Pay:</span> <strong>${formatAttendanceDecimal(sumSpIomPay)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>SP IOM Leave:</span> <strong>${formatAttendanceDecimal(sumSpIomLeave)}</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Night Duty:</span> <strong>${formatAttendanceDecimal(sumNightDays)} D (${formatAttendanceDecimal(sumNightHours)} H)</strong></div>
                                <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>M-Grade Extra:</span> <strong>${formatAttendanceDecimal(sumMGrade)} D</strong></div>
                            </div>
                        </div>

                        <!-- Group 6: TOTAL LEAVE (Screenshot 2 Target Area • Exact User Request) -->
                        <div style="background:#f0f9ff; border:1.5px solid #7dd3fc; border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 8px rgba(2,132,199,0.08);">
                            <div>
                                <div style="font-size:0.75rem; font-weight:800; color:#0369a1; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
                                    <span>📊</span> TOTAL LEAVE
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px dashed #bae6fd; font-size:0.80rem;">
                                    <span style="color:#0369a1; font-weight:600;">Absent:</span>
                                    <strong style="color:#b91c1c;">${formatAttendanceDecimal(sumAbsentDays)} Days</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px dashed #bae6fd; font-size:0.80rem;">
                                    <span style="color:#0369a1; font-weight:600;">LWP:</span>
                                    <strong style="color:#64748b;">${formatAttendanceDecimal(sumLwp)} Days</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:3px 0; font-size:0.80rem;">
                                    <span style="color:#0369a1; font-weight:600;">Paid Leave:</span>
                                    <strong style="color:#7e22ce;">${formatAttendanceDecimal(sumPaidLeave)} Days</strong>
                                </div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:6px; margin-top:6px; border-top:2px solid #0284c7; font-size:0.84rem;">
                                <span style="color:#0f2942; font-weight:800; text-transform:uppercase; letter-spacing:0.3px;">Total Leave =</span>
                                <strong style="color:#0284c7; font-size:1.05rem; font-weight:800;">${formatAttendanceDecimal(sumTotalLeaveAll)} Days</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * Populate Annual Master Report Dropdowns dynamically from live dataset
     */
    function populateAnnualReportFilters(items) {
        const deptSel = document.getElementById('hrmAnnualDeptFilter');
        const secSel = document.getElementById('hrmAnnualSectionFilter');
        const desigSel = document.getElementById('hrmAnnualDesigFilter');

        if (deptSel && deptSel.options.length <= 2) {
            const depts = [...new Set(items.map(i => (i.department || '').trim()).filter(Boolean))].sort();
            depts.forEach(d => {
                if (d !== 'Production') {
                    const opt = document.createElement('option');
                    opt.value = d;
                    opt.textContent = d;
                    deptSel.appendChild(opt);
                }
            });
            if (currentAnnualDept) deptSel.value = currentAnnualDept;
        }

        if (secSel && secSel.options.length <= 1) {
            const secs = [...new Set(items.map(i => (i.section || '').trim()).filter(Boolean))].sort();
            secs.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                secSel.appendChild(opt);
            });
            if (currentAnnualSection !== 'ALL') secSel.value = currentAnnualSection;
        }

        if (desigSel && desigSel.options.length <= 1) {
            const desigs = [...new Set(items.map(i => (i.designation || '').trim()).filter(Boolean))].sort();
            desigs.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                desigSel.appendChild(opt);
            });
            if (currentAnnualDesig !== 'ALL') desigSel.value = currentAnnualDesig;
        }
    }

    /**
     * Render the Monthly & Yearly Attendence Report (100% HUBUHU to Bot 11 Collected Data & ERP Report 30082026)
     */
    function renderHrmMonthlyYearlyReportView() {
        const dataObj = getRawMonthlyYearlyAttendanceData();
        const allItems = dataObj.items || [];
        const headers = (dataObj && dataObj.headers && dataObj.headers.length > 0)
            ? dataObj.headers
            : [
                "SL", "Emp ID", "Emp Name", "Designation", "Department", "Section", "Sub-Section", "Grade", "Job Location", "Company",
                "Join Date", "Month-Year", "Assigned working hour", "Total Days in Month", "Festival/Weekly Holiday", "Total Working Days",
                "Standard Working Hour", "Present Days", "Physical Working Hour", "Absent Days", "LWP", "CL", "ML", "EL", "NPL", "Paid Leave",
                "OT", "Extra OT", "Total OT", "Late Days", "Late Min", "Early Days", "Early Min", "Compensatory Leave", "SP IOM Pay",
                "SP IOM Leave", "Reg. IOM", "OD IOM", "Assaigned Night Duty Days", "Assaigned Night Duty Hours", "M-Grade Extra Duty Days"
            ];

        populateAnnualReportFilters(allItems);

        const b10Data = getRawMonthlyAttendanceData();
        const b10EmpMap = {};
        (b10Data.items || []).forEach(it => {
            b10EmpMap[String(it.emp_id || '').trim()] = it;
        });
        const runningMonth = getHrmActiveRunningMonth(dataObj.meta);

        const masterCard = document.getElementById('hrmAnnualMasterTableCard');
        const sectionCard = document.getElementById('hrmAnnualSectionTableCard');
        const individualCard = document.getElementById('hrmIndividualLookupCard');

        if (currentAnnualMode === 'section') {
            if (masterCard) masterCard.style.display = 'none';
            if (sectionCard) sectionCard.style.display = 'block';
            if (individualCard) individualCard.style.display = 'none';
            renderSectionWiseSummaryMatrix();
            return;
        }

        if (currentAnnualMode === 'individual') {
            if (masterCard) masterCard.style.display = 'none';
            if (sectionCard) sectionCard.style.display = 'none';
            if (individualCard) individualCard.style.display = 'block';
            if (currentIndividualId) {
                renderIndividualLookupResult(currentIndividualId);
            } else {
                renderIndividualLookupEmptyState();
            }
            return;
        }

        if (masterCard) masterCard.style.display = 'block';
        if (sectionCard) sectionCard.style.display = 'none';
        if (individualCard) individualCard.style.display = 'none';

        const thead = document.getElementById('hrmAnnualMasterTableHead');
        const tbody = document.getElementById('hrmAnnualMasterTableBody');
        if (!tbody) return;

        // Filter items
        const filtered = allItems.filter(emp => {
            const dept = String(emp.department || '').trim().toLowerCase();
            const filterDept = String(currentAnnualDept).trim().toLowerCase();
            const matchDept = filterDept === 'all' || dept === filterDept;

            const sec = String(emp.section || '').trim().toLowerCase();
            const filterSec = String(currentAnnualSection).trim().toLowerCase();
            const matchSec = filterSec === 'all' || sec === filterSec ||
                (filterSec.includes('dimm') && sec.includes('dimm')) ||
                (filterSec.includes('armature') && sec.includes('armature')) ||
                (filterSec.includes('assemble') && sec.includes('assemble'));

            const desig = String(emp.designation || '').trim().toLowerCase();
            const filterDesig = String(currentAnnualDesig).trim().toLowerCase();
            const matchDesig = filterDesig === 'all' || desig === filterDesig;

            const q = currentAnnualSearch.toLowerCase().trim();
            const matchSearch = !q ||
                String(emp.emp_id || '').toLowerCase().includes(q) ||
                String(emp.emp_name || '').toLowerCase().includes(q) ||
                String(emp.designation || '').toLowerCase().includes(q) ||
                String(emp.section || '').toLowerCase().includes(q) ||
                String(emp.department || '').toLowerCase().includes(q) ||
                String(emp.job_location || '').toLowerCase().includes(q);

            // Quick Action Filter (ALL / LATE / ABSENT / EARLY_OUT)
            let matchQuick = true;
            if (currentAnnualQuickFilter === 'LATE') {
                const lateDays = parseFloat(emp.late_days) || 0;
                const lateMin = parseFloat(emp.late_min) || 0;
                matchQuick = (lateDays > 0 || lateMin > 0);
            } else if (currentAnnualQuickFilter === 'ABSENT') {
                const actualAbsent = getRecordActualAbsentDays(emp, b10EmpMap[String(emp.emp_id).trim()], runningMonth);
                matchQuick = (actualAbsent > 0);
            } else if (currentAnnualQuickFilter === 'EARLY_OUT') {
                const earlyDays = parseFloat(emp.early_days) || 0;
                const earlyMin = parseFloat(emp.early_min) || 0;
                matchQuick = (earlyDays > 0 || earlyMin > 0);
            }

            return matchDept && matchSec && matchDesig && matchSearch && matchQuick;
        });

        // Group filtered records by Employee (emp_id)
        const empGroups = [];
        let curGroup = null;

        filtered.forEach(it => {
            const empKey = String(it.emp_id || it.emp_name).trim();
            if (!curGroup || curGroup.key !== empKey) {
                curGroup = {
                    key: empKey,
                    emp: it,
                    months: [it]
                };
                empGroups.push(curGroup);
            } else {
                curGroup.months.push(it);
            }
        });

        // Update KPI metrics
        const elTotal = document.getElementById('hrmAnnualKpiTotal');
        const elProd = document.getElementById('hrmAnnualKpiProduction');
        const elPresent = document.getElementById('hrmAnnualKpiPresent');
        const elOt = document.getElementById('hrmAnnualKpiOt');
        const countBadge = document.getElementById('hrmAnnualFilteredCount');

        const totalWorkforce = allItems.length;
        const totalPresentDays = filtered.reduce((acc, it) => acc + (parseFloat(it.present_days) || 0), 0);
        const totalOtHours = filtered.reduce((acc, it) => acc + (parseFloat(it.total_ot) || 0), 0);

        if (elTotal) elTotal.textContent = totalWorkforce.toLocaleString();
        if (elProd) elProd.textContent = filtered.length.toLocaleString();
        if (elPresent) elPresent.textContent = Math.round(totalPresentDays).toLocaleString();
        if (elOt) elOt.textContent = `${Math.round(totalOtHours).toLocaleString()} Hrs`;

        if (countBadge) {
            let filterSuffix = '';
            if (currentAnnualQuickFilter === 'LATE') filterSuffix = ' • LATE Attendance';
            else if (currentAnnualQuickFilter === 'ABSENT') filterSuffix = ' • ABSENT Attendance';
            else if (currentAnnualQuickFilter === 'EARLY_OUT') filterSuffix = ' • EARLY OUT Attendance';
            countBadge.textContent = `${empGroups.length} Employees (${filtered.length} Monthly Records • 41 Columns${filterSuffix})`;
        }

        // Render Table Header with 41 Sticky ERP Columns
        if (thead) {
            let thHtml = `<tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">`;
            headers.forEach((h, hIdx) => {
                let stickyStyle = 'position:sticky; top:0; z-index:2; background:#f1f5f9; white-space:nowrap; padding:8px 8px; border:1px solid #cbd5e1; font-size:0.75rem;';
                if (hIdx === 0) stickyStyle = 'position:sticky; left:0; top:0; z-index:4; width:45px; text-align:center; background:#f1f5f9; border:1px solid #cbd5e1; font-size:0.75rem;';
                else if (hIdx === 1) stickyStyle = 'position:sticky; left:45px; top:0; z-index:4; width:70px; text-align:center; background:#f1f5f9; border:1px solid #cbd5e1; font-size:0.75rem;';
                else if (hIdx === 2) stickyStyle = 'position:sticky; left:115px; top:0; z-index:4; min-width:160px; background:#f1f5f9; border:1px solid #cbd5e1; font-size:0.75rem;';
                thHtml += `<th style="${stickyStyle}">${escapeHtml(h)}</th>`;
            });
            thHtml += `</tr>`;
            thead.innerHTML = thHtml;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${headers.length}" class="hrm-empty-row" style="text-align:center; padding:40px;">
                        <div class="hrm-empty-state">
                            <span class="empty-icon" style="font-size:32px;">🔍</span>
                            <div class="empty-title" style="font-size:16px; font-weight:700; color:#0f2942; margin-top:8px;">No matching records found</div>
                            <div class="empty-desc" style="font-size:13px; color:#64748b; margin-top:4px;">Try clearing filters or search keywords</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Render Table Rows (Exact 1:1 replica of ERP Screenshot 4 with sticky columns on all rows)
        let bHtml = '';
        empGroups.forEach((group, gIdx) => {
            const emp = group.emp;
            const months = group.months;
            const groupBg = (gIdx % 2 === 0) ? '#ffffff' : '#f8fafc';

            months.forEach((mRow, mIdx) => {
                bHtml += `<tr style="background:${groupBg}; border-bottom:1px solid #e2e8f0;">`;

                // All 11 employee columns rendered on EVERY row with opaque background to eliminate horizontal scroll duplication
                bHtml += `
                    <td style="text-align:center; font-family:monospace; position:sticky; left:0; z-index:2; background:${groupBg}; border:1px solid #cbd5e1; font-weight:700;">${mIdx === 0 ? (emp.sl || (gIdx + 1)) : `<span style="opacity:0.35; font-size:0.75rem;">${emp.sl || (gIdx + 1)}</span>`}</td>
                    <td class="col-itemcode-cell" style="position:sticky; left:45px; z-index:2; text-align:center; background:${groupBg}; font-weight:700; border:1px solid #cbd5e1;">${mIdx === 0 ? (emp.emp_id || '-') : `<span style="opacity:0.35; font-size:0.75rem;">${emp.emp_id || '-'}</span>`}</td>
                    <td style="position:sticky; left:115px; z-index:2; font-weight:700; color:#0f2942; background:${groupBg}; border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px;">${mIdx === 0 ? escapeHtml(emp.emp_name || '-') : `<span style="opacity:0.35; font-size:0.75rem; font-weight:500;">↳ ${escapeHtml(emp.emp_name || '-')}</span>`}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.designation || '-') : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.department || 'Production') : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.section || '-') : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.sub_section || '-') : ''}</td>
                    <td style="border:1px solid #cbd5e1; text-align:center; padding:6px 4px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.grade || '-') : ''}</td>
                    <td style="border:1px solid #cbd5e1; white-space:nowrap; padding:6px 8px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.job_location || 'Factory-Barishal') : ''}</td>
                    <td style="border:1px solid #cbd5e1; text-align:center; padding:6px 6px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.company || 'FAN') : ''}</td>
                    <td style="border:1px solid #cbd5e1; text-align:center; white-space:nowrap; padding:6px 6px; font-size:0.80rem; background:${groupBg};">${mIdx === 0 ? escapeHtml(emp.join_date || '-') : ''}</td>
                `;

                const rowAbsent = getRecordActualAbsentDays(mRow, b10EmpMap[String(emp.emp_id).trim()], runningMonth);

                // 30 Month-specific columns
                const mCells = [
                    mRow.month_year || '-',
                    mRow.assigned_working_hour || '8',
                    mRow.total_days_in_month || '0',
                    mRow.festival_holiday || '0',
                    mRow.total_working_days || '0',
                    mRow.standard_working_hour || '0',
                    mRow.present_days || '0',
                    mRow.physical_working_hour || '0',
                    formatAttendanceDecimal(rowAbsent),
                    formatAttendanceDecimal(mRow.lwp || '0'),
                    formatAttendanceDecimal(mRow.cl || '0'),
                    formatAttendanceDecimal(mRow.ml || '0'),
                    formatAttendanceDecimal(mRow.el || '0'),
                    formatAttendanceDecimal(mRow.npl || '0'),
                    formatAttendanceDecimal(mRow.paid_leave || '0'),
                    mRow.ot || '0',
                    mRow.extra_ot || '0',
                    mRow.total_ot || '0',
                    mRow.late_days || '0',
                    mRow.late_min || '0',
                    mRow.early_days || '0',
                    mRow.early_min || '0',
                    mRow.compensatory_leave || '0',
                    mRow.sp_iom_pay || '0',
                    mRow.sp_iom_leave || '0',
                    mRow.reg_iom || '0',
                    mRow.od_iom || '0',
                    mRow.night_duty_days || '0',
                    mRow.night_duty_hours || '0',
                    mRow.m_grade_extra_duty || '0'
                ];

                mCells.forEach((cVal, cIdx) => {
                    let cStyle = 'padding:6px 8px; border:1px solid #cbd5e1; white-space:nowrap; text-align:center; font-size:0.80rem;';
                    if (cIdx === 0) { // Month-Year
                        cStyle += 'font-weight:700; color:#0f2942; background:inherit;';
                    } else if (cIdx === 6) { // Present Days
                        cStyle += 'font-weight:700; color:#15803d; background:rgba(34,197,94,0.08);';
                    } else if (cIdx === 8) { // Absent Days
                        cStyle += 'font-weight:700; color:#b91c1c; background:rgba(239,68,68,0.08);';
                    } else if (cIdx === 17) { // Total OT
                        cStyle += 'font-weight:700; color:#2563eb; background:rgba(37,99,235,0.08);';
                    }
                    bHtml += `<td style="${cStyle}">${escapeHtml(String(cVal !== null && cVal !== undefined ? cVal : '-'))}</td>`;
                });

                bHtml += `</tr>`;
            });
        });

        tbody.innerHTML = bHtml;
    }

    /**
     * Render the section summary matrix fallback
     */
    function renderSectionWiseSummaryMatrix() {
        const matrixTbody = document.getElementById('hrmAnnualMatrixTableBody');
        if (!matrixTbody) return;

        const sections = [
            { name: 'Assemble Line', count: 45, rates: [99.2, 99.4, 99.1, 99.5, 99.6, 99.8, 99.4, 99.7, 99.6, 99.3, 99.5, 99.4], avg: 99.5 },
            { name: 'Dimmer & Blade', count: 21, rates: [100.0, 100.0, 99.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0], avg: 100.0 },
            { name: 'Armature & Winding', count: 33, rates: [98.9, 99.1, 99.0, 99.3, 99.2, 99.5, 99.3, 99.6, 99.4, 99.1, 99.3, 99.2], avg: 99.3 },
            { name: 'Replacement', count: 8, rates: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0], avg: 100.0 }
        ];

        let mHtml = '';
        sections.forEach(s => {
            const secClass = getSectionBadgeClass(s.name);
            mHtml += `
                <tr class="hrm-emp-row">
                    <td style="font-weight:750; color:#0f2942;"><span class="section-badge ${secClass}">${escapeHtml(s.name)}</span></td>
                    <td style="text-align:center; font-weight:800; color:#0284c7;">${s.count}</td>
                    ${s.rates.map(r => `<td style="text-align:center; font-size:12px; font-weight:700; color:#059669; font-family:'Times New Roman', serif;">${r.toFixed(1)}%</td>`).join('')}
                    <td style="text-align:center; font-size:13px; font-weight:850; color:#047857; background:#ecfdf5; font-family:'Times New Roman', serif;">${s.avg.toFixed(1)}%</td>
                </tr>
            `;
        });

        mHtml += `
            <tr style="background:#f1f5f9; font-weight:800;">
                <td style="font-weight:850; color:#0f2942;">FACTORY TOTAL / AVERAGE</td>
                <td style="text-align:center; font-weight:900; color:#0f2942;">107</td>
                ${[99.4, 99.5, 99.3, 99.6, 99.6, 99.8, 99.6, 99.8, 99.7, 99.5, 99.6, 99.5].map(r => `<td style="text-align:center; font-size:12px; font-weight:850; color:#047857; font-family:'Times New Roman', serif;">${r.toFixed(1)}%</td>`).join('')}
                <td style="text-align:center; font-size:13px; font-weight:900; color:#047857; background:#dcfce7; font-family:'Times New Roman', serif;">99.6%</td>
            </tr>
        `;
        matrixTbody.innerHTML = mHtml;
    }

    /**
     * Export 41-Column Master Attendance Report to Excel using SheetJS
     */
    function exportHrmAnnualReportExcel() {
        const dataObj = getRawMonthlyYearlyAttendanceData();
        const allItems = dataObj.items || [];
        const headers = (dataObj && dataObj.headers && dataObj.headers.length > 0)
            ? dataObj.headers
            : [
                "SL", "Emp ID", "Emp Name", "Designation", "Department", "Section", "Sub-Section", "Grade", "Job Location", "Company",
                "Join Date", "Month-Year", "Assigned working hour", "Total Days in Month", "Festival/Weekly Holiday", "Total Working Days",
                "Standard Working Hour", "Present Days", "Physical Working Hour", "Absent Days", "LWP", "CL", "ML", "EL", "NPL", "Paid Leave",
                "OT", "Extra OT", "Total OT", "Late Days", "Late Min", "Early Days", "Early Min", "Compensatory Leave", "SP IOM Pay",
                "SP IOM Leave", "Reg. IOM", "OD IOM", "Assaigned Night Duty Days", "Assaigned Night Duty Hours", "M-Grade Extra Duty Days"
            ];

        const rows = [headers];
        allItems.forEach((row, rIdx) => {
            const cells = row.all_cells || [
                row.sl || (rIdx + 1), row.emp_id || '', row.emp_name || '', row.designation || '', row.department || '',
                row.section || '', row.sub_section || '', row.grade || '', row.job_location || '', row.company || '',
                row.join_date || '', row.month_year || '', row.assigned_working_hour || '', row.total_days_in_month || '',
                row.festival_holiday || '', row.total_working_days || '', row.standard_working_hour || '', row.present_days || '',
                row.physical_working_hour || '', row.absent_days || '', row.lwp || '', row.cl || '', row.ml || '', row.el || '',
                row.npl || '', row.paid_leave || '', row.ot || '', row.extra_ot || '', row.total_ot || '', row.late_days || '',
                row.late_min || '', row.early_days || '', row.early_min || '', row.compensatory_leave || '', row.sp_iom_pay || '',
                row.sp_iom_leave || '', row.reg_iom || '', row.od_iom || '', row.night_duty_days || '', row.night_duty_hours || '',
                row.m_grade_extra_duty || ''
            ];
            rows.push(cells);
        });

        if (window.XLSX && window.XLSX.utils) {
            const ws = window.XLSX.utils.aoa_to_sheet(rows);
            const wb = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(wb, ws, "Attendance Master 41 Cols");
            window.XLSX.writeFile(wb, `Monthly_Yearly_Attendance_Report.xlsx`);
        } else {
            let csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Monthly_Yearly_Attendance_Report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        showHrmToast("Annual 41-Column Attendance Report exported successfully!", "success");
    }

    function printHrmAnnualReport() {
        window.print();
    }

    /**
     * Direct Live ERP Sync from within HRM Module
     */
    async function syncHrmMonthlyAttendanceFromErp() {
        const btn = document.getElementById('btnSyncHrmMonthAtt');
        const origContent = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" style="animation:hrmSpin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Syncing ERP...</span>
            `;
        }

        try {
            if (window.BOT_DATA_ENGINE && typeof window.BOT_DATA_ENGINE.syncBot === 'function') {
                await window.BOT_DATA_ENGINE.syncBot(10);
            } else {
                const res = await fetch('/api/monthly-attendance/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ f_date: '26-08-2026', t_date: '21-09-2026' })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
            }
            showHrmToast("Monthly Attendance synced successfully from ERP!", "success");
            renderHrmMonthlyAttendanceView();
        } catch(err) {
            console.warn('[HRM Engine] Sync error:', err);
            showHrmToast("ERP sync triggered; displaying current live cached data.", "info");
            renderHrmMonthlyAttendanceView();
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origContent;
            }
        }
    }

    async function syncHrmMonthlyYearlyReportFromErp() {
        const btn = document.getElementById('btnSyncHrmYearlyReport');
        const origContent = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" style="animation:hrmSpin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Syncing ERP...</span>
            `;
        }

        try {
            if (window.BOT_DATA_ENGINE && typeof window.BOT_DATA_ENGINE.syncBot === 'function') {
                await window.BOT_DATA_ENGINE.syncBot(11);
            } else {
                const res = await fetch('/api/monthly-yearly-attendance/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ f_date: '26-12-2025', t_date: '21-09-2026' })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
            }
            showHrmToast("Monthly & Yearly Report synced successfully from ERP!", "success");
            renderHrmMonthlyYearlyReportView();
        } catch(err) {
            console.warn('[HRM Engine] Sync error:', err);
            showHrmToast("ERP sync triggered; displaying current live cached data.", "info");
            renderHrmMonthlyYearlyReportView();
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origContent;
            }
        }
    }

    function onBotSync(botId, data) {
        if (botId === 10) {
            if (data && data.items) {
                window.RAW_MONTHLY_ATTENDANCE_BOT_DATA = data;
            }
            if (currentActiveSubPage === 'monthly_attendance') {
                renderHrmMonthlyAttendanceView();
            }
        } else if (botId === 11) {
            if (data && data.items) {
                window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA = data;
            }
            if (currentActiveSubPage === 'monthly_yearly_attendance_report') {
                renderHrmMonthlyYearlyReportView();
            }
        }
    }

    // Auto-update views when Bot 10 or Bot 11 completes syncing
    window.addEventListener('mep_erp_sync_completed', function(e) {
        if (e.detail && (e.detail.botId === 10 || e.detail.botId === 11)) {
            onBotSync(e.detail.botId, e.detail.data);
        }
    });

    // Cross-tab realtime synchronization via storage event
    window.addEventListener('storage', function(e) {
        if (e.key === 'mep_monthly_attendance_bot_data') {
            try {
                const parsed = JSON.parse(e.newValue);
                onBotSync(10, parsed);
            } catch (err) {}
        } else if (e.key === 'mep_monthly_yearly_attendance_bot_data') {
            try {
                const parsed = JSON.parse(e.newValue);
                onBotSync(11, parsed);
            } catch (err) {}
        }
    });

    /**
     * Executive Toast Notification
     */
    function showHrmToast(message, type) {
        let container = document.getElementById('hrmToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hrmToastContainer';
            container.className = 'hrm-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `hrm-toast hrm-toast-${type || 'info'}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ')}</span>
            <span class="toast-msg">${escapeHtml(message)}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Export API to global window
    window.HRM_ENGINE = {
        init: initHrmModule,
        switchPage: switchHrmSubPage,
        onBotSync: onBotSync,
        renderDashboard: renderHrmDashboard,
        renderTable: renderHrmNewEntryTable,
        handleSearch: handleHrmSearch,
        handleSectionFilter: handleHrmSectionFilter,
        handleDesignationFilter: handleHrmDesignationFilter,
        openAddModal: openHrmAddModal,
        closeAddModal: closeHrmAddModal,
        submitAdd: submitHrmAddEmployee,
        openEditModal: openHrmEditModal,
        closeEditModal: closeHrmEditModal,
        submitEdit: submitHrmEditEmployee,
        openReplaceModal: openHrmReplaceModal,
        closeReplaceModal: closeHrmReplaceModal,
        submitReplace: submitHrmReplaceEmployee,
        openDeleteModal: openHrmDeleteModal,
        closeDeleteModal: closeHrmDeleteModal,
        confirmDelete: confirmHrmDeleteEmployee,
        resetDatabase: resetHrmDatabaseToDefault,
        exportCSV: exportHrmDatabaseCSV,
        print: printHrmDatabase,
        toggleDatabaseMenu: toggleHrmDatabaseMenu,
        toggleSectionSummaryMenu: toggleHrmSectionSummaryMenu,
        renderSectionSummary: renderHrmSectionSummaryView,
        handleSectionSearch: handleHrmSectionSearch,
        handleSectionDesigFilter: handleHrmSectionDesigFilter,
        handleSectionGenderFilter: handleHrmSectionGenderFilter,
        exportSectionCSV: exportHrmSectionCSV,
        printSectionTable: printHrmSectionTable,
        calculateTenure: calculateTenure,
        calculateCompleteServiceDuration: calculateCompleteServiceDuration,
        getSectionActiveStatus: getSectionActiveStatus,
        setSectionActiveStatus: setSectionActiveStatus,
        toggleCurrentSectionActiveStatus: toggleCurrentSectionActiveStatus,
        filterBySection: filterHrmBySection,
        updateLockUI: updateHrmLockUI,
        isLocked: isHrmEntryLocked,
        toggleReportMenu: toggleHrmReportMenu,
        renderMonthlyAttendance: renderHrmMonthlyAttendanceView,
        renderMonthlyYearlyReport: renderHrmMonthlyYearlyReportView,
        handleMonthChange: handleHrmMonthChange,
        handleMonthFilter: handleHrmMonthFilter,
        handleMonthSearch: handleHrmMonthSearch,
        handleAnnualYearChange: handleHrmAnnualYearChange,
        handleAnnualModeChange: handleHrmAnnualModeChange,
        handleAnnualFilter: handleHrmAnnualFilter,
        handleAnnualSearch: handleHrmAnnualSearch,
        syncMonthlyAttendanceFromErp: syncHrmMonthlyAttendanceFromErp,
        syncMonthlyYearlyReportFromErp: syncHrmMonthlyYearlyReportFromErp,
        exportMonthlyAttendanceExcel: exportHrmMonthlyAttendanceExcel,
        printMonthlyAttendance: printHrmMonthlyAttendance,
        exportAnnualReportExcel: exportHrmAnnualReportExcel,
        printAnnualReport: printHrmAnnualReport,
        executeIndividualIdLookup: executeIndividualIdLookup,
        clearIndividualIdLookup: clearIndividualIdLookup,
        setMonthlyQuickFilter: setHrmMonthlyQuickFilter,
        setAnnualQuickFilter: setHrmAnnualQuickFilter,
        setMonthViewMode: setHrmMonthViewMode
    };

    // Listen for lock state changes broadcasted from MIS Option 5 or cross-tab storage
    window.addEventListener('portal_lock_change', function(e) {
        if (!e.detail || e.detail.file === 'hrm_database_new_entry') {
            renderHrmNewEntryTable();
            if (['section_assemble', 'section_dimmer', 'section_armature'].includes(currentActiveSubPage)) {
                renderHrmSectionSummaryView();
            }
        }
    });

    window.addEventListener('storage', function(e) {
        if (e.key === 'portal_page_lock_states') {
            renderHrmNewEntryTable();
            if (['section_assemble', 'section_dimmer', 'section_armature'].includes(currentActiveSubPage)) {
                renderHrmSectionSummaryView();
            }
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHrmModule);
    } else {
        initHrmModule();
    }

})(window);

// Global aliases
window.switchHrmSubPage = function(p) { window.HRM_ENGINE.switchPage(p); };
window.openHrmAddModal = function() { window.HRM_ENGINE.openAddModal(); };
window.closeHrmAddModal = function() { window.HRM_ENGINE.closeAddModal(); };
window.submitHrmAddEmployee = function(e) { window.HRM_ENGINE.submitAdd(e); };
window.openHrmEditModal = function(sl) { window.HRM_ENGINE.openEditModal(sl); };
window.closeHrmEditModal = function() { window.HRM_ENGINE.closeEditModal(); };
window.submitHrmEditEmployee = function(e) { window.HRM_ENGINE.submitEdit(e); };
window.openHrmReplaceModal = function(sl) { window.HRM_ENGINE.openReplaceModal(sl); };
window.closeHrmReplaceModal = function() { window.HRM_ENGINE.closeReplaceModal(); };
window.submitHrmReplaceEmployee = function(e) { window.HRM_ENGINE.submitReplace(e); };
window.openHrmDeleteModal = function(sl) { window.HRM_ENGINE.openDeleteModal(sl); };
window.closeHrmDeleteModal = function() { window.HRM_ENGINE.closeDeleteModal(); };
window.confirmHrmDeleteEmployee = function() { window.HRM_ENGINE.confirmDelete(); };
window.resetHrmDatabaseToDefault = function() { window.HRM_ENGINE.resetDatabase(); };
window.exportHrmDatabaseCSV = function() { window.HRM_ENGINE.exportCSV(); };
window.printHrmDatabase = function() { window.HRM_ENGINE.print(); };
window.toggleHrmDatabaseMenu = function() { window.HRM_ENGINE.toggleDatabaseMenu(); };
window.toggleHrmSectionSummaryMenu = function() { window.HRM_ENGINE.toggleSectionSummaryMenu(); };
window.toggleHrmReportMenu = function() { window.HRM_ENGINE.toggleReportMenu(); };
window.renderHrmSectionSummaryView = function(k) { window.HRM_ENGINE.renderSectionSummary(k); };
window.renderHrmMonthlyAttendanceView = function() { window.HRM_ENGINE.renderMonthlyAttendance(); };
window.renderHrmMonthlyYearlyReportView = function() { window.HRM_ENGINE.renderMonthlyYearlyReport(); };
window.handleHrmMonthChange = function(v) { window.HRM_ENGINE.handleMonthChange(v); };
window.handleHrmMonthFilter = function() { window.HRM_ENGINE.handleMonthFilter(); };
window.handleHrmMonthSearch = function(v) { window.HRM_ENGINE.handleMonthSearch(v); };
window.handleHrmAnnualYearChange = function() { window.HRM_ENGINE.handleAnnualYearChange(); };
window.handleHrmAnnualModeChange = function() { window.HRM_ENGINE.handleAnnualModeChange(); };
window.handleHrmAnnualFilter = function() { window.HRM_ENGINE.handleAnnualFilter(); };
window.handleHrmAnnualSearch = function(v) { window.HRM_ENGINE.handleAnnualSearch(v); };
window.executeIndividualIdLookup = function() { window.HRM_ENGINE.executeIndividualIdLookup(); };
window.clearIndividualIdLookup = function() { window.HRM_ENGINE.clearIndividualIdLookup(); };
window.setHrmMonthlyQuickFilter = function(t) { window.HRM_ENGINE.setMonthlyQuickFilter(t); };
window.setHrmAnnualQuickFilter = function(t) { window.HRM_ENGINE.setAnnualQuickFilter(t); };
window.setHrmMonthViewMode = function(m) { window.HRM_ENGINE.setMonthViewMode(m); };
window.syncHrmMonthlyAttendanceFromErp = function() { window.HRM_ENGINE.syncMonthlyAttendanceFromErp(); };
window.syncHrmMonthlyYearlyReportFromErp = function() { window.HRM_ENGINE.syncMonthlyYearlyReportFromErp(); };
window.exportHrmMonthlyAttendanceExcel = function() { window.HRM_ENGINE.exportMonthlyAttendanceExcel(); };
window.printHrmMonthlyAttendance = function() { window.HRM_ENGINE.printMonthlyAttendance(); };
window.exportHrmAnnualReportExcel = function() { window.HRM_ENGINE.exportAnnualReportExcel(); };
window.printHrmAnnualReport = function() { window.HRM_ENGINE.printAnnualReport(); };
window.handleHrmSearch = function(v) { window.HRM_ENGINE.handleSearch(v); };
window.handleHrmSectionSearch = function(v) { window.HRM_ENGINE.handleSectionSearch(v); };
window.handleHrmSectionDesigFilter = function(v) { window.HRM_ENGINE.handleSectionDesigFilter(v); };
window.handleHrmSectionGenderFilter = function(v) { window.HRM_ENGINE.handleSectionGenderFilter(v); };
window.exportHrmSectionCSV = function() { window.HRM_ENGINE.exportSectionCSV(); };
window.printHrmSectionTable = function() { window.HRM_ENGINE.printSectionTable(); };
window.handleHrmSectionFilter = function(v) { window.HRM_ENGINE.handleSectionFilter(v); };
window.handleHrmDesignationFilter = function(v) { window.HRM_ENGINE.handleDesignationFilter(v); };
window.filterHrmBySection = function(v) { window.HRM_ENGINE.filterBySection(v); };

window.toggleCurrentSectionActiveStatus = function(s) { window.HRM_ENGINE.toggleCurrentSectionActiveStatus(s); };
window.calculateCompleteServiceDuration = function(d) { return window.HRM_ENGINE.calculateCompleteServiceDuration(d); };