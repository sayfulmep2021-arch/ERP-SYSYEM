/**
 * Warehouse Module Engine
 * Controls Executive Warehouse Dashboard, Operational Tables,
 * KPI Metrics, and Dedicated 3-Page Navigation Menu.
 */
(function(window) {
    'use strict';

    // 1. Core Data Models for Warehouse Dashboard Overview
    const WAREHOUSE_METRICS = {
        overview: {
            totalSkus: '1,428',
            inventoryHealth: '98.6%',
            storageUtilization: '74.2%',
            activeWarehouses: '3 Hubs'
        },
        receiving: {
            todayBatches: '18',
            todayUnits: '4,250',
            grnCleared: '100%',
            pendingInspection: '0'
        },
        requisition: {
            activeRequests: '34',
            dispatchedToday: '28',
            inProcess: '6',
            fulfillmentRate: '94.2%'
        },
        spares: {
            totalSpares: '412',
            criticalSpares: '64',
            reorderAlerts: '8',
            stockValue: '৳ 14.8M'
        },
        status: {
            onTimeFulfillment: '94.2%',
            pendingActions: '12',
            accuracyRate: '99.4%',
            auditStatus: 'Passed'
        }
    };

    const RECENT_INTERSALES = [
        { id: 'REQ-2026-0941', dept: 'Fan Assembly Unit-1', items: 'Rotor & Stator Core 56"', qty: '650 Pcs', date: 'Today, 11:20 AM', priority: 'High', status: 'In Transit', statusClass: 'status-transit' },
        { id: 'REQ-2026-0940', dept: 'Winding & Coil Dept', items: 'Super Enamelled Wire 0.32mm', qty: '42 Spools', date: 'Today, 10:15 AM', priority: 'Normal', status: 'Completed', statusClass: 'status-completed' },
        { id: 'REQ-2026-0939', dept: 'Final Packing Line', items: 'Master Packaging Cartons 56"', qty: '1,200 Sets', date: 'Today, 09:40 AM', priority: 'Normal', status: 'Completed', statusClass: 'status-completed' },
        { id: 'REQ-2026-0938', dept: 'Die Casting Section', items: 'Aluminium Ingot Grade-A', qty: '2,500 Kg', date: 'Today, 08:30 AM', priority: 'Urgent', status: 'Pending', statusClass: 'status-pending' }
    ];

    const RECENT_RECEIVING = [
        { grn: 'GRN-88412', po: 'PO-2026-781', supplier: 'Apex Metals Ltd', category: 'Raw Materials (Copper)', qty: '1,800 Kg', qc: 'Passed', status: 'Stored', statusClass: 'status-completed' },
        { grn: 'GRN-88411', po: 'PO-2026-779', supplier: 'National Polymers', category: 'Canopy & Blade Parts', qty: '3,200 Pcs', qc: 'Passed', status: 'Stored', statusClass: 'status-completed' },
        { grn: 'GRN-88410', po: 'PO-2026-775', supplier: 'SKF Precision Co.', category: 'Ball Bearings 6201/6202', qty: '2,400 Pcs', qc: 'Passed', status: 'Stored', statusClass: 'status-completed' },
        { grn: 'GRN-88409', po: 'PO-2026-768', supplier: 'Delta Fasteners', category: 'Downrod Safety Bolts', qty: '5,000 Pcs', qc: 'Passed', status: 'Stored', statusClass: 'status-completed' }
    ];

    const SPARES_STOCK_LEVELS = [
        { name: 'Ball Bearing 6202-2RS (High Speed)', category: 'Mechanical Spare', inStock: 480, reorder: 150, percent: 85, colorClass: 'fill-emerald', status: 'Optimal' },
        { name: 'Starting Capacitor 2.5µF 450V', category: 'Electrical Spare', inStock: 620, reorder: 200, percent: 90, colorClass: 'fill-emerald', status: 'Optimal' },
        { name: 'Shaft 18mm Hardened Ground Steel', category: 'Precision Component', inStock: 110, reorder: 100, percent: 45, colorClass: 'fill-amber', status: 'Normal' },
        { name: 'Rubber Bush & Grommet Damper', category: 'Hardware Consumable', inStock: 35, reorder: 80, percent: 22, colorClass: 'fill-rose', status: 'Low Stock' }
    ];

    const AUDIT_ACTIVITY_STREAM = [
        { time: '12:45 PM', text: 'Consignment GRN-88412 verified and moved to Rack B-04 by Sayful Islam.', dot: 'dot-green' },
        { time: '11:22 AM', text: 'Intersales Requisition REQ-2026-0941 approved for Fan Assembly Unit-1.', dot: 'dot-blue' },
        { time: '10:05 AM', text: 'Daily physical receiving audit completed for 18 material batches.', dot: 'dot-green' },
        { time: '09:15 AM', text: 'Low stock notification flagged for Rubber Bush & Grommet Damper (35 left).', dot: 'dot-amber' }
    ];

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
     * Render Intersales Requisition Table in Dashboard
     */
    function renderIntersalesSummary() {
        const tbody = document.getElementById('whIntersalesTableBody');
        if (!tbody) return;

        tbody.innerHTML = RECENT_INTERSALES.map(item => `
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
     * Render Receiving Summary Table in Dashboard
     */
    function renderReceivingSummary() {
        const tbody = document.getElementById('whReceivingTableBody');
        if (!tbody) return;

        tbody.innerHTML = RECENT_RECEIVING.map(item => `
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

        container.innerHTML = SPARES_STOCK_LEVELS.map(item => `
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

        container.innerHTML = AUDIT_ACTIVITY_STREAM.map(item => `
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
        // If master portal_dashboard_runtime.js is present (on index.html),
        // let the master runtime drive the clock with zero competition.
        const isMasterClockRunning = (typeof window.updateClosingERPStatus === 'function' || !!document.getElementById('mainInterfaceView'));
        if (!isMasterClockRunning) {
            updateWarehouseLiveClock();
            setInterval(updateWarehouseLiveClock, 1000);
        }

        renderIntersalesSummary();
        renderReceivingSummary();
        renderSparesGauges();
        renderActivityStream();

        // Render dynamic alternative module switcher cards at bottom of sidebar
        if (typeof window.renderSidebarDynamicModels === 'function') {
            window.renderSidebarDynamicModels('warehouse');
        }
    }

    // Expose Global Public API
    window.WAREHOUSE_ENGINE = {
        init: initWarehouseEngine,
        metrics: WAREHOUSE_METRICS,
        refresh: function() {
            renderIntersalesSummary();
            renderReceivingSummary();
            renderSparesGauges();
            renderActivityStream();
            if (typeof window.showToast === 'function') {
                window.showToast("Warehouse metrics updated successfully.");
            }
        }
    };

    // Auto-init if element is present
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('warehouseModuleView')) {
            initWarehouseEngine();
        }
    });

})(window);
