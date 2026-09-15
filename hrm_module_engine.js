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
            if (subParam && ['section_assemble', 'section_dimmer', 'section_armature', 'new_entry', 'dashboard'].includes(subParam)) {
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
        renderHrmDashboard();
        renderHrmNewEntryTable();
        updateHrmLockUI();
    }

    /**
     * Switch sub-page between Dashboard, Data Base -> New Entry, and Section Summaries
     */
    function switchHrmSubPage(pageKey) {
        currentActiveSubPage = pageKey;
        const dashPane = document.getElementById('hrmDashboardPane');
        const entryPane = document.getElementById('hrmDatabaseNewEntryPane');
        const sectionPane = document.getElementById('hrmSectionSummaryPane');

        const btnDash = document.getElementById('hrmNavBtnDash');
        const navNewEntry = document.getElementById('hrmNavNewEntry');
        const parentDb = document.getElementById('hrmNavDatabaseParent');

        const parentSec = document.getElementById('hrmNavSectionSummaryParent');
        const navSecAssemble = document.getElementById('hrmNavSectionAssemble');
        const navSecDimmer = document.getElementById('hrmNavSectionDimmer');
        const navSecArmature = document.getElementById('hrmNavSectionArmature');

        const breadcrumbPage = document.getElementById('hrmBreadcrumbPage');

        // Reset all active states on navigation subitems
        [navNewEntry, navSecAssemble, navSecDimmer, navSecArmature].forEach(el => {
            if (el) el.classList.remove('active');
        });

        if (pageKey === 'section_assemble' || pageKey === 'section_dimmer' || pageKey === 'section_armature') {
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

            if (btnDash) btnDash.classList.remove('active');
            if (parentSec) parentSec.classList.add('is-open');
            if (parentDb) parentDb.classList.remove('is-open');

            const cfg = SECTION_CONFIGS[pageKey];
            const activeNav = document.getElementById(cfg.navId);
            if (activeNav) activeNav.classList.add('active');

            if (breadcrumbPage) breadcrumbPage.textContent = `Section Summary > ${cfg.name}`;

            renderHrmSectionSummaryView();
        } else if (pageKey === 'new_entry') {
            if (dashPane) dashPane.style.setProperty('display', 'none', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'block', 'important');
            if (sectionPane) sectionPane.style.setProperty('display', 'none', 'important');

            if (btnDash) btnDash.classList.remove('active');
            if (navNewEntry) navNewEntry.classList.add('active');
            if (parentDb) parentDb.classList.add('is-open');
            if (parentSec) parentSec.classList.remove('is-open');
            if (breadcrumbPage) breadcrumbPage.textContent = 'Data Base > New Entry';
            renderHrmNewEntryTable();
            updateHrmLockUI();
        } else {
            if (dashPane) dashPane.style.setProperty('display', 'block', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'none', 'important');
            if (sectionPane) sectionPane.style.setProperty('display', 'none', 'important');

            if (btnDash) btnDash.classList.add('active');
            if (breadcrumbPage) breadcrumbPage.textContent = 'HRM Dashboard';
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

        // 1. Top 4 Floating KPI Cards
        const elActive = document.getElementById('hrmKpiActiveCount');
        const elInactive = document.getElementById('hrmKpiInactiveCount');
        const elLeaveReq = document.getElementById('hrmKpiLeaveReqCount');
        const elNextHoliday = document.getElementById('hrmKpiNextHoliday');

        if (elActive) elActive.textContent = stats.activeCount;
        if (elInactive) elInactive.textContent = stats.inactiveCount;
        if (elLeaveReq) elLeaveReq.textContent = stats.leaveRequestsLast30;
        if (elNextHoliday) elNextHoliday.textContent = stats.nextHoliday;

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
     * Sidebar accordion toggle for Data Base parent (auto-collapses Section Summary)
     */
    function toggleHrmDatabaseMenu() {
        const parentDb = document.getElementById('hrmNavDatabaseParent');
        const parentSec = document.getElementById('hrmNavSectionSummaryParent');
        if (parentDb) {
            const willOpen = !parentDb.classList.contains('is-open');
            if (willOpen) {
                parentDb.classList.add('is-open');
                if (parentSec) parentSec.classList.remove('is-open');
            } else {
                parentDb.classList.remove('is-open');
            }
        }
    }

    /**
     * Sidebar accordion toggle for Section Summary parent (auto-collapses Data Base)
     */
    function toggleHrmSectionSummaryMenu() {
        const parentDb = document.getElementById('hrmNavDatabaseParent');
        const parentSec = document.getElementById('hrmNavSectionSummaryParent');
        if (parentSec) {
            const willOpen = !parentSec.classList.contains('is-open');
            if (willOpen) {
                parentSec.classList.add('is-open');
                if (parentDb) parentDb.classList.remove('is-open');
            } else {
                parentSec.classList.remove('is-open');
            }
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
        isLocked: isHrmEntryLocked
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
window.renderHrmSectionSummaryView = function(k) { window.HRM_ENGINE.renderSectionSummary(k); };
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