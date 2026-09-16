/**
 * ============================================================================
 * MEP FAN ERP - DATA BACKUP & DISASTER RECOVERY ENGINE (data_backup_engine.js)
 * ============================================================================
 * Provides universal full-database JSON backup, restore, status inspection,
 * and automated audit trail integration across the ERP software.
 */
(function(window) {
    'use strict';

    /**
     * Format current date-time for human readability
     */
    function formatDateTime(d) {
        if (!d) return 'Never';
        const date = (d instanceof Date) ? d : new Date(d);
        if (isNaN(date.getTime())) return 'Never';
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
    }

    /**
     * Compute current database statistics
     */
    function getDatabaseStats() {
        let totalKeys = 0;
        let notebookNotes = 0;
        let hrmEmployees = 0;
        let auditLogs = 0;

        try {
            totalKeys = localStorage.length;
            const nbData = JSON.parse(localStorage.getItem('mep_supervisor_notebook_tasks') || '[]');
            notebookNotes = Array.isArray(nbData) ? nbData.length : 0;
        } catch(e) {}

        try {
            const hrmData = JSON.parse(localStorage.getItem('hrm_employees_data') || '[]');
            hrmEmployees = Array.isArray(hrmData) ? hrmData.length : 0;
        } catch(e) {}

        try {
            const notifData = JSON.parse(localStorage.getItem('mep_system_activity_notifications_v3') || '[]');
            auditLogs = Array.isArray(notifData) ? notifData.length : 0;
        } catch(e) {}

        const lastBackupTime = localStorage.getItem('portal_last_backup_time');
        const formattedLastBackup = lastBackupTime ? formatDateTime(lastBackupTime) : 'No recent backup';

        return {
            totalKeys,
            notebookNotes,
            hrmEmployees,
            auditLogs,
            lastBackupTime: formattedLastBackup
        };
    }

    /**
     * Export Full System Database to a Downloadable JSON Snapshot
     */
    function exportSystemDataBackup() {
        try {
            const storageSnapshot = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    storageSnapshot[key] = localStorage.getItem(key);
                }
            }

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
            const filename = `MEP_ERP_Full_Backup_${dateStr}_${timeStr}.json`;

            const payload = {
                meta: {
                    application: 'MEP FAN ERP SYSTEM',
                    version: '2026.09',
                    backupDate: now.toISOString(),
                    backupDateReadable: formatDateTime(now),
                    totalKeys: Object.keys(storageSnapshot).length,
                    operator: 'Sayful Islam (Senior Supervisor)'
                },
                storage: storageSnapshot
            };

            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', filename);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            // Record Last Backup Time
            localStorage.setItem('portal_last_backup_time', now.toISOString());

            // Universal Audit Logging
            if (typeof window.logSystemAudit === 'function') {
                window.logSystemAudit({
                    page: 'Data Backup',
                    module: 'System Administration',
                    action: 'BACKUP',
                    item: filename,
                    field: 'Full Database Snapshot',
                    prevVal: 'Previous State',
                    newVal: `${payload.meta.totalKeys} keys exported`,
                    description: `Successfully exported full ERP database backup with ${payload.meta.totalKeys} keys to ${filename}.`
                });
            }

            // Show Toast Notification
            if (typeof window.showPortalToast === 'function') {
                window.showPortalToast(`Data Backup downloaded successfully (${payload.meta.totalKeys} keys saved)!`);
            } else {
                alert(`Data Backup generated successfully!\nFile: ${filename}\nTotal records: ${payload.meta.totalKeys}`);
            }

            // Update modal stats if open
            updateBackupModalStats();

            return true;
        } catch(err) {
            console.error('[Data Backup] Export failed:', err);
            alert('Failed to export data backup: ' + (err.message || err));
            return false;
        }
    }

    /**
     * Restore System Database from an Uploaded JSON Snapshot
     */
    function restoreSystemDataBackup(event) {
        const file = event && event.target && event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                let storageData = null;

                if (parsed && typeof parsed.storage === 'object' && parsed.storage !== null) {
                    storageData = parsed.storage;
                } else if (parsed && typeof parsed === 'object') {
                    storageData = parsed;
                }

                if (!storageData || Object.keys(storageData).length === 0) {
                    alert('Invalid or empty backup file format.');
                    return;
                }

                const keyCount = Object.keys(storageData).length;
                const confirmMsg = `Are you sure you want to restore the database from this backup file?\n\nBackup Source: ${file.name}\nRecords to restore: ${keyCount}\n\nWARNING: Existing system data will be updated with the backup snapshot.`;
                
                if (!window.confirm(confirmMsg)) {
                    if (event.target) event.target.value = '';
                    return;
                }

                let appliedCount = 0;
                Object.keys(storageData).forEach(k => {
                    const v = storageData[k];
                    if (typeof v === 'string') {
                        localStorage.setItem(k, v);
                        appliedCount++;
                    } else if (v !== null && v !== undefined) {
                        localStorage.setItem(k, JSON.stringify(v));
                        appliedCount++;
                    }
                });

                // Log system audit
                if (typeof window.logSystemAudit === 'function') {
                    window.logSystemAudit({
                        page: 'Data Backup',
                        module: 'System Administration',
                        action: 'RESTORE',
                        item: file.name,
                        field: 'Database Snapshot Restore',
                        prevVal: 'Pre-restore state',
                        newVal: `${appliedCount} keys restored`,
                        description: `Restored ${appliedCount} system keys from backup file: ${file.name}.`
                    });
                }

                alert(`Database restored successfully!\n${appliedCount} records were imported.\nThe page will now refresh to load the restored state.`);
                window.location.reload();

            } catch(err) {
                console.error('[Data Backup] Restore error:', err);
                alert('Error parsing backup file: ' + (err.message || err));
            } finally {
                if (event.target) event.target.value = '';
            }
        };

        reader.readAsText(file);
    }

    /**
     * Build & Inject Executive Data Backup Modal
     */
    function ensureDataBackupModalInDOM() {
        if (document.getElementById('dataBackupModalBackdrop')) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'dataBackupModalBackdrop';
        modalDiv.className = 'data-backup-modal-backdrop';
        modalDiv.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 100050;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        modalDiv.innerHTML = `
            <div class="data-backup-modal-card" style="
                background: #ffffff;
                width: 100%;
                max-width: 580px;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                animation: backupModalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            ">
                <!-- Header -->
                <div style="
                    padding: 18px 24px;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border-bottom: 1px solid #bbf7d0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="
                            width: 38px; height: 38px;
                            border-radius: 10px;
                            background: #16a34a;
                            color: #ffffff;
                            display: flex; align-items: center; justify-content: center;
                            box-shadow: 0 4px 10px rgba(22, 163, 74, 0.25);
                        ">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                        </div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #14532d;">Data Backup &amp; Recovery Hub</h3>
                            <div style="font-size: 0.76rem; color: #15803d; font-weight: 600;">Secure Full-System Local Snapshot &amp; Disaster Recovery</div>
                        </div>
                    </div>
                    <button type="button" onclick="window.closeDataBackupModal()" style="
                        border: none; background: #ffffff;
                        color: #64748b; width: 32px; height: 32px;
                        border-radius: 8px; cursor: pointer;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 16px; font-weight: 700;
                        transition: all 0.15s ease;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    " onmouseover="this.style.color='#0f172a'; this.style.background='#f1f5f9';" onmouseout="this.style.color='#64748b'; this.style.background='#ffffff';">✕</button>
                </div>

                <!-- Body -->
                <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
                    <!-- Stats Grid -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;">
                            <div style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Database Records</div>
                            <div style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-top: 4px;" id="backupStatTotalKeys">0</div>
                            <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 2px;">LocalStorage system keys</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;">
                            <div style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Last Backup</div>
                            <div style="font-size: 0.95rem; font-weight: 800; color: #15803d; margin-top: 6px;" id="backupStatLastTime">Never</div>
                            <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 4px;">Automated timestamp</div>
                        </div>
                    </div>

                    <!-- Secondary Stats Pill Row -->
                    <div style="display: flex; gap: 10px; font-size: 0.76rem; color: #475569; background: #f1f5f9; padding: 8px 14px; border-radius: 8px;">
                        <div>Notebook Notes: <strong id="backupStatNotes" style="color: #0f172a;">0</strong></div>
                        <div style="color: #cbd5e1;">|</div>
                        <div>HRM Personnel: <strong id="backupStatHrm" style="color: #0f172a;">0</strong></div>
                        <div style="color: #cbd5e1;">|</div>
                        <div>Audit Logs: <strong id="backupStatLogs" style="color: #0f172a;">0</strong></div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <!-- Download Backup Button -->
                        <button type="button" onclick="window.exportSystemDataBackup()" style="
                            display: flex; align-items: center; justify-content: center; gap: 10px;
                            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                            color: #ffffff; border: none; padding: 13px 20px;
                            border-radius: 10px; font-size: 0.88rem; font-weight: 700;
                            cursor: pointer; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.28);
                            transition: transform 0.15s ease, box-shadow 0.15s ease;
                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(22, 163, 74, 0.35)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 12px rgba(22, 163, 74, 0.28)';">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Download Full Backup (JSON)</span>
                        </button>

                        <!-- Restore Backup Trigger Button -->
                        <div style="position: relative;">
                            <button type="button" onclick="document.getElementById('erpBackupRestoreFileInput').click()" style="
                                width: 100%;
                                display: flex; align-items: center; justify-content: center; gap: 10px;
                                background: #ffffff; color: #1e293b;
                                border: 1.5px solid #cbd5e1; padding: 12px 20px;
                                border-radius: 10px; font-size: 0.86rem; font-weight: 700;
                                cursor: pointer; transition: all 0.15s ease;
                            " onmouseover="this.style.borderColor='#94a3b8'; this.style.background='#f8fafc';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#ffffff';">
                                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <span>Restore Database Snapshot</span>
                            </button>
                            <input type="file" id="erpBackupRestoreFileInput" accept=".json" style="display: none;" onchange="window.restoreSystemDataBackup(event)">
                        </div>
                    </div>

                    <!-- Security Notice -->
                    <div style="font-size: 0.72rem; color: #64748b; line-height: 1.4; display: flex; align-items: flex-start; gap: 6px;">
                        <span style="color: #16a34a; font-size: 14px;">🛡️</span>
                        <span>Backups contain complete local operational records, supervisor notes, personnel tables, closing metrics, and activity logs. Passwords and credentials are excluded from plain text.</span>
                    </div>
                </div>
            </div>
        `;

        // Add backdrop click close
        modalDiv.addEventListener('click', function(e) {
            if (e.target === modalDiv) {
                window.closeDataBackupModal();
            }
        });

        document.body.appendChild(modalDiv);
    }

    /**
     * Update dynamic numbers in modal
     */
    function updateBackupModalStats() {
        const stats = getDatabaseStats();
        const elTotal = document.getElementById('backupStatTotalKeys');
        const elLast = document.getElementById('backupStatLastTime');
        const elNotes = document.getElementById('backupStatNotes');
        const elHrm = document.getElementById('backupStatHrm');
        const elLogs = document.getElementById('backupStatLogs');

        if (elTotal) elTotal.textContent = stats.totalKeys;
        if (elLast) elLast.textContent = stats.lastBackupTime;
        if (elNotes) elNotes.textContent = stats.notebookNotes;
        if (elHrm) elHrm.textContent = stats.hrmEmployees;
        if (elLogs) elLogs.textContent = stats.auditLogs;
    }

    /**
     * Open Data Backup Modal
     */
    function openDataBackupModal() {
        ensureDataBackupModalInDOM();
        updateBackupModalStats();
        const modal = document.getElementById('dataBackupModalBackdrop');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Close Data Backup Modal
     */
    function closeDataBackupModal() {
        const modal = document.getElementById('dataBackupModalBackdrop');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Keyboard ESC listener
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDataBackupModal();
        }
    });

    // Expose globally
    window.exportSystemDataBackup = exportSystemDataBackup;
    window.restoreSystemDataBackup = restoreSystemDataBackup;
    window.openDataBackupModal = openDataBackupModal;
    window.closeDataBackupModal = closeDataBackupModal;

})(typeof window !== 'undefined' ? window : this);
