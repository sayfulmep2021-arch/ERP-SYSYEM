/**
 * MEP Portal - Production Performance Dashboard Dynamic Engine
 * Real-time Production Target, Achievement, Pending, Day-wise Gap & 3-Color Donut Chart
 * Synchronized live to Production Plan & Yearly Production Summary ERP
 */
window.PRODUCTION_DASHBOARD_DATA = null;

function renderProductionPerformanceDashboard(customData) {
    // 1. Determine Current Live Date
    const now = new Date();
    const liveYear = now.getFullYear();
    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const liveMonthIdx = now.getMonth();
    const liveMonthName = MONTH_NAMES[liveMonthIdx];
    const liveMonthShort = MONTH_SHORT[liveMonthIdx];
    const liveMonthShortYear = `${liveMonthShort}-${String(liveYear).slice(-2)}`;

    // 2. Dynamic Production Target from Production Plan (STRICT: Ceiling Fan Series Total Target)
    let planData = null;
    if (typeof getProductionPlanTargetForPeriod === 'function') {
        try {
            planData = getProductionPlanTargetForPeriod(liveYear, liveMonthName);
        } catch(e) {
            console.warn("[Dashboard Engine] getProductionPlanTargetForPeriod error:", e);
        }
    }

    // 3. Dynamic Production Achievement from Yearly Production Summary ERP (STRICT: Ceiling Fan Series ONLY)
    let erpData = null;
    if (typeof getYearlyERPDataForPeriod === 'function') {
        try {
            erpData = getYearlyERPDataForPeriod(liveYear, liveMonthName);
        } catch(e) {
            console.warn("[Dashboard Engine] getYearlyERPDataForPeriod error:", e);
        }
    }

    // 4. Resolve Production Target & Achievement (Defaults for Sep 2026: 40,000 & 7,613)
    let target = (customData && customData.monthlyTarget !== undefined) ? Number(customData.monthlyTarget) :
                 (planData && planData.ceilingFanTarget !== undefined ? Number(planData.ceilingFanTarget) :
                 (planData && planData.totalTarget !== undefined ? Number(planData.totalTarget) : 40000));

    let achieve = (customData && customData.monthlyAchievement !== undefined) ? Number(customData.monthlyAchievement) :
                  (erpData && erpData.ceilingFanAchievement !== undefined ? Number(erpData.ceilingFanAchievement) :
                  (erpData && erpData.totalAchievement !== undefined ? Number(erpData.totalAchievement) : 7613));

    target = Math.max(0, target);
    achieve = Math.max(0, achieve);

    // 5. Calculate Pending (Strictly non-negative)
    const pending = Math.max(0, target - achieve);
    const achievePct = target > 0 ? ((achieve / target) * 100).toFixed(1) : "0.0";
    const pendingPct = target > 0 ? ((pending / target) * 100).toFixed(1) : "0.0";

    // 6. Day-wise Target & Production Gap (26 Working Days Standard)
    const STANDARD_WORKING_DAYS = 26;
    const dailyTarget = Math.round(target / STANDARD_WORKING_DAYS);

    // Completed working days: based on day of month, capped at 26
    const curDay = now.getDate();
    const totalDaysInMonth = new Date(liveYear, liveMonthIdx + 1, 0).getDate();
    const completedWorkingDays = Math.min(STANDARD_WORKING_DAYS, Math.max(1, Math.round((curDay / totalDaysInMonth) * STANDARD_WORKING_DAYS)));

    const expectedProduction = Math.round(dailyTarget * completedWorkingDays);
    const productionGap = Math.max(0, expectedProduction - achieve);
    const isBehind = achieve < expectedProduction;
    const dayWisePct = expectedProduction > 0 ? Math.min(100, Math.round((achieve / expectedProduction) * 100)) : 100;

    // Cache state
    window.PRODUCTION_DASHBOARD_DATA = {
        year: liveYear,
        month: liveMonthName,
        target,
        achieve,
        pending,
        achievePct,
        pendingPct,
        dailyTarget,
        completedWorkingDays,
        expectedProduction,
        productionGap,
        isBehind,
        dayWisePct
    };

    // =========================================================================
    // UPDATE DOM ELEMENTS IN MAIN INTERFACE VIEW
    // =========================================================================

    // ① CARD 1: PRODUCTION TARGET
    const elSalesVal = document.getElementById('kpiSalesVal');
    if (elSalesVal) {
        elSalesVal.innerHTML = `${target.toLocaleString()} <span style="font-size:0.55em; font-weight:800; color:#64748b;">PCS</span>`;
    }
    const elTargetSubVal = document.getElementById('kpiTargetSubVal');
    if (elTargetSubVal) {
        elTargetSubVal.innerText = `${target.toLocaleString()} PCS`;
    }
    const elTargetScope = document.getElementById('kpiTargetScope');
    if (elTargetScope) {
        elTargetScope.innerText = `Ceiling Fan (${liveMonthShortYear})`;
    }
    const elTargetProgressBar = document.getElementById('kpiTargetProgressBar');
    if (elTargetProgressBar) {
        elTargetProgressBar.style.width = '100%';
    }

    // ② CARD 2: ACHIEVEMENT
    const elPurchaseVal = document.getElementById('kpiPurchaseVal');
    if (elPurchaseVal) {
        elPurchaseVal.innerHTML = `${achieve.toLocaleString()} <span style="font-size:0.55em; font-weight:800; color:#64748b;">PCS</span>`;
    }
    const elAchieveSubVal = document.getElementById('kpiAchieveSubVal');
    if (elAchieveSubVal) {
        elAchieveSubVal.innerText = `${achieve.toLocaleString()} PCS`;
    }
    const elAchievePct = document.getElementById('kpiAchievePct');
    if (elAchievePct) {
        elAchievePct.innerText = `${achievePct}%`;
    }
    const elAchieveProgressBar = document.getElementById('kpiAchieveProgressBar');
    if (elAchieveProgressBar) {
        elAchieveProgressBar.style.width = `${Math.min(100, parseFloat(achievePct))}%`;
    }

    // ③ CARD 3: PENDING
    const elCashFlowVal = document.getElementById('kpiCashFlowVal');
    if (elCashFlowVal) {
        elCashFlowVal.innerHTML = `${pending.toLocaleString()} <span style="font-size:0.55em; font-weight:800; color:#64748b;">PCS</span>`;
    }
    const elPendingSubVal = document.getElementById('kpiPendingSubVal');
    if (elPendingSubVal) {
        elPendingSubVal.innerText = `${pending.toLocaleString()} PCS`;
    }
    const elPendingPct = document.getElementById('kpiPendingPct');
    if (elPendingPct) {
        elPendingPct.innerText = `${pendingPct}%`;
    }
    const elPendingProgressBar = document.getElementById('kpiPendingProgressBar');
    if (elPendingProgressBar) {
        elPendingProgressBar.style.width = `${Math.min(100, parseFloat(pendingPct))}%`;
    }

    // ④ CARD 4: DAY WISE TARGET & PRODUCTION GAP
    const elAccountVal = document.getElementById('kpiAccountVal');
    if (elAccountVal) {
        elAccountVal.innerHTML = `${dailyTarget.toLocaleString()} <span style="font-size:0.55em; font-weight:800; color:#64748b;">PCS / Day</span>`;
    }
    const elDayWiseExpected = document.getElementById('kpiDayWiseExpected');
    if (elDayWiseExpected) {
        elDayWiseExpected.innerText = `${expectedProduction.toLocaleString()} PCS`;
    }
    const elDayWiseGap = document.getElementById('kpiDayWiseGap');
    if (elDayWiseGap) {
        if (isBehind) {
            elDayWiseGap.innerHTML = `<span style="color:#ef4444;">${productionGap.toLocaleString()} PCS Behind</span>`;
        } else {
            const ahead = achieve - expectedProduction;
            elDayWiseGap.innerHTML = `<span style="color:#10b981;">On Track (+${ahead.toLocaleString()} PCS)</span>`;
        }
    }
    const elDayStatusBadge = document.getElementById('kpiDayStatusBadge');
    if (elDayStatusBadge) {
        if (isBehind) {
            elDayStatusBadge.innerText = 'BEHIND';
            elDayStatusBadge.style.background = '#fee2e2';
            elDayStatusBadge.style.color = '#dc2626';
        } else {
            elDayStatusBadge.innerText = 'ON TRACK';
            elDayStatusBadge.style.background = '#dcfce7';
            elDayStatusBadge.style.color = '#15803d';
        }
    }
    const elDayWiseProgressBar = document.getElementById('kpiDayWiseProgressBar');
    if (elDayWiseProgressBar) {
        elDayWiseProgressBar.style.width = `${dayWisePct}%`;
        elDayWiseProgressBar.style.background = isBehind ? '#ef4444' : '#10b981';
    }
    const elDayWiseLabel = document.getElementById('kpiDayWiseLabel');
    if (elDayWiseLabel) {
        elDayWiseLabel.innerText = `Day ${completedWorkingDays} of ${STANDARD_WORKING_DAYS} Working Days`;
    }

    // ⑤ SECTION 5: PREMIUM DONUT / PIE CHART
    // Circumference for r = 38 is 2 * PI * 38 = 238.761
    const C = 2 * Math.PI * 38;
    const ratioAchieve = target > 0 ? (achieve / target) : 0;
    const ratioPending = target > 0 ? (pending / target) : 1;

    const strokeAchieve = Math.max(0, Math.min(C, ratioAchieve * C));
    const strokePending = Math.max(0, Math.min(C, ratioPending * C));

    const elArcAchieve = document.getElementById('donutArcAchieve');
    if (elArcAchieve) {
        elArcAchieve.setAttribute('stroke-dasharray', `${strokeAchieve.toFixed(2)} ${C.toFixed(2)}`);
        elArcAchieve.setAttribute('stroke-dashoffset', '0');
    }

    const elArcPending = document.getElementById('donutArcPending');
    if (elArcPending) {
        elArcPending.setAttribute('stroke-dasharray', `${strokePending.toFixed(2)} ${C.toFixed(2)}`);
        elArcPending.setAttribute('stroke-dashoffset', `-${strokeAchieve.toFixed(2)}`);
    }

    const elCenterPct = document.getElementById('donutCenterPct');
    if (elCenterPct) {
        elCenterPct.innerText = `${achievePct}%`;
    }
    const elCenterTarget = document.getElementById('donutCenterTarget');
    if (elCenterTarget) {
        elCenterTarget.innerText = `Target: ${target.toLocaleString()} PCS`;
    }

    // Update 3D Pie Chart vector text values
    const el3DTarget = document.getElementById('pie3DTargetVal');
    if (el3DTarget) el3DTarget.textContent = target.toLocaleString();
    const el3DAchieve = document.getElementById('pie3DAchievePct');
    if (el3DAchieve) el3DAchieve.textContent = `${achievePct}%`;
    const el3DPending = document.getElementById('pie3DPendingPct');
    if (el3DPending) el3DPending.textContent = `${pendingPct}%`;

    // Donut Legend
    const elLegendTarget = document.getElementById('legendTargetVal');
    if (elLegendTarget) {
        elLegendTarget.innerText = `${target.toLocaleString()} PCS`;
    }
    const elLegendAchieve = document.getElementById('legendAchieveVal');
    if (elLegendAchieve) {
        elLegendAchieve.innerText = `${achieve.toLocaleString()} PCS - ${achievePct}%`;
    }
    const elLegendPending = document.getElementById('legendPendingVal');
    if (elLegendPending) {
        elLegendPending.innerText = `${pending.toLocaleString()} PCS - ${pendingPct}%`;
    }

    // Right Card: Yearly Target vs Achievement (Fiscal Year: July -> June)
    renderYearlyTargetVsAchievementChart(window.currentSelectedFiscalYear || '2026-2027');

    // ⑥ LEGACY / OPTIONAL COMPATIBILITY (if older elements exist)
    const elTargetOld = document.getElementById('valProdTarget');
    if (elTargetOld) elTargetOld.innerHTML = `${target.toLocaleString()} <span style="font-size:0.52em; font-weight:800;">PCS</span>`;
    const elAchieveOld = document.getElementById('valProdAchieve');
    if (elAchieveOld) elAchieveOld.innerHTML = `${achieve.toLocaleString()} <span style="font-size:0.52em; font-weight:800;">PCS</span>`;
}

// =========================================================================
// YEARLY TARGET VS ACHIEVEMENT CHART ENGINE (Fiscal Year: July -> June)
// =========================================================================

window.currentSelectedFiscalYear = '2026-2027';

const FISCAL_MONTH_SHORT = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const FISCAL_MONTH_FULL = [
    "July", "August", "September", "October", "November", "December",
    "January", "February", "March", "April", "May", "June"
];

/**
 * Retrieve 12 Months Production Targets from Production Plan (Ceiling Fan series)
 */
function getFiscalYearProductionTargets(fiscalYearStr) {
    const parts = String(fiscalYearStr || '2026-2027').split('-');
    const startYr = parseInt(parts[0]) || 2026;
    const endYr = parseInt(parts[1]) || (startYr + 1);
    const key = `July_${startYr}_June_${endYr}`;

    let planData = null;
    try {
        const stored = localStorage.getItem('mep_yearly_production_plans_all');
        if (stored) {
            const all = JSON.parse(stored);
            if (all[key]) planData = all[key];
            else {
                const altKey = Object.keys(all).find(k => k.includes(String(startYr)));
                if (altKey && all[altKey]) planData = all[altKey];
            }
        }
    } catch(e) {}

    if (!planData && typeof DEFAULT_PRODUCTION_PLAN !== 'undefined') {
        planData = DEFAULT_PRODUCTION_PLAN;
    }

    const monthlyTargets = new Array(12).fill(0);
    if (planData && Array.isArray(planData.categories)) {
        planData.categories.forEach(cat => {
            const isCeiling = cat.name && cat.name.toLowerCase().includes('ceiling');
            if (isCeiling && Array.isArray(cat.items)) {
                cat.items.forEach(it => {
                    if (Array.isArray(it.months)) {
                        it.months.forEach((v, idx) => {
                            if (idx < 12) {
                                monthlyTargets[idx] += (parseFloat(v) || 0);
                            }
                        });
                    }
                });
            }
        });
    }

    return monthlyTargets;
}

/**
 * Retrieve 12 Months Production Achievements from Yearly Production Summary ERP
 * STRICT FILTER: Ceiling Fan Series ONLY
 */
function getFiscalYearProductionAchievements(fiscalYearStr) {
    const parts = String(fiscalYearStr || '2026-2027').split('-');
    const startYr = parts[0] || '2026';

    let allERP = null;
    try {
        const stored = localStorage.getItem('mep_yearly_erp_production_data');
        if (stored) allERP = JSON.parse(stored);
    } catch(e) {}

    if (!allERP && typeof DEFAULT_YEARLY_ERP_DATA !== 'undefined') {
        allERP = DEFAULT_YEARLY_ERP_DATA;
    }

    const yearData = (allERP && allERP[startYr]) ? allERP[startYr] : (allERP && allERP["2026"] ? allERP["2026"] : []);
    const monthlyAchievements = new Array(12).fill(0);

    yearData.forEach(cat => {
        const isCeilingFan = cat.category && cat.category.toLowerCase().includes('ceiling') && !cat.category.toLowerCase().includes('blade');
        if (isCeilingFan && Array.isArray(cat.items)) {
            cat.items.forEach(item => {
                if (Array.isArray(item.months)) {
                    item.months.forEach((val, idx) => {
                        if (idx < 12) {
                            const mName = FISCAL_MONTH_FULL[idx];
                            let v = parseFloat(val) || 0;
                            if (typeof MONTHLY_ARCHIVE_ENGINE !== 'undefined' && typeof MONTHLY_ARCHIVE_ENGINE.resolveMonthlyItemProduction === 'function') {
                                const resolved = MONTHLY_ARCHIVE_ENGINE.resolveMonthlyItemProduction(startYr, mName, item.code, v);
                                if (resolved && resolved.qty > 0) {
                                    v = resolved.qty;
                                }
                            }
                            monthlyAchievements[idx] += v;
                        }
                    });
                }
            });
        }
    });

    return monthlyAchievements;
}

/**
 * Render Yearly Target vs Achievement Line Chart (Executive ERP Dashboard)
 */
function renderYearlyTargetVsAchievementChart(fiscalYearStr) {
    const fy = fiscalYearStr || window.currentSelectedFiscalYear || '2026-2027';
    const container = document.getElementById('yearlyChartContainer');
    if (!container) return;

    const targets = getFiscalYearProductionTargets(fy);
    const achievements = getFiscalYearProductionAchievements(fy);

    // Chart Dimensions
    const svgWidth = 720;
    const svgHeight = 220;
    const padLeft = 56;
    const padRight = 24;
    const padTop = 18;
    const padBottom = 32;

    const plotWidth = svgWidth - padLeft - padRight;
    const plotHeight = svgHeight - padTop - padBottom;

    // Y-Axis ceiling is strictly 50,000 Production per user specification
    const Y_MAX = 50000;
    const Y_INTERVALS = [50000, 40000, 30000, 20000, 10000, 0];

    const getX = (idx) => padLeft + (idx / 11) * plotWidth;
    const getY = (val) => padTop + (1 - Math.min(Y_MAX, Math.max(0, val)) / Y_MAX) * plotHeight;

    // Calculate Coordinates
    const targetPoints = targets.map((val, i) => ({ x: getX(i), y: getY(val), val, month: FISCAL_MONTH_SHORT[i], monthFull: FISCAL_MONTH_FULL[i] }));
    const achievePoints = achievements.map((val, i) => ({ x: getX(i), y: getY(val), val, month: FISCAL_MONTH_SHORT[i], monthFull: FISCAL_MONTH_FULL[i] }));

    // Generate Catmull-Rom smooth curves
    function createSpline(pts) {
        if (!pts || pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
        let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = i > 0 ? pts[i - 1] : pts[i];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = i < pts.length - 2 ? pts[i + 2] : p2;
            
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            
            d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
        }
        return d;
    }

    const targetPath = createSpline(targetPoints);
    const achievePath = createSpline(achievePoints);

    // Build SVG elements
    let svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" style="overflow: visible;">
        <defs>
            <!-- Drop Shadow for Target Curve (Deep Yellow) -->
            <filter id="shadowTarget" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#b45309" flood-opacity="0.22" />
            </filter>
            <!-- Drop Shadow for Achievement Curve (Deep Green) -->
            <filter id="shadowAchieve" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#15803d" flood-opacity="0.22" />
            </filter>
            <!-- Area Gradients for Subtle ERP Fill -->
            <linearGradient id="areaTargetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#d97706" stop-opacity="0.08" />
                <stop offset="100%" stop-color="#d97706" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="areaAchieveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#15803d" stop-opacity="0.10" />
                <stop offset="100%" stop-color="#15803d" stop-opacity="0.0" />
            </linearGradient>
        </defs>

        <!-- Horizontal Gridlines & Y-Axis Labels -->
    `;

    Y_INTERVALS.forEach((val) => {
        const y = getY(val);
        const isBase = val === 0;
        const lineStyle = isBase ? 'stroke="#cbd5e1" stroke-width="1.2"' : 'stroke="#e2e8f0" stroke-width="0.9" stroke-dasharray="3 3"';
        const labelText = val.toLocaleString();

        svg += `
            <line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${(padLeft + plotWidth).toFixed(1)}" y2="${y.toFixed(1)}" ${lineStyle} />
            <text x="${(padLeft - 8).toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="10.5px" fill="#94a3b8" font-weight="700" font-family="inherit">${labelText}</text>
        `;
    });

    // Subtle Area fills beneath curves
    const baseY = getY(0).toFixed(1);
    const targetAreaD = `${targetPath} L ${targetPoints[11].x.toFixed(1)},${baseY} L ${targetPoints[0].x.toFixed(1)},${baseY} Z`;
    const achieveAreaD = `${achievePath} L ${achievePoints[11].x.toFixed(1)},${baseY} L ${achievePoints[0].x.toFixed(1)},${baseY} Z`;

    svg += `
        <path d="${targetAreaD}" fill="url(#areaTargetGrad)" pointer-events="none" />
        <path d="${achieveAreaD}" fill="url(#areaAchieveGrad)" pointer-events="none" />
    `;

    // 1. Target Curve: Deep Yellow (#d97706)
    svg += `
        <path d="${targetPath}" fill="none" stroke="#d97706" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#shadowTarget)" />
    `;

    // 2. Achievement Curve: Deep Green (#15803d)
    svg += `
        <path d="${achievePath}" fill="none" stroke="#15803d" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#shadowAchieve)" />
    `;

    // 3. Data Points: Small Deep Red Dots (#b91c1c)
    // Production Target Dots
    targetPoints.forEach((pt, idx) => {
        svg += `
            <circle class="chart-dot target-dot" id="targetDot_${idx}" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.8" fill="#b91c1c" stroke="#ffffff" stroke-width="1.6" />
        `;
    });

    // Achievement Dots
    achievePoints.forEach((pt, idx) => {
        svg += `
            <circle class="chart-dot achieve-dot" id="achieveDot_${idx}" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.8" fill="#b91c1c" stroke="#ffffff" stroke-width="1.6" />
        `;
    });

    // X-Axis Month Labels
    FISCAL_MONTH_SHORT.forEach((m, idx) => {
        const x = getX(idx);
        const y = padTop + plotHeight + 20;
        svg += `
            <text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="11px" font-weight="750" fill="#64748b" font-family="inherit">${m}</text>
        `;
    });

    // Vertical Hover Guides & Interactive Overlay Columns
    FISCAL_MONTH_SHORT.forEach((m, idx) => {
        const x = getX(idx);
        const tVal = targets[idx];
        const aVal = achievements[idx];
        const mFull = FISCAL_MONTH_FULL[idx];

        svg += `
            <line class="chart-hover-line" id="hoverLine_${idx}" x1="${x.toFixed(1)}" y1="${padTop}" x2="${x.toFixed(1)}" y2="${(padTop + plotHeight).toFixed(1)}" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="2 2" opacity="0" pointer-events="none" />
            <rect class="chart-hover-col" x="${(x - 24).toFixed(1)}" y="${padTop}" width="48" height="${plotHeight}" fill="transparent" cursor="pointer"
                onmouseenter="handleChartHoverEnter(${idx}, '${mFull}', ${tVal}, ${aVal}, event)"
                onmousemove="handleChartHoverMove(event)"
                onmouseleave="handleChartHoverLeave(${idx})" />
        `;
    });

    svg += `</svg>`;

    // Insert Floating Tooltip container inside chart
    svg += `
        <div class="yearly-chart-tooltip" id="yearlyChartTooltip" style="display:none; position:absolute; pointer-events:none; z-index:100;">
            <div class="tt-header" id="ttMonthHeader">September 2026</div>
            <div class="tt-row">
                <span class="tt-indicator" style="background:#d97706;"></span>
                <span class="tt-label">Target:</span>
                <strong class="tt-val" id="ttTargetVal">40,000 PCS</strong>
            </div>
            <div class="tt-row">
                <span class="tt-indicator" style="background:#15803d;"></span>
                <span class="tt-label">Achievement:</span>
                <strong class="tt-val" id="ttAchieveVal">7,613 PCS</strong>
            </div>
            <div class="tt-row tt-gap-row" id="ttGapRow">
                <span class="tt-indicator" style="background:#ef4444;"></span>
                <span class="tt-label">Variance:</span>
                <strong class="tt-val" id="ttGapVal">-32,387 PCS</strong>
            </div>
        </div>
    `;

    container.innerHTML = svg;
}

// Tooltip Interaction Handlers
window.handleChartHoverEnter = function(idx, monthFull, targetVal, achieveVal, evt) {
    const line = document.getElementById(`hoverLine_${idx}`);
    if (line) line.setAttribute('opacity', '1');

    const tDot = document.getElementById(`targetDot_${idx}`);
    if (tDot) { tDot.setAttribute('r', '5.5'); tDot.setAttribute('stroke-width', '2'); }

    const aDot = document.getElementById(`achieveDot_${idx}`);
    if (aDot) { aDot.setAttribute('r', '5.5'); aDot.setAttribute('stroke-width', '2'); }

    const tt = document.getElementById('yearlyChartTooltip');
    const ttHead = document.getElementById('ttMonthHeader');
    const ttT = document.getElementById('ttTargetVal');
    const ttA = document.getElementById('ttAchieveVal');
    const ttG = document.getElementById('ttGapVal');

    if (tt && ttHead && ttT && ttA && ttG) {
        const fy = window.currentSelectedFiscalYear || '2026-2027';
        const parts = fy.split('-');
        const startYr = parts[0] || '2026';
        const endYr = parts[1] || '2027';
        const yr = idx < 6 ? startYr : endYr;

        ttHead.innerText = `${monthFull} ${yr}`;
        ttT.innerText = `${targetVal.toLocaleString()} PCS`;
        ttA.innerText = `${achieveVal.toLocaleString()} PCS`;

        const diff = achieveVal - targetVal;
        const diffStr = diff >= 0 ? `+${diff.toLocaleString()} PCS` : `-${Math.abs(diff).toLocaleString()} PCS`;
        ttG.innerText = diffStr;
        ttG.style.color = diff >= 0 ? '#10b981' : '#ef4444';

        tt.style.display = 'block';
        updateTooltipPosition(evt);
    }
};

window.handleChartHoverMove = function(evt) {
    updateTooltipPosition(evt);
};

window.handleChartHoverLeave = function(idx) {
    const line = document.getElementById(`hoverLine_${idx}`);
    if (line) line.setAttribute('opacity', '0');

    const tDot = document.getElementById(`targetDot_${idx}`);
    if (tDot) { tDot.setAttribute('r', '3.8'); tDot.setAttribute('stroke-width', '1.6'); }

    const aDot = document.getElementById(`achieveDot_${idx}`);
    if (aDot) { aDot.setAttribute('r', '3.8'); aDot.setAttribute('stroke-width', '1.6'); }

    const tt = document.getElementById('yearlyChartTooltip');
    if (tt) tt.style.display = 'none';
};

function updateTooltipPosition(evt) {
    const tt = document.getElementById('yearlyChartTooltip');
    const container = document.getElementById('yearlyChartContainer');
    if (!tt || !container) return;

    const rect = container.getBoundingClientRect();
    let x = evt.clientX - rect.left + 15;
    let y = evt.clientY - rect.top - 70;

    if (x + 220 > rect.width) {
        x = evt.clientX - rect.left - 230;
    }
    if (y < 5) y = 10;

    tt.style.left = `${x}px`;
    tt.style.top = `${y}px`;
}

// Global Fiscal Year Selection Handler
window.handleFiscalYearSelection = function(fy) {
    window.currentSelectedFiscalYear = fy;
    const curEl = document.getElementById('dashFilterCurrentDate');
    if (curEl) curEl.innerText = fy;

    const options = document.querySelectorAll('.dash-fy-option');
    options.forEach(opt => {
        if (opt.getAttribute('data-fy') === fy) opt.classList.add('active');
        else opt.classList.remove('active');
    });

    const menu = document.getElementById('dashFiscalYearMenu');
    if (menu) menu.classList.remove('show');

    const parts = fy.split('-');
    const subEl = document.getElementById('yearlyChartSubtitle');
    if (subEl) {
        subEl.innerText = `Fiscal Year: July ${parts[0]} → June ${parts[1]} (Ceiling Fan)`;
    }

    renderYearlyTargetVsAchievementChart(fy);
};

window.updateProductionDashboard = function(newData) {
    renderProductionPerformanceDashboard(newData);
};

// Real-time synchronization across browser tabs (when Production Plan or ERP Summary updates in localStorage)
window.addEventListener('storage', (e) => {
    if (e.key === 'mep_yearly_production_plans_all' || e.key === 'mep_yearly_erp_production_data' || e.key === 'mep_monthly_production_snapshots') {
        renderProductionPerformanceDashboard();
    }
});

// Re-calculate on window focus in case localStorage changed in another tab
window.addEventListener('focus', () => {
    renderProductionPerformanceDashboard();
});

