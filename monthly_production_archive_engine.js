/**
 * ============================================================================
 * MEP FAN LTD. - Central Monthly Production Archive & Linking Engine
 * ============================================================================
 * 
 * Architecture:
 * - 🟢 Live Dynamic Layer: Open months dynamically aggregate PRODUCTION RECEIVE
 *   from assemble_summary.html / MEP_ERP_ENGINE in real time.
 * - 🔵 Historical Archive Layer (Immutable Monthly Snapshots): Closed months are
 *   permanently frozen and locked in localStorage['mep_monthly_production_snapshots'].
 *   Future source edits will never alter closed historical months.
 * - Triple-Key Linking: [Item Code] + [Month] + [Year].
 * - Multi-Entry Summation: Sums all valid matching records without omission or duplicates.
 * - Zero Handling: Non-produced items display 0 with full row integrity.
 */

const MONTHLY_ARCHIVE_ENGINE = (function() {
    'use strict';

    const STORAGE_KEY_SNAPSHOTS = 'mep_monthly_production_snapshots';
    const STORAGE_KEY_SETTINGS = 'mep_monthly_production_settings';
    
    const FISCAL_MONTHS = [
        "July", "August", "September", "October", "November", "December",
        "January", "February", "March", "April", "May", "June"
    ];

    const CALENDAR_MONTHS = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    /**
     * Code Normalization & Matching Logic
     */
    function cleanCode(codeStr) {
        return (codeStr || '')
            .toString()
            .trim()
            .toUpperCase()
            .replace(/[\s\-_]/g, '');
    }

    function extractCodeVariants(codeStr) {
        const raw = (codeStr || '').toString().trim().toUpperCase();
        const variants = new Set();
        if (!raw) return [];

        const normalized = cleanCode(raw);
        if (normalized) variants.add(normalized);

        // Handle slash compound codes, e.g. "CF5601/CF5601IV" -> ["CF5601", "CF5601IV", "CF5601/CF5601IV"]
        if (raw.includes('/')) {
            raw.split('/').forEach(part => {
                const sub = cleanCode(part);
                if (sub) variants.add(sub);
            });
        }
        return Array.from(variants);
    }

    function codesMatch(codeA, codeB) {
        if (!codeA || !codeB) return false;
        const listA = extractCodeVariants(codeA);
        const listB = extractCodeVariants(codeB);
        for (const a of listA) {
            for (const b of listB) {
                if (a === b) return true;
            }
        }
        return false;
    }

    /**
     * Format timestamp to readable string: "31-Aug-2026 11:59 PM"
     */
    function formatDateTime(dateObj) {
        const d = dateObj || new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(d.getDate()).padStart(2, '0');
        const m = months[d.getMonth()];
        const y = d.getFullYear();
        let hours = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${day}-${m}-${y} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }

    /**
     * Current Logged In User Helper
     */
    function getCurrentUser() {
        try {
            const name = sessionStorage.getItem('portal_user_name') || sessionStorage.getItem('portal_user_fullname');
            const role = sessionStorage.getItem('portal_auth_role') || 'ADMIN';
            if (name) return `${name} (${role})`;
        } catch(e) {}
        return "Sayful Islam (SENIOR SUPERVISOR)";
    }

    /**
     * Snapshot Storage Accessors
     */
    function getAllSnapshots() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch(e) {
            console.error("[MonthlyArchiveEngine] Error loading snapshots:", e);
        }
        return initializeDefaultSnapshots();
    }

    function saveAllSnapshots(snapshotsMap) {
        try {
            localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshotsMap));
            // Trigger storage sync notification across tabs
            try {
                window.dispatchEvent(new CustomEvent('mep_monthly_production_snapshot_updated', { detail: { snapshots: snapshotsMap } }));
            } catch(e) {}
            return true;
        } catch(e) {
            console.error("[MonthlyArchiveEngine] Error saving snapshots:", e);
            return false;
        }
    }

    function getSnapshotKey(year, monthName) {
        return `${String(year).trim()}_${String(monthName).trim()}`;
    }

    function getSnapshot(year, monthName) {
        const snapshots = getAllSnapshots();
        const key = getSnapshotKey(year, monthName);
        return snapshots[key] || null;
    }

    function isMonthClosed(year, monthName) {
        const snap = getSnapshot(year, monthName);
        return Boolean(snap && snap.status === 'CLOSED');
    }

    /**
     * Factory Baseline Seeding
     * Seeds historical verified data from DEFAULT_YEARLY_ERP_DATA
     * - 2025: All 12 months CLOSED
     * - 2026: July and August CLOSED, September onwards OPEN / LIVE
     */
    function initializeDefaultSnapshots() {
        console.log("[MonthlyArchiveEngine] Initializing default factory baseline snapshots...");
        const snapshots = {};

        // Fallback or read DEFAULT_YEARLY_ERP_DATA
        let erpData = null;
        if (typeof DEFAULT_YEARLY_ERP_DATA !== 'undefined') {
            erpData = DEFAULT_YEARLY_ERP_DATA;
        } else {
            try {
                const saved = localStorage.getItem('mep_yearly_erp_production_data');
                if (saved) erpData = JSON.parse(saved);
            } catch(e) {}
        }

        if (!erpData) erpData = { "2026": [], "2025": [] };

        // Helper to populate items from DEFAULT_YEARLY_ERP_DATA for a specific month index
        function buildSnapshotItemsFromDefaults(yearStr, monthIndex, monthName) {
            const itemsMap = {};
            const categories = erpData[yearStr] || [];
            let totalQty = 0;
            let activeCount = 0;

            categories.forEach(cat => {
                (cat.items || []).forEach(item => {
                    const val = (item.months && item.months[monthIndex] !== undefined) ? Number(item.months[monthIndex]) || 0 : 0;
                    totalQty += val;
                    if (val > 0) activeCount++;

                    itemsMap[item.code] = {
                        code: item.code,
                        name: item.name,
                        unit: item.unit || "Pcs",
                        category: cat.category,
                        qty: val,
                        sourceCount: val > 0 ? 1 : 0,
                        records: val > 0 ? [
                            {
                                id: `seed_${yearStr}_${monthName}_${item.code}`,
                                code: item.code,
                                name: item.name,
                                erpCode: item.erpCode || "",
                                qty: val,
                                sourceFile: "assemble_summary.html",
                                sourceCol: "PRODUCTION RECEIVE",
                                dateInterval: `${yearStr}-${monthName} Historical Audit`
                            }
                        ] : []
                    };
                });
            });

            return { itemsMap, totalQty, activeCount };
        }

        // 1. Seed 2025: All 12 Fiscal Months (July 2024 to June 2025) as CLOSED
        if (erpData["2025"] && erpData["2025"].length > 0) {
            FISCAL_MONTHS.forEach((mName, mIdx) => {
                const { itemsMap, totalQty, activeCount } = buildSnapshotItemsFromDefaults("2025", mIdx, mName);
                const snapKey = `2025_${mName}`;
                snapshots[snapKey] = {
                    snapshotId: `SNAP_2025_${mName}`,
                    year: "2025",
                    month: mName,
                    fiscalMonthIndex: mIdx,
                    status: "CLOSED",
                    closedAt: "2025-06-30T23:59:59.000Z",
                    closedDateStr: `30-Jun-2025 11:59 PM`,
                    closedBy: "MEP ERP AUDIT SYSTEM",
                    version: "1.0",
                    sourceRef: "assemble_summary.html ➔ PRODUCTION RECEIVE",
                    totalQty,
                    activeItemsCount: activeCount,
                    notes: `Audited 2024-2025 Fiscal Archive for ${mName} 2025`,
                    items: itemsMap
                };
            });
        }

        // 2. Seed 2026: July and August as CLOSED snapshots
        // July 2026 (mIdx = 0)
        {
            const { itemsMap, totalQty, activeCount } = buildSnapshotItemsFromDefaults("2026", 0, "July");
            snapshots["2026_July"] = {
                snapshotId: "SNAP_2026_July",
                year: "2026",
                month: "July",
                fiscalMonthIndex: 0,
                status: "CLOSED",
                closedAt: "2026-07-31T23:59:59.000Z",
                closedDateStr: "31-Jul-2026 11:59 PM",
                closedBy: "Sayful Islam (SENIOR SUPERVISOR)",
                version: "1.0",
                sourceRef: "assemble_summary.html ➔ PRODUCTION RECEIVE",
                totalQty: totalQty || 23527,
                activeItemsCount: activeCount || 7,
                notes: "Official Monthly Closing Snapshot for July 2026",
                items: itemsMap
            };
        }

        // August 2026 (mIdx = 1)
        {
            const { itemsMap, totalQty, activeCount } = buildSnapshotItemsFromDefaults("2026", 1, "August");
            snapshots["2026_August"] = {
                snapshotId: "SNAP_2026_August",
                year: "2026",
                month: "August",
                fiscalMonthIndex: 1,
                status: "CLOSED",
                closedAt: "2026-08-31T23:59:59.000Z",
                closedDateStr: "31-Aug-2026 11:59 PM",
                closedBy: "Sayful Islam (SENIOR SUPERVISOR)",
                version: "1.0",
                sourceRef: "assemble_summary.html ➔ PRODUCTION RECEIVE",
                totalQty: totalQty || 82820,
                activeItemsCount: activeCount || 16,
                notes: "Official Monthly Closing Snapshot for August 2026",
                items: itemsMap
            };
        }

        // Save initialized baseline
        try {
            localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshots));
        } catch(e) {}

        return snapshots;
    }

    /**
     * Get Live Source Records from assemble_summary dataset
     * Evaluates MEP_ERP_ENGINE, RAW_ASSEMBLE_SUMMARY_DATA, and RAW_FAN_ASSEMBLE_ERP_DATA
     */
    function getLiveSourceRecords() {
        let records = [];

        // 1. Try MEP_ERP_ENGINE.computeLiveAssembleSummary()
        if (typeof MEP_ERP_ENGINE !== 'undefined' && typeof MEP_ERP_ENGINE.computeLiveAssembleSummary === 'function') {
            try {
                const computed = MEP_ERP_ENGINE.computeLiveAssembleSummary();
                if (Array.isArray(computed) && computed.length > 0) {
                    records = computed;
                }
            } catch(e) {
                console.warn("[MonthlyArchiveEngine] computeLiveAssembleSummary error:", e);
            }
        }

        // 2. Fallback to localStorage['mep_assemble_custom_data']
        if (records.length === 0) {
            try {
                const saved = localStorage.getItem('mep_assemble_custom_data');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) records = parsed;
                }
            } catch(e) {}
        }

        // 3. Fallback to window.RAW_ASSEMBLE_SUMMARY_DATA
        if (records.length === 0 && typeof RAW_ASSEMBLE_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_ASSEMBLE_SUMMARY_DATA)) {
            records = RAW_ASSEMBLE_SUMMARY_DATA;
        }

        // 4. Map into standardized source record format
        const dateInterval = localStorage.getItem('mep_erp_date_interval') || "2026-08-01 to 2026-08-25";

        const standardized = records.map((r, idx) => {
            const rawPr = (r.productionRec !== undefined && r.productionRec !== null)
                ? r.productionRec
                : ((r.productionReceive !== undefined && r.productionReceive !== null) ? r.productionReceive : 0);
            const qty = parseFloat(rawPr) || 0;

            return {
                id: r.id || `live_${idx}`,
                code: r.code || r.itemCode || '',
                erpCode: r.erpCode || '',
                name: r.name || r.itemName || '',
                category: r.category || '',
                unit: r.unit || 'Pcs',
                qty: qty,
                sourceFile: 'assemble_summary.html',
                sourceCol: 'PRODUCTION RECEIVE',
                dateInterval: dateInterval,
                rawItem: r
            };
        });

        // Also check if RAW_FAN_ASSEMBLE_ERP_DATA has items with productionReceive that aren't in assemble summary
        if (typeof RAW_FAN_ASSEMBLE_ERP_DATA !== 'undefined' && Array.isArray(RAW_FAN_ASSEMBLE_ERP_DATA)) {
            const seenCodes = new Set(standardized.map(s => cleanCode(s.code)));
            RAW_FAN_ASSEMBLE_ERP_DATA.forEach((erpRow, idx) => {
                const code = erpRow.code || '';
                const clean = cleanCode(code);
                const pr = parseFloat(erpRow.productionReceive) || 0;
                if (pr > 0 && clean && !seenCodes.has(clean)) {
                    standardized.push({
                        id: erpRow.id || `erp_${idx}`,
                        code: code,
                        erpCode: erpRow.erpCode || '',
                        name: erpRow.name || '',
                        category: erpRow.category || 'Finished Goods',
                        unit: erpRow.unit || 'Pcs',
                        qty: pr,
                        sourceFile: 'fan_assemble_erp.html',
                        sourceCol: 'PRODUCTION RECEIVE (ERP Movement)',
                        dateInterval: dateInterval,
                        rawItem: erpRow
                    });
                    seenCodes.add(clean);
                }
            });
        }

        return standardized;
    }

    /**
     * Active Live Month Configuration
     * The month currently open for live ERP movements (default: September)
     */
    function getActiveLiveMonth() {
        try {
            const custom = localStorage.getItem('mep_active_live_month');
            if (custom) return custom;
        } catch(e) {}
        return "September";
    }

    function setActiveLiveMonth(monthName) {
        if (!monthName) return;
        localStorage.setItem('mep_active_live_month', monthName);
        try {
            window.dispatchEvent(new CustomEvent('mep_monthly_production_snapshot_updated'));
        } catch(e) {}
    }

    /**
     * Resolve Monthly Item Production
     * Core function resolving a single matrix cell: (year, monthName, itemCode)
     * 
     * Output structure:
     * {
     *   year, month, itemCode, qty, isClosed, status,
     *   snapshotMeta, sourceRecords, formula
     * }
     */
    function resolveMonthlyItemProduction(year, monthName, itemCode, defaultFallbackVal) {
        const yrStr = String(year).trim();
        const mName = String(monthName).trim();
        const cleanTargetCode = cleanCode(itemCode);

        // 1. LAYER A: Check if Month is CLOSED in Historical Archive
        const snap = getSnapshot(yrStr, mName);
        if (snap && snap.status === 'CLOSED') {
            // Locate item inside snapshot items map
            let matchedSnapItem = null;
            if (snap.items) {
                // Direct key match
                if (snap.items[itemCode]) {
                    matchedSnapItem = snap.items[itemCode];
                } else {
                    // Compound or clean code match
                    const keys = Object.keys(snap.items);
                    for (const k of keys) {
                        if (codesMatch(k, itemCode)) {
                            matchedSnapItem = snap.items[k];
                            break;
                        }
                    }
                }
            }

            const snapQty = matchedSnapItem ? Number(matchedSnapItem.qty) || 0 : (Number(defaultFallbackVal) || 0);
            const snapRecords = matchedSnapItem && Array.isArray(matchedSnapItem.records) && matchedSnapItem.records.length > 0
                ? matchedSnapItem.records
                : (snapQty > 0 ? [{
                    id: `${snap.snapshotId}_${itemCode}`,
                    code: itemCode,
                    name: matchedSnapItem ? matchedSnapItem.name : '',
                    qty: snapQty,
                    sourceFile: snap.sourceRef || 'assemble_summary.html',
                    sourceCol: 'PRODUCTION RECEIVE',
                    dateInterval: snap.closedDateStr || 'Historical Closed Snapshot'
                }] : []);

            return {
                year: yrStr,
                month: mName,
                itemCode,
                qty: snapQty,
                isClosed: true,
                status: 'CLOSED',
                snapshotMeta: {
                    snapshotId: snap.snapshotId,
                    closedAt: snap.closedAt,
                    closedDateStr: snap.closedDateStr,
                    closedBy: snap.closedBy || 'ADMIN',
                    version: snap.version || '1.0',
                    sourceRef: snap.sourceRef || 'assemble_summary.html ➔ PRODUCTION RECEIVE',
                    notes: snap.notes || 'Audited Monthly Snapshot'
                },
                sourceRecords: snapRecords,
                formula: `🔒 Immutable Historical Snapshot (${snap.snapshotId}) locked on ${snap.closedDateStr || snap.closedAt} by ${snap.closedBy || 'ADMIN'}`
            };
        }

        // 2. LAYER B: Month is OPEN / LIVE Dynamic Layer
        const activeLiveMonth = getActiveLiveMonth();
        const isActiveLiveMonth = (mName.toLowerCase() === activeLiveMonth.toLowerCase());

        // Only the active live month dynamically aggregates current movements from assemble_summary.html
        if (isActiveLiveMonth) {
            const liveRecords = getLiveSourceRecords();
            const matchedRecords = [];
            let totalLiveQty = 0;

            liveRecords.forEach(rec => {
                if (codesMatch(itemCode, rec.code) || (rec.erpCode && codesMatch(itemCode, rec.erpCode))) {
                    if (rec.qty > 0) {
                        matchedRecords.push(rec);
                        totalLiveQty += rec.qty;
                    }
                }
            });

            if (matchedRecords.length > 0) {
                return {
                    year: yrStr,
                    month: mName,
                    itemCode,
                    qty: totalLiveQty,
                    isClosed: false,
                    status: 'LIVE',
                    snapshotMeta: null,
                    sourceRecords: matchedRecords,
                    formula: `🟢 Live Dynamic SUM: ${matchedRecords.map(r => `${r.qty} [${r.code}]`).join(' + ')} from assemble_summary.html (PRODUCTION RECEIVE)`
                };
            }
        }

        // For future unclosed months or unclosed months with no production: return 0
        return {
            year: yrStr,
            month: mName,
            itemCode,
            qty: 0,
            isClosed: false,
            status: 'LIVE',
            snapshotMeta: null,
            sourceRecords: [],
            formula: `0 Units (${mName} ${yrStr} - Open month, awaiting production)`
        };
    }

    /**
     * Close a Month & Generate Immutable Snapshot
     * Captures every item currently in catalog with current resolved quantities
     */
    function closeMonth(year, monthName, user, notes, catalogCategories) {
        const yrStr = String(year).trim();
        const mName = String(monthName).trim();
        const snapKey = getSnapshotKey(yrStr, mName);
        const currentUser = user || getCurrentUser();
        const timestamp = new Date();

        // Ensure catalog items are available
        let categories = catalogCategories;
        if (!categories || !Array.isArray(categories)) {
            if (typeof RAW_ERP_DATA !== 'undefined' && RAW_ERP_DATA[yrStr]) {
                categories = RAW_ERP_DATA[yrStr];
            } else if (typeof DEFAULT_YEARLY_ERP_DATA !== 'undefined' && DEFAULT_YEARLY_ERP_DATA[yrStr]) {
                categories = DEFAULT_YEARLY_ERP_DATA[yrStr];
            } else if (typeof DEFAULT_YEARLY_ERP_DATA !== 'undefined' && DEFAULT_YEARLY_ERP_DATA["2026"]) {
                categories = DEFAULT_YEARLY_ERP_DATA["2026"];
            } else {
                categories = [];
            }
        }

        const itemsMap = {};
        let grandTotal = 0;
        let activeCount = 0;

        categories.forEach(cat => {
            (cat.items || []).forEach(item => {
                // Find month index if available in item.months
                let fallbackVal = 0;
                const mIdx = FISCAL_MONTHS.indexOf(mName);
                if (mIdx !== -1 && item.months && item.months[mIdx] !== undefined) {
                    fallbackVal = item.months[mIdx];
                }

                // Resolve current live value
                const resolved = resolveMonthlyItemProduction(yrStr, mName, item.code, fallbackVal);
                const q = resolved.qty || 0;
                grandTotal += q;
                if (q > 0) activeCount++;

                itemsMap[item.code] = {
                    code: item.code,
                    name: item.name,
                    category: cat.category,
                    unit: item.unit || "Pcs",
                    qty: q,
                    sourceCount: resolved.sourceRecords.length,
                    records: resolved.sourceRecords
                };
            });
        });

        const snapshot = {
            snapshotId: `SNAP_${yrStr}_${mName}`,
            year: yrStr,
            month: mName,
            status: "CLOSED",
            closedAt: timestamp.toISOString(),
            closedDateStr: formatDateTime(timestamp),
            closedBy: currentUser,
            version: "1.0",
            sourceRef: "assemble_summary.html ➔ PRODUCTION RECEIVE",
            totalQty: grandTotal,
            activeItemsCount: activeCount,
            notes: notes || `Monthly production closed on ${formatDateTime(timestamp)}`,
            items: itemsMap
        };

        const snapshots = getAllSnapshots();
        snapshots[snapKey] = snapshot;
        saveAllSnapshots(snapshots);

        console.log(`[MonthlyArchiveEngine] Month ${mName} ${yrStr} CLOSED successfully. Snapshot ID: ${snapshot.snapshotId}, Total Qty: ${grandTotal}`);
        return { success: true, snapshot };
    }

    /**
     * Reopen a Closed Month back to Live Dynamic Layer (Admin Override)
     */
    function reopenMonth(year, monthName, user, reason) {
        const yrStr = String(year).trim();
        const mName = String(monthName).trim();
        const snapKey = getSnapshotKey(yrStr, mName);
        const snapshots = getAllSnapshots();

        if (!snapshots[snapKey]) {
            return { success: false, message: "No snapshot found for this period." };
        }

        // Delete or mark status as OPEN
        delete snapshots[snapKey];
        saveAllSnapshots(snapshots);

        console.log(`[MonthlyArchiveEngine] Month ${mName} ${yrStr} REOPENED to Live Mode by ${user || getCurrentUser()}`);
        return { success: true, message: `Month ${mName} ${yrStr} reopened to Live Dynamic mode.` };
    }

    /**
     * Export Snapshots to JSON file
     */
    function exportSnapshotsJSON() {
        const snapshots = getAllSnapshots();
        const payload = {
            exportDate: new Date().toISOString(),
            exportedBy: getCurrentUser(),
            formatVersion: "1.0",
            totalSnapshots: Object.keys(snapshots).length,
            snapshots: snapshots
        };
        return JSON.stringify(payload, null, 2);
    }

    /**
     * Restore Snapshots from JSON file
     */
    function restoreSnapshotsJSON(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            if (!data) throw new Error("Invalid JSON data");
            const snapshots = data.snapshots || data;
            if (typeof snapshots !== 'object') throw new Error("Invalid snapshots structure");

            saveAllSnapshots(snapshots);
            return { success: true, count: Object.keys(snapshots).length };
        } catch(e) {
            return { success: false, message: e.message };
        }
    }

    /**
     * Reset to Default Factory Baseline Snapshots
     */
    function resetToFactoryBaseline() {
        localStorage.removeItem(STORAGE_KEY_SNAPSHOTS);
        const baseline = initializeDefaultSnapshots();
        return baseline;
    }

    // Public API
    return {
        FISCAL_MONTHS,
        CALENDAR_MONTHS,
        cleanCode,
        codesMatch,
        getAllSnapshots,
        getSnapshot,
        isMonthClosed,
        getLiveSourceRecords,
        resolveMonthlyItemProduction,
        closeMonth,
        reopenMonth,
        exportSnapshotsJSON,
        restoreSnapshotsJSON,
        resetToFactoryBaseline,
        getActiveLiveMonth,
        setActiveLiveMonth,
        getCurrentUser,
        formatDateTime
    };

})();

if (typeof window !== 'undefined') {
    window.MONTHLY_ARCHIVE_ENGINE = MONTHLY_ARCHIVE_ENGINE;
}
