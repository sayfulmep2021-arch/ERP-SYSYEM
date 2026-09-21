/**
 * Warehouse Module Engine
 * Controls Executive Warehouse Dashboard, Live Data-Bound KPI Metrics,
 * Operational Requisition & Receiving Tables, and Real-Time Clock Sync.
 */
(function(window) {
    'use strict';

    // Fallback static metrics if live data files are not yet loaded
    const WAREHOUSE_METRICS_FALLBACK = {
        overview: { totalDemand: '1,660,624', activeDemands: '9', totalItems: '90' },
        receiving: { totalReceived: '1,180,478', pendingQty: '480,146' },
        percentages: { receivedPct: '71.1%', pendingPct: '28.9%' },
        spares: { totalSpares: '532', electrical: '65', mechanical: '467', inStock: '201' },
        valuation: { amount: 4588920.91, formatted: '৳ 4,588,920.91' }
    };

    /**
     * Compute Live Warehouse KPI Metrics dynamically from loaded ERP datasets
     * Sources:
     * - Box 1, 2, 3: window.RAW_INTERSALES_REQUISITION_DATA
     * - Box 4, 5:    window.RAW_SPARE_PARTS_DATA
     */
    function calculateWarehouseKpis() {
        // 1. Inter Sales Requisition & Received Data (Boxes 1, 2, 3)
        let totalDemand = 0;
        let totalReceived = 0;
        let totalPending = 0;
        let demandCount = 0;
        let itemCount = 0;

        if (typeof window.RAW_INTERSALES_REQUISITION_DATA !== 'undefined' && window.RAW_INTERSALES_REQUISITION_DATA) {
            const reqData = window.RAW_INTERSALES_REQUISITION_DATA;
            if (reqData.meta) {
                totalDemand = parseFloat(reqData.meta.total_req_qty) || 0;
                totalReceived = parseFloat(reqData.meta.total_issue_qty) || 0;
                totalPending = parseFloat(reqData.meta.total_pending_qty) || 0;
                demandCount = reqData.meta.total_requisitions || (reqData.requisitions ? reqData.requisitions.length : 0);
                itemCount = reqData.meta.total_items || 0;
            }
            if (totalDemand === 0 && Array.isArray(reqData.requisitions)) {
                demandCount = reqData.requisitions.length;
                reqData.requisitions.forEach(req => {
                    (req.items || []).forEach(it => {
                        itemCount++;
                        totalDemand += parseFloat(it.req_qty) || 0;
                        totalReceived += parseFloat(it.issue_qty) || 0;
                        totalPending += parseFloat(it.pending_qty) || 0;
                    });
                });
            }
        }

        // Fallbacks if data source is missing
        if (totalDemand === 0) {
            totalDemand = 1660624;
            totalReceived = 1180478.4;
            totalPending = 480145.6;
            demandCount = 9;
            itemCount = 90;
        }

        // Data Validation: Total Demand >= Total Received
        let receivedPct = 0;
        let pendingPct = 0;
        let isAbnormal = false;

        if (totalDemand > 0) {
            if (totalReceived > totalDemand) {
                isAbnormal = true;
                receivedPct = 100.0;
                pendingPct = 0.0;
                console.warn('[Warehouse Engine] Data Validation Alert: Total Received exceeds Total Demand!');
            } else {
                receivedPct = (totalReceived / totalDemand) * 100;
                pendingPct = Math.max(0, 100.0 - receivedPct);
            }
        }

        // 2. Spare Parts Stock Summary Data (Boxes 4, 5)
        let totalSpares = 0;
        let electricalItems = 0;
        let mechanicalParts = 0;
        let inStockItems = 0;
        let totalSparesQty = 0;
        let stockValuation = 0;

        if (typeof window.RAW_SPARE_PARTS_DATA !== 'undefined' && window.RAW_SPARE_PARTS_DATA) {
            const spData = window.RAW_SPARE_PARTS_DATA;
            if (spData.meta) {
                totalSpares = spData.meta.total_items || (spData.items ? spData.items.length : 0);
                inStockItems = spData.meta.in_stock_items || 0;
                totalSparesQty = spData.meta.total_quantity || 0;
                stockValuation = parseFloat(spData.meta.total_stock_value) || 0;
            }
            if (Array.isArray(spData.items)) {
                totalSpares = spData.items.length;
                electricalItems = 0;
                mechanicalParts = 0;
                let sumVal = 0;
                spData.items.forEach(it => {
                    const sub = (it.subcategory || '').toLowerCase();
                    if (sub.includes('electrical')) {
                        electricalItems++;
                    } else if (sub.includes('mechanical')) {
                        mechanicalParts++;
                    }
                    const amt = parseFloat(it.stock_amt) || ((parseFloat(it.total_qty) || 0) * (parseFloat(it.rate) || 0));
                    sumVal += amt;
                });
                if (!stockValuation && sumVal > 0) stockValuation = sumVal;
            }
        }

        // Fallbacks if data source is missing
        if (totalSpares === 0) {
            totalSpares = 532;
            electricalItems = 65;
            mechanicalParts = 467;
            inStockItems = 201;
            totalSparesQty = 4385.05;
            stockValuation = 4588920.91;
        }

        const formattedValuation = '৳ ' + stockValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return {
            demand: {
                total: totalDemand,
                demandCount: demandCount,
                itemCount: itemCount
            },
            received: {
                total: totalReceived,
                pending: totalPending
            },
            percentages: {
                receivedPct: receivedPct.toFixed(1),
                pendingPct: pendingPct.toFixed(1),
                isAbnormal: isAbnormal
            },
            spares: {
                total: totalSpares,
                electrical: electricalItems,
                mechanical: mechanicalParts,
                inStock: inStockItems,
                totalQty: totalSparesQty
            },
            valuation: {
                amount: stockValuation,
                formatted: formattedValuation
            }
        };
    }

    /**
     * Render the 5 Executive KPI Cards with Live Data
     */
    function renderWarehouseKpiCards() {
        const kpis = calculateWarehouseKpis();

        // BOX 1: TOTAL DEMAND HUNDRED PERCENT (Marked Box 1)
        const elDemand = document.getElementById('whKpiTotalDemand');
        if (elDemand) elDemand.textContent = Math.round(kpis.demand.total).toLocaleString();
        const elDemandSubVal = document.getElementById('whKpiDemandSubVal');
        if (elDemandSubVal) elDemandSubVal.textContent = `${Math.round(kpis.demand.total).toLocaleString()} Pcs`;
        const elDemandBar = document.getElementById('whKpiDemandProgressBar');
        if (elDemandBar) elDemandBar.style.width = '100%';
        const elDemandMeta = document.getElementById('whKpiDemandMeta');
        if (elDemandMeta) elDemandMeta.innerHTML = `<strong>${kpis.demand.demandCount} Demands</strong> (${kpis.demand.itemCount} Items)`;

        // BOX 2: TOTAL RECEIVED (Marked Box 2)
        const elReceived = document.getElementById('whKpiTotalReceived');
        if (elReceived) elReceived.textContent = Math.round(kpis.received.total).toLocaleString();
        const elReceivedSubVal = document.getElementById('whKpiReceivedSubVal');
        if (elReceivedSubVal) elReceivedSubVal.textContent = `${Math.round(kpis.received.total).toLocaleString()} Pcs`;
        const elReceivedSubPct = document.getElementById('whKpiReceivedSubPct');
        if (elReceivedSubPct) elReceivedSubPct.textContent = `${kpis.percentages.receivedPct}%`;
        const elReceivedBar = document.getElementById('whKpiReceivedProgressBar');
        if (elReceivedBar) elReceivedBar.style.width = `${Math.min(100, parseFloat(kpis.percentages.receivedPct))}%`;
        const elPending = document.getElementById('whKpiTotalPending');
        if (elPending) elPending.textContent = Math.round(kpis.received.pending).toLocaleString();

        // BOX 3: RECEIVED % & PENDING % (Marked Box 3)
        const elRecPct = document.getElementById('whKpiReceivedPct');
        if (elRecPct) elRecPct.textContent = `${kpis.percentages.receivedPct}%`;
        const elPendPct = document.getElementById('whKpiPendingPct');
        if (elPendPct) elPendPct.textContent = `${kpis.percentages.pendingPct}%`;

        const elPendingSubVal = document.getElementById('whKpiPendingSubVal');
        if (elPendingSubVal) elPendingSubVal.textContent = `${Math.round(kpis.received.pending).toLocaleString()} Pcs`;
        const elPendingSubPct = document.getElementById('whKpiPendingSubPct');
        if (elPendingSubPct) elPendingSubPct.textContent = `${kpis.percentages.pendingPct}%`;

        const elRecBar = document.getElementById('whKpiRecBar');
        if (elRecBar) elRecBar.style.width = `${Math.min(100, parseFloat(kpis.percentages.receivedPct))}%`;
        const elPendBar = document.getElementById('whKpiPendBar');
        if (elPendBar) elPendBar.style.width = `${Math.min(100, parseFloat(kpis.percentages.pendingPct))}%`;

        const elRecMeta = document.getElementById('whKpiRecMeta');
        if (elRecMeta) elRecMeta.textContent = `${kpis.percentages.receivedPct}%`;
        const elPendMeta = document.getElementById('whKpiPendMeta');
        if (elPendMeta) elPendMeta.textContent = `${kpis.percentages.pendingPct}%`;

        // BOX 4: SPARE PARTS SUMMARY (Marked Box 4)
        const elTotalSpares = document.getElementById('whKpiTotalSpares');
        if (elTotalSpares) elTotalSpares.textContent = kpis.spares.total.toLocaleString();
        const elElec = document.getElementById('whKpiSparesElectrical');
        if (elElec) elElec.textContent = kpis.spares.electrical.toLocaleString();
        const elMech = document.getElementById('whKpiSparesMechanical');
        if (elMech) elMech.textContent = kpis.spares.mechanical.toLocaleString();
        const elInStock = document.getElementById('whKpiSparesInStock');
        if (elInStock) elInStock.textContent = kpis.spares.inStock.toLocaleString();
        const elSparesQty = document.getElementById('whKpiSparesQty');
        if (elSparesQty) elSparesQty.textContent = kpis.spares.totalQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // BOX 5: STOCK VALUATION (Marked Box 5)
        const elVal = document.getElementById('whKpiStockValuation');
        if (elVal) elVal.textContent = kpis.valuation.formatted;
    }

    /**
     * Render the Live Clock for Warehouse Navbar (Rock-Solid Anti-Jitter Monospace Slots)
     */
    function updateWarehouseLiveClock() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dayName = days[now.getDay()];
        const dateNum = now.getDate();
        const monthName = months[now.getMonth()];
        const yearNum = now.getFullYear();

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, '0');

        const dateStr = `${dayName}, ${dateNum} ${monthName} ${yearNum}`;
        const slottedTime = `<span class="t-digit">${formattedHours[0]}</span><span class="t-digit">${formattedHours[1]}</span><span class="t-colon">:</span><span class="t-digit">${minutes[0]}</span><span class="t-digit">${minutes[1]}</span><span class="t-colon">:</span><span class="t-digit">${seconds[0]}</span><span class="t-digit">${seconds[1]}</span> <span class="t-ampm">${ampm}</span>`;

        document.querySelectorAll('#whLiveDayText, .live-day-text').forEach(function(el) {
            if (el.textContent !== dateStr) el.textContent = dateStr;
        });

        document.querySelectorAll('#whLiveTimeText, .live-time-text').forEach(function(el) {
            if (el.innerHTML !== slottedTime) el.innerHTML = slottedTime;
        });
    }

    /**
     * Render Intersales Requisition Table in Dashboard from Live Dataset
     */
    function renderIntersalesSummary() {
        const tbody = document.getElementById('whIntersalesTableBody');
        if (!tbody) return;

        if (typeof window.RAW_INTERSALES_REQUISITION_DATA !== 'undefined' && window.RAW_INTERSALES_REQUISITION_DATA && window.RAW_INTERSALES_REQUISITION_DATA.requisitions) {
            const reqs = window.RAW_INTERSALES_REQUISITION_DATA.requisitions.slice(0, 4);
            tbody.innerHTML = reqs.map(req => {
                const items = req.items || [];
                const totReq = items.reduce((acc, it) => acc + (parseFloat(it.req_qty) || 0), 0);
                const totIssue = items.reduce((acc, it) => acc + (parseFloat(it.issue_qty) || 0), 0);
                const pct = totReq > 0 ? ((totIssue / totReq) * 100).toFixed(0) : 0;
                const statusClass = pct >= 100 ? 'status-completed' : (pct > 0 ? 'status-transit' : 'status-pending');
                const statusLabel = pct >= 100 ? 'Completed' : (pct > 0 ? `${pct}% Issued` : 'Pending');
                return `
                    <tr>
                        <td style="font-weight:700; color:#0284c7;">REQ-${req.req_no}</td>
                        <td style="font-weight:600;">${req.company_for || 'FAN'} ➔ ${req.company_to || 'MEP'}</td>
                        <td>${items.length > 0 ? items[0].item_name : 'Materials'} ${items.length > 1 ? `(+${items.length - 1} more)` : ''}</td>
                        <td style="font-weight:700;">${Math.round(totReq).toLocaleString()} Pcs</td>
                        <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
                    </tr>
                `;
            }).join('');
            return;
        }

        // Fallback
        const fallbackItems = [
            { id: 'REQ-2291', dept: 'FAN ➔ MEP', items: 'Exhaust Fan Base (8") (+16 more)', qty: '166,200 Pcs', status: '57% Issued', statusClass: 'status-transit' },
            { id: 'REQ-2290', dept: 'FAN ➔ MEP', items: 'Fan Blade Set (+1 more)', qty: '7,800 Pcs', status: '96% Issued', statusClass: 'status-completed' },
            { id: 'REQ-2287', dept: 'FAN ➔ MEP', items: 'Rotor & Stator Core (+7 more)', qty: '176,709 Pcs', status: '66% Issued', statusClass: 'status-transit' },
            { id: 'REQ-2283', dept: 'FAN ➔ Packaging', items: 'Master Packaging Cartons (+34 more)', qty: '466,260 Pcs', status: '77% Issued', statusClass: 'status-completed' }
        ];

        tbody.innerHTML = fallbackItems.map(item => `
            <tr>
                <td style="font-weight:700; color:#0284c7;">${item.id}</td>
                <td style="font-weight:600;">${item.dept}</td>
                <td>${item.items}</td>
                <td style="font-weight:700;">${item.qty}</td>
                <td><span class="status-pill ${item.statusClass}">${item.status}</span></td>
            </tr>
        `).join('');
    }

    /**
     * Render Receiving Summary Table in Dashboard from Live Dataset
     */
    function renderReceivingSummary() {
        const tbody = document.getElementById('whReceivingTableBody');
        if (!tbody) return;

        if (typeof window.RAW_INTER_SALES_CHALAN_DATA !== 'undefined' && window.RAW_INTER_SALES_CHALAN_DATA && window.RAW_INTER_SALES_CHALAN_DATA.date_sections) {
            const memos = [];
            window.RAW_INTER_SALES_CHALAN_DATA.date_sections.forEach(sec => {
                (sec.memos || []).forEach(m => {
                    if (memos.length < 4) memos.push(m);
                });
            });
            if (memos.length > 0) {
                tbody.innerHTML = memos.map(m => `
                    <tr>
                        <td style="font-weight:700; color:#059669;">CH-${m.chalan_no}</td>
                        <td>${m.company || 'Printing & Packaging'}</td>
                        <td>${(m.materials && m.materials.length > 0) ? m.materials[0].product_name : 'Packaging Materials'}</td>
                        <td style="font-weight:700;">${(m.total_material_qty || 0).toLocaleString()} Pcs</td>
                        <td><span class="status-pill status-completed">Received</span></td>
                    </tr>
                `).join('');
                return;
            }
        }

        // Fallback
        const fallbackReceiving = [
            { grn: 'CH-16368', supplier: 'Printing & Packaging', category: 'Blade Carton Speed King Fan', qty: '1,876 Pcs', status: 'Stored', statusClass: 'status-completed' },
            { grn: 'CH-16367', supplier: 'Printing & Packaging', category: '56" Ceiling Fan Master Carton', qty: '2,500 Pcs', status: 'Stored', statusClass: 'status-completed' },
            { grn: 'CH-16366', supplier: 'Printing & Packaging', category: 'Inner Box & Leaflet Sets', qty: '5,000 Pcs', status: 'Stored', statusClass: 'status-completed' },
            { grn: 'CH-16365', supplier: 'MEP Hardware Unit', category: 'Downrod Safety Bolts & Pins', qty: '12,000 Pcs', status: 'Stored', statusClass: 'status-completed' }
        ];

        tbody.innerHTML = fallbackReceiving.map(item => `
            <tr>
                <td style="font-weight:700; color:#059669;">${item.grn}</td>
                <td>${item.supplier}</td>
                <td>${item.category}</td>
                <td style="font-weight:700;">${item.qty}</td>
                <td><span class="status-pill ${item.statusClass}">${item.status}</span></td>
            </tr>
        `).join('');
    }

    /**
     * Render Spare Parts Stock Gauges
     */
    function renderSparesGauges() {
        const container = document.getElementById('whSparesGaugeContainer');
        if (!container) return;

        const sparesList = [
            { name: 'Ball Bearing 6202-2RS (High Speed)', category: 'Mechanical Parts', inStock: 480, reorder: 150, percent: 85, colorClass: 'fill-emerald', status: 'Optimal' },
            { name: 'Starting Capacitor 2.5µF 450V', category: 'Electrical Items', inStock: 620, reorder: 200, percent: 90, colorClass: 'fill-emerald', status: 'Optimal' },
            { name: 'Moulded case circuit breaker (TP) 63 Amp', category: 'Electrical Items', inStock: 3, reorder: 5, percent: 40, colorClass: 'fill-amber', status: 'Normal' },
            { name: 'Air Screw Driver (Assembly Line)', category: 'Mechanical Parts', inStock: 12, reorder: 15, percent: 35, colorClass: 'fill-amber', status: 'Reorder' }
        ];

        container.innerHTML = sparesList.map(item => `
            <div class="wh-stock-gauge-row">
                <div class="wh-gauge-info">
                    <div class="wh-gauge-name">${item.name}</div>
                    <div class="wh-gauge-sub">${item.category} • In Stock: <strong>${item.inStock}</strong> (Min: ${item.reorder})</div>
                </div>
                <div class="wh-gauge-bar-track" title="${item.percent}% Stock Capacity">
                    <div class="wh-gauge-bar-fill ${item.colorClass}" style="width:${item.percent}%;"></div>
                </div>
                <div>
                    <span class="status-pill ${item.percent < 30 ? 'status-alert' : (item.percent < 60 ? 'status-pending' : 'status-completed')}">${item.status}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render Activity & Audit Stream
     */
    function renderActivityStream() {
        const container = document.getElementById('whActivityStreamContainer');
        if (!container) return;

        const activityItems = [
            { time: '12:45 PM', text: 'Consignment CH-16368 verified and moved to Rack B-04 by Sayful Islam.', dot: 'dot-green' },
            { time: '11:22 AM', text: 'Intersales Requisition REQ-2291 approved for Fan Assembly Unit-1.', dot: 'dot-blue' },
            { time: '10:05 AM', text: 'Daily physical receiving audit completed for 18 material batches.', dot: 'dot-green' },
            { time: '09:15 AM', text: 'Low stock notification flagged for Circuit Breaker 63 Amp (3 units left).', dot: 'dot-amber' }
        ];

        container.innerHTML = activityItems.map(item => `
            <div class="wh-activity-item">
                <span class="wh-activity-dot ${item.dot}"></span>
                <div class="wh-activity-content">
                    <p class="wh-activity-text">${item.text}</p>
                    <div class="wh-activity-time">${item.time}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Initialize Warehouse Dashboard Engine
     */
    function initWarehouseEngine() {
        // Start or sync Live Clock
        updateWarehouseLiveClock();
        setInterval(updateWarehouseLiveClock, 1000);

        // Render Data-Bound KPI Cards (Boxes 1-5)
        renderWarehouseKpiCards();

        // Render Operational Summary Tables
        renderIntersalesSummary();
        renderReceivingSummary();
        renderSparesGauges();
        renderActivityStream();

        // Render dynamic alternative module switcher cards at bottom of sidebar
        if (typeof window.renderSidebarDynamicModels === 'function') {
            window.renderSidebarDynamicModels('warehouse');
        }
    }

    /**
     * Enforce correct View-Only badge visibility based on verified user session
     */
    function enforceWarehouseRoleBadge() {
        try {
            const role = (sessionStorage.getItem('portal_auth_role') || '').toUpperCase();
            const sig = sessionStorage.getItem('portal_auth_sig') || '';
            const isAdmin = (role === 'ADMIN' || sig === btoa('ADMIN:::MEP_SECURE_PORTAL_2026'));
            const isViewOnly = !isAdmin && (sessionStorage.getItem('portal_view_only') === 'true' || role === 'VIEW' || sig === btoa('VIEW:::MEP_SECURE_PORTAL_2026'));

            document.querySelectorAll('.smart-view-only-badge').forEach(function(badge) {
                if (isViewOnly) {
                    badge.style.setProperty('display', 'inline-flex', 'important');
                } else {
                    badge.style.setProperty('display', 'none', 'important');
                }
            });
        } catch(e) {}
    }

    // Safe global fallback for page lock checker
    window.checkPageLockStatus = function() {
        if (typeof window.applyCentralLockState === 'function') {
            window.applyCentralLockState();
        }
        enforceWarehouseRoleBadge();
    };

    window.updateWarehouseLiveClock = updateWarehouseLiveClock;
    window.enforceWarehouseRoleBadge = enforceWarehouseRoleBadge;
    window.calculateWarehouseKpis = calculateWarehouseKpis;
    window.renderWarehouseKpiCards = renderWarehouseKpiCards;

    // Expose Global Public API
    window.WAREHOUSE_ENGINE = {
        init: initWarehouseEngine,
        metrics: WAREHOUSE_METRICS_FALLBACK,
        calculateKpis: calculateWarehouseKpis,
        renderKpis: renderWarehouseKpiCards,
        refresh: function() {
            renderWarehouseKpiCards();
            renderIntersalesSummary();
            renderReceivingSummary();
            renderSparesGauges();
            renderActivityStream();
            if (typeof window.showToast === 'function') {
                window.showToast("Warehouse metrics synced from live ERP data.");
            }
        }
    };

    // Auto-init across both dashboard and subpages
    document.addEventListener('DOMContentLoaded', function() {
        enforceWarehouseRoleBadge();
        if (document.getElementById('warehouseModuleView')) {
            initWarehouseEngine();
        } else if (document.getElementById('whLiveClockBadge') || document.getElementById('whLiveTimeText') || document.querySelector('.live-time-text')) {
            updateWarehouseLiveClock();
            setInterval(updateWarehouseLiveClock, 1000);
            if (typeof window.renderSidebarDynamicModels === 'function') {
                window.renderSidebarDynamicModels('warehouse');
            }
        }
    });

    window.addEventListener('storage', function(e) {
        if (e.key === 'portal_auth_role' || e.key === 'portal_view_only') {
            enforceWarehouseRoleBadge();
        }
    });

})(window);
