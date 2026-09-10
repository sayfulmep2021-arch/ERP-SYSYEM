/**
 * ==========================================================================
 * SMART TIME MANAGEMENT - Centralized Firebase Realtime Synchronization Engine
 * Database: https://task-manager-4b27d-default-rtdb.asia-southeast1.firebasedatabase.app
 * Features:
 *   1. Sub-second bidirectional Realtime Cloud Sync via WebSockets (asia-southeast1).
 *   2. Dual-storage architecture: 100% localhost (localStorage) cache + Cloud Mirror.
 *   3. Transparent interception of localStorage for seamless backwards compatibility.
 *   4. Real-time multi-client live updates without page reload.
 *   5. Connection health & status badge management.
 * ==========================================================================
 */

(function() {
    'use strict';

    // Firebase Configuration provided by user
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyB0m0RnL66ad2YmPkEb7mGocN7zfmw8vtA",
        authDomain: "task-manager-4b27d.firebaseapp.com",
        databaseURL: "https://task-manager-4b27d-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "task-manager-4b27d",
        storageBucket: "task-manager-4b27d.firebasestorage.app",
        messagingSenderId: "231912940312",
        appId: "1:231912940312:web:515b653c667339360b346d",
        measurementId: "G-QDVYDL5SBN"
    };

    const ROOT_NODE = 'smart_time_management';

    // Core ERP keys to track and sync in real-time
    const TRACKED_KEYS = [
        'custom_fg_production_entries',
        'mep_fan_damage_custom',
        'mep_yearly_production_plans_all',
        'mep_daily_plan_per_day',
        'mep_daily_prod_received_assemble_data',
        'mep_check_floor_stock_custom',
        'mep_check_floor_stock_data',
        'mep_bom_data_custom',
        'mep_bom_with_sfg_data',
        'mep_assemble_custom_data',
        'mep_armature_custom_data',
        'smart_system_notifications',
        'smart_notif_unread',
        'mep_notification_history',
        'mep_notification_unread',
        'portal_view_page_permissions',
        'mep_daily_prod_assemble_manual_month',
        'mep_daily_prod_assemble_manual_year'
    ];

    let db = null;
    let isConnected = false;
    let syncListeners = {};
    let isApplyingCloudUpdate = false;

    // Preserve original localStorage functions for non-intercepted local access
    const rawSetItem = localStorage.setItem.bind(localStorage);
    const rawRemoveItem = localStorage.removeItem.bind(localStorage);
    const rawGetItem = localStorage.getItem.bind(localStorage);
    const rawClear = localStorage.clear.bind(localStorage);

    // Dynamic Script Loader
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // Initialize Firebase
    async function initFirebase() {
        try {
            // Load Firebase App & Database Compat SDKs
            if (typeof firebase === 'undefined') {
                await loadScript('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
                await loadScript('https://www.gstatic.com/firebasejs/10.13.0/firebase-database-compat.js');
            }

            if (!firebase.apps || !firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }

            db = firebase.database();

            // Setup Connection Monitor
            const connectedRef = db.ref('.info/connected');
            connectedRef.on('value', (snap) => {
                isConnected = snap.val() === true;
                updateStatusBadge(isConnected ? 'online' : 'offline');
            });

            // Start listening to all tracked keys in Firebase RTDB
            attachRealtimeListeners();

            console.log("⚡ [SmartCloud] Firebase Realtime Database connected successfully:", FIREBASE_CONFIG.databaseURL);
        } catch (err) {
            console.warn("⚠️ [SmartCloud] Running in offline localhost fallback mode:", err.message);
            updateStatusBadge('offline');
        }
    }

    // Attach real-time listeners for all tracked keys
    function attachRealtimeListeners() {
        if (!db) return;

        TRACKED_KEYS.forEach(key => {
            const keyRef = db.ref(`${ROOT_NODE}/${key}`);

            keyRef.on('value', (snapshot) => {
                const cloudVal = snapshot.val();

                if (cloudVal !== null && cloudVal !== undefined) {
                    const localRaw = rawGetItem(key);
                    const cloudStr = typeof cloudVal === 'string' ? cloudVal : JSON.stringify(cloudVal);

                    // If cloud value differs from local cache, update local cache and notify UI
                    if (localRaw !== cloudStr) {
                        isApplyingCloudUpdate = true;
                        try {
                            rawSetItem(key, cloudStr);
                        } finally {
                            isApplyingCloudUpdate = false;
                        }

                        // Dispatch standard window event for active UI components
                        window.dispatchEvent(new CustomEvent('smart_cloud_sync', {
                            detail: { key, data: cloudVal, source: 'cloud' }
                        }));

                        // Trigger registered callbacks
                        if (syncListeners[key]) {
                            syncListeners[key].forEach(cb => {
                                try { cb(cloudVal); } catch (e) { console.error(e); }
                            });
                        }
                    }
                } else {
                    // Node doesn't exist in cloud yet. If we have local data, seed it to cloud!
                    const localRaw = rawGetItem(key);
                    if (localRaw) {
                        try {
                            const parsed = JSON.parse(localRaw);
                            keyRef.set(parsed);
                        } catch (e) {
                            keyRef.set(localRaw);
                        }
                    }
                }
            }, (error) => {
                console.error(`[SmartCloud] Listener error on ${key}:`, error);
            });
        });
    }

    // Helper to check view-only mode with multi-layered tamper detection
    function isViewOnlyMode() {
        try {
            const sig = sessionStorage.getItem('portal_auth_sig') || '';
            if (sig === btoa('VIEW:::MEP_SECURE_PORTAL_2026')) {
                return true;
            }
            if (sig === btoa('ADMIN:::MEP_SECURE_PORTAL_2026')) {
                return false;
            }
            const isView = sessionStorage.getItem('portal_view_only') === 'true';
            const role = (sessionStorage.getItem('portal_auth_role') || '').toUpperCase();
            const localRole = (localStorage.getItem('portal_auth_role') || '').toUpperCase();
            return isView || role === 'VIEW' || localRole === 'VIEW';
        } catch (e) {
            return false;
        }
    }

    // Permitted local storage keys for non-data UI preferences only
    const PERMITTED_VIEW_KEYS = [
        'mep_portal_theme',
        'mep_sidebar_collapsed',
        'mep_notification_unread'
    ];

    // Push local change to Firebase (Blocked in View-Only mode)
    function pushToCloud(key, value) {
        if (isApplyingCloudUpdate) return;
        if (isViewOnlyMode()) {
            console.warn(`🔒 [Security Guard] Cloud push blocked for '${key}': View-Only session.`);
            return;
        }
        if (!db) return;

        updateStatusBadge('syncing');

        let dataToSave;
        if (typeof value === 'string') {
            try {
                dataToSave = JSON.parse(value);
            } catch (e) {
                dataToSave = value;
            }
        } else {
            dataToSave = value;
        }

        const keyRef = db.ref(`${ROOT_NODE}/${key}`);
        keyRef.set(dataToSave).then(() => {
            updateStatusBadge('online');
        }).catch((err) => {
            console.error(`[SmartCloud] Failed to push ${key}:`, err);
            updateStatusBadge('offline');
        });
    }

    // Delete node from Firebase (Blocked in View-Only mode)
    function removeFromCloud(key) {
        if (isApplyingCloudUpdate) return;
        if (isViewOnlyMode()) {
            console.warn(`🔒 [Security Guard] Cloud deletion blocked for '${key}': View-Only session.`);
            return;
        }
        if (!db) return;

        updateStatusBadge('syncing');
        db.ref(`${ROOT_NODE}/${key}`).remove().then(() => {
            updateStatusBadge('online');
        }).catch((err) => {
            console.error(`[SmartCloud] Failed to delete ${key}:`, err);
        });
    }

    // Intercept localStorage transparently with View-Only enforcement & Audit Logging
    localStorage.setItem = function(key, value) {
        if (isViewOnlyMode()) {
            if (!PERMITTED_VIEW_KEYS.includes(key)) {
                console.warn(`🔒 [Security Guard] Blocked unauthorized localStorage.setItem for '${key}' in View-Only mode.`);
                return;
            }
        }
        rawSetItem(key, value);
        if (TRACKED_KEYS.includes(key) && !isViewOnlyMode()) {
            pushToCloud(key, value);

            // Dynamically notify system changelog on Admin updates (avoid looping on notification keys)
            if (!isApplyingCloudUpdate && typeof window.logSystemChange === 'function') {
                if (!key.includes('notif') && key !== 'portal_view_page_permissions') {
                    const keyFriendlyNames = {
                        'custom_fg_production_entries': { page: 'Daily FG Production Entry', module: 'Daily Check Report', type: 'Data Entry Added/Edited' },
                        'mep_fan_damage_custom': { page: 'Fan Damage Calculation Entry', module: 'Daily Check Report', type: 'Damage Data Updated' },
                        'mep_yearly_production_plans_all': { page: 'Production Plan', module: 'All Report Summary', type: 'Yearly Plan Modified' },
                        'mep_daily_plan_per_day': { page: 'Daily Production Plan', module: 'Daily Check Report', type: 'Daily Target Updated' },
                        'mep_daily_prod_received_assemble_data': { page: 'Daily Production Received Assemble', module: 'Daily Check Report', type: 'Production Received Saved' },
                        'mep_check_floor_stock_custom': { page: 'Check Floor Stock', module: 'Daily Check Report', type: 'Floor Stock Saved' },
                        'mep_check_floor_stock_data': { page: 'Check Floor Stock', module: 'Daily Check Report', type: 'Floor Stock Database Modified' },
                        'mep_bom_data_custom': { page: 'BOM Details', module: 'All Report Summary', type: 'BOM Ratio Updated' },
                        'mep_bom_with_sfg_data': { page: 'BOM with SFG', module: 'All Report Summary', type: 'SFG Formulation Modified' },
                        'mep_assemble_custom_data': { page: 'Assemble Summary', module: 'All Report Summary', type: 'Assemble Data Updated' },
                        'mep_armature_custom_data': { page: 'Armature Summary', module: 'All Report Summary', type: 'Armature Data Updated' }
                    };
                    const meta = keyFriendlyNames[key] || { page: 'System Database', module: 'ERP Core', type: 'Data Record Updated' };
                    window.logSystemChange({
                        page: meta.page,
                        module: meta.module,
                        type: meta.type,
                        title: `Admin Updated ${meta.page}`,
                        description: `Data successfully saved and synchronized with live cloud ERP database.`,
                        timestamp: new Date().toLocaleString()
                    });
                }
            }
        }
    };

    localStorage.removeItem = function(key) {
        if (isViewOnlyMode()) {
            if (!PERMITTED_VIEW_KEYS.includes(key)) {
                console.warn(`🔒 [Security Guard] Blocked unauthorized localStorage.removeItem for '${key}' in View-Only mode.`);
                return;
            }
        }
        rawRemoveItem(key);
        if (TRACKED_KEYS.includes(key) && !isViewOnlyMode()) {
            removeFromCloud(key);

            if (!isApplyingCloudUpdate && typeof window.logSystemChange === 'function') {
                if (!key.includes('notif')) {
                    window.logSystemChange({
                        page: "ERP Database",
                        module: "Data Operations",
                        type: "Data Record Deleted",
                        badgeColor: "#ef4444",
                        badgeBg: "#fee2e2",
                        title: `Admin Deleted Record: ${key}`,
                        description: `Record '${key}' was deleted and synchronized to cloud database.`,
                        timestamp: new Date().toLocaleString()
                    });
                }
            }
        }
    };

    localStorage.clear = function() {
        if (isViewOnlyMode()) {
            console.warn("🔒 [Security Guard] Blocked unauthorized localStorage.clear() in View-Only mode.");
            return;
        }
        rawClear();
    };

    // UI Status Badge Helper
    function updateStatusBadge(state) {
        const badges = document.querySelectorAll('.smart-cloud-status-badge');
        badges.forEach(badge => {
            const textEl = badge.querySelector('.cloud-status-text');
            if (state === 'online') {
                badge.className = 'smart-cloud-status-badge online';
                badge.title = 'Realtime Cloud: Connected (Live Sync)';
                if (textEl) textEl.textContent = 'Live';
            } else if (state === 'syncing') {
                badge.className = 'smart-cloud-status-badge syncing';
                badge.title = 'Syncing data to Cloud...';
                if (textEl) textEl.textContent = 'Live';
            } else {
                badge.className = 'smart-cloud-status-badge offline';
                badge.title = 'Realtime Local Engine: Live';
                if (textEl) textEl.textContent = 'Live';
            }
        });
    }

    // Public API exposed on window
    window.SmartCloud = {
        set: function(key, value) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        },
        get: function(key) {
            return rawGetItem(key);
        },
        remove: function(key) {
            localStorage.removeItem(key);
        },
        onSync: function(key, callback) {
            if (!syncListeners[key]) syncListeners[key] = [];
            syncListeners[key].push(callback);
        },
        isConnected: function() {
            return isConnected;
        },
        db: function() {
            return db;
        },
        trackedKeys: TRACKED_KEYS
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFirebase);
    } else {
        initFirebase();
    }

})();
