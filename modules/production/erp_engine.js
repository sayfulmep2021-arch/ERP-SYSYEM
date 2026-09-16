/**
 * ============================================================================
 * MEP FAN LTD. - Central ERP Linked Data Engine (Excel-like Workbook Engine)
 * ============================================================================
 * 
 * Architecture Principle:
 * "One Central Source Entry -> Live Field/Heading Match -> Master Lookup -> Real-time Summary Reports"
 * 
 * Works like Excel's XLOOKUP + SUMIFS + Dynamic Pivot Engine.
 */

const MEP_ERP_ENGINE = (function() {

    const STORAGE_KEY_SOURCE_ERP = 'mep_fan_assemble_erp_data';
    const STORAGE_KEY_ASSEMBLE_SUMMARY = 'mep_assemble_custom_data';

    // Standard Category Mapping
    const CATEGORY_MAP = {
        'ceiling raw': 'Raw Material',
        'exhaust raw': 'Raw Material',
        'raw material': 'Raw Material',
        'packing materials - fan': 'Packing Item',
        'packing item': 'Packing Item',
        'fan sfg': 'SFG',
        'sfg': 'SFG',
        'production consumables - fan': 'Production Consumption',
        'production consumption': 'Production Consumption',
        'finished goods': 'Finished Goods',
        'printing process': 'Raw Material'
    };

    /**
     * Normalize Category Name
     */
    function normalizeCategory(rawCat) {
        if (!rawCat) return 'Raw Material';
        const key = rawCat.toLowerCase().trim();
        return CATEGORY_MAP[key] || rawCat;
    }

    /**
     * Get All Source ERP Movement Records (Single Source of Truth)
     */
    function getSourceErpData() {
        // 1. Check LocalStorage for live user-entered/pasted data
        const saved = localStorage.getItem(STORAGE_KEY_SOURCE_ERP);
        if (saved) {
            try {
                const list = JSON.parse(saved);
                if (Array.isArray(list) && list.length > 0) {
                    return list;
                }
            } catch(e) {
                console.error("[ERP Engine] Error reading saved ERP data:", e);
            }
        }

        // 2. Fallback to raw pre-loaded data
        if (typeof RAW_FAN_ASSEMBLE_ERP_DATA !== 'undefined' && Array.isArray(RAW_FAN_ASSEMBLE_ERP_DATA)) {
            return RAW_FAN_ASSEMBLE_ERP_DATA;
        }

        return [];
    }

    /**
     * Save Source ERP Data (Triggers Live Sync to all dependent reports)
     */
    function saveSourceErpData(dataList) {
        if (!Array.isArray(dataList)) return false;
        localStorage.setItem(STORAGE_KEY_SOURCE_ERP, JSON.stringify(dataList));

        // Dynamically compute and update Assemble Summary cached dataset
        const computedSummary = computeLiveAssembleSummary();
        localStorage.setItem(STORAGE_KEY_ASSEMBLE_SUMMARY, JSON.stringify(computedSummary));

        console.log(`[ERP Engine] Source ERP saved. Live synced ${computedSummary.length} items to Assemble Summary.`);
        return true;
    }

    /**
     * LIVE CALCULATION: Compute Assemble Summary directly from Source ERP (Closing ERP ➔ Fan Assemble)
     * Exact 8-Column Item Code Mapping:
     * Opening            <- Opening
     * Store Receive      <- Store Receive
     * Section Receive    <- Section Receive
     * Production Receive <- Production Receive
     * Issue To Damage    <- Issue To Damage
     * Others Receive     <- Others Receive
     * Consumption        <- Consumption
     * Bin Closing        <- Bin Closing
     */
    function computeLiveAssembleSummary() {
        const sourceData = getSourceErpData();
        if (!sourceData || sourceData.length === 0) {
            if (typeof RAW_ASSEMBLE_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_ASSEMBLE_SUMMARY_DATA)) {
                return JSON.parse(JSON.stringify(RAW_ASSEMBLE_SUMMARY_DATA));
            }
            return [];
        }

        // Build Item Code index from Source ERP (Fan Assemble)
        const sourceMap = new Map();
        sourceData.forEach(row => {
            const rawCode = (row.code || row.erpCode || '').trim();
            if (!rawCode) return;
            const codeUpper = rawCode.toUpperCase();
            sourceMap.set(codeUpper, row);
            if (row.erpCode) sourceMap.set(row.erpCode.trim().toUpperCase(), row);
            if (rawCode.includes('/')) {
                rawCode.split('/').forEach(part => {
                    const sub = part.trim().toUpperCase();
                    if (sub && !sourceMap.has(sub)) sourceMap.set(sub, row);
                });
            }
        });

        const baseList = (typeof RAW_ASSEMBLE_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_ASSEMBLE_SUMMARY_DATA))
            ? JSON.parse(JSON.stringify(RAW_ASSEMBLE_SUMMARY_DATA))
            : [];

        // Build FG Summary and Closing FG map for 1. CEILING FAN SERIES dynamic link
        let fgList = [];
        try {
            const savedFg = localStorage.getItem('mep_fg_summary_data');
            if (savedFg) fgList = JSON.parse(savedFg);
        } catch(e) {}
        if (!Array.isArray(fgList) || fgList.length === 0) {
            if (typeof RAW_FG_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_FG_SUMMARY_DATA)) {
                fgList = RAW_FG_SUMMARY_DATA;
            }
        }

        let cfgList = [];
        try {
            const savedCfg = localStorage.getItem('mep_closing_fg_data');
            if (savedCfg) cfgList = JSON.parse(savedCfg);
        } catch(e) {}
        if (!Array.isArray(cfgList) || cfgList.length === 0) {
            if (typeof RAW_CLOSING_FG_DATA !== 'undefined' && Array.isArray(RAW_CLOSING_FG_DATA)) {
                cfgList = RAW_CLOSING_FG_DATA;
            }
        }

        const cleanCode = (c) => (c || '').toString().trim().toUpperCase().replace(/\s+/g, '');
        const fgMap = new Map();
        if (Array.isArray(fgList)) {
            fgList.forEach(r => {
                if (!r.code) return;
                const k = cleanCode(r.code);
                fgMap.set(k, r);
                if (r.code.includes('/')) {
                    r.code.split('/').forEach(p => {
                        const sub = cleanCode(p);
                        if (sub && !fgMap.has(sub)) fgMap.set(sub, r);
                    });
                }
            });
        }

        const cfgMap = new Map();
        if (Array.isArray(cfgList)) {
            cfgList.forEach(r => {
                if (!r.code) return;
                const k = cleanCode(r.code);
                if (!cfgMap.has(k)) cfgMap.set(k, []);
                cfgMap.get(k).push(r);
                if (r.code.includes('/')) {
                    r.code.split('/').forEach(p => {
                        const sub = cleanCode(p);
                        if (sub) {
                            if (!cfgMap.has(sub)) cfgMap.set(sub, []);
                            cfgMap.get(sub).push(r);
                        }
                    });
                }
            });
        }

        const matchedSourceCodes = new Set();

        // 1. Update Base Assemble Summary items directly from Source ERP (Primary Single Source of Truth)
        baseList.forEach(item => {
            const normCode = cleanCode(item.code);
            let matched = sourceMap.get(normCode);
            if (!matched && item.code && item.code.includes('/')) {
                const parts = item.code.split('/');
                for (const p of parts) {
                    const sub = sourceMap.get(cleanCode(p));
                    if (sub) { matched = sub; break; }
                }
            }

            if (matched) {
                const matchedKey = cleanCode(matched.code || matched.erpCode || '');
                matchedSourceCodes.add(matchedKey);
                if (matched.code) matchedSourceCodes.add(cleanCode(matched.code));
                if (matched.erpCode) matchedSourceCodes.add(cleanCode(matched.erpCode));

                item.opening = parseFloat(matched.opening) || 0;
                item.storeRec = parseFloat(matched.storeReceive) || 0;
                item.sectionRec = parseFloat(matched.sectionReceive) || 0;
                item.productionRec = parseFloat(matched.productionReceive) || 0;
                item.damage = (matched.issueToDamage !== undefined && matched.issueToDamage !== null && matched.issueToDamage !== '')
                    ? (parseFloat(matched.issueToDamage) || 0)
                    : (parseFloat(matched.damageReceive) || 0);
                item.othersRec = parseFloat(matched.othersReceive) || 0;
                item.delivery = (matched.consumption !== undefined && matched.consumption !== null && matched.consumption !== '' && parseFloat(matched.consumption) !== 0)
                    ? (parseFloat(matched.consumption) || 0)
                    : ((parseFloat(matched.totalIssue) || parseFloat(matched.wipIssue) || 0));
                item.closing = (matched.binClosing !== undefined && matched.binClosing !== null && matched.binClosing !== '')
                    ? (parseFloat(matched.binClosing) || 0)
                    : (parseFloat(matched.closing) || 0);
                item.isLinked = true;
                item.linkedSource = 'Closing ERP ➔ Fan Assemble';
                return;
            }

            // Fallback for Ceiling Fan Series NOT in Source ERP: check FG Summary / Closing FG
            if (item.category === '1. CEILING FAN SERIES') {
                let matchedFg = fgMap.get(normCode);
                if (!matchedFg && item.code && item.code.includes('/')) {
                    for (const p of item.code.split('/')) {
                        const sub = fgMap.get(cleanCode(p));
                        if (sub) { matchedFg = sub; break; }
                    }
                }

                if (matchedFg) {
                    item.opening = parseFloat(matchedFg.opening) || 0;
                    item.storeRec = 0;
                    item.sectionRec = 0;
                    item.productionRec = parseFloat(matchedFg.production) || 0;
                    item.damage = 0;
                    item.othersRec = 0;
                    item.delivery = parseFloat(matchedFg.delivery) || 0;
                    item.closing = matchedFg.closing !== undefined ? (parseFloat(matchedFg.closing) || 0) : (item.opening + item.productionRec - item.delivery);
                    item.isLinked = true;
                    item.linkedSource = 'FG Summary Report';
                    return;
                }

                let cfgMatches = cfgMap.get(normCode) || [];
                if (cfgMatches.length === 0 && item.code && item.code.includes('/')) {
                    for (const p of item.code.split('/')) {
                        const sub = cfgMap.get(cleanCode(p));
                        if (sub && sub.length > 0) { cfgMatches = sub; break; }
                    }
                }

                if (cfgMatches.length > 0) {
                    let sumOp = 0, sumProd = 0, sumDel = 0, sumClose = 0;
                    cfgMatches.forEach(r => {
                        sumOp += parseFloat(r.opening) || 0;
                        const prod = r.otherReceive !== undefined ? r.otherReceive : (r.receiveOther !== undefined ? r.receiveOther : (r.other !== undefined ? r.other : 0));
                        sumProd += parseFloat(prod) || 0;
                        const del = r.transfer !== undefined ? r.transfer : (r.transferIssue !== undefined ? r.transferIssue : 0);
                        sumDel += parseFloat(del) || 0;
                        const cl = r.binClosing !== undefined ? r.binClosing : (r.closing !== undefined ? r.closing : 0);
                        sumClose += parseFloat(cl) || 0;
                    });
                    item.opening = sumOp;
                    item.storeRec = 0;
                    item.sectionRec = 0;
                    item.productionRec = sumProd;
                    item.damage = 0;
                    item.othersRec = 0;
                    item.delivery = sumDel;
                    item.closing = sumClose;
                    item.isLinked = true;
                    item.linkedSource = 'Closing ERP (Finish Good FG)';
                    return;
                }

                // If not found in any source -> STRICT ZERO (0)
                item.opening = 0;
                item.storeRec = 0;
                item.sectionRec = 0;
                item.productionRec = 0;
                item.damage = 0;
                item.othersRec = 0;
                item.delivery = 0;
                item.closing = 0;
                item.isLinked = false;
                item.linkedSource = '';
            }
        });

        // 2. Append any extra non-Finished-Goods items from Source ERP not already present in baseList
        sourceData.forEach((row, idx) => {
            const rowCode = (row.code || row.erpCode || '').trim().toUpperCase();
            if (!rowCode) return;
            if (matchedSourceCodes.has(rowCode)) return;

            // Skip finished good fans that belong only to FG
            const catLower = (row.category || '').toLowerCase();
            if (catLower.includes('finished')) return;

            matchedSourceCodes.add(rowCode);

            let itemCat = normalizeCategory(row.category);
            let itemName = row.name || row.itemName || '';
            let itemUnit = row.unit || 'Pcs';

            if (typeof getMasterItem === 'function') {
                const master = getMasterItem(rowCode);
                if (master) {
                    if (!itemName) itemName = master.name;
                    if (!itemUnit) itemUnit = master.unit;
                    if (!row.category && master.section) itemCat = normalizeCategory(master.section);
                }
            }

            const op = parseFloat(row.opening) || 0;
            const sr = parseFloat(row.storeReceive) || 0;
            const sec = parseFloat(row.sectionReceive) || 0;
            const pr = parseFloat(row.productionReceive) || 0;
            const dam = (row.issueToDamage !== undefined && row.issueToDamage !== null && row.issueToDamage !== '')
                ? (parseFloat(row.issueToDamage) || 0)
                : (parseFloat(row.damageReceive) || 0);
            const oth = parseFloat(row.othersReceive) || 0;
            const con = parseFloat(row.consumption) || 0;
            const bin = (row.binClosing !== undefined && row.binClosing !== null && row.binClosing !== '')
                ? (parseFloat(row.binClosing) || 0)
                : (parseFloat(row.closing) || 0);

            baseList.push({
                id: 'extra_src_' + (row.code || row.erpCode || idx),
                sl: baseList.length + 1,
                category: itemCat,
                code: row.code || row.erpCode,
                erpCode: row.erpCode || '',
                name: itemName,
                unit: itemUnit,
                opening: op,
                storeRec: sr,
                sectionRec: sec,
                productionRec: pr,
                damage: dam,
                othersRec: oth,
                delivery: con,
                closing: bin,
                isLinked: true,
                linkedSource: 'Closing ERP ➔ Fan Assemble'
            });
        });

        return baseList;
    }

    const STORAGE_KEY_ARMATURE_ERP = 'mep_armature_winding_erp_data';
    const STORAGE_KEY_ARMATURE_SUMMARY = 'mep_armature_custom_data';

    /**
     * Get All Source Armature ERP Movement Records
     */
    function getArmatureErpData() {
        const saved = localStorage.getItem(STORAGE_KEY_ARMATURE_ERP);
        if (saved) {
            try {
                const list = JSON.parse(saved);
                if (Array.isArray(list) && list.length > 0) return list;
            } catch(e) {
                console.error("[ERP Engine] Error reading saved Armature ERP data:", e);
            }
        }

        if (typeof RAW_ARMATURE_WINDING_ERP_DATA !== 'undefined' && Array.isArray(RAW_ARMATURE_WINDING_ERP_DATA)) {
            return RAW_ARMATURE_WINDING_ERP_DATA;
        }

        return [];
    }

    /**
     * Save Source Armature ERP Data (Triggers Live Sync to Armature Summary)
     */
    function saveArmatureErpData(dataList) {
        if (!Array.isArray(dataList)) return false;
        localStorage.setItem(STORAGE_KEY_ARMATURE_ERP, JSON.stringify(dataList));
        localStorage.setItem('mep_armature_winding_erp_data_updated', String(Date.now()));

        const computedSummary = computeLiveArmatureSummary();
        localStorage.setItem(STORAGE_KEY_ARMATURE_SUMMARY, JSON.stringify(computedSummary));

        console.log(`[ERP Engine] Armature ERP saved. Live synced ${computedSummary.length} items to Armature Summary.`);
        return true;
    }

    /**
     * LIVE CALCULATION: Compute Armature Summary directly from Source Armature ERP (Closing ERP ➔ Fan Armature)
     * Exact 8-Column Item Code Mapping:
     * Opening            <- Opening
     * Store Receive      <- Store Receive
     * Section Receive    <- Section Receive
     * Production Receive <- Production Receive
     * Issue To Damage    <- Issue To Damage
     * Others Receive     <- Others Receive
     * Consumption        <- Consumption
     * Bin Closing        <- Bin Closing
     */
    function computeLiveArmatureSummary() {
        const sourceData = getArmatureErpData();
        if (!sourceData || sourceData.length === 0) {
            if (typeof RAW_ARMATURE_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_ARMATURE_SUMMARY_DATA)) {
                return JSON.parse(JSON.stringify(RAW_ARMATURE_SUMMARY_DATA));
            }
            return [];
        }

        const sourceMap = new Map();
        sourceData.forEach(row => {
            const rawCode = (row.code || row.erpCode || '').trim();
            if (!rawCode) return;
            const codeUpper = rawCode.toUpperCase();
            sourceMap.set(codeUpper, row);
            if (row.erpCode) sourceMap.set(row.erpCode.trim().toUpperCase(), row);
            if (rawCode.includes('/')) {
                rawCode.split('/').forEach(part => {
                    const sub = part.trim().toUpperCase();
                    if (sub && !sourceMap.has(sub)) sourceMap.set(sub, row);
                });
            }
        });

        const baseList = (typeof RAW_ARMATURE_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_ARMATURE_SUMMARY_DATA))
            ? JSON.parse(JSON.stringify(RAW_ARMATURE_SUMMARY_DATA))
            : [];

        const matchedSourceCodes = new Set();

        baseList.forEach(item => {
            const itemCode = (item.code || '').trim().toUpperCase();
            let matched = sourceMap.get(itemCode);
            if (!matched && itemCode.includes('/')) {
                const parts = itemCode.split('/');
                for (const p of parts) {
                    const sub = sourceMap.get(p.trim());
                    if (sub) { matched = sub; break; }
                }
            }

            if (matched) {
                const matchedKey = (matched.code || matched.erpCode || '').trim().toUpperCase();
                matchedSourceCodes.add(matchedKey);
                if (matched.code) matchedSourceCodes.add(matched.code.trim().toUpperCase());
                if (matched.erpCode) matchedSourceCodes.add(matched.erpCode.trim().toUpperCase());

                item.opening = parseFloat(matched.opening) || 0;
                item.storeRec = parseFloat(matched.storeReceive) || 0;
                item.sectionRec = parseFloat(matched.sectionReceive) || 0;
                item.productionRec = parseFloat(matched.productionReceive) || 0;
                item.damage = (matched.issueToDamage !== undefined && matched.issueToDamage !== null && matched.issueToDamage !== '')
                    ? (parseFloat(matched.issueToDamage) || 0)
                    : (parseFloat(matched.damageReceive) || 0);
                item.othersRec = parseFloat(matched.othersReceive) || 0;
                // STRICT 1-to-1 CONSUMPTION mapping without extraneous wipIssue
                item.delivery = parseFloat(matched.consumption) || 0;
                item.closing = (matched.binClosing !== undefined && matched.binClosing !== null && matched.binClosing !== '')
                    ? (parseFloat(matched.binClosing) || 0)
                    : (parseFloat(matched.closing) || 0);
                item.isLinked = true;
                item.linkedSource = 'Closing ERP ➔ Fan Armature';
            }
        });

        // Append any extra items from Source Armature ERP not in baseList
        sourceData.forEach((row, idx) => {
            const rowCode = (row.code || row.erpCode || '').trim().toUpperCase();
            if (!rowCode) return;
            if (matchedSourceCodes.has(rowCode)) return;

            matchedSourceCodes.add(rowCode);

            let itemCat = normalizeCategory(row.category);
            let itemName = row.name || row.itemName || '';
            let itemUnit = row.unit || 'Pcs';

            if (typeof getMasterItem === 'function') {
                const master = getMasterItem(rowCode);
                if (master) {
                    if (!itemName) itemName = master.name;
                    if (!itemUnit) itemUnit = master.unit;
                    if (!row.category && master.section) itemCat = normalizeCategory(master.section);
                }
            }

            const op = parseFloat(row.opening) || 0;
            const sr = parseFloat(row.storeReceive) || 0;
            const sec = parseFloat(row.sectionReceive) || 0;
            const pr = parseFloat(row.productionReceive) || 0;
            const dam = (row.issueToDamage !== undefined && row.issueToDamage !== null && row.issueToDamage !== '')
                ? (parseFloat(row.issueToDamage) || 0)
                : (parseFloat(row.damageReceive) || 0);
            const oth = parseFloat(row.othersReceive) || 0;
            const con = parseFloat(row.consumption) || 0;
            const bin = (row.binClosing !== undefined && row.binClosing !== null && row.binClosing !== '')
                ? (parseFloat(row.binClosing) || 0)
                : (parseFloat(row.closing) || 0);

            baseList.push({
                id: 'arm_extra_src_' + (row.code || row.erpCode || idx),
                sl: baseList.length + 1,
                category: itemCat,
                code: row.code || row.erpCode,
                erpCode: row.erpCode || '',
                name: itemName,
                unit: itemUnit,
                opening: op,
                storeRec: sr,
                sectionRec: sec,
                productionRec: pr,
                damage: dam,
                othersRec: oth,
                delivery: con,
                closing: bin,
                isLinked: true,
                linkedSource: 'Closing ERP ➔ Fan Armature'
            });
        });

        return baseList;
    }

    /**
     * Dynamic XLOOKUP by Code across Master & Source ERP
     */
    function lookupItemDetails(code) {
        if (!code) return null;
        const clean = code.trim().toLowerCase();

        // 1. Check Master
        if (typeof getMasterItem === 'function') {
            const m = getMasterItem(code);
            if (m) return m;
        }

        // 2. Check Source ERP
        const source = getSourceErpData();
        const found = source.find(i => (i.code && i.code.toLowerCase() === clean) || (i.erpCode && i.erpCode.toLowerCase() === clean));
        if (found) {
            return {
                code: found.code || found.erpCode,
                name: found.name,
                unit: found.unit,
                category: normalizeCategory(found.category)
            };
        }

        return null;
    }

    return {
        getSourceErpData,
        saveSourceErpData,
        computeLiveAssembleSummary,
        getArmatureErpData,
        saveArmatureErpData,
        computeLiveArmatureSummary,
        lookupItemDetails,
        normalizeCategory
    };

})();

// Expose globally
window.MEP_ERP_ENGINE = MEP_ERP_ENGINE;
