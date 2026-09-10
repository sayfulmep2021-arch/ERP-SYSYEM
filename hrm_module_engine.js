/**
 * HRM Module Engine
 * Controls HRM Dashboard & Data Base -> New Entry View
 */
(function(window) {
    'use strict';

    let currentFilterSection = 'ALL';
    let currentFilterDesignation = 'ALL';
    let currentSearchTerm = '';
    let currentActiveSubPage = 'dashboard'; // 'dashboard' or 'new_entry'

    /**
     * Initialize HRM Module Engine
     */
    function initHrmModule() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const secParam = urlParams.get('sec') || urlParams.get('section');
            if (secParam) {
                currentFilterSection = secParam;
                const select = document.getElementById('hrmSectionSelectFilter');
                if (select) select.value = currentFilterSection;
            }
        } catch (e) {}
        renderHrmDashboard();
        renderHrmNewEntryTable();
    }

    /**
     * Switch sub-page between Dashboard and Data Base -> New Entry
     */
    function switchHrmSubPage(pageKey) {
        currentActiveSubPage = pageKey;
        const dashPane = document.getElementById('hrmDashboardPane');
        const entryPane = document.getElementById('hrmDatabaseNewEntryPane');
        const btnDash = document.getElementById('hrmNavBtnDash');
        const navNewEntry = document.getElementById('hrmNavNewEntry');
        const parentDb = document.getElementById('hrmNavDatabaseParent');
        const breadcrumbPage = document.getElementById('hrmBreadcrumbPage');

        if (pageKey === 'new_entry') {
            if (dashPane) dashPane.style.setProperty('display', 'none', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'block', 'important');
            if (btnDash) btnDash.classList.remove('active');
            if (navNewEntry) navNewEntry.classList.add('active');
            if (parentDb) parentDb.classList.add('is-open');
            if (breadcrumbPage) breadcrumbPage.textContent = 'Data Base > New Entry';
            renderHrmNewEntryTable();
        } else {
            if (dashPane) dashPane.style.setProperty('display', 'block', 'important');
            if (entryPane) entryPane.style.setProperty('display', 'none', 'important');
            if (btnDash) btnDash.classList.add('active');
            if (navNewEntry) navNewEntry.classList.remove('active');
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
            return;
        }

        let html = '';
        filtered.forEach((emp) => {
            const secClass = getSectionBadgeClass(emp.section);
            const isReplaced = emp.replaced_from ? true : false;
            const replaceTag = isReplaced 
                ? `<span class="replaced-badge" title="Replaced: ${escapeHtml(emp.replaced_from.name)} on ${escapeHtml(emp.replaced_from.date)}">🔁 Replaced</span>` 
                : '';

            const isFemale = String(emp.gender || '').toLowerCase() === 'female';
            const genderBadge = isFemale 
                ? `<span class="gender-badge gen-female">👩 Female</span>` 
                : `<span class="gender-badge gen-male">👨 Male</span>`;

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
                            <button type="button" class="btn-hrm-action btn-hrm-edit" onclick="openHrmEditModal(${emp.sl})" title="Edit Employee Details" aria-label="Edit">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>Edit</span>
                            </button>
                            <button type="button" class="btn-hrm-action btn-hrm-replace" onclick="openHrmReplaceModal(${emp.sl})" title="Replace this Employee" aria-label="Replace">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                                <span>Replace</span>
                            </button>
                            <button type="button" class="btn-hrm-action btn-hrm-delete" onclick="openHrmDeleteModal(${emp.sl})" title="Delete Employee Record" aria-label="Delete">
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

    function submitHrmAddEmployee(event) {
        if (event) event.preventDefault();
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

        window.HRM_DATABASE.addEmployee({
            id: id,
            name: name,
            designation: designation,
            doj: doj,
            section: section,
            gender: gender
        });

        closeHrmAddModal();
        renderHrmNewEntryTable();
        renderHrmDashboard();
        showHrmToast(`Employee "${name}" added successfully!`, 'success');
    }

    /**
     * Modals: Edit Employee
     */
    function openHrmEditModal(sl) {
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

        const modal = document.getElementById('hrmEditEmployeeModal');
        if (modal) modal.classList.add('show');
    }

    function closeHrmEditModal() {
        const modal = document.getElementById('hrmEditEmployeeModal');
        if (modal) modal.classList.remove('show');
    }

    function submitHrmEditEmployee(event) {
        if (event) event.preventDefault();
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

        window.HRM_DATABASE.updateEmployee(sl, {
            id: id,
            name: name,
            designation: designation,
            doj: doj,
            section: section,
            gender: gender
        });

        closeHrmEditModal();
        renderHrmNewEntryTable();
        renderHrmDashboard();
        showHrmToast(`Employee #${id} updated successfully!`, 'success');
    }

    /**
     * Modals: Replace Employee
     */
    let replacingSl = null;
    function openHrmReplaceModal(sl) {
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
        renderHrmNewEntryTable();
        renderHrmDashboard();
        showHrmToast(`Position successfully replaced with "${newName}" (ID: ${newId})!`, 'success');
    }

    /**
     * Modals: Delete Employee
     */
    let deletingSl = null;
    function openHrmDeleteModal(sl) {
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
        if (!deletingSl) return;
        window.HRM_DATABASE.deleteEmployee(deletingSl);
        closeHrmDeleteModal();
        renderHrmNewEntryTable();
        renderHrmDashboard();
        showHrmToast('Employee record deleted and list re-indexed.', 'info');
    }

    /**
     * Reset database to default 107 records
     */
    function resetHrmDatabaseToDefault() {
        if (confirm('Are you sure you want to reset the Employee Database to the initial 107 records?')) {
            window.HRM_DATABASE.resetToDefaultEmployees();
            renderHrmNewEntryTable();
            renderHrmDashboard();
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
     * Sidebar accordion toggle for Data Base parent
     */
    function toggleHrmDatabaseMenu() {
        const parent = document.getElementById('hrmNavDatabaseParent');
        if (parent) {
            parent.classList.toggle('is-open');
        }
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
        filterBySection: filterHrmBySection
    };

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
window.handleHrmSearch = function(v) { window.HRM_ENGINE.handleSearch(v); };
window.handleHrmSectionFilter = function(v) { window.HRM_ENGINE.handleSectionFilter(v); };
window.handleHrmDesignationFilter = function(v) { window.HRM_ENGINE.handleDesignationFilter(v); };
window.filterHrmBySection = function(v) { window.HRM_ENGINE.filterBySection(v); };
