/**
 * ============================================================================
 * ERP SYSTEM - EXECUTIVE NOTEBOOK & DAILY TASK MANAGER (notebook_engine.js)
 * ============================================================================
 * Provides an executive-grade operational diary & interactive daily task manager:
 *   - Auto-saves all entries to localStorage ('mep_supervisor_notebook_tasks')
 *   - "New Page" writing desk that turns to a fresh clean page after each note
 *   - Interactive task cards with complete/pending status, priority, and tags
 *   - Instant search, category & status filtering, pin to top, and inline edit
 *   - One-click CSV export and clean printable view
 * ============================================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'mep_supervisor_notebook_tasks';
    const COUNTER_KEY = 'mep_supervisor_notebook_page_count';

    let activeFilter = 'all';
    let searchQuery = '';
    let pageCount = parseInt(localStorage.getItem(COUNTER_KEY) || '1', 10);

    // Initial realistic supervisor tasks for first-time launch
    const SEED_TASKS = [
        {
            id: 'nb_seed_1',
            title: 'Ceiling Fan Line Production Target Review',
            body: 'Verify Fan Assemble line 2nd shift quota (1,400 Pcs target). Coordinate with Store for bearing 6201 & 6202 stock allocation.',
            category: 'Production Floor',
            priority: 'urgent',
            dueDate: getTodayDateString(),
            completed: false,
            pinned: true,
            createdAt: Date.now() - 3600000 * 2,
            updatedAt: Date.now() - 3600000 * 2
        },
        {
            id: 'nb_seed_2',
            title: 'Dimmer & Blade Testing Station Quality Check',
            body: 'Inspect batch #B-2026 packaging. Verify male/female operator shift handoff records on Dimmer & Blade summary.',
            category: 'Production Floor',
            priority: 'normal',
            dueDate: getTodayDateString(),
            completed: false,
            pinned: false,
            createdAt: Date.now() - 3600000 * 5,
            updatedAt: Date.now() - 3600000 * 5
        },
        {
            id: 'nb_seed_3',
            title: 'Copper Wire 0.35mm Roll Store Requisition',
            body: 'Follow up with Central Procurement for Armature & Winding line material delivery confirmation before 4:00 PM.',
            category: 'Store & Inventory',
            priority: 'normal',
            dueDate: getTodayDateString(),
            completed: true,
            pinned: false,
            createdAt: Date.now() - 3600000 * 8,
            updatedAt: Date.now() - 3600000 * 1
        }
    ];

    function getTodayDateString() {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function formatTime(timestamp) {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) + ', ' + d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
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

    /**
     * Load tasks from localStorage or seed initial data
     */
    function getStoredTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TASKS));
                return SEED_TASKS;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.warn('[Notebook] Failed to parse stored tasks:', e);
        }
        return [];
    }

    /**
     * Dynamically update Option 8 (Notebook) MIS Module Card Pending Indicator
     * If >= 1 Pending tasks: card gets soft red gradient and pending badge
     * If 0 Pending tasks: card reverts to clean white / normal state
     */
    function updateNotebookCardIndicator() {
        try {
            const tasks = getStoredTasks();
            const pendingCount = tasks.filter(t => !t.completed).length;
            const card = document.getElementById('misNotebookCard');
            const badge = document.getElementById('misNotebookPendingBadge');

            if (card) {
                if (pendingCount > 0) {
                    card.classList.add('has-pending-tasks');
                } else {
                    card.classList.remove('has-pending-tasks');
                }
            }

            if (badge) {
                if (pendingCount > 0) {
                    badge.style.display = 'inline-flex';
                    badge.textContent = `⏳ ${pendingCount} Pending`;
                } else {
                    badge.style.display = 'none';
                    badge.textContent = '';
                }
            }
        } catch (err) {
            console.error('[Notebook] Error updating card indicator:', err);
        }
    }

    /**
     * Persist tasks array to localStorage
     */
    function persistTasks(tasks) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('[Notebook] Failed to persist tasks:', e);
        }
        updateNotebookCardIndicator();
    }

    /**
     * Open the MIS Notebook Modal
     */
    function openMISNotebookModal() {
        let modal = document.getElementById('misNotebookModal');
        if (!modal) {
            // Safeguard: if portal_modals hasn't injected yet, re-check or wait
            if (typeof window.mountPortalModals === 'function') {
                window.mountPortalModals();
            }
            modal = document.getElementById('misNotebookModal');
        }

        if (!modal) {
            console.error('[Notebook] misNotebookModal container not found in DOM');
            return;
        }

        // Set default target date on writing desk if empty
        const dateInput = document.getElementById('notebookTaskDueDate');
        if (dateInput && !dateInput.value) {
            dateInput.value = getTodayDateString();
        }

        updatePageCounterDisplay();
        renderNotebookUI();

        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';

        // Focus title input for rapid note taking
        setTimeout(function () {
            const titleInput = document.getElementById('notebookTaskTitle');
            if (titleInput) titleInput.focus();
        }, 120);
    }

    /**
     * Close the MIS Notebook Modal
     */
    function closeMISNotebookModal() {
        const modal = document.getElementById('misNotebookModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.setProperty('display', 'none', 'important');
        }
        document.body.style.overflow = '';
        clearNotebookForm();
    }

    /**
     * Update the "Page #X" indicator
     */
    function updatePageCounterDisplay() {
        const counterEl = document.getElementById('notebookPageCounter');
        if (counterEl) {
            counterEl.textContent = `Page #${pageCount}`;
        }
    }

    /**
     * Render task cards and KPI counters
     */
    function renderNotebookUI() {
        const tasks = getStoredTasks();
        const grid = document.getElementById('notebookCardsGrid');

        // Calculate KPI Stats
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const urgentCount = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;

        const todayStr = getTodayDateString();
        const todayCount = tasks.filter(t => t.dueDate === todayStr || (t.createdAt && new Date(t.createdAt).toISOString().slice(0, 10) === todayStr)).length;

        // Update KPI Badges
        const kpiTotal = document.getElementById('notebookKpiTotal');
        const kpiPending = document.getElementById('notebookKpiPending');
        const kpiCompleted = document.getElementById('notebookKpiCompleted');
        const kpiRate = document.getElementById('notebookKpiRate');

        if (kpiTotal) kpiTotal.textContent = total;
        if (kpiPending) kpiPending.textContent = pending;
        if (kpiCompleted) kpiCompleted.textContent = completed;
        if (kpiRate) kpiRate.textContent = `${rate}%`;

        // Update Tab Counters
        const tabAll = document.getElementById('tabCountAll');
        const tabPending = document.getElementById('tabCountPending');
        const tabCompleted = document.getElementById('tabCountCompleted');
        const tabUrgent = document.getElementById('tabCountUrgent');
        const tabToday = document.getElementById('tabCountToday');

        if (tabAll) tabAll.textContent = total;
        if (tabPending) tabPending.textContent = pending;
        if (tabCompleted) tabCompleted.textContent = completed;
        if (tabUrgent) tabUrgent.textContent = urgentCount;
        if (tabToday) tabToday.textContent = todayCount;

        // Filter and Sort Tasks
        let filtered = tasks.slice();

        // 1. Tab Filter
        if (activeFilter === 'pending') {
            filtered = filtered.filter(t => !t.completed);
        } else if (activeFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        } else if (activeFilter === 'urgent') {
            filtered = filtered.filter(t => t.priority === 'urgent');
        } else if (activeFilter === 'today') {
            filtered = filtered.filter(t => t.dueDate === todayStr || (t.createdAt && new Date(t.createdAt).toISOString().slice(0, 10) === todayStr));
        }

        // 2. Search Query Filter
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(t => {
                const titleMatch = (t.title || '').toLowerCase().includes(q);
                const bodyMatch = (t.body || '').toLowerCase().includes(q);
                const catMatch = (t.category || '').toLowerCase().includes(q);
                return titleMatch || bodyMatch || catMatch;
            });
        }

        // 3. Sort: Pinned first, then incomplete first, then newer first
        filtered.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="nb-empty-state">
                    <div class="nb-empty-icon">📝</div>
                    <h3 class="nb-empty-title">No notes found in this view</h3>
                    <p class="nb-empty-desc">Write your tasks, instructions, or operational memos on the Writing Desk (left) and save them to create interactive task boxes.</p>
                </div>
            `;
            return;
        }

        // Build HTML cards
        grid.innerHTML = filtered.map(item => {
            const isCompleted = !!item.completed;
            const isPinned = !!item.pinned;
            const priorityClass = item.priority === 'urgent' ? 'urgent' : (item.priority === 'low' ? 'low' : 'normal');
            const priorityLabel = item.priority === 'urgent' ? 'Urgent' : (item.priority === 'low' ? 'Routine' : 'Normal');

            return `
                <div class="nb-task-card ${isCompleted ? 'is-completed' : ''} ${isPinned ? 'is-pinned' : ''}" id="taskCard_${item.id}">
                    <div class="nb-card-header">
                        <div class="nb-card-header-left">
                            <button type="button" class="nb-check-btn ${isCompleted ? 'checked' : ''}" onclick="toggleNotebookTaskComplete('${item.id}')" title="${isCompleted ? 'Mark as Incomplete / Pending' : 'Mark as Completed'}">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                            <span class="nb-badge nb-badge-${priorityClass}">${priorityLabel}</span>
                            <span class="nb-category-badge">${escapeHtml(item.category || 'General')}</span>
                            ${isPinned ? '<span class="nb-pin-badge" title="Pinned note">📌 Pinned</span>' : ''}
                        </div>
                        <div class="nb-card-header-right">
                            <button type="button" class="nb-action-icon-btn ${isPinned ? 'is-active-pin' : ''}" onclick="toggleNotebookTaskPin('${item.id}')" title="${isPinned ? 'Unpin note' : 'Pin note to top'}">
                                📌
                            </button>
                            <button type="button" class="nb-action-icon-btn" onclick="editNotebookTask('${item.id}')" title="Edit this note">
                                ✏️
                            </button>
                            <button type="button" class="nb-action-icon-btn" onclick="copyNotebookTask('${item.id}')" title="Copy note text">
                                📋
                            </button>
                            <button type="button" class="nb-action-icon-btn btn-delete" onclick="deleteNotebookTask('${item.id}')" title="Delete note">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <div class="nb-card-content">
                        <h4 class="nb-card-title">${escapeHtml(item.title || 'Untitled Memo')}</h4>
                        ${item.body ? `<div class="nb-card-body">${escapeHtml(item.body).replace(/\n/g, '<br>')}</div>` : ''}
                    </div>

                    <div class="nb-card-footer">
                        <div class="nb-card-time">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${formatTime(item.createdAt)}</span>
                        </div>
                        ${item.dueDate ? `
                            <div class="nb-card-due ${item.dueDate < todayStr && !isCompleted ? 'is-overdue' : ''}">
                                <span>🎯 Due: ${item.dueDate}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Save note & turn to a clean new page
     */
    function saveNotebookTask() {
        const titleInput = document.getElementById('notebookTaskTitle');
        const catInput = document.getElementById('notebookTaskCategory');
        const prioInput = document.getElementById('notebookTaskPriority');
        const dueInput = document.getElementById('notebookTaskDueDate');
        const bodyInput = document.getElementById('notebookTaskBody');
        const editIdInput = document.getElementById('notebookEditTaskId');

        if (!titleInput || !bodyInput) return;

        let title = (titleInput.value || '').trim();
        let body = (bodyInput.value || '').trim();
        const category = (catInput && catInput.value) || 'Production Floor';
        const priority = (prioInput && prioInput.value) || 'normal';
        const dueDate = (dueInput && dueInput.value) || getTodayDateString();
        const editId = editIdInput ? editIdInput.value.trim() : '';

        // Validation: must have either title or body
        if (!title && !body) {
            if (typeof window.showToast === 'function') {
                window.showToast("⚠️ Please enter a title or note details to save.");
            } else {
                alert("Please enter a title or note details to save.");
            }
            titleInput.focus();
            return;
        }

        // If title is blank, generate an intelligent title from first line of body
        if (!title && body) {
            const firstLine = body.split('\n')[0].trim();
            title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
        }

        const tasks = getStoredTasks();

        if (editId) {
            // Edit existing note
            const idx = tasks.findIndex(t => t.id === editId);
            if (idx !== -1) {
                tasks[idx].title = title;
                tasks[idx].body = body;
                tasks[idx].category = category;
                tasks[idx].priority = priority;
                tasks[idx].dueDate = dueDate;
                tasks[idx].updatedAt = Date.now();
            }

            if (typeof window.logSystemAudit === 'function') {
                window.logSystemAudit({
                    page: 'Notebook',
                    module: 'Executive System',
                    action: 'Task Updated',
                    item: title,
                    field: 'Daily Task Memo',
                    prevVal: 'Previous Task Content',
                    newVal: title,
                    description: `Updated operational task '${title}' in Executive Notebook.`
                });
            }

            if (typeof window.showToast === 'function') {
                window.showToast("✓ Note updated successfully!");
            }
        } else {
            // New Note: create distinct box
            const newTask = {
                id: 'nb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: title,
                body: body,
                category: category,
                priority: priority,
                dueDate: dueDate,
                completed: false,
                pinned: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            tasks.unshift(newTask);

            // Increment page counter
            pageCount++;
            localStorage.setItem(COUNTER_KEY, pageCount.toString());

            if (typeof window.logSystemAudit === 'function') {
                window.logSystemAudit({
                    page: 'Notebook',
                    module: 'Executive System',
                    action: 'Task Created',
                    item: newTask.title,
                    field: 'Daily Task Memo',
                    prevVal: null,
                    newVal: `[${newTask.category}] ${newTask.title}`,
                    description: `Created new operational memo in Executive Notebook under '${newTask.category}'.`
                });
            }

            if (typeof window.showToast === 'function') {
                window.showToast("✓ Note saved to Notebook! Clean page ready.");
            }
        }

        persistTasks(tasks);

        // Turn to fresh clean page: animate and reset form
        flashWritingDeskPageTurn();
        clearNotebookForm();
        updatePageCounterDisplay();
        renderNotebookUI();

        // Focus title input on the new clean page
        if (titleInput) {
            setTimeout(() => titleInput.focus(), 80);
        }
    }

    /**
     * Subtle page-turn ripple animation on Writing Desk
     */
    function flashWritingDeskPageTurn() {
        const desk = document.getElementById('notebookWritingDesk');
        if (!desk) return;
        desk.classList.remove('page-turn-flash');
        void desk.offsetWidth; // Trigger reflow
        desk.classList.add('page-turn-flash');
    }

    /**
     * Clear the writing desk and reset to "New Page" mode
     */
    function clearNotebookForm() {
        const titleInput = document.getElementById('notebookTaskTitle');
        const prioInput = document.getElementById('notebookTaskPriority');
        const dueInput = document.getElementById('notebookTaskDueDate');
        const bodyInput = document.getElementById('notebookTaskBody');
        const editIdInput = document.getElementById('notebookEditTaskId');
        const saveBtnText = document.getElementById('btnSaveNotebookText');
        const pageLabel = document.getElementById('notebookPageTitleLabel');

        if (titleInput) titleInput.value = '';
        if (bodyInput) bodyInput.value = '';
        if (prioInput) prioInput.value = 'normal';
        if (dueInput) dueInput.value = getTodayDateString();
        if (editIdInput) editIdInput.value = '';

        if (saveBtnText) {
            saveBtnText.textContent = 'Save Note & New Page';
        }
        if (pageLabel) {
            pageLabel.textContent = 'Writing Desk';
        }
    }

    /**
     * Toggle completed status of a note
     */
    function toggleNotebookTaskComplete(id) {
        const tasks = getStoredTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        task.updatedAt = Date.now();
        persistTasks(tasks);

        renderNotebookUI();

        if (typeof window.logSystemAudit === 'function') {
            window.logSystemAudit({
                page: 'Notebook',
                module: 'Executive System',
                action: task.completed ? 'Task Completed' : 'Task Marked Pending',
                item: task.title,
                field: 'Task Status',
                prevVal: task.completed ? 'Pending' : 'Completed',
                newVal: task.completed ? 'Completed' : 'Pending',
                description: `Task '${task.title}' marked as ${task.completed ? 'Completed' : 'Pending'}.`
            });
        }

        if (typeof window.showToast === 'function') {
            window.showToast(task.completed ? "✓ Task marked as Completed!" : "Task marked as Pending.");
        }
    }

    /**
     * Pin/Unpin note to top
     */
    function toggleNotebookTaskPin(id) {
        const tasks = getStoredTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.pinned = !task.pinned;
        task.updatedAt = Date.now();
        persistTasks(tasks);

        renderNotebookUI();

        if (typeof window.showToast === 'function') {
            window.showToast(task.pinned ? "📌 Note pinned to top of board." : "Note unpinned.");
        }
    }

    /**
     * Load note into Writing Desk to edit
     */
    function editNotebookTask(id) {
        const tasks = getStoredTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const titleInput = document.getElementById('notebookTaskTitle');
        const catInput = document.getElementById('notebookTaskCategory');
        const prioInput = document.getElementById('notebookTaskPriority');
        const dueInput = document.getElementById('notebookTaskDueDate');
        const bodyInput = document.getElementById('notebookTaskBody');
        const editIdInput = document.getElementById('notebookEditTaskId');
        const saveBtnText = document.getElementById('btnSaveNotebookText');
        const pageLabel = document.getElementById('notebookPageTitleLabel');

        if (titleInput) titleInput.value = task.title || '';
        if (catInput) catInput.value = task.category || 'Production Floor';
        if (prioInput) prioInput.value = task.priority || 'normal';
        if (dueInput) dueInput.value = task.dueDate || getTodayDateString();
        if (bodyInput) bodyInput.value = task.body || '';
        if (editIdInput) editIdInput.value = task.id;

        if (saveBtnText) {
            saveBtnText.textContent = 'Update Note';
        }
        if (pageLabel) {
            pageLabel.textContent = 'Edit Note';
        }

        // Scroll desk into view and focus
        const desk = document.getElementById('notebookWritingDesk');
        if (desk) desk.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (titleInput) titleInput.focus();

        if (typeof window.showToast === 'function') {
            window.showToast("Loaded note into Writing Desk for editing.");
        }
    }

    /**
     * Delete a note
     */
    function deleteNotebookTask(id) {
        if (!confirm("Are you sure you want to delete this note?")) return;

        let tasks = getStoredTasks();
        const targetTask = tasks.find(t => t.id === id);
        tasks = tasks.filter(t => t.id !== id);
        persistTasks(tasks);

        // If active editing task was deleted, reset form
        const editIdInput = document.getElementById('notebookEditTaskId');
        if (editIdInput && editIdInput.value === id) {
            clearNotebookForm();
        }

        renderNotebookUI();

        if (typeof window.logSystemAudit === 'function') {
            window.logSystemAudit({
                page: 'Notebook',
                module: 'Executive System',
                action: 'Task Deleted',
                item: targetTask ? targetTask.title : 'Task',
                field: 'Daily Task Memo',
                prevVal: targetTask ? targetTask.title : 'Task',
                newVal: 'Deleted',
                description: `Deleted task '${targetTask ? targetTask.title : ''}' from Executive Notebook.`
            });
        }

        if (typeof window.showToast === 'function') {
            window.showToast("🗑️ Note deleted successfully.");
        }
    }

    /**
     * Copy note text to clipboard
     */
    function copyNotebookTask(id) {
        const tasks = getStoredTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const textToCopy = `[${task.category}] ${task.title}\nDue: ${task.dueDate || 'N/A'}\nStatus: ${task.completed ? 'Completed' : 'Pending'}\n\n${task.body || ''}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            if (typeof window.showToast === 'function') {
                window.showToast("📋 Copied note text to clipboard!");
            }
        }).catch(() => {
            if (typeof window.showToast === 'function') {
                window.showToast("Unable to copy to clipboard.");
            }
        });
    }

    /**
     * Filter tasks by category/status tab
     */
    function filterNotebookTasks(filterKey) {
        activeFilter = filterKey;

        // Update active tab buttons
        document.querySelectorAll('.nb-filter-tabs .nb-tab').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === filterKey);
        });

        renderNotebookUI();
    }

    /**
     * Live search tasks
     */
    function searchNotebookTasks(query) {
        searchQuery = query || '';
        renderNotebookUI();
    }

    /**
     * Export all notebook items to CSV
     */
    function exportNotebookCSV() {
        const tasks = getStoredTasks();
        if (tasks.length === 0) {
            if (typeof window.showToast === 'function') {
                window.showToast("No notes to export.");
            }
            return;
        }

        const headers = ['ID', 'Title', 'Category', 'Priority', 'Due Date', 'Status', 'Pinned', 'Created At', 'Details'];
        const csvRows = [headers.join(',')];

        tasks.forEach(t => {
            const row = [
                `"${(t.id || '').replace(/"/g, '""')}"`,
                `"${(t.title || '').replace(/"/g, '""')}"`,
                `"${(t.category || '').replace(/"/g, '""')}"`,
                `"${(t.priority || '').replace(/"/g, '""')}"`,
                `"${(t.dueDate || '').replace(/"/g, '""')}"`,
                `"${t.completed ? 'Completed' : 'Pending'}"`,
                `"${t.pinned ? 'Yes' : 'No'}"`,
                `"${formatTime(t.createdAt).replace(/"/g, '""')}"`,
                `"${(t.body || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = '\uFEFF' + csvRows.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ERP_Executive_Notebook_${getTodayDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (typeof window.showToast === 'function') {
            window.showToast("📥 Exported Notebook to CSV!");
        }
    }

    /**
     * Clean printable view
     */
    function printNotebookView() {
        const tasks = getStoredTasks();
        const printWindow = window.open('', '_blank', 'width=850,height=700');
        if (!printWindow) {
            window.print();
            return;
        }

        const rowsHtml = tasks.map((t, i) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">${i + 1}</td>
                <td style="padding: 10px;">
                    <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${escapeHtml(t.title)}</div>
                    <div style="font-size: 12px; color: #475569; margin-top: 4px;">${escapeHtml(t.body || '')}</div>
                </td>
                <td style="padding: 10px; font-size: 12px;">${escapeHtml(t.category)}</td>
                <td style="padding: 10px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${escapeHtml(t.priority)}</td>
                <td style="padding: 10px; font-size: 12px;">${t.dueDate || 'N/A'}</td>
                <td style="padding: 10px; font-size: 12px; font-weight: bold; color: ${t.completed ? '#16a34a' : '#ea580c'};">${t.completed ? '✓ Completed' : '⏳ Pending'}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ERP Executive Notebook - ${getTodayDateString()}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; }
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
                    th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
                    .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
                </style>
            </head>
            <body>
                <div class="header-box">
                    <h2 style="margin: 0 0 4px 0;">ERP Executive Notebook & Daily Task Log</h2>
                    <p style="margin: 0; font-size: 13px; color: #64748b;">Printed on: ${formatTime(Date.now())} • Total Notes: ${tasks.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Task / Subject</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Target Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    }

    /**
     * Clear all completed tasks
     */
    function clearCompletedNotebookTasks() {
        let tasks = getStoredTasks();
        const completedCount = tasks.filter(t => t.completed).length;

        if (completedCount === 0) {
            if (typeof window.showToast === 'function') {
                window.showToast("No completed tasks to clear.");
            }
            return;
        }

        if (!confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) return;

        tasks = tasks.filter(t => !t.completed);
        persistTasks(tasks);
        renderNotebookUI();

        if (typeof window.showToast === 'function') {
            window.showToast(`Cleared ${completedCount} completed task(s).`);
        }
    }

    // Keyboard Shortcuts: Ctrl+Enter to save, Esc to close
    document.addEventListener('keydown', function (e) {
        const modal = document.getElementById('misNotebookModal');
        if (!modal || !modal.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeMISNotebookModal();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            saveNotebookTask();
        }
    });

    // Expose functions globally
    window.openMISNotebookModal = openMISNotebookModal;
    window.closeMISNotebookModal = closeMISNotebookModal;
    window.saveNotebookTask = saveNotebookTask;
    window.clearNotebookForm = clearNotebookForm;
    window.toggleNotebookTaskComplete = toggleNotebookTaskComplete;
    window.toggleNotebookTaskPin = toggleNotebookTaskPin;
    window.editNotebookTask = editNotebookTask;
    window.deleteNotebookTask = deleteNotebookTask;
    window.copyNotebookTask = copyNotebookTask;
    window.filterNotebookTasks = filterNotebookTasks;
    window.searchNotebookTasks = searchNotebookTasks;
    window.exportNotebookCSV = exportNotebookCSV;
    window.printNotebookView = printNotebookView;
    window.clearCompletedNotebookTasks = clearCompletedNotebookTasks;
    window.updateNotebookCardIndicator = updateNotebookCardIndicator;

    // Cross-tab sync and auto-initialization
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            updateNotebookCardIndicator();
            renderNotebookUI();
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        updateNotebookCardIndicator();
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        updateNotebookCardIndicator();
    }

    console.log('✓ ERP Executive Notebook Engine initialized successfully.');
})();
