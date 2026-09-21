/**
 * Complete vs Pending (FG Pending Report) Executive Dashboard Modal Engine
 * Handles live rendering, calculations, month switching, Excel export, and modal controls
 */
(function(window) {
    'use strict';

    // 1. Standard Ceiling Fan Model Catalog (17 Finished Goods Models)
    const CEILING_FAN_MODELS = [
        { id: 'CF5601IV', code: 'CF5601/CF5601IV', shortCode: 'CF5601IV', name: '56 Inch Premium Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CF5601WH', code: 'CF5601WH/CF5601WH', shortCode: 'CF5601WH', name: '56 Inch Premium Ceiling Fan - White', unit: 'Pcs', series: 'standard' },
        { id: 'CF5602IV', code: 'CF5602/CF5602IV', shortCode: 'CF5602IV', name: '56 Inch Speed King Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CF5603IV', code: 'CF5603/CF5603IV', shortCode: 'CF5603IV', name: '56 Inch Premium Gold Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CF5606IV', code: 'CF5606/CF5606IV', shortCode: 'CF5606IV', name: '56 Inch Premium Plus Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CF5607IV', code: 'CF5607/CF5607IV', shortCode: 'CF5607IV', name: '56 Inch Crown Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CF4801IV', code: 'CF4801/CF4801IV', shortCode: 'CF4801IV', name: '48 Inch Popular Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CF3601IV', code: 'CF3601/CF3601IV', shortCode: 'CF3601IV', name: '36 Inch Hero Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CF2401IV', code: 'CF2401/CF2401IV', shortCode: 'CF2401IV', name: '24 Inch Super Ceiling Fan - Ivory', unit: 'Pcs', series: 'standard' },
        { id: 'CR5601IV', code: 'CR5601IV', shortCode: 'CR5601IV', name: '56 Inch Premium Ceiling Fan- Ivory (Without Regulator)', unit: 'Pcs', series: 'special' },
        { id: 'CR5601WH', code: 'CR5601WH', shortCode: 'CR5601WH', name: '56 Inch Premium Ceiling Fan- White (Without Regulator)', unit: 'Pcs', series: 'special' },
        { id: 'CG5601IV', code: 'CG5601/CG5601IV', shortCode: 'CG5601IV', name: '56 Inch Premium Ceiling Fan With Gang Regulator - Ivory', unit: 'Pcs', series: 'special' },
        { id: 'CR5603IV', code: 'CR5603IV', shortCode: 'CR5603IV', name: '56 Inch Premium Gold Ceiling Fan- Ivory (Without Regulator)', unit: 'Pcs', series: 'special' },
        { id: 'CR5606IV', code: 'CR5606IV', shortCode: 'CR5606IV', name: '56 Inch Premium Plus Ceiling Fan- Ivory (Without Regulator)', unit: 'Pcs', series: 'special' },
        { id: 'CG5606IV', code: 'CG5606/CG5606IV', shortCode: 'CG5606IV', name: '56 Inch Premium Plus Ceiling Fan With Gang Regulator - Ivory', unit: 'Pcs', series: 'special' },
        { id: 'CR4801IV', code: 'CR4801IV', shortCode: 'CR4801IV', name: '48 Inch Popular Ceiling Fan- Ivory (Without Regulator)', unit: 'Pcs', series: 'special' },
        { id: 'CR3601IV', code: 'CR3601IV', shortCode: 'CR3601IV', name: '36 Inch Hero Ceiling Fan- Ivory (Without Regulator)', unit: 'Pcs', series: 'special' }
    ];

    // 2. Month Definitions & Default Intervals
    const PENDING_MONTH_CONFIG = {
        '2026_September': {
            year: '2026',
            monthIndex: 8,
            monthName: 'September',
            dateInterval: '2026-09-01 to 2026-09-07'
        },
        '2026_August': {
            year: '2026',
            monthIndex: 7,
            monthName: 'August',
            dateInterval: '2026-08-01 to 2026-08-25'
        },
        '2026_July': {
            year: '2026',
            monthIndex: 6,
            monthName: 'July',
            dateInterval: '2026-07-01 to 2026-07-31'
        },
        '2026_June': {
            year: '2026',
            monthIndex: 5,
            monthName: 'June',
            dateInterval: '2026-06-01 to 2026-06-30'
        },
        '2026_May': {
            year: '2026',
            monthIndex: 4,
            monthName: 'May',
            dateInterval: '2026-05-01 to 2026-05-31'
        },
        '2026_April': {
            year: '2026',
            monthIndex: 3,
            monthName: 'April',
            dateInterval: '2026-04-01 to 2026-04-30'
        },
        '2026_March': {
            year: '2026',
            monthIndex: 2,
            monthName: 'March',
            dateInterval: '2026-03-01 to 2026-03-31'
        },
        '2026_February': {
            year: '2026',
            monthIndex: 1,
            monthName: 'February',
            dateInterval: '2026-02-01 to 2026-02-28'
        },
        '2026_January': {
            year: '2026',
            monthIndex: 0,
            monthName: 'January',
            dateInterval: '2026-01-01 to 2026-01-31'
        }
    };

    // 3. Verified Baseline Datasets (Screenshot 2: 28,326 Live Production Received)
    const BASELINE_ERP_MONTHS = {
        '2026_September': {
            'CF5601IV': 9380,
            'CF5601WH': 33,
            'CF5602IV': 5553,
            'CF5603IV': 1062,
            'CF5606IV': 0,
            'CF5607IV': 0,
            'CF4801IV': 2331,
            'CF3601IV': 7602,
            'CF2401IV': 2188,
            'CR5601IV': 176,
            'CR5601WH': 0,
            'CG5601IV': 0,
            'CR5603IV': 0,
            'CR5606IV': 0,
            'CG5606IV': 0,
            'CR4801IV': 0,
            'CR3601IV': 0
        },
        '2026_August': {
            'CF5601IV': 30849,
            'CF5601WH': 105,
            'CF5602IV': 0,
            'CF5603IV': 0,
            'CF5606IV': 60,
            'CF5607IV': 335,
            'CF4801IV': 1100,
            'CF3601IV': 5107,
            'CF2401IV': 1091,
            'CR5601IV': 0,
            'CR5601WH': 0,
            'CG5601IV': 0,
            'CR5603IV': 0,
            'CR5606IV': 0,
            'CG5606IV': 0,
            'CR4801IV': 0,
            'CR3601IV': 0
        }
    };

    const BASELINE_PHYSICAL_MONTHS = {
        '2026_September': {
            'CF5601IV': 8659,
            'CF5601WH': 0,
            'CF5602IV': 5838,
            'CF5603IV': 1473,
            'CF5606IV': 0,
            'CF5607IV': 0,
            'CF4801IV': 3630,
            'CF3601IV': 8610,
            'CF2401IV': 4300,
            'CR5601IV': 8136,
            'CR5601WH': 250,
            'CG5601IV': 0,
            'CR5603IV': 0,
            'CR5606IV': 0,
            'CG5606IV': 0,
            'CR4801IV': 0,
            'CR3601IV': 0
        },
        '2026_August': {
            'CF5601IV': 34525,
            'CF5601WH': 0,
            'CF5602IV': 271,
            'CF5603IV': 89,
            'CF5606IV': 49,
            'CF5607IV': 340,
            'CF4801IV': 2717,
            'CF3601IV': 9426,
            'CF2401IV': 3191,
            'CR5601IV': 0,
            'CR5601WH': 0,
            'CG5601IV': 0,
            'CR5603IV': 0,
            'CR5606IV': 0,
            'CG5606IV': 0,
            'CR4801IV': 0,
            'CR3601IV': 0
        }
    };

    const BASELINE_CLOSING_MONTHS = {
        '2026_September': {
            'CF5601IV': 50,
            'CF5601WH': 0,
            'CF5602IV': 0,
            'CF5603IV': 0,
            'CF5606IV': 8,
            'CF5607IV': 0,
            'CF4801IV': 0,
            'CF3601IV': 0,
            'CF2401IV': 0,
            'CR5601IV': 0,
            'CR5601WH': 0,
            'CG5601IV': 0,
            'CR5603IV': 0,
            'CR5606IV': 2,
            'CG5606IV': 4,
            'CR4801IV': 0,
            'CR3601IV': 15
        },
        '2026_August': {
            'CF5601IV': 0,
            'CF5601WH': 23,
            'CF5602IV': 0,
            'CF5603IV': 8,
            'CF5606IV': 14,
            'CF5607IV': 336,
            'CF4801IV': 0,
            'CF3601IV': 15,
            'CF2401IV': 0,
            'CR5601IV': 0,
            'CR5601WH': 0,
            'CG5601IV': 0,
            'CR5603IV': 0,
            'CR5606IV': 0,
            'CG5606IV': 0,
            'CR4801IV': 0,
            'CR3601IV': 0
        }
    };

    // Code Normalization & Matching Logic
    function cleanCode(codeStr) {
        return (codeStr || '').toString().trim().toUpperCase().replace(/[\s\-_]/g, '');
    }

    function matchesFanModel(model, candidateCode) {
        if (!candidateCode) return false;
        const cleanCand = cleanCode(candidateCode);
        if (!cleanCand) return false;

        const candTokens = candidateCode.includes('/') ? candidateCode.split('/').map(cleanCode).filter(Boolean) : [cleanCand];

        const mTokens = [cleanCode(model.id), cleanCode(model.code), cleanCode(model.shortCode)].filter(Boolean);
        if (model.code && model.code.includes('/')) {
            model.code.split('/').forEach(p => {
                const c = cleanCode(p);
                if (c && !mTokens.includes(c)) mTokens.push(c);
            });
        }

        for (const ct of candTokens) {
            if (mTokens.includes(ct)) return true;
        }
        return mTokens.includes(cleanCand);
    }

    // 4. Data Loaders
    // Source: Screenshot 2 (assemble_summary.html ➔ Ceiling Fan Series ➔ Production Receive)
    function getErpDataForMonth(monthKey) {
        const config = PENDING_MONTH_CONFIG[monthKey] || PENDING_MONTH_CONFIG['2026_September'];
        const erpMap = {};
        CEILING_FAN_MODELS.forEach(m => erpMap[m.id] = 0);

        if (monthKey === '2026_August' || (BASELINE_ERP_MONTHS[monthKey] && monthKey !== '2026_September')) {
            const hist = BASELINE_ERP_MONTHS[monthKey];
            Object.keys(hist).forEach(c => erpMap[c] = hist[c] || 0);
            return erpMap;
        }

        if (monthKey === '2026_September') {
            // Priority 1: Assemble Summary Dataset (Screenshot 2: assemble_summary.html ➔ PRODUCTION RECEIVE)
            let assemList = [];
            try {
                const savedAssem = localStorage.getItem('mep_assemble_custom_data');
                if (savedAssem) {
                    const parsed = JSON.parse(savedAssem);
                    if (Array.isArray(parsed) && parsed.length > 0) assemList = parsed;
                }
            } catch(e) {}

            if ((!Array.isArray(assemList) || assemList.length === 0) && typeof MEP_ERP_ENGINE !== 'undefined') {
                try {
                    const live = MEP_ERP_ENGINE.computeLiveAssembleSummary();
                    if (Array.isArray(live) && live.length > 0) assemList = live;
                } catch(e) {}
            }

            if ((!Array.isArray(assemList) || assemList.length === 0) && typeof RAW_ASSEMBLE_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_ASSEMBLE_SUMMARY_DATA)) {
                assemList = RAW_ASSEMBLE_SUMMARY_DATA;
            }

            let erpFoundCount = 0;
            if (Array.isArray(assemList) && assemList.length > 0) {
                assemList.forEach(row => {
                    const sec = (row.category || row.section || '').toUpperCase();
                    if (sec && !sec.includes('CEILING FAN')) return;
                    const code = row.code || '';
                    if (!code) return;
                    const prodRec = parseFloat(row.productionRec !== undefined ? row.productionRec : (row.production !== undefined ? row.production : 0)) || 0;

                    for (const model of CEILING_FAN_MODELS) {
                        if (matchesFanModel(model, code)) {
                            erpMap[model.id] = prodRec;
                            if (prodRec > 0) erpFoundCount++;
                            break;
                        }
                    }
                });
            }

            if (erpFoundCount > 0) {
                return erpMap;
            }

            // Priority 2: Closing FG Dataset (otherReceive = Production Receive)
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
            if (Array.isArray(cfgList) && cfgList.length > 0) {
                cfgList.forEach(row => {
                    const code = row.code || '';
                    if (!code) return;
                    const prodRec = parseFloat(row.otherReceive !== undefined ? row.otherReceive : (row.productionRec || 0)) || 0;
                    for (const model of CEILING_FAN_MODELS) {
                        if (matchesFanModel(model, code)) {
                            erpMap[model.id] = prodRec;
                            if (prodRec > 0) erpFoundCount++;
                            break;
                        }
                    }
                });
                if (erpFoundCount > 0) {
                    return erpMap;
                }
            }

            // Priority 3: FG Summary Dataset
            let fgList = [];
            try {
                const saved = localStorage.getItem('mep_fg_summary_data');
                if (saved) fgList = JSON.parse(saved);
            } catch(e) {}
            if (!Array.isArray(fgList) || fgList.length === 0) {
                if (typeof RAW_FG_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_FG_SUMMARY_DATA)) {
                    fgList = RAW_FG_SUMMARY_DATA;
                }
            }
            if (Array.isArray(fgList)) {
                fgList.forEach(row => {
                    const sec = (row.section || row.category || '').toUpperCase();
                    if (!sec.includes('CEILING FAN') || sec.includes('BLADE')) return;
                    const code = row.code || '';
                    const prodRec = parseFloat(row.production) || 0;
                    for (const model of CEILING_FAN_MODELS) {
                        if (matchesFanModel(model, code)) {
                            erpMap[model.id] = prodRec;
                            if (prodRec > 0) erpFoundCount++;
                            break;
                        }
                    }
                });
                if (erpFoundCount > 0) {
                    return erpMap;
                }
            }

            const defaultSep = BASELINE_ERP_MONTHS['2026_September'];
            Object.keys(defaultSep).forEach(c => erpMap[c] = defaultSep[c] || 0);
            return erpMap;
        }

        if (typeof MONTHLY_ARCHIVE_ENGINE !== 'undefined' && typeof MONTHLY_ARCHIVE_ENGINE.getSnapshot === 'function') {
            const snap = MONTHLY_ARCHIVE_ENGINE.getSnapshot(config.year, config.monthName);
            if (snap && snap.items) {
                Object.values(snap.items).forEach(it => {
                    for (const model of CEILING_FAN_MODELS) {
                        if (matchesFanModel(model, it.code)) {
                            erpMap[model.id] += (parseFloat(it.qty) || 0);
                            break;
                        }
                    }
                });
                return erpMap;
            }
        }

        return erpMap;
    }

    function getPhysicalDataForMonth(monthKey) {
        const config = PENDING_MONTH_CONFIG[monthKey] || PENDING_MONTH_CONFIG['2026_September'];
        const physMap = {};
        CEILING_FAN_MODELS.forEach(m => physMap[m.id] = 0);

        let dailyEntries = [];
        if (typeof getUnifiedDailyFGProductionData === 'function') {
            dailyEntries = getUnifiedDailyFGProductionData();
        } else if (typeof RAW_PRODUCTION_DATA !== 'undefined' && Array.isArray(RAW_PRODUCTION_DATA)) {
            dailyEntries = RAW_PRODUCTION_DATA;
        }

        const ALL_MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        let physFoundTotal = 0;

        dailyEntries.forEach(entry => {
            const qty = parseFloat(entry.qty) || 0;
            if (qty === 0) return;

            let yr = '';
            if (entry.year) yr = String(entry.year).trim();
            else if (entry.date) {
                const parts = String(entry.date).trim().split(/[-/.\s]+/);
                if (parts.length === 3) {
                    yr = parts[0].length === 4 ? parts[0] : (parts[2].length === 2 ? '20' + parts[2] : parts[2]);
                }
            }
            if (yr !== config.year) return;

            let mIdx = -1;
            if (entry.month) {
                const cleanM = String(entry.month).trim().toLowerCase();
                for (let i = 0; i < ALL_MONTHS.length; i++) {
                    if (ALL_MONTHS[i].startsWith(cleanM.slice(0, 3))) { mIdx = i; break; }
                }
            } else if (entry.date) {
                const parts = String(entry.date).trim().split(/[-/.\s]+/);
                if (parts.length === 3) {
                    const mp = parts[1].toLowerCase();
                    for (let i = 0; i < ALL_MONTHS.length; i++) {
                        if (ALL_MONTHS[i].startsWith(mp.slice(0, 3))) { mIdx = i; break; }
                    }
                }
            }
            if (mIdx !== config.monthIndex) return;

            const itemCode = entry.item_code || entry.code;
            for (const model of CEILING_FAN_MODELS) {
                if (matchesFanModel(model, itemCode)) {
                    physMap[model.id] += qty;
                    physFoundTotal += qty;
                    break;
                }
            }
        });

        if (physFoundTotal > 0) {
            return physMap;
        }

        if (BASELINE_PHYSICAL_MONTHS[monthKey]) {
            const basePhys = BASELINE_PHYSICAL_MONTHS[monthKey];
            Object.keys(basePhys).forEach(c => physMap[c] = basePhys[c] || 0);
            return physMap;
        }

        return physMap;
    }

    // Source: Screenshot 3 (fg_summary.html ➔ Stock Movement Report Finish Good FG ➔ Closing Column)
    function getClosingDataForMonth(monthKey) {
        const config = PENDING_MONTH_CONFIG[monthKey] || PENDING_MONTH_CONFIG['2026_September'];
        const closingMap = {};
        CEILING_FAN_MODELS.forEach(m => closingMap[m.id] = 0);

        if (monthKey === '2026_August') {
            const hist = BASELINE_CLOSING_MONTHS['2026_August'];
            if (hist) {
                Object.keys(hist).forEach(c => closingMap[c] = (parseFloat(hist[c]) || 0));
            }
            return closingMap;
        }

        if (monthKey === '2026_September') {
            // Priority 1: Closing FG Dataset (Primary authoritative source for Closing FG - Screenshot 3)
            let cfgList = [];
            try {
                const cfgSaved = localStorage.getItem('mep_closing_fg_data');
                if (cfgSaved) {
                    const parsed = JSON.parse(cfgSaved);
                    if (Array.isArray(parsed) && parsed.length > 0) cfgList = parsed;
                }
            } catch(e) {}
            if (!Array.isArray(cfgList) || cfgList.length === 0) {
                if (typeof RAW_CLOSING_FG_DATA !== 'undefined' && Array.isArray(RAW_CLOSING_FG_DATA)) {
                    cfgList = RAW_CLOSING_FG_DATA;
                }
            }

            let matchCount = 0;
            if (Array.isArray(cfgList) && cfgList.length > 0) {
                cfgList.forEach(row => {
                    const code = row.code || '';
                    if (!code) return;
                    const closingVal = parseFloat(
                        row.binClosing !== undefined && row.binClosing !== null ? String(row.binClosing).replace(/,/g, '') : 
                        (row.closing !== undefined && row.closing !== null ? String(row.closing).replace(/,/g, '') : 0)
                    ) || 0;

                    for (const model of CEILING_FAN_MODELS) {
                        if (matchesFanModel(model, code)) {
                            closingMap[model.id] = closingVal;
                            if (closingVal > 0) matchCount++;
                            break;
                        }
                    }
                });
            }

            if (matchCount > 0) {
                return closingMap;
            }

            // Priority 2: Saved FG Summary dataset (localStorage: mep_fg_summary_data) or RAW_FG_SUMMARY_DATA
            let fgList = [];
            try {
                const saved = localStorage.getItem('mep_fg_summary_data');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) fgList = parsed;
                }
            } catch(e) {}

            if (!Array.isArray(fgList) || fgList.length === 0) {
                if (typeof RAW_FG_SUMMARY_DATA !== 'undefined' && Array.isArray(RAW_FG_SUMMARY_DATA)) {
                    fgList = RAW_FG_SUMMARY_DATA;
                }
            }

            if (Array.isArray(fgList) && fgList.length > 0) {
                fgList.forEach(row => {
                    const sec = (row.section || row.category || '').toUpperCase();
                    if (sec && (!sec.includes('CEILING FAN') || sec.includes('BLADE'))) return;

                    const code = row.code || '';
                    if (!code) return;

                    const closingVal = parseFloat(
                        row.closing !== undefined && row.closing !== null ? String(row.closing).replace(/,/g, '') :
                        (row.binClosing !== undefined && row.binClosing !== null ? String(row.binClosing).replace(/,/g, '') : 
                        (row.closingStock !== undefined && row.closingStock !== null ? String(row.closingStock).replace(/,/g, '') : 0))
                    ) || 0;

                    for (const model of CEILING_FAN_MODELS) {
                        if (matchesFanModel(model, code)) {
                            closingMap[model.id] = closingVal;
                            if (closingVal > 0) matchCount++;
                            break;
                        }
                    }
                });
            }

            if (matchCount > 0) {
                return closingMap;
            }

            const baseSep = BASELINE_CLOSING_MONTHS['2026_September'];
            if (baseSep) {
                Object.keys(baseSep).forEach(c => closingMap[c] = (parseFloat(baseSep[c]) || 0));
            }
            return closingMap;
        }

        if (BASELINE_CLOSING_MONTHS[monthKey]) {
            const b = BASELINE_CLOSING_MONTHS[monthKey];
            Object.keys(b).forEach(c => closingMap[c] = (parseFloat(b[c]) || 0));
            return closingMap;
        }

        return closingMap;
    }

    function formatNum(val) {
        const num = Number(val);
        if (isNaN(num) || num === 0) return '0';
        return Math.round(num).toLocaleString();
    }

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 5. Render Modal UI
    function renderPendingReportUI() {
        const monthSelect = document.getElementById('pendingModalMonthSelect');
        const selectedMonth = monthSelect ? monthSelect.value : '2026_September';
        const config = PENDING_MONTH_CONFIG[selectedMonth] || PENDING_MONTH_CONFIG['2026_September'];

        // Update Date Interval Badges
        let dateIntervalStr = config.dateInterval;
        if (selectedMonth === '2026_September') {
            const liveDate = localStorage.getItem('mep_closing_fg_date_interval') || localStorage.getItem('mep_erp_date_interval');
            if (liveDate) dateIntervalStr = liveDate;
        }
        const badgeEl = document.getElementById('modalPendingDateIntervalText');
        if (badgeEl) badgeEl.textContent = `Date Interval: ${dateIntervalStr}`;
        const assembleDateEl = document.getElementById('modalPendingAssembleDateInterval');
        if (assembleDateEl) assembleDateEl.textContent = `Date Interval: ${dateIntervalStr}`;
        const closingDateEl = document.getElementById('modalPendingClosingDateInterval');
        if (closingDateEl) closingDateEl.textContent = `Date Interval: ${dateIntervalStr}`;

        const erpData = getErpDataForMonth(selectedMonth);
        const physicalData = getPhysicalDataForMonth(selectedMonth);
        const closingData = getClosingDataForMonth(selectedMonth);

        // 1. Render Left Table: CODE | CEILING FAN | ERP | PHYSICAL | DUE
        const assembleTbody = document.getElementById('tblPendingAssembleBody');
        let assembleRowsHtml = '';
        let totalErp = 0;
        let totalPhysical = 0;
        let totalDue = 0;

        CEILING_FAN_MODELS.forEach((model, idx) => {
            const erpVal = erpData[model.id] || 0;
            const physVal = physicalData[model.id] || 0;
            const dueVal = erpVal - physVal;

            totalErp += erpVal;
            totalPhysical += physVal;
            totalDue += dueVal;

            let dueHtml = '';
            if (erpVal === 0 && physVal === 0) {
                dueHtml = '<span class="badge-due-zero">0</span>';
            } else if (dueVal === 0) {
                dueHtml = '<span class="badge-due-zero">0</span>';
            } else if (dueVal < 0) {
                dueHtml = `<span class="badge-due-neg">(${formatNum(Math.abs(dueVal))})</span>`;
            } else {
                dueHtml = `<span class="badge-due-pos">${formatNum(dueVal)}</span>`;
            }

            const isSpecial = model.series === 'special';
            const rowStyle = isSpecial ? 'background: rgba(254, 243, 199, 0.28);' : '';

            assembleRowsHtml += `
                <tr style="${rowStyle}">
                    <td><span class="code-pill ${isSpecial ? 'code-pill-special' : ''}">${escapeHTML(model.code)}</span></td>
                    <td class="cell-name">${escapeHTML(model.name)}</td>
                    <td class="cell-num">${formatNum(erpVal)}</td>
                    <td class="cell-num">${formatNum(physVal)}</td>
                    <td class="cell-due">${dueHtml}</td>
                </tr>
            `;
        });

        if (assembleTbody) assembleTbody.innerHTML = assembleRowsHtml;

        // Left Table Footers
        const totalErpEl = document.getElementById('modalTotalAssembleErp');
        if (totalErpEl) totalErpEl.textContent = formatNum(totalErp);
        const totalPhysEl = document.getElementById('modalTotalAssemblePhysical');
        if (totalPhysEl) totalPhysEl.textContent = formatNum(totalPhysical);
        const totalDueEl = document.getElementById('modalTotalAssembleDue');
        if (totalDueEl) {
            if (totalDue < 0) {
                totalDueEl.innerHTML = `<span class="badge-due-total">(${formatNum(Math.abs(totalDue))})</span>`;
            } else if (totalDue === 0) {
                totalDueEl.innerHTML = `<span class="badge-due-zero">0</span>`;
            } else {
                totalDueEl.innerHTML = `<span class="badge-due-pos" style="font-size:0.95rem; font-weight:900;">${formatNum(totalDue)}</span>`;
            }
        }

        // 2. Render Right Table: Fan Floor FG Closing (Box 2)
        // Rule: Only ONE column for Quantity beside Code and Model (Unit column removed)
        const closingTbody = document.getElementById('tblPendingClosingBody');
        let closingRowsHtml = '';
        let totalClosing = 0;

        CEILING_FAN_MODELS.forEach((model, idx) => {
            const qty = closingData[model.id] || 0;
            totalClosing += qty;

            const qtyHtml = qty > 0 
                ? `<span class="qty-active">${formatNum(qty)}</span>`
                : `<span style="color:#94a3b8; font-weight:600;">0</span>`;

            const isSpecial = model.series === 'special';
            const rowStyle = isSpecial ? 'background: rgba(254, 243, 199, 0.28);' : '';

            closingRowsHtml += `
                <tr style="${rowStyle}">
                    <td><span class="code-pill ${isSpecial ? 'code-pill-special' : ''}">${escapeHTML(model.code)}</span></td>
                    <td class="cell-name">${escapeHTML(model.name)}</td>
                    <td class="cell-num">${qtyHtml}</td>
                </tr>
            `;
        });

        if (closingTbody) closingTbody.innerHTML = closingRowsHtml;

        const totalClosingEl = document.getElementById('modalTotalFloorClosing');
        if (totalClosingEl) totalClosingEl.textContent = `${formatNum(totalClosing)} Pcs`;

        // 3. Update Executive KPI Strip
        const kpiErp = document.getElementById('modalKpiErpOutput');
        if (kpiErp) kpiErp.textContent = formatNum(totalErp);

        const kpiNetDue = document.getElementById('modalKpiNetDue');
        if (kpiNetDue) {
            if (totalDue < 0) {
                kpiNetDue.textContent = `(${formatNum(Math.abs(totalDue))})`;
                kpiNetDue.style.color = '#e11d48';
            } else if (totalDue === 0) {
                kpiNetDue.textContent = '0';
                kpiNetDue.style.color = '#64748b';
            } else {
                kpiNetDue.textContent = formatNum(totalDue);
                kpiNetDue.style.color = '#059669';
            }
        }

        const kpiPhysical = document.getElementById('modalKpiPhysicalOutput');
        if (kpiPhysical) kpiPhysical.textContent = formatNum(totalPhysical);

        const kpiFloorClosing = document.getElementById('modalKpiFloorClosing');
        if (kpiFloorClosing) {
            kpiFloorClosing.innerHTML = `${formatNum(totalClosing)} <span style="font-size:0.9rem; font-weight:700;">Pcs</span>`;
        }
    }

    // 6. Modal Open & Close Functions
    function openPendingReportModal() {
        const modal = document.getElementById('pendingReportModal');
        if (!modal) return;

        const monthSelect = document.getElementById('pendingModalMonthSelect');
        if (monthSelect && !monthSelect.value) {
            monthSelect.value = '2026_September';
        }

        renderPendingReportUI();
        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
    }

    function closePendingReportModal() {
        const modal = document.getElementById('pendingReportModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.setProperty('display', 'none', 'important');
        }
        document.body.style.overflow = '';
    }

    function changePendingReportMonth(val) {
        renderPendingReportUI();
    }

    // 7. Excel & Print Export
    function exportPendingReportToExcel() {
        const monthSelect = document.getElementById('pendingModalMonthSelect');
        const selectedMonth = monthSelect ? monthSelect.value : '2026_September';
        const config = PENDING_MONTH_CONFIG[selectedMonth] || PENDING_MONTH_CONFIG['2026_September'];

        const erpData = getErpDataForMonth(selectedMonth);
        const physicalData = getPhysicalDataForMonth(selectedMonth);
        const closingData = getClosingDataForMonth(selectedMonth);

        if (typeof XLSX !== 'undefined') {
            try {
                const wb = XLSX.utils.book_new();

                const sheet1Data = [
                    ["COMPLETE VS PENDING - ASSEMBLE ERP FG PRODUCTION REPORT"],
                    [`Month: ${config.monthName} ${config.year}`, `Date Interval: ${config.dateInterval}`],
                    [],
                    ["Code", "Ceiling Fan Model", "ERP Output", "Physical Output", "Due (ERP - Physical)"]
                ];

                let tErp = 0, tPhys = 0, tDue = 0;
                CEILING_FAN_MODELS.forEach(m => {
                    const e = erpData[m.id] || 0;
                    const p = physicalData[m.id] || 0;
                    const d = e - p;
                    tErp += e; tPhys += p; tDue += d;
                    sheet1Data.push([m.code, m.name, e, p, d]);
                });
                sheet1Data.push(["TOTAL", "", tErp, tPhys, tDue]);

                const sheet2Data = [
                    ["FAN FLOOR FG CLOSING REPORT"],
                    [`Month: ${config.monthName} ${config.year}`, `Date Interval: ${config.dateInterval}`],
                    [],
                    ["Code", "Model Name", "Closing Quantity"]
                ];

                let tClose = 0;
                CEILING_FAN_MODELS.forEach(m => {
                    const q = closingData[m.id] || 0;
                    tClose += q;
                    sheet2Data.push([m.code, m.name, q]);
                });
                sheet2Data.push(["TOTAL", "", tClose]);

                const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
                const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

                XLSX.utils.book_append_sheet(wb, ws1, "Assemble ERP Output");
                XLSX.utils.book_append_sheet(wb, ws2, "Fan Floor Closing");

                XLSX.writeFile(wb, `Complete_vs_Pending_${config.monthName}_${config.year}.xlsx`);
                return;
            } catch(e) {
                console.error("Excel generation error:", e);
            }
        }

        // CSV Fallback
        let csv = `Complete vs Pending - ${config.monthName} ${config.year}\n`;
        csv += `Code,Model,ERP,Physical,Due\n`;
        CEILING_FAN_MODELS.forEach(m => {
            const e = erpData[m.id] || 0;
            const p = physicalData[m.id] || 0;
            csv += `"${m.code}","${m.name}",${e},${p},${e - p}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Complete_vs_Pending_${config.monthName}_${config.year}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function printPendingReport() {
        const modal = document.getElementById('pendingReportModal');
        if (!modal) return;
        window.print();
    }

    // 8. Event Listeners
    if (typeof document !== 'undefined') {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('pendingReportModal');
                if (modal && modal.classList.contains('active')) {
                    closePendingReportModal();
                }
            }
        });

        // Reactive Storage Listener
        window.addEventListener('storage', (e) => {
            if (e.key === 'mep_fan_assemble_erp_data' || e.key === 'mep_fan_assemble_erp_data_updated' ||
                e.key === 'mep_assemble_custom_data' || e.key === 'mep_assemble_summary_updated' ||
                e.key === 'mep_fg_summary_data' || e.key === 'mep_fg_summary_last_updated' ||
                e.key === 'mep_closing_fg_data' || e.key === 'mep_closing_fg_last_updated' ||
                e.key === 'mep_closing_fg_date_interval' || e.key === 'closingDate_closing_fg' ||
                e.key === 'custom_fg_production_entries' || e.key === 'deleted_fg_production_entry_ids') {
                const modal = document.getElementById('pendingReportModal');
                if (modal && modal.classList.contains('active')) {
                    renderPendingReportUI();
                }
            }
        });

        // Tab Focus Listener
        window.addEventListener('focus', () => {
            const modal = document.getElementById('pendingReportModal');
            if (modal && modal.classList.contains('active')) {
                renderPendingReportUI();
            }
        });
    }

    // Expose Global Functions
    window.openPendingReportModal = openPendingReportModal;
    window.closePendingReportModal = closePendingReportModal;
    window.changePendingReportMonth = changePendingReportMonth;
    window.renderPendingReportUI = renderPendingReportUI;
    window.exportPendingReportToExcel = exportPendingReportToExcel;
    window.printPendingReport = printPendingReport;

})(window);
