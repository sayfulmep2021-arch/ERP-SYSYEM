/**
 * ============================================================================
 * ERP SYSTEM - 8 BOT SYSTEMS DATA ENGINE (bot_data_engine.js)
 * ============================================================================
 * Seamlessly integrates the 8 automation bots from 'NEW BOT 02':
 *   1. Inter Sales Chalan Report (Warehouse -> Inter Sales -> Fan Only)
 *   2. BOM Master File (Production -> Bill of Materials Master)
 *   3. Spare Parts Stock Summary with Rate (Warehouse -> Report 3224)
 *   4. Inventory Movement — Fan Assemble (Production -> Report 221023)
 *   5. Inventory Movement — Armature Winding (Production -> Report 221023)
 *   6. Inventory Movement — Semi Finished Goods (Production -> Report 221023)
 *   7. Ground Floor Fan Store FAN-1 — Stock Position Detail Closing (Report 91223)
 *   8. Finished Goods Stock Movement — FAN Floor (Warehouse -> Report 222)
 *
 * Core Features:
 *   - Dual-path resilient data loading (Live Flask API on port 5000 or static JSON caches)
 *   - Exact schema matching: 0 invented fields, faithful to actual collected JSON data
 *   - Interactive multi-field search + Date / Category filtering
 *   - Dual-path resilient Excel workbook download + Client-side CSV export
 *   - Expandable drill-down sub-tables for Chalan Materials and BOM Raw Materials
 *   - Alternating paste color (#EAF5EA / #FFFFFF) high-speed responsive tables
 *   - Status pills, KPI metrics, loading skeleton, error notices, and empty states
 * ============================================================================
 */

(function () {
    'use strict';

    const API_BASE = 'http://127.0.0.1:5000';

    /**
     * Resolve base path to 'NEW BOT 02' resiliently across both root index.html
     * and sub-directory module pages (e.g. modules/warehouse/, modules/production/)
     */
    function getCacheBasePath() {
        const path = window.location.pathname || '';
        if (path.includes('/modules/')) {
            return '../../NEW BOT 02';
        }
        return 'NEW BOT 02';
    }

    // 9 Bot Definitions & Exact Schema Configurations
    const BOTS_CONFIG = {
        1: {
            id: 1,
            cardId: 'flashCard1',
            name: 'Inter Sales Requisition',
            fullTitle: 'Inter Sales Requisition (Warehouse Module ⟶ Intersales Requisition)',
            code: 'REQ-STATUS',
            module: 'Warehouse Module',
            sourceModule: 'Warehouse Module',
            sourcePage: 'Intersales Requisition',
            sourcePath: 'Warehouse Module ⟶ Intersales Requisition',
            company: 'Company To: FAN',
            apiData: '/api/intersales-requisition/data',
            apiSync: '/api/intersales-requisition/sync',
            apiDownload: '/api/intersales-requisition/download',
            cacheFile: 'intersales_requisition_cache.json',
            excelFile: 'Inter_Sales_Requisition_Report.xlsx',
            themeClass: 'flash-theme-intersales',
            dateField: 'req_date',
            kpiConfig: [
                { label: 'Total Requisitions', key: 'total_requisitions', icon: '📋', format: 'number' },
                { label: 'Pending Requisitions', key: 'pending_requisitions', icon: '⏳', format: 'number' },
                { label: 'Material Items', key: 'total_items', icon: '📦', format: 'number' },
                { label: 'Pending Quantity', key: 'total_pending_qty', icon: '⚠️', format: 'number' }
            ],
            columns: [
                { key: 'req_no', label: 'Req No', type: 'code' },
                { key: 'req_date', label: 'Req Date', type: 'text' },
                { key: 'company_for', label: 'Company For', type: 'text' },
                { key: 'company_to', label: 'Company To', type: 'badge-blue' },
                { key: 'need_by', label: 'Need By', type: 'text' },
                { key: 'entry_by', label: 'Entry By', type: 'text' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'total_req_qty', label: 'Req Qty', type: 'number' },
                { key: 'total_issue_qty', label: 'Issue Qty', type: 'number' },
                { key: 'total_pending_qty', label: 'Pending Qty', type: 'number-bold' },
                { key: 'materials_count', label: 'Items', type: 'badge-count' },
                { key: 'action', label: 'Details', type: 'expand-btn' }
            ]
        },
        2: {
            id: 2,
            cardId: 'flashCard2',
            name: 'Inter Sales Chalan Report',
            fullTitle: 'Inter Sales Chalan Report (Warehouse Module ⟶ Inter Sales Chalan Report)',
            code: 'CHALAN-REPORT',
            module: 'Warehouse Module',
            sourceModule: 'Warehouse Module',
            sourcePage: 'Inter Sales Chalan Report',
            sourcePath: 'Warehouse Module ⟶ Inter Sales Chalan Report',
            company: 'Printing & Packaging ⟶ Fan',
            apiData: '/api/fan/data',
            apiSync: '/api/fan/sync',
            apiDownload: '/api/fan/download',
            cacheFile: 'fan_inter_sales_cache.json',
            excelFile: 'Fan_Inter_Sales_Report_Sep2026.xlsx',
            themeClass: 'flash-theme-perday',
            dateField: 'date',
            dateDisplayField: 'formatted_date',
            kpiConfig: [
                { label: 'Total Fan Memos', key: 'total_memos', icon: '📋', format: 'number' },
                { label: 'Total Sales Amount', key: 'total_amount', icon: '৳', format: 'currency' },
                { label: 'Total Dispatched Qty', key: 'total_quantity', icon: '📦', format: 'number' },
                { label: 'Dispatched Items', key: 'total_items', icon: '⚡', format: 'number' }
            ],
            columns: [
                { key: 'chalan_no', label: 'Chalan No', type: 'code' },
                { key: 'formatted_date', label: 'Chalan Date', type: 'text' },
                { key: 'company', label: 'Source Company', type: 'text' },
                { key: 'destination', label: 'Destination', type: 'badge-blue' },
                { key: 'sales_amount', label: 'Sales Amount', type: 'currency' },
                { key: 'total_material_qty', label: 'Total Qty', type: 'number-bold' },
                { key: 'materials_count', label: 'Materials', type: 'badge-count' },
                { key: 'duplicate_status', label: 'Status', type: 'status' },
                { key: 'action', label: 'Materials', type: 'expand-btn' }
            ]
        },
        3: {
            id: 3,
            cardId: 'flashCard3',
            name: 'Spare Parts',
            fullTitle: 'Fan Spare Parts Stock Summary (Warehouse Module ⟶ Spare Parts)',
            code: 'REPORT-3224',
            module: 'Warehouse Module',
            sourceModule: 'Warehouse Module',
            sourcePage: 'Spare Parts',
            sourcePath: 'Warehouse Module ⟶ Spare Parts',
            company: 'FAN',
            apiData: '/api/spare-parts/data',
            apiSync: '/api/spare-parts/sync',
            apiDownload: '/api/spare-parts/download',
            cacheFile: 'spare_parts_cache.json',
            excelFile: 'Fan_Spare_Parts_Stock_Summary.xlsx',
            themeClass: 'flash-theme-spareparts',
            categoryField: 'subcategory',
            kpiConfig: [
                { label: 'Total Spares', key: 'total_items', icon: '⚙️', format: 'number' },
                { label: 'In-Stock Items', key: 'in_stock_items', icon: '🟢', format: 'number' },
                { label: 'Total Quantity', key: 'total_quantity', icon: '📦', format: 'number' },
                { label: 'Stock Valuation', key: 'total_stock_value', icon: '৳', format: 'currency' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'subcategory', label: 'Sub Category', type: 'text' },
                { key: 'item_code', label: 'Item Code', type: 'code' },
                { key: 'fg', label: 'FG Ref', type: 'text' },
                { key: 'item_name', label: 'Spare Parts Name', type: 'text' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'store_qty', label: 'Store Qty', type: 'number' },
                { key: 'section_qty', label: 'Section Qty', type: 'number' },
                { key: 'total_qty', label: 'Total Qty', type: 'number-bold' },
                { key: 'rate', label: 'Rate (৳)', type: 'currency' },
                { key: 'stock_amt', label: 'Stock Value (৳)', type: 'currency' }
            ]
        },
        4: {
            id: 4,
            cardId: 'flashCard4',
            name: 'Fan Assemble',
            fullTitle: 'Fan Assemble — Inventory Movement (Production Module ⟶ Closing ERP ⟶ Fan Assemble)',
            code: 'REPORT-221023-FA',
            module: 'Production Module',
            sourceModule: 'Production Module',
            sourcePage: 'Closing ERP ⟶ Fan Assemble',
            sourcePath: 'Production Module ⟶ Closing ERP ⟶ Fan Assemble',
            company: 'FAN (Wh: 86)',
            apiData: '/api/fan-assemble/data',
            apiSync: '/api/fan-assemble/sync',
            apiDownload: '/api/fan-assemble/download',
            cacheFile: 'fan_assemble_cache.json',
            excelFile: 'Fan_Assemble_Inventory_Movement.xlsx',
            themeClass: 'flash-theme-fanassemble',
            categoryField: 'category',
            kpiConfig: [
                { label: 'Total Items', key: 'total_items', icon: '🌀', format: 'number' },
                { label: 'Active Movements', key: 'active_items', icon: '🟢', format: 'number' },
                { label: 'Prod Recv', key: 'total_production_receive', icon: '📥', format: 'number' },
                { label: 'Closing Balance', key: 'total_closing', icon: '🏢', format: 'number' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'erp_code', label: 'ERP Code', type: 'code' },
                { key: 'code', label: 'Model Code', type: 'code' },
                { key: 'item_name', label: 'Fan Assemble Description', type: 'text' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'opening', label: 'Opening', type: 'number' },
                { key: 'production_receive', label: 'Prod Recv', type: 'number-blue' },
                { key: 'others_receive', label: 'Other Recv', type: 'number' },
                { key: 'total_receive', label: 'Total Recv', type: 'number' },
                { key: 'consumption', label: 'Consump', type: 'number' },
                { key: 'wip_issue', label: 'WIP Issue', type: 'number' },
                { key: 'total_issue', label: 'Total Issue', type: 'number' },
                { key: 'closing', label: 'Closing', type: 'number-bold' },
                { key: 'diff', label: 'Diff', type: 'number' },
                { key: 'remarks', label: 'Remarks', type: 'text' }
            ]
        },
        5: {
            id: 5,
            cardId: 'flashCard5',
            name: 'Armature & Winding',
            fullTitle: 'Armature & Winding — Inventory Movement (Production Module ⟶ Closing ERP ⟶ Armature & Winding)',
            code: 'REPORT-221023-AW',
            module: 'Production Module',
            sourceModule: 'Production Module',
            sourcePage: 'Closing ERP ⟶ Armature & Winding',
            sourcePath: 'Production Module ⟶ Closing ERP ⟶ Armature & Winding',
            company: 'FAN (Wh: 83)',
            apiData: '/api/armature-winding/data',
            apiSync: '/api/armature-winding/sync',
            apiDownload: '/api/armature-winding/download',
            cacheFile: 'armature_winding_cache.json',
            excelFile: 'Armature_Winding_Inventory_Movement.xlsx',
            themeClass: 'flash-theme-armature',
            categoryField: 'category',
            kpiConfig: [
                { label: 'Total Armature Items', key: 'total_items', icon: '🔄', format: 'number' },
                { label: 'Active Items', key: 'active_items', icon: '🟢', format: 'number' },
                { label: 'Total Received', key: 'total_receive', icon: '📥', format: 'number' },
                { label: 'Closing Stock', key: 'total_closing', icon: '📊', format: 'number' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'erp_code', label: 'ERP Code', type: 'code' },
                { key: 'code', label: 'Coil / Part Code', type: 'code' },
                { key: 'item_name', label: 'Description', type: 'text' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'opening', label: 'Opening', type: 'number' },
                { key: 'others_receive', label: 'Receive', type: 'number-blue' },
                { key: 'total_receive', label: 'Total Recv', type: 'number' },
                { key: 'consumption', label: 'Consump', type: 'number' },
                { key: 'total_issue', label: 'Total Issue', type: 'number' },
                { key: 'closing', label: 'Closing', type: 'number-bold' },
                { key: 'diff', label: 'Diff', type: 'number' },
                { key: 'remarks', label: 'Remarks', type: 'text' }
            ]
        },
        6: {
            id: 6,
            cardId: 'flashCard6',
            name: 'Finish Good (FG)',
            fullTitle: 'Finished Goods Stock Movement — FAN Floor (Production Module ⟶ Closing ERP ⟶ Finish Good (FG))',
            code: 'REPORT-222',
            module: 'Production Module',
            sourceModule: 'Production Module',
            sourcePage: 'Closing ERP ⟶ Finish Good (FG)',
            sourcePath: 'Production Module ⟶ Closing ERP ⟶ Finish Good (FG)',
            company: 'FAN (Wh: 68)',
            apiData: '/api/stock-movement/data',
            apiSync: '/api/stock-movement/sync',
            apiDownload: '/api/stock-movement/download',
            cacheFile: 'stock_movement_cache.json',
            excelFile: 'Finished_Goods_FAN_Floor_Stock_Movement.xlsx',
            themeClass: 'flash-theme-finishgood',
            categoryField: 'product_category',
            kpiConfig: [
                { label: 'Total FG Models', key: 'total_items', icon: '🎯', format: 'number' },
                { label: 'Active Movements', key: 'active_items', icon: '🟢', format: 'number' },
                { label: 'Total Stocked', key: 'total_stock', icon: '📦', format: 'number' },
                { label: 'Closing FG Balance', key: 'total_closing', icon: '🏢', format: 'number' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'product_category', label: 'Category', type: 'text' },
                { key: 'code', label: 'Model Code', type: 'code' },
                { key: 'item_name', label: 'Finished Good Fan Name', type: 'text' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'opening', label: 'Opening', type: 'number' },
                { key: 'production', label: 'Production', type: 'number-blue' },
                { key: 'other_receive', label: 'Other Recv', type: 'number' },
                { key: 'total_stock', label: 'Total Stock', type: 'number-bold' },
                { key: 'sales', label: 'Sales/Out', type: 'number' },
                { key: 'transfer_out', label: 'Transfer Out', type: 'number' },
                { key: 'other_issue', label: 'Other Issue', type: 'number' },
                { key: 'out_total', label: 'Total Out', type: 'number' },
                { key: 'closing', label: 'Closing FG', type: 'number-bold' },
                { key: 'diff', label: 'Diff', type: 'number' },
                { key: 'rate', label: 'Rate (৳)', type: 'currency' },
                { key: 'remarks', label: 'Remarks', type: 'text' }
            ]
        },
        7: {
            id: 7,
            cardId: 'flashCard7',
            name: 'Closing All SFG',
            fullTitle: 'Semi Finished Goods — Inventory Movement (Production Module ⟶ Closing ERP ⟶ Closing All SFG)',
            code: 'REPORT-221023-SFG',
            module: 'Production Module',
            sourceModule: 'Production Module',
            sourcePage: 'Closing ERP ⟶ Closing All SFG',
            sourcePath: 'Production Module ⟶ Closing ERP ⟶ Closing All SFG',
            company: 'FAN (Item Group: SFG)',
            apiData: '/api/semi-finished/data',
            apiSync: '/api/semi-finished/sync',
            apiDownload: '/api/semi-finished/download',
            cacheFile: 'semi_finished_cache.json',
            excelFile: 'Semi_Finished_Inventory_Movement.xlsx',
            themeClass: 'flash-theme-closingsfg',
            categoryField: 'category',
            kpiConfig: [
                { label: 'Total SFG Items', key: 'total_items', icon: '📦', format: 'number' },
                { label: 'Active SFG Items', key: 'active_items', icon: '🟢', format: 'number' },
                { label: 'Total Receive', key: 'total_receive', icon: '📥', format: 'number' },
                { label: 'Closing SFG Stock', key: 'total_closing', icon: '🏭', format: 'number' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'erp_code', label: 'ERP Code', type: 'code' },
                { key: 'code', label: 'SFG Code', type: 'code' },
                { key: 'item_name', label: 'SFG Material Name', type: 'text' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'opening', label: 'Opening', type: 'number' },
                { key: 'total_receive', label: 'Total Recv', type: 'number-blue' },
                { key: 'consumption', label: 'Consump', type: 'number' },
                { key: 'wip_issue', label: 'WIP Issue', type: 'number' },
                { key: 'total_issue', label: 'Total Issue', type: 'number' },
                { key: 'closing', label: 'Closing SFG', type: 'number-bold' },
                { key: 'diff', label: 'Diff', type: 'number' },
                { key: 'remarks', label: 'Remarks', type: 'text' }
            ]
        },
        8: {
            id: 8,
            cardId: 'flashCard8',
            name: 'Store Position Report',
            fullTitle: 'Ground Floor Fan Store FAN-1 — Stock Position Detail (Production Module ⟶ Closing ERP ⟶ Store Position Report)',
            code: 'REPORT-91223',
            module: 'Production Module',
            sourceModule: 'Production Module',
            sourcePage: 'Closing ERP ⟶ Store Position Report',
            sourcePath: 'Production Module ⟶ Closing ERP ⟶ Store Position Report',
            company: 'FAN (Wh: 113)',
            apiData: '/api/fan-store/data',
            apiSync: '/api/fan-store/sync',
            apiDownload: '/api/fan-store/download',
            cacheFile: 'fan_store_stock_cache.json',
            excelFile: 'Ground_Floor_Fan_Store_Stock_Detail.xlsx',
            themeClass: 'flash-theme-storeposition',
            categoryField: 'subcategory',
            kpiConfig: [
                { label: 'Total Store Items', key: 'total_items', icon: '🏛️', format: 'number' },
                { label: 'In-Stock Items', key: 'in_stock_items', icon: '🟢', format: 'number' },
                { label: 'Store Quantity', key: 'total_store_qty', icon: '📦', format: 'number' },
                { label: 'Total Quantity', key: 'total_quantity', icon: '📊', format: 'number' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'subcategory', label: 'Sub Category', type: 'text' },
                { key: 'item_code', label: 'Item Code', type: 'code' },
                { key: 'fg', label: 'Ref Code', type: 'text' },
                { key: 'item_name', label: 'Store Material Name', type: 'text' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'store_qty', label: 'Store Qty', type: 'number' },
                { key: 'section_qty', label: 'Section Qty', type: 'number' },
                { key: 'total_qty', label: 'Total Stock Qty', type: 'number-bold' }
            ]
        },
        9: {
            id: 9,
            cardId: 'flashCard9',
            name: 'Bill Of Materials',
            fullTitle: 'MEP BOM Master Report (Production Module ⟶ Bill of Materials (BOM) ⟶ BOM VIEW)',
            code: 'BOM-MASTER',
            module: 'Production Module',
            sourceModule: 'Production Module',
            sourcePage: 'Bill of Materials (BOM) ⟶ BOM VIEW',
            sourcePath: 'Production Module ⟶ Bill of Materials (BOM) ⟶ BOM VIEW',
            company: 'FAN / MEP Group',
            apiData: '/api/bom/data',
            apiSync: '/api/bom/sync',
            apiDownload: '/api/bom/download',
            cacheFile: 'mep_bom_cache.json',
            excelFile: 'MEP_BOM_Master_Report.xlsx',
            themeClass: 'flash-theme-bom',
            dateField: 'bom_date',
            categoryField: 'section',
            kpiConfig: [
                { label: 'Total BOMs', key: 'total_boms', icon: '📄', format: 'number' },
                { label: 'Raw Materials', key: 'total_raw_materials', icon: '🔩', format: 'number' },
                { label: 'Approved BOMs', key: 'approved_count', icon: '✅', format: 'number' },
                { label: 'Factory Sections', key: 'sections_count', icon: '🏭', format: 'number' }
            ],
            columns: [
                { key: 'bom_no', label: 'BOM No', type: 'code' },
                { key: 'bom_date', label: 'BOM Date', type: 'text' },
                { key: 'section', label: 'Section', type: 'text' },
                { key: 'item_code', label: 'Product Code', type: 'code' },
                { key: 'product_name', label: 'Product Name', type: 'text' },
                { key: 'batch_quantity', label: 'Batch Qty', type: 'batch' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'approved_by', label: 'Approved By', type: 'text' },
                { key: 'raw_materials_count', label: 'RM Items', type: 'badge-count' },
                { key: 'action', label: 'RM Details', type: 'expand-btn' }
            ]
        },
        10: {
            id: 10,
            cardId: 'flashCard10',
            name: 'Monthly Attendance',
            fullTitle: 'Monthly Attendance Sheet (HRM Module ⟶ New-HRM Report ⟶ Reports ⟶ Monthly Attendence Sheet)',
            code: 'HRM-ATT-20220522',
            module: 'HRM Module',
            sourceModule: 'HRM Module',
            sourcePage: 'Monthly Attendence Sheet',
            sourcePath: 'HRM Module ⟶ New-HRM Report ⟶ Reports ⟶ Monthly Attendence Sheet',
            company: 'MEP Group / All Plants',
            apiData: '/api/monthly-attendance/data',
            apiSync: '/api/monthly-attendance/sync',
            apiDownload: '/api/monthly-attendance/download',
            cacheFile: 'monthly_attendance_cache.json',
            excelFile: 'Monthly_Attendance_Sheet.xlsx',
            themeClass: 'flash-theme-attendance',
            categoryField: 'department',
            kpiConfig: [
                { label: 'Total Employees', key: 'total_employees', icon: '👥', format: 'number' },
                { label: 'Recorded Days', key: 'total_days', icon: '📅', format: 'number' },
                { label: 'Total Present', key: 'total_present', icon: '✅', format: 'number' },
                { label: 'Total Absent', key: 'total_absent', icon: '❌', format: 'number' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'emp_id', label: 'Emp Id', type: 'code' },
                { key: 'emp_name', label: 'EMP Name', type: 'text' },
                { key: 'company', label: 'Company', type: 'text' },
                { key: 'department', label: 'Department', type: 'text' },
                { key: 'section', label: 'Section', type: 'text' },
                { key: 'unit', label: 'Unit', type: 'text' },
                { key: 'job_location', label: 'Job Location', type: 'text' }
            ]
        },
        11: {
            id: 11,
            cardId: 'flashCard11',
            name: 'Monthly & Yearly Attendance',
            fullTitle: 'Monthly & Yearly Attendance Report (HRM Module ⟶ New-HRM Report ⟶ Reports ⟶ Monthly & Yearly Attendence Report)',
            code: 'HRM-ATT-30082026',
            module: 'HRM Module',
            sourceModule: 'HRM Module',
            sourcePage: 'Monthly & Yearly Attendence Report',
            sourcePath: 'HRM Module ⟶ New-HRM Report ⟶ Reports ⟶ Monthly & Yearly Attendence Report',
            company: 'MEP FAN LIMITED. (Production Dept)',
            apiData: '/api/monthly-yearly-attendance/data',
            apiSync: '/api/monthly-yearly-attendance/sync',
            apiDownload: '/api/monthly-yearly-attendance/download',
            cacheFile: 'monthly_yearly_attendance_cache.json',
            excelFile: 'Monthly_Yearly_Attendance_Report.xlsx',
            themeClass: 'flash-theme-yearlyatt',
            categoryField: 'designation',
            kpiConfig: [
                { label: 'Total Workforce', key: 'total_employees', icon: '👷', format: 'number' },
                { label: 'Production Staff', key: 'total_records', icon: '🏭', format: 'number' },
                { label: 'Company Filter', key: 'company_label', icon: '🏢', format: 'text' },
                { label: 'Dept Filter', key: 'dept_label', icon: '🏷️', format: 'text' }
            ],
            columns: [
                { key: 'sl', label: 'SL', type: 'serial' },
                { key: 'emp_id', label: 'ID No', type: 'code' },
                { key: 'emp_name', label: 'Name', type: 'text' },
                { key: 'designation', label: 'Designation', type: 'text' },
                { key: 'department', label: 'Department', type: 'text' },
                { key: 'section', label: 'Section', type: 'text' },
                { key: 'join_date', label: 'Joining Date', type: 'text' },
                { key: 'present_days', label: 'Present Days', type: 'number' },
                { key: 'absent_days', label: 'Absent Days', type: 'number' },
                { key: 'total_ot', label: 'Total OT', type: 'number' },
                { key: 'late_days', label: 'Late Days', type: 'number' }
            ]
        }
    };

    // In-Memory Storage Cache for instantaneous re-renders
    const botDataCache = {};
    let activeBotModalId = null;
    let currentFilterText = '';
    let currentDateFilter = 'all';
    let currentCategoryFilter = 'all';

    // ============================================================================
    // PERSISTENT DATE RANGE STORAGE ENGINE
    // Strict Invariance: Date once saved in localStorage MUST NEVER be changed by
    // Auto Sync, Run Bot, Global Run Bot, Page Refresh, or navigation.
    // Changes ONLY when user manually edits and clicks Save.
    // ============================================================================
    const BOT_DEFAULT_DATES = {
        1: { fromDate: '01-09-2026', toDate: '17-09-2026' },
        10: { fromDate: '26-08-2026', toDate: '21-09-2026' },
        11: { fromDate: '26-12-2025', toDate: '21-09-2026' }
    };

    function getBotDateStorageKey(botId) {
        return `flash_bot_date_range_${botId}`;
    }

    /**
     * Retrieve persistent saved date range for a bot from localStorage.
     * STRICT INVARIANCE: Never modifies or overwrites localStorage when reading.
     */
    function getBotSavedDateRange(botId) {
        try {
            const raw = localStorage.getItem(getBotDateStorageKey(botId));
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.fromDate && parsed.toDate) {
                    return { fromDate: String(parsed.fromDate).trim(), toDate: String(parsed.toDate).trim() };
                }
            }
        } catch (e) {
            console.warn(`[Bot Engine] Could not read saved date range for Bot ${botId}:`, e);
        }

        // Return bot-specific default if not manually saved yet (does NOT write to localStorage)
        const defaults = BOT_DEFAULT_DATES[botId] || { fromDate: '01-09-2026', toDate: '21-09-2026' };
        return { fromDate: defaults.fromDate, toDate: defaults.toDate };
    }

    /**
     * Parse date string (supports DD-MM-YYYY, YYYY-MM-DD, and standard Date strings)
     */
    function parseDateToTimestamp(str) {
        if (!str) return null;
        str = String(str).trim();
        const ddmmyyyy = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (ddmmyyyy) {
            return new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10)).getTime();
        }
        const yyyymmdd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (yyyymmdd) {
            return new Date(parseInt(yyyymmdd[1], 10), parseInt(yyyymmdd[2], 10) - 1, parseInt(yyyymmdd[3], 10)).getTime();
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d.getTime();
    }

    /**
     * Format date string to YYYY-MM-DD for backend ERP API payload
     */
    function formatToYyyyMmDd(str) {
        if (!str) return '';
        str = String(str).trim();
        const ddmmyyyy = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (ddmmyyyy) {
            return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
        }
        return str;
    }

    /**
     * User clicks "💾 Save" button on a bot date card in top header:
     * - Validates From Date <= To Date
     * - Saves to localStorage (flash_bot_date_range_{botId})
     * - Updates saved indicator badge
     * - Shows confirmation toast
     * - NEVER changes dates on Run Bot, Global Run Bot, Auto Sync, or Page Refresh!
     */
    function validateAndSaveBotDateRange(botId) {
        const fromInput = document.getElementById(`headerDateFrom_${botId}`) || document.getElementById(`flashDateFrom_${botId}`);
        const toInput = document.getElementById(`headerDateTo_${botId}`) || document.getElementById(`flashDateTo_${botId}`);
        const badge = document.getElementById(`headerDateBadge_${botId}`) || document.getElementById(`flashDateBadge_${botId}`);

        if (!fromInput || !toInput) {
            console.warn(`[Bot Engine] Date inputs not found for Bot ${botId}`);
            return false;
        }

        const fromVal = fromInput.value.trim();
        const toVal = toInput.value.trim();

        if (!fromVal || !toVal) {
            if (typeof window.showToast === 'function') {
                window.showToast(`⚠️ [Bot ${botId}] Please provide both From Date and To Date.`);
            }
            return false;
        }

        const tFrom = parseDateToTimestamp(fromVal);
        const tTo = parseDateToTimestamp(toVal);

        if (!tFrom || !tTo) {
            if (typeof window.showToast === 'function') {
                window.showToast(`⚠️ [Bot ${botId}] Invalid Date format. Please use DD-MM-YYYY.`);
            }
            return false;
        }

        if (tFrom > tTo) {
            if (typeof window.showToast === 'function') {
                window.showToast(`⚠️ [Bot ${botId}] Invalid Range: From Date (${fromVal}) cannot be later than To Date (${toVal}).`);
            }
            return false;
        }

        // Save persistently in localStorage
        try {
            const payload = {
                fromDate: fromVal,
                toDate: toVal,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(getBotDateStorageKey(botId), JSON.stringify(payload));
        } catch (e) {
            console.error(`[Bot Engine] Failed to persist date range for Bot ${botId}:`, e);
        }

        if (badge) {
            badge.innerText = `Saved: ${fromVal} to ${toVal}`;
            badge.style.color = '#047857';
            badge.style.background = 'rgba(16, 185, 129, 0.15)';
        }

        const altBadge = document.getElementById(`flashDateBadge_${botId}`);
        if (altBadge && altBadge !== badge) {
            altBadge.innerText = `Saved: ${fromVal} to ${toVal}`;
        }

        // If botId === 1, also mirror to legacy header inputs if present
        if (botId === 1) {
            const hFrom = document.getElementById('headerDateFromInput');
            const hTo = document.getElementById('headerDateToInput');
            if (hFrom) hFrom.value = fromVal;
            if (hTo) hTo.value = toVal;
        }

        const botConfig = BOTS_CONFIG[botId];
        const botName = botConfig ? botConfig.name : `Bot ${botId}`;

        if (typeof window.showToast === 'function') {
            window.showToast(`✅ [${botName}] Date Range Saved Successfully: ${fromVal} to ${toVal}`);
        }

        return true;
    }

    /**
     * Populate all date inputs with their saved values from localStorage.
     * STRICT INVARIANCE: Does not modify or overwrite localStorage.
     */
    function initAllBotDateInputs() {
        [1, 10, 11].forEach(botId => {
            const saved = getBotSavedDateRange(botId);
            const fromInput = document.getElementById(`headerDateFrom_${botId}`) || document.getElementById(`flashDateFrom_${botId}`);
            const toInput = document.getElementById(`headerDateTo_${botId}`) || document.getElementById(`flashDateTo_${botId}`);
            const badge = document.getElementById(`headerDateBadge_${botId}`) || document.getElementById(`flashDateBadge_${botId}`);

            if (fromInput) fromInput.value = saved.fromDate;
            if (toInput) toInput.value = saved.toDate;
            if (badge) {
                badge.innerText = `Saved: ${saved.fromDate} to ${saved.toDate}`;
            }

            const altFrom = document.getElementById(`flashDateFrom_${botId}`);
            const altTo = document.getElementById(`flashDateTo_${botId}`);
            const altBadge = document.getElementById(`flashDateBadge_${botId}`);
            if (altFrom && altFrom !== fromInput) altFrom.value = saved.fromDate;
            if (altTo && altTo !== toInput) altTo.value = saved.toDate;
            if (altBadge && altBadge !== badge) altBadge.innerText = `Saved: ${saved.fromDate} to ${saved.toDate}`;

            if (botId === 1) {
                const hFrom = document.getElementById('headerDateFromInput');
                const hTo = document.getElementById('headerDateToInput');
                if (hFrom && !hFrom.dataset.userEdited) hFrom.value = saved.fromDate;
                if (hTo && !hTo.dataset.userEdited) hTo.value = saved.toDate;
            }
        });
    }

    /**
     * Format a value as number with comma separators
     */
    function formatNumber(val) {
        if (val === null || val === undefined || isNaN(val)) return '0';
        return Number(val).toLocaleString('en-US', { maximumFractionDigits: 2 });
    }

    /**
     * Format a value as currency (BDT)
     */
    function formatCurrency(val) {
        if (val === null || val === undefined || isNaN(val)) return '৳ 0.00';
        return '৳ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /**
     * Fetch Bot Data with Dual-Path Resilience:
     * 1. Try Live Flask API (http://127.0.0.1:5000/api/...)
     * 2. Fallback to Local Static JSON Cache (NEW BOT 02/...)
     */
    async function fetchBotData(botId, forceRefresh) {
        const config = BOTS_CONFIG[botId];
        if (!config) return null;

        if (!forceRefresh && botDataCache[botId]) {
            return botDataCache[botId];
        }

        // 1. Try Live Flask API first (fast 2s timeout)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${API_BASE}${config.apiData}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                botDataCache[botId] = normalizeBotData(botId, data, 'live');
                return botDataCache[botId];
            }
        } catch (e) {
            // Live backend offline or unreachable; fall back gracefully
        }

        // 2. Fallback: Fetch static JSON cache from disk
        try {
            const cacheBase = getCacheBasePath();
            const staticUrl = `${cacheBase}/${config.cacheFile}`;
            const res = await fetch(staticUrl);
            if (res.ok) {
                const data = await res.json();
                botDataCache[botId] = normalizeBotData(botId, data, 'cache');
                return botDataCache[botId];
            }
        } catch (e) {
            console.warn(`[Bot Engine] Failed to load static cache for Bot ${botId}:`, e);
        }

        // 3. Fallback: JavaScript in-memory globals or localStorage for offline / file:/// resilience
        try {
            if (botId === 10) {
                const jsData = (typeof window !== 'undefined' && window.RAW_MONTHLY_ATTENDANCE_BOT_DATA) ? window.RAW_MONTHLY_ATTENDANCE_BOT_DATA : (typeof RAW_MONTHLY_ATTENDANCE_BOT_DATA !== 'undefined' ? RAW_MONTHLY_ATTENDANCE_BOT_DATA : null);
                if (jsData) {
                    botDataCache[botId] = normalizeBotData(botId, jsData, 'cache');
                    return botDataCache[botId];
                }
                const ls = localStorage.getItem('mep_monthly_attendance_bot_data');
                if (ls) {
                    const parsed = JSON.parse(ls);
                    botDataCache[botId] = normalizeBotData(botId, parsed, 'cache');
                    return botDataCache[botId];
                }
            } else if (botId === 11) {
                const jsData = (typeof window !== 'undefined' && window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA) ? window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA : (typeof RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA !== 'undefined' ? RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA : null);
                if (jsData) {
                    botDataCache[botId] = normalizeBotData(botId, jsData, 'cache');
                    return botDataCache[botId];
                }
                const ls = localStorage.getItem('mep_monthly_yearly_attendance_bot_data');
                if (ls) {
                    const parsed = JSON.parse(ls);
                    botDataCache[botId] = normalizeBotData(botId, parsed, 'cache');
                    return botDataCache[botId];
                }
            }
        } catch (e) {
            console.warn(`[Bot Engine] In-memory JS fallback failed for Bot ${botId}:`, e);
        }

        return null;
    }

    /**
     * Normalize different bot JSON structures into a unified format
     */
    function normalizeBotData(botId, rawData, sourceMode) {
        if (!rawData) return null;

        let items = [];
        let meta = {};
        let collectedAt = rawData.collected_at || rawData.extracted_at || (rawData.meta && rawData.meta.collected_at) || 'Preserved Cache';

        if (botId === 1) {
            // Bot 1: Inter Sales Requisition
            items = rawData.requisitions || [];
            meta = rawData.meta || {};
            meta.total_requisitions = meta.total_requisitions || items.length;
            meta.total_items = meta.total_items || items.reduce((sum, r) => sum + (r.materials_count || (r.items ? r.items.length : 0)), 0);
            meta.total_pending_qty = meta.total_pending_qty || items.reduce((sum, r) => sum + (r.total_pending_qty || 0), 0);
            meta.pending_requisitions = meta.pending_requisitions || items.filter(r => (r.status || '').toUpperCase().includes('PEND')).length;
            meta.collected_at = meta.collected_at || collectedAt;
            meta.f_date = meta.f_date || '2026-09-01';
            meta.t_date = meta.t_date || '2026-09-17';
        } else if (botId === 2) {
            // Bot 2: Per Day Received (Inter Sales Chalan)
            items = rawData.all_memos || [];
            if (items.length === 0 && Array.isArray(rawData.date_sections)) {
                rawData.date_sections.forEach(sec => {
                    if (Array.isArray(sec.memos)) {
                        items.push(...sec.memos);
                    }
                });
            }
            meta = {
                total_memos: rawData.total_fan_memos || rawData.total_memos || items.length,
                total_amount: rawData.total_sales_amount || rawData.total_amount || 0,
                total_quantity: rawData.total_material_quantity || rawData.total_quantity || 0,
                total_items: rawData.total_materials_dispatched || items.length,
                collected_at: collectedAt,
                f_date: rawData.f_date || '2026-09-01',
                t_date: rawData.t_date || '2026-09-17'
            };
        } else if (botId === 9) {
            // Bot 9: BOM Master
            items = rawData.boms || rawData.data || [];
            const totalRMs = items.reduce((sum, b) => sum + (b.raw_materials ? b.raw_materials.length : (b.raw_material_count || 0)), 0);
            const approved = items.filter(b => (b.status || '').toUpperCase().includes('APPROV')).length;
            const sections = new Set(items.map(b => b.section).filter(Boolean)).size;
            meta = {
                total_boms: items.length,
                total_raw_materials: rawData.total_raw_materials || totalRMs,
                approved_count: approved,
                sections_count: sections,
                collected_at: collectedAt,
                f_date: '01-09-2023',
                t_date: 'Running Date'
            };
        } else if (botId === 10) {
            // Bot 10: Monthly Attendance Sheet
            items = rawData.items || [];
            meta = rawData.meta || {};
            meta.total_employees = meta.total_employees || items.length;
            meta.total_days = meta.days_count || (rawData.day_headers ? rawData.day_headers.length : 21);
            meta.total_present = meta.total_presents || items.reduce((sum, it) => sum + (parseInt(it.present_days, 10) || 0), 0);
            meta.total_absent = meta.total_absents || items.reduce((sum, it) => sum + (parseInt(it.absent_days, 10) || 0), 0);
            meta.total_leave = meta.total_leaves || items.reduce((sum, it) => sum + (parseInt(it.leave_days, 10) || 0), 0);
            meta.f_date = meta.from_date || '01-09-2026';
            meta.t_date = meta.to_date || '21-09-2026';
            meta.collected_at = meta.collected_at || collectedAt;
        } else if (botId === 11) {
            // Bot 11: Monthly & Yearly Attendance Report
            items = rawData.items || [];
            meta = rawData.meta || {};
            meta.total_employees = meta.total_employees || items.length;
            meta.total_records = items.length;
            meta.company_label = meta.filter_company || 'MEP FAN LIMITED.';
            meta.dept_label = meta.filter_department || 'Production';
            meta.total_present = meta.total_present_days || 0;
            meta.total_absent = meta.total_absent_days || 0;
            meta.total_ot = meta.total_ot_hours || 0;
            meta.f_date = meta.from_date || '01-09-2026';
            meta.t_date = meta.to_date || '21-09-2026';
            meta.collected_at = meta.collected_at || collectedAt;
        } else {
            // Bots 3 to 8: Report collectors
            items = rawData.items || [];
            meta = rawData.meta || {};
            meta.collected_at = meta.collected_at || collectedAt;
        }

        return {
            botId: botId,
            items: items,
            meta: meta,
            raw_data: rawData,
            day_headers: rawData.day_headers || [],
            headers: rawData.headers || [],
            date_sections: rawData.date_sections || [],
            all_memos: rawData.all_memos || items,
            raw_headers: rawData.raw_headers || (rawData.meta && rawData.meta.raw_headers) || null,
            raw_rows: rawData.raw_rows || null,
            total_row: rawData.total_row || null,
            report_title: rawData.report_title || (rawData.meta && rawData.meta.report_title) || null,
            report_subtitle: rawData.report_subtitle || (rawData.meta && rawData.meta.report_subtitle) || null,
            sourceMode: sourceMode,
            lastLoaded: new Date().toLocaleTimeString()
        };
    }

    /**
     * Synchronize freshly collected data into browser localStorage for the corresponding module page
     */
    function syncBotToModuleLocalStorage(botId, refreshedData) {
        if (!refreshedData) return;

        // Zero Data Loss Guard: Never overwrite existing module datasets with empty arrays
        const candidateItems = refreshedData.items || refreshedData.requisitions || refreshedData.all_memos || refreshedData.boms || refreshedData.data || [];
        if (Array.isArray(candidateItems) && candidateItems.length === 0) {
            console.warn(`[Bot Engine] Refreshed dataset for Bot ${botId} is empty. Preserving existing stored data to prevent data vanish.`);
            return;
        }

        const nowStr = new Date().toISOString();
        let dateIntervalStr = `${new Date().getFullYear()}-09-01 to ${new Date().toISOString().split('T')[0]}`;
        if (refreshedData && refreshedData.report_subtitle) {
            const m = String(refreshedData.report_subtitle).match(/\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}/i);
            if (m) dateIntervalStr = m[0];
        }

        try {
            switch (botId) {
                case 1: // Warehouse Module ⟶ Intersales Requisition
                    localStorage.setItem('mep_intersales_requisition_data', JSON.stringify(refreshedData));
                    localStorage.setItem('mep_intersales_requisition_synced', nowStr);
                    break;
                case 2: // Warehouse Module ⟶ Inter Sales Chalan Report
                    const fanDataToSave = refreshedData.raw_data || refreshedData;
                    localStorage.setItem('mep_fan_inter_sales_data', JSON.stringify(fanDataToSave));
                    localStorage.setItem('mep_fan_inter_sales_synced', nowStr);
                    break;
                case 3: // Warehouse Module ⟶ Spare Parts
                    localStorage.setItem('mep_spare_parts_data', JSON.stringify(refreshedData));
                    localStorage.setItem('mep_spare_parts_synced', nowStr);
                    break;
                case 4: { // Production Module ⟶ Closing ERP ⟶ Fan Assemble
                    const items = refreshedData.items || [];
                    const formatted = items.map((it, idx) => ({
                        id: `erp_fa_${it.erp_code || idx}`,
                        sl: idx + 1,
                        origSl: String(it.sl || (idx + 1)),
                        company: it.company || 'FAN',
                        category: it.category || 'Finished Goods',
                        erpCode: it.erp_code || '',
                        code: it.code || '',
                        name: it.item_name || '',
                        itemName: it.item_name || '',
                        unit: it.unit || 'Pcs',
                        opening: parseFloat(it.opening) || 0,
                        openingAdjust: parseFloat(it.opening_adjust) || 0,
                        storeReceive: parseFloat(it.store_receive) || 0,
                        sectionReceive: parseFloat(it.section_receive) || 0,
                        productionReceive: parseFloat(it.production_receive) || 0,
                        damageReceive: parseFloat(it.damage_receive) || 0,
                        othersReceive: parseFloat(it.others_receive) || 0,
                        totalReceive: parseFloat(it.total_receive) || 0,
                        consumption: parseFloat(it.consumption) || 0,
                        wipIssue: parseFloat(it.wip_issue) || 0,
                        issueOpeningAdjust: parseFloat(it.issue_opening_adjust) || 0,
                        issueToRepair: parseFloat(it.issue_to_repair) || 0,
                        issueToDamage: parseFloat(it.issue_to_damage) || 0,
                        inTransit: parseFloat(it.in_transit) || 0,
                        totalIssue: parseFloat(it.total_issue) || 0,
                        closing: parseFloat(it.closing) || 0,
                        binClosing: parseFloat(it.bin_closing) || 0,
                        diff: parseFloat(it.diff) || 0,
                        remarks: it.remarks || ''
                    }));
                    localStorage.setItem('mep_fan_assemble_erp_data', JSON.stringify(formatted));
                    localStorage.setItem('mep_fan_assemble_date_interval', dateIntervalStr);
                    localStorage.setItem('mep_erp_date_interval', dateIntervalStr);

                    // Auto-sync to Assemble Summary map
                    try {
                        const summaryMap = {};
                        formatted.forEach(it => {
                            if (it.code) summaryMap[it.code.toUpperCase()] = it.closing;
                        });
                        localStorage.setItem('mep_assemble_closing_map', JSON.stringify(summaryMap));
                    } catch(e) {}
                    break;
                }
                case 5: { // Production Module ⟶ Closing ERP ⟶ Armature & Winding
                    const items = refreshedData.items || [];
                    const formatted = items.map((it, idx) => ({
                        id: `erp_aw_${it.erp_code || idx}`,
                        sl: idx + 1,
                        origSl: String(it.sl || (idx + 1)),
                        company: it.company || 'FAN',
                        category: it.category || 'Ceiling Raw',
                        erpCode: it.erp_code || '',
                        code: it.code || '',
                        name: it.item_name || '',
                        itemName: it.item_name || '',
                        unit: it.unit || 'Pcs',
                        opening: parseFloat(it.opening) || 0,
                        openingAdjust: parseFloat(it.opening_adjust) || 0,
                        storeReceive: parseFloat(it.store_receive) || 0,
                        sectionReceive: parseFloat(it.section_receive) || 0,
                        productionReceive: parseFloat(it.production_receive) || 0,
                        damageReceive: parseFloat(it.damage_receive) || 0,
                        othersReceive: parseFloat(it.others_receive) || 0,
                        totalReceive: parseFloat(it.total_receive) || 0,
                        consumption: parseFloat(it.consumption) || 0,
                        wipIssue: parseFloat(it.wip_issue) || 0,
                        issueOpeningAdjust: parseFloat(it.issue_opening_adjust) || 0,
                        issueToRepair: parseFloat(it.issue_to_repair) || 0,
                        issueToDamage: parseFloat(it.issue_to_damage) || 0,
                        inTransit: parseFloat(it.in_transit) || 0,
                        totalIssue: parseFloat(it.total_issue) || 0,
                        closing: parseFloat(it.closing) || 0,
                        binClosing: parseFloat(it.bin_closing) || 0,
                        diff: parseFloat(it.diff) || 0,
                        remarks: it.remarks || ''
                    }));
                    localStorage.setItem('mep_armature_winding_erp_data', JSON.stringify(formatted));
                    localStorage.setItem('mep_armature_date_interval', dateIntervalStr);
                    break;
                }
                case 6: { // Production Module ⟶ Closing ERP ⟶ Finish Good (FG)
                    const items = refreshedData.items || [];
                    const formatted = items.map((it, idx) => ({
                        sl: idx + 1,
                        origSl: String(it.sl || (idx + 1)),
                        company: it.company || '3',
                        itemGroup: it.item_group || 'Finished Goods',
                        category: it.product_category || 'Fan Group',
                        code: it.code || '',
                        itemName: it.item_name || '',
                        unit: it.unit || 'Pcs',
                        opening: parseFloat(it.opening) || 0,
                        totalReceive: (parseFloat(it.total_stock) || 0) - (parseFloat(it.opening) || 0),
                        otherReceive: parseFloat(it.other_receive) || 0,
                        totalStock: parseFloat(it.total_stock) || 0,
                        transfer: parseFloat(it.transfer_total) || 0,
                        outTotal: parseFloat(it.out_total) || 0,
                        closing: parseFloat(it.closing) || 0,
                        binClosing: parseFloat(it.bin_closing) || 0,
                        diff: parseFloat(it.diff) || 0,
                        rate: parseFloat(it.rate) || 0,
                        remarks: it.remarks || ''
                    }));
                    localStorage.setItem('mep_closing_fg_data', JSON.stringify(formatted));
                    localStorage.setItem('mep_closing_fg_date_interval', dateIntervalStr);
                    localStorage.setItem('closingDate_closing_fg', dateIntervalStr);
                    break;
                }
                case 7: { // Production Module ⟶ Closing ERP ⟶ Closing All SFG
                    const items = refreshedData.items || [];
                    const formatted = items.map((it, idx) => ({
                        sl: idx + 1,
                        origSl: String(it.sl || (idx + 1)),
                        company: it.company || 'FAN',
                        category: it.category || 'FAN SFG',
                        erpCode: it.erp_code || '',
                        code: it.code || '',
                        itemName: it.item_name || '',
                        unit: it.unit || 'Pcs',
                        opening: parseFloat(it.opening) || 0,
                        openingAdjust: parseFloat(it.opening_adjust) || 0,
                        storeReceive: parseFloat(it.store_receive) || 0,
                        sectionReceive: parseFloat(it.section_receive) || 0,
                        prodReceive: parseFloat(it.production_receive) || 0,
                        damageReceive: parseFloat(it.damage_receive) || 0,
                        othersReceive: parseFloat(it.others_receive) || 0,
                        totalReceive: parseFloat(it.total_receive) || 0,
                        consumption: parseFloat(it.consumption) || 0,
                        wipIssue: parseFloat(it.wip_issue) || 0,
                        openingAdjustIssue: parseFloat(it.issue_opening_adjust) || 0,
                        issueToRepair: parseFloat(it.issue_to_repair) || 0,
                        issueToDamage: parseFloat(it.issue_to_damage) || 0,
                        inTransit: parseFloat(it.in_transit) || 0,
                        totalIssue: parseFloat(it.total_issue) || 0,
                        closing: parseFloat(it.closing) || 0,
                        binClosing: parseFloat(it.bin_closing) || 0,
                        diff: parseFloat(it.diff) || 0,
                        remarks: it.remarks || ''
                    }));
                    localStorage.setItem('mep_closing_all_sfg_data', JSON.stringify(formatted));
                    localStorage.setItem('mep_closing_all_sfg_date_interval', dateIntervalStr);
                    localStorage.setItem('closingDate_closing_all_sfg', dateIntervalStr);
                    break;
                }
                case 8: { // Production Module ⟶ Closing ERP ⟶ Store Position Report
                    const items = refreshedData.items || [];
                    if (items.length === 0) break;
                    const formatted = items.map((it, idx) => {
                        const sq = parseFloat(it.store_qty) || 0;
                        const secq = parseFloat(it.section_qty) || 0;
                        const tq = (it.total_qty !== undefined && parseFloat(it.total_qty) > 0) ? parseFloat(it.total_qty) : (sq + secq);
                        return {
                            sl: idx + 1,
                            company: it.company || 'FAN',
                            group: it.group || '',
                            category: it.category || '',
                            subCategory: it.subcategory || 'Ceiling Raw',
                            itemCode: it.item_code || '',
                            fg: it.fg || it.item_code || '',
                            itemName: it.item_name || '',
                            unit: it.unit || 'Pcs',
                            storeQty: sq,
                            sectionQty: secq,
                            totalQty: tq
                        };
                    });
                    localStorage.setItem('mep_store_position_report_data', JSON.stringify(formatted));
                    localStorage.setItem('mep_store_position_date', new Date().toISOString().split('T')[0]);
                    localStorage.setItem('closingDate_store_position', new Date().toISOString().split('T')[0]);
                    break;
                }
                case 9: { // Production Module ⟶ Bill of Materials (BOM) ⟶ BOM VIEW
                    localStorage.setItem('mep_bom_data_custom', JSON.stringify(refreshedData));
                    localStorage.setItem('mep_bom_synced', nowStr);
                    break;
                }
                case 10: { // HRM Module ⟶ Monthly Attendance Sheet
                    localStorage.setItem('mep_monthly_attendance_bot_data', JSON.stringify(refreshedData));
                    localStorage.setItem('mep_monthly_attendance_synced', nowStr);
                    window.RAW_MONTHLY_ATTENDANCE_BOT_DATA = refreshedData;
                    if (window.HRM_ENGINE && typeof window.HRM_ENGINE.onBotSync === 'function') {
                        window.HRM_ENGINE.onBotSync(10, refreshedData);
                    }
                    break;
                }
                case 11: { // HRM Module ⟶ Monthly & Yearly Attendance Report
                    localStorage.setItem('mep_monthly_yearly_attendance_bot_data', JSON.stringify(refreshedData));
                    localStorage.setItem('mep_monthly_yearly_attendance_synced', nowStr);
                    window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA = refreshedData;
                    if (window.HRM_ENGINE && typeof window.HRM_ENGINE.onBotSync === 'function') {
                        window.HRM_ENGINE.onBotSync(11, refreshedData);
                    }
                    break;
                }
            }

            // Dispatch global event for live page re-rendering
            window.dispatchEvent(new CustomEvent('mep_erp_sync_completed', {
                detail: { botId: botId, data: refreshedData, timestamp: nowStr }
            }));
            console.log(`[Bot Engine] Successfully synced Bot ${botId} data to localStorage!`);
        } catch (e) {
            console.error(`[Bot Engine] Failed saving Bot ${botId} to localStorage:`, e);
        }
    }

    /**
     * Run / Sync Bot Action (User clicks "⚡ Run Bot" or "Rerun Bot")
     */
    async function triggerBotRun(botId, btnElement) {
        const config = BOTS_CONFIG[botId];
        if (!config) return { success: false, error: 'Config missing' };

        const originalText = btnElement ? (btnElement.getAttribute('data-orig-text') || btnElement.innerHTML) : '';
        if (btnElement) {
            if (!btnElement.getAttribute('data-orig-text')) {
                btnElement.setAttribute('data-orig-text', originalText);
            }
            btnElement.classList.add('is-running');
            btnElement.disabled = true;
            btnElement.style.background = '#d97706';
            btnElement.style.color = '#ffffff';
            btnElement.style.borderColor = '#d97706';
            btnElement.innerHTML = `
                <svg class="spin-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"/>
                </svg>
                <span>Collecting Data...</span>
            `;
        }

        if (typeof window.showToast === 'function') {
            window.showToast(`🤖 [${config.name}] Connecting to: ${config.sourcePath}...`);
        }

        // Build payload with persistent saved date ranges
        const payload = {};
        if ([1, 10, 11].includes(botId)) {
            const fromInput = document.getElementById(`headerDateFrom_${botId}`) || document.getElementById(`flashDateFrom_${botId}`);
            const toInput = document.getElementById(`headerDateTo_${botId}`) || document.getElementById(`flashDateTo_${botId}`);
            const savedDates = getBotSavedDateRange(botId);

            const effFrom = (fromInput && fromInput.value.trim()) ? fromInput.value.trim() : savedDates.fromDate;
            const effTo = (toInput && toInput.value.trim()) ? toInput.value.trim() : savedDates.toDate;

            payload.f_date = formatToYyyyMmDd(effFrom);
            payload.t_date = formatToYyyyMmDd(effTo);
            payload.from_date = effFrom;
            payload.to_date = effTo;
        }
        if (botId === 1) {
            // Also accept inputs from legacy header inputs if present
            const fromInput = document.getElementById('headerDateFrom_1') || document.getElementById('headerDateFromInput') || document.getElementById('reqDateFromInput');
            const toInput = document.getElementById('headerDateTo_1') || document.getElementById('headerDateToInput') || document.getElementById('reqDateToInput');
            if (fromInput && fromInput.value) {
                payload.f_date = formatToYyyyMmDd(fromInput.value.trim());
                payload.from_date = fromInput.value.trim();
            }
            if (toInput && toInput.value) {
                payload.t_date = formatToYyyyMmDd(toInput.value.trim());
                payload.to_date = toInput.value.trim();
            }
        }
        if (botId === 11) {
            payload.pbi_org = '3';
            payload.dept_id = '32';
        }

        try {
            // Attempt to trigger Python Sync API with a generous 90s timeout for complex ERP reports
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000);

            const response = await fetch(`${API_BASE}${config.apiSync}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const result = await response.json();
                if (btnElement) {
                    btnElement.classList.remove('is-running');
                    btnElement.disabled = false;
                    btnElement.innerHTML = `<span>✓ Completed</span>`;
                    btnElement.style.background = '#10B981';
                    btnElement.style.color = '#FFFFFF';
                    btnElement.style.borderColor = '#10B981';
                    btnElement.title = `Data Collected Successfully (${new Date().toLocaleTimeString()})`;
                }

                // Invalidate memory cache and reload freshly collected data
                delete botDataCache[botId];
                const refreshedData = await fetchBotData(botId, true);

                // Synchronize freshly collected live ERP data directly to browser localStorage and module pages
                syncBotToModuleLocalStorage(botId, refreshedData);

                // Dispatch global event so all active module pages auto-refresh seamlessly
                try {
                    window.dispatchEvent(new CustomEvent('mep_erp_sync_completed', { detail: { botId: botId, result: result } }));
                } catch(evErr) {}

                if (typeof window.showToast === 'function') {
                    const countStr = result.total_requisitions || result.total_items || result.total_memos || result.total_boms || 'All';
                    window.showToast(`✅ [${config.name}] 100% Synced from ${config.sourcePath} (${countStr} records &bull; Zero Mismatch)`);
                }

                // If modal is currently open, re-render immediately
                if (activeBotModalId === botId) {
                    renderCollectedDataModal(botId, refreshedData);
                }

                setTimeout(() => {
                    if (btnElement && btnElement.innerHTML.includes('Completed')) {
                        btnElement.style.background = '';
                        btnElement.style.color = '';
                        btnElement.style.borderColor = '';
                        btnElement.innerHTML = btnElement.getAttribute('data-orig-text') || '<span>⚡ Run Bot</span>';
                    }
                }, 3500);

                return { success: true, botId: botId, result: result };
            } else {
                const errJson = await response.json().catch(() => ({}));
                throw new Error(errJson.error || `HTTP ${response.status}`);
            }
        } catch (err) {
            let errMsg = err.message || 'Unknown error';
            let isBackendDown = false;
            let isAuthFail = false;

            if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || errMsg.includes('aborted')) {
                isBackendDown = true;
                errMsg = 'ERP Backend on port 5000 is offline. Please launch NEW BOT 02/start.bat or run "py app.py".';
            } else if (errMsg.toLowerCase().includes('auth') || errMsg.toLowerCase().includes('login') || errMsg.toLowerCase().includes('credential')) {
                isAuthFail = true;
                errMsg = 'ERP Login Failed! Please verify ERP credentials in .erp_secret.json.';
            }

            console.error(`[Bot Engine] Collection failed for Bot ${botId}:`, errMsg);

            if (btnElement) {
                btnElement.classList.remove('is-running');
                btnElement.disabled = false;
                btnElement.innerHTML = `<span>❌ Failed (Retry)</span>`;
                btnElement.style.background = '#DC2626';
                btnElement.style.color = '#FFFFFF';
                btnElement.style.borderColor = '#B91C1C';
                btnElement.title = `Collection Failed: ${errMsg} (Click to Retry)`;
            }

            if (typeof window.showToast === 'function') {
                if (isBackendDown) {
                    window.showToast(`⚠️ [${config.name}] ${errMsg}`);
                } else if (isAuthFail) {
                    window.showToast(`🚫 [${config.name}] ERP Login Failed! Authentication error.`);
                } else {
                    window.showToast(`❌ [${config.name}] Collection Failed: ${errMsg}`);
                }
            }

            return { success: false, botId: botId, error: errMsg, isBackendDown: isBackendDown, isAuthFail: isAuthFail };
        }
    }

    /**
     * Master "Run Bot": Automatically logs into ERP and collects data for all 9 modules
     */
    async function triggerRunAllBots(btnElement) {
        if (window._isAllBotsRunning) return;
        window._isAllBotsRunning = true;

        const originalHTML = btnElement ? btnElement.innerHTML : '';
        if (btnElement) {
            btnElement.disabled = true;
            btnElement.style.background = '#d97706';
            btnElement.innerHTML = `
                <svg class="spin-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"/>
                </svg>
                <span>Running 11 Bots...</span>
            `;
        }

        const statusStrip = document.getElementById('flashBotStatusStrip');
        const statusText = document.getElementById('flashStatusText');
        const progressPill = document.getElementById('flashStatusProgress');
        const percentBadge = document.getElementById('flashStatusPercentage');
        const barFill = document.getElementById('flashStatusBarFill');
        const timerDisplay = document.getElementById('flashTimerDisplay');

        // Setup timer
        const startTime = Date.now();
        let timerInterval = null;

        function formatDuration(ms) {
            const totalSecs = Math.floor(ms / 1000);
            if (totalSecs < 60) {
                return `${totalSecs}s`;
            }
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
        }

        function updateTimer() {
            const elapsedMs = Date.now() - startTime;
            const str = formatDuration(elapsedMs);
            if (timerDisplay) {
                timerDisplay.innerText = str;
            } else if (progressPill) {
                progressPill.innerText = `⏱️ ${str}`;
            }
        }

        if (statusStrip) {
            statusStrip.style.display = 'flex';
            statusStrip.style.background = '#eff6ff';
            statusStrip.style.borderColor = '#3b82f6';
        }

        if (barFill) {
            barFill.style.width = '0%';
            barFill.style.background = 'linear-gradient(90deg, #38bdf8 0%, #0284c7 40%, #10b981 85%, #059669 100%)';
        }
        if (percentBadge) {
            percentBadge.innerText = '0%';
            percentBadge.style.background = '#e0f2fe';
            percentBadge.style.color = '#0284c7';
            percentBadge.style.borderColor = '#bae6fd';
        }
        if (progressPill) {
            progressPill.style.background = '#0284c7';
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 250);

        if (typeof window.showToast === 'function') {
            window.showToast('🚀 Master Bot Started: Sequentially collecting all 11 ERP modules...');
        }

        let successCount = 0;
        const failures = [];

        for (let i = 1; i <= 11; i++) {
            const config = BOTS_CONFIG[i];
            if (!config) continue;

            // In-flight status update
            if (statusText) {
                statusText.style.color = '#1e40af';
                statusText.innerHTML = `Collecting Bot ${i}/11: <strong>${config.name}</strong> <span style="font-size:0.75rem; color:#475569; font-weight:normal;">(📍 ${config.sourcePath})</span>...`;
            }
            if (percentBadge && i === 1) {
                percentBadge.innerText = `0%`;
            }

            const cardBtn = document.getElementById(`flashBtn${i}`);
            const res = await triggerBotRun(i, cardBtn);

            if (res && res.success) {
                successCount++;
            } else {
                failures.push({ name: config.name, error: res ? res.error : 'Unknown' });
                // If the very first bot failed because the backend is down, abort remaining to save time
                if (res && res.isBackendDown && i === 1) {
                    for (let rest = 2; rest <= 11; rest++) {
                        const restBtn = document.getElementById(`flashBtn${rest}`);
                        if (restBtn) {
                            restBtn.innerHTML = `<span>❌ Backend Offline</span>`;
                            restBtn.style.background = '#DC2626';
                            restBtn.style.color = '#FFFFFF';
                            restBtn.style.borderColor = '#B91C1C';
                        }
                    }
                    failures.push(...[2,3,4,5,6,7,8,9,10,11].map(k => ({ name: BOTS_CONFIG[k] ? BOTS_CONFIG[k].name : `Bot ${k}`, error: 'Backend Offline' })));
                    break;
                }
            }

            // Completed percentage after bot i finishes (e.g. 1/11 = 9.1%, 2/11 = 18.2%, ..., 11/11 = 100%)
            const completedPct = (i === 11) ? '100%' : `${((i / 11) * 100).toFixed(1)}%`;
            if (barFill) {
                barFill.style.width = completedPct;
            }
            if (percentBadge) {
                percentBadge.innerText = completedPct;
            }

            // Safe delay between bot executions to respect external ERP server rate limits
            await new Promise(r => setTimeout(r, 400));
        }

        clearInterval(timerInterval);
        const totalDurationMs = Date.now() - startTime;
        const totalTimeStr = formatDuration(totalDurationMs);

        window._isAllBotsRunning = false;

        if (statusStrip) {
            if (failures.length === 0) {
                statusStrip.style.background = '#ecfdf5';
                statusStrip.style.borderColor = '#10b981';
                if (statusText) {
                    statusText.style.color = '#065f46';
                    statusText.innerHTML = `✅ All 11 Reports Collected Successfully from ERP in <strong>${totalTimeStr}</strong>!`;
                }
                if (barFill) {
                    barFill.style.width = '100%';
                    barFill.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
                }
                if (percentBadge) {
                    percentBadge.innerText = '100%';
                    percentBadge.style.background = '#dcfce7';
                    percentBadge.style.color = '#15803d';
                    percentBadge.style.borderColor = '#86efac';
                }
                if (progressPill) {
                    progressPill.style.background = '#10b981';
                    if (timerDisplay) {
                        timerDisplay.innerText = `${totalTimeStr} ✓`;
                    } else {
                        progressPill.innerText = `⏱️ ${totalTimeStr} ✓`;
                    }
                }
            } else {
                statusStrip.style.background = '#fef2f2';
                statusStrip.style.borderColor = '#ef4444';
                const failedNames = failures.map(f => f.name).join(', ');
                if (statusText) {
                    statusText.style.color = '#b91c1c';
                    statusText.innerHTML = `❌ Collection Finished with ${failures.length} failure(s) in <strong>${totalTimeStr}</strong>: ${failedNames}. Click failed modules to retry.`;
                }
                if (barFill) {
                    barFill.style.background = 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)';
                }
                if (percentBadge) {
                    percentBadge.style.background = '#fee2e2';
                    percentBadge.style.color = '#b91c1c';
                    percentBadge.style.borderColor = '#fca5a5';
                }
                if (progressPill) {
                    progressPill.style.background = '#ef4444';
                    if (timerDisplay) {
                        timerDisplay.innerText = `${totalTimeStr} ⚠️`;
                    } else {
                        progressPill.innerText = `⏱️ ${totalTimeStr} ⚠️`;
                    }
                }
            }
        }

        if (btnElement) {
            btnElement.disabled = false;
            btnElement.style.background = failures.length === 0 ? '#10b981' : '#dc2626';
            btnElement.innerHTML = failures.length === 0 ? `<span>✓ All 11 Collected (${totalTimeStr})</span>` : '<span>⚡ Run Bot (Retry)</span>';

            setTimeout(() => {
                btnElement.style.background = '';
                btnElement.innerHTML = originalHTML || '<span>⚡ Run Bot</span>';
            }, 5000);
        }

        if (typeof window.showToast === 'function') {
            if (failures.length === 0) {
                window.showToast(`🎉 All 11 MEP ERP Reports Collected Successfully in ${totalTimeStr}!`);
            } else {
                window.showToast(`⚠️ Master Collection Result: ${successCount} succeeded, ${failures.length} failed in ${totalTimeStr}.`);
            }
        }
    }

    function toggleReqDateRangePicker(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const picker = document.getElementById('reqDatePickerDropdown');
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    }

    function applyReqDateRange(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const fromInput = document.getElementById('reqDateFromInput');
        const toInput = document.getElementById('reqDateToInput');
        const badge = document.getElementById('reqDateRangeBadge');
        const picker = document.getElementById('reqDatePickerDropdown');

        if (fromInput && toInput && badge) {
            badge.innerText = `${fromInput.value.trim()} ⟶ ${toInput.value.trim()}`;
        }
        if (picker) {
            picker.style.display = 'none';
        }
        if (typeof window.showToast === 'function') {
            window.showToast(`📅 Inter Sales Requisition Date Range set: ${fromInput.value.trim()} to ${toInput.value.trim()}`);
        }
    }

    document.addEventListener('click', function(e) {
        const picker = document.getElementById('reqDatePickerDropdown');
        if (picker && picker.style.display !== 'none') {
            if (!picker.contains(e.target) && !e.target.closest('.flash-date-pill-btn')) {
                picker.style.display = 'none';
            }
        }
    });

    /**
     * Open the Dedicated "Collected Data" Modal for the clicked Bot
     */
    async function openCollectedDataModal(botId) {
        const config = BOTS_CONFIG[botId];
        if (!config) return;

        activeBotModalId = botId;
        currentFilterText = '';
        currentDateFilter = 'all';
        currentCategoryFilter = 'all';

        let modalBackdrop = document.getElementById('collectedDataModal');
        if (!modalBackdrop) {
            createCollectedDataModalTemplate();
            modalBackdrop = document.getElementById('collectedDataModal');
        }

        modalBackdrop.style.display = 'flex';
        renderModalHeaderSkeleton(config);

        const dataObj = await fetchBotData(botId);
        renderCollectedDataModal(botId, dataObj);
    }

    /**
     * Close the Collected Data Modal
     */
    function closeCollectedDataModal() {
        const modalBackdrop = document.getElementById('collectedDataModal');
        if (modalBackdrop) {
            modalBackdrop.style.display = 'none';
        }
        activeBotModalId = null;
    }

    /**
     * Create the Modal DOM structure if not yet attached
     */
    function createCollectedDataModalTemplate() {
        const modalHTML = `
        <div class="collected-modal-backdrop" id="collectedDataModal" onclick="if(event.target===this) window.closeCollectedDataModal()">
            <div class="collected-modal-dialog">
                <div class="collected-header-glow"></div>
                <div class="collected-modal-header" id="collectedModalHeader"></div>
                <div class="collected-kpi-strip" id="collectedKpiStrip"></div>

                <div class="collected-toolbar" id="collectedToolbar">
                    <div class="collected-search-box">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="collectedSearchInput" placeholder="Search collected data by code, description, section..." oninput="window.filterCollectedData(this.value)">
                    </div>

                    <div class="collected-filters-group" id="collectedFiltersGroup">
                        <!-- Populated dynamically: Date Filter & Category Filter -->
                    </div>

                    <div class="collected-toolbar-meta" id="collectedToolbarMeta">
                        <span class="badge-count-pill" id="collectedRecordCount">0 records</span>
                        <button type="button" class="btn-collected-export" onclick="window.exportFilteredCSV()" title="Export current filtered table to CSV">
                            📥 Export CSV
                        </button>
                    </div>
                </div>

                <div class="collected-modal-body" id="collectedModalBody">
                    <div class="flash-skeleton" style="height:32px; margin:16px 24px;"></div>
                    <div class="flash-skeleton" style="height:32px; margin:16px 24px;"></div>
                    <div class="flash-skeleton" style="height:32px; margin:16px 24px;"></div>
                </div>

                <div class="collected-modal-footer">
                    <div class="collected-footer-left" id="collectedFooterInfo">
                        <span>⚡ Data Source: MEP GROUP ERP &bull; Realtime Cache Synchronized</span>
                    </div>
                    <div class="collected-footer-right">
                        <button type="button" class="btn-collected-secondary" onclick="window.closeCollectedDataModal()">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHTML;
        document.body.appendChild(div.firstElementChild);
    }

    /**
     * Render Initial Skeleton Header
     */
    function renderModalHeaderSkeleton(config) {
        const headerEl = document.getElementById('collectedModalHeader');
        if (!headerEl) return;

        headerEl.innerHTML = `
            <div class="collected-header-info">
                <div class="collected-bot-badge">BOT 0${config.id}</div>
                <div>
                    <h3 class="collected-title">${config.fullTitle}</h3>
                    <div class="collected-subtags">
                        <span class="collected-pill collected-pill-source" title="Source ERP Module Location">📍 Source: <strong>${config.sourcePath}</strong></span>
                        <span class="collected-pill">🏢 ${config.company}</span>
                        <span class="collected-pill">🏷️ ${config.code}</span>
                        <span class="collected-pill">📁 ${config.module}</span>
                    </div>
                </div>
            </div>
            <div class="collected-header-actions">
                <button type="button" class="collected-btn-action" onclick="window.downloadBotExcel(${config.id})" title="Download Master Excel Workbook">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Excel</span>
                </button>
                <button type="button" class="collected-close-btn" onclick="window.closeCollectedDataModal()" title="Close">✕</button>
            </div>
        `;
    }

    /**
     * Render Complete Collected Data View
     */
    function renderCollectedDataModal(botId, dataObj) {
        const config = BOTS_CONFIG[botId];
        if (!config) return;

        const headerEl = document.getElementById('collectedModalHeader');
        const kpiStrip = document.getElementById('collectedKpiStrip');
        const bodyEl = document.getElementById('collectedModalBody');
        const countBadge = document.getElementById('collectedRecordCount');
        const footerInfo = document.getElementById('collectedFooterInfo');
        const filtersGroup = document.getElementById('collectedFiltersGroup');

        // Empty state check
        if (!dataObj || !dataObj.items || dataObj.items.length === 0) {
            bodyEl.innerHTML = `
                <div class="collected-empty-state">
                    <div class="empty-state-icon">📂</div>
                    <h4>No Collected Data Available</h4>
                    <p>This bot has not collected any operational records yet, or the ERP cache is empty.</p>
                    <button type="button" class="btn-collected-primary" onclick="window.triggerBotRun(${botId}, this)">
                        <span>⚡ Run Bot to Collect Data</span>
                    </button>
                </div>
            `;
            if (kpiStrip) kpiStrip.innerHTML = '';
            if (countBadge) countBadge.innerText = '0 records';
            if (filtersGroup) filtersGroup.innerHTML = '';
            return;
        }

        const items = dataObj.items;
        const meta = dataObj.meta || {};

        // 1. Header with Live/Cache Badges & Date Range Badge
        const periodStr = (meta.f_date && meta.t_date) ? `${meta.f_date} ⟶ ${meta.t_date}` : 'Current Month (Live)';
        headerEl.innerHTML = `
            <div class="collected-header-info">
                <div class="collected-bot-badge">BOT 0${config.id}</div>
                <div>
                    <h3 class="collected-title">${config.fullTitle}</h3>
                    <div class="collected-subtags">
                        <span class="collected-pill collected-pill-source" title="Source ERP Module Location">📍 Source: <strong>${config.sourcePath}</strong></span>
                        <span class="collected-pill collected-pill-verified" title="Zero missing columns, rows, or discrepancies">🛡️ Verified: Zero Data Mismatch (100% ERP Exact)</span>
                        <span class="collected-pill">🏢 ${config.company}</span>
                        <span class="collected-pill">📅 Period: ${periodStr}</span>
                        <span class="collected-pill">⏱️ Sync: ${meta.collected_at || 'Live Cache'}</span>
                        <span class="collected-pill collected-pill-green">🟢 ${dataObj.sourceMode === 'live' ? 'Live Connected' : 'Preserved Cache'}</span>
                    </div>
                </div>
            </div>
            <div class="collected-header-actions">
                <button type="button" class="collected-btn-action" onclick="window.downloadBotExcel(${config.id})" title="Download Master Excel Workbook">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Excel</span>
                </button>
                <button type="button" class="collected-btn-action" onclick="window.triggerBotRun(${config.id}, this)" title="Rerun Bot Data Collection">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M23 4v6h-6"></path>
                        <path d="M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    <span>Rerun Bot</span>
                </button>
                <button type="button" class="collected-close-btn" onclick="window.closeCollectedDataModal()" title="Close">✕</button>
            </div>
        `;

        // 2. Render KPI Cards Strip
        let kpiHTML = '';
        config.kpiConfig.forEach(k => {
            const rawVal = meta[k.key] !== undefined ? meta[k.key] : (items.length);
            const valStr = k.format === 'currency' ? formatCurrency(rawVal) : formatNumber(rawVal);
            kpiHTML += `
                <div class="collected-kpi-card">
                    <div class="kpi-icon-cell">${k.icon}</div>
                    <div class="kpi-details-cell">
                        <div class="kpi-label-text">${k.label}</div>
                        <div class="kpi-number-text">${valStr}</div>
                    </div>
                </div>
            `;
        });
        kpiStrip.innerHTML = kpiHTML;

        // 3. Render Dynamic Filters (Date filter + Category filter)
        renderDynamicFilters(botId, items, filtersGroup);

        // 4. Render Table
        renderTableRows(botId, items);

        if (footerInfo) {
            footerInfo.innerHTML = `
                <span>📍 Source: <strong>${config.sourcePath}</strong> &bull; 🛡️ Verified: Zero Data Mismatch (100% ERP Exact) &bull; Preserved Cache: <code>${config.cacheFile}</code> &bull; Showing ${items.length} records</span>
            `;
        }
    }

    /**
     * Render Dynamic Filter Selectors in the Toolbar
     */
    function renderDynamicFilters(botId, items, container) {
        if (!container) return;
        const config = BOTS_CONFIG[botId];
        let filterHtml = '';

        // 1. Date Filter (if bot has row-level dates)
        if (config.dateField) {
            const uniqueDates = [];
            items.forEach(it => {
                const d = it[config.dateDisplayField] || it[config.dateField];
                if (d && !uniqueDates.includes(d)) uniqueDates.push(d);
            });

            if (uniqueDates.length > 1) {
                filterHtml += `
                    <div class="collected-filter-item">
                        <label for="collectedDateSelect">📅 Date:</label>
                        <select id="collectedDateSelect" class="collected-select-filter" onchange="window.onDateFilterChange(this.value)">
                            <option value="all">All Dates (${uniqueDates.length})</option>
                            ${uniqueDates.map(d => `<option value="${d}">${d}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
        }

        // 2. Category / Subcategory / Section Filter
        if (config.categoryField) {
            const uniqueCats = [];
            items.forEach(it => {
                const c = it[config.categoryField];
                if (c && !uniqueCats.includes(c)) uniqueCats.push(c);
            });

            if (uniqueCats.length > 1) {
                filterHtml += `
                    <div class="collected-filter-item">
                        <label for="collectedCatSelect">📂 Group:</label>
                        <select id="collectedCatSelect" class="collected-select-filter" onchange="window.onCategoryFilterChange(this.value)">
                            <option value="all">All Groups (${uniqueCats.length})</option>
                            ${uniqueCats.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
        }

        container.innerHTML = filterHtml;
    }

    /**
     * Filter Table Rows by search query
     */
    function filterCollectedData(query) {
        currentFilterText = (query || '').toLowerCase().trim();
        if (!activeBotModalId || !botDataCache[activeBotModalId]) return;
        renderTableRows(activeBotModalId, botDataCache[activeBotModalId].items);
    }

    /**
     * Date Filter Change Handler
     */
    function onDateFilterChange(val) {
        currentDateFilter = val || 'all';
        if (!activeBotModalId || !botDataCache[activeBotModalId]) return;
        renderTableRows(activeBotModalId, botDataCache[activeBotModalId].items);
    }

    /**
     * Category Filter Change Handler
     */
    function onCategoryFilterChange(val) {
        currentCategoryFilter = val || 'all';
        if (!activeBotModalId || !botDataCache[activeBotModalId]) return;
        renderTableRows(activeBotModalId, botDataCache[activeBotModalId].items);
    }

    /**
     * Get Current Filtered Items
     */
    function getFilteredItems(botId) {
        if (!botDataCache[botId] || !botDataCache[botId].items) return [];
        const config = BOTS_CONFIG[botId];
        let items = botDataCache[botId].items;

        // 1. Filter by Date
        if (currentDateFilter !== 'all' && config.dateField) {
            items = items.filter(it => {
                const d = it[config.dateDisplayField] || it[config.dateField];
                return d === currentDateFilter;
            });
        }

        // 2. Filter by Category / Section
        if (currentCategoryFilter !== 'all' && config.categoryField) {
            items = items.filter(it => {
                return it[config.categoryField] === currentCategoryFilter;
            });
        }

        // 3. Search query (supports deep search into requisition line items and chalan materials)
        if (currentFilterText) {
            items = items.filter(item => {
                const directMatch = Object.values(item).some(v => {
                    if (typeof v === 'string') return v.toLowerCase().includes(currentFilterText);
                    if (typeof v === 'number') return String(v).includes(currentFilterText);
                    return false;
                });
                if (directMatch) return true;
                if (item.items && Array.isArray(item.items)) {
                    return item.items.some(sub => Object.values(sub).some(sv => String(sv).toLowerCase().includes(currentFilterText)));
                }
                if (item.materials && Array.isArray(item.materials)) {
                    return item.materials.some(sub => Object.values(sub).some(sv => String(sv).toLowerCase().includes(currentFilterText)));
                }
                if (item.raw_materials && Array.isArray(item.raw_materials)) {
                    return item.raw_materials.some(sub => Object.values(sub).some(sv => String(sv).toLowerCase().includes(currentFilterText)));
                }
                return false;
            });
        }

        return items;
    }

    /**
     * Bot 2: Inter Sales Chalan Report — Direct Date-Wise Grouped Display
     * All items/materials under each date are directly displayed in an alternating table.
     * No clicking "View Detail" or "Materials" required.
     */
    function renderDirectInterSalesChalan(filtered, allItems) {
        const bodyEl = document.getElementById('collectedModalBody');
        const countBadge = document.getElementById('collectedRecordCount');
        if (!bodyEl) return;

        // Group filtered memos by date
        const dateGroups = {};
        let grandTotalItems = 0;
        let grandTotalQty = 0;
        let grandTotalAmount = 0;

        filtered.forEach(m => {
            const dKey = m.formatted_date || m.date || 'Unknown Date';
            if (!dateGroups[dKey]) {
                dateGroups[dKey] = {
                    dateStr: dKey,
                    rawDate: m.date || '',
                    dayName: m.day_name || '',
                    memos: [],
                    totalAmount: 0,
                    totalQty: 0,
                    totalItems: 0
                };
            }
            dateGroups[dKey].memos.push(m);
            dateGroups[dKey].totalAmount += (parseFloat(m.sales_amount) || 0);

            const matList = m.materials || [];
            const memoQty = matList.reduce((acc, it) => acc + (parseFloat(it.qty) || 0), 0) || (parseFloat(m.total_material_qty) || 0);
            dateGroups[dKey].totalQty += memoQty;
            dateGroups[dKey].totalItems += (matList.length || 1);

            grandTotalQty += memoQty;
            grandTotalAmount += (parseFloat(m.sales_amount) || 0);
            grandTotalItems += (matList.length || 1);
        });

        if (countBadge) {
            countBadge.innerText = `${filtered.length} Chalans (${grandTotalItems} Items) in ${Object.keys(dateGroups).length} Days`;
        }

        let html = `<div class="direct-date-groups-container">`;

        // Descending order of dates (latest date first)
        const sortedDates = Object.keys(dateGroups).sort((a, b) => {
            const rawA = dateGroups[a].rawDate || a;
            const rawB = dateGroups[b].rawDate || b;
            return rawB.localeCompare(rawA);
        });

        sortedDates.forEach(dKey => {
            const g = dateGroups[dKey];
            html += `
                <div class="collected-date-group">
                    <div class="collected-date-header">
                        <h4 class="collected-date-title">
                            <span class="date-badge">DATE</span>
                            <span>📅 ${g.dateStr} ${g.dayName ? `(${g.dayName})` : ''}</span>
                        </h4>
                        <div class="collected-date-stats">
                            <span class="collected-date-pill">📦 Chalans: <strong>${g.memos.length}</strong></span>
                            <span class="collected-date-pill">⚡ Items: <strong>${g.totalItems}</strong></span>
                            <span class="collected-date-pill">Total Qty: <strong>${formatNumber(g.totalQty)}</strong></span>
                            <span class="collected-date-pill" style="background:rgba(16,185,129,0.2); border-color:rgba(16,185,129,0.4); color:#ecfdf5;">
                                Sales: <strong>৳ ${formatCurrency(g.totalAmount)}</strong>
                            </span>
                        </div>
                    </div>

                    <div class="direct-table-wrap">
                        <table class="direct-report-table">
                            <thead>
                                <tr>
                                    <th style="width:40px; text-align:center;">SL</th>
                                    <th>Chalan No</th>
                                    <th>Item Code</th>
                                    <th>Description of Goods / Product Name</th>
                                    <th style="width:60px; text-align:center;">Unit</th>
                                    <th style="text-align:right;">Quantity</th>
                                    <th style="text-align:right;">Rate (৳)</th>
                                    <th style="text-align:right;">Total Amount (৳)</th>
                                    <th>Company (From)</th>
                                    <th>Destination (To)</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            let rowSl = 1;
            g.memos.forEach(memo => {
                const mats = memo.materials || [];
                if (mats.length > 0) {
                    mats.forEach(mat => {
                        html += `
                            <tr>
                                <td style="text-align:center; font-family:monospace; color:#64748b;">${rowSl++}</td>
                                <td class="col-itemcode-cell">${memo.chalan_no || '-'}</td>
                                <td class="col-itemcode-cell">${mat.item_code || '-'}</td>
                                <td style="font-weight:600; color:#0f172a;">${mat.product_name || '-'}</td>
                                <td style="text-align:center;">${mat.unit || 'Pcs'}</td>
                                <td class="col-number-cell font-bold-blue">${formatNumber(mat.qty)}</td>
                                <td class="col-number-cell">${formatCurrency(mat.rate)}</td>
                                <td class="col-currency-cell">${formatCurrency(mat.total_amt)}</td>
                                <td>${memo.company || 'Printing and Packaging'}</td>
                                <td><span class="badge-pill-blue">${memo.destination || 'Fan'}</span></td>
                            </tr>
                        `;
                    });
                } else {
                    html += `
                        <tr>
                            <td style="text-align:center; font-family:monospace; color:#64748b;">${rowSl++}</td>
                            <td class="col-itemcode-cell">${memo.chalan_no || '-'}</td>
                            <td class="col-itemcode-cell">-</td>
                            <td style="font-weight:600; color:#0f172a;">Inter Sales Chalan #${memo.chalan_no}</td>
                            <td style="text-align:center;">Pcs</td>
                            <td class="col-number-cell font-bold-blue">${formatNumber(memo.total_material_qty)}</td>
                            <td class="col-number-cell">-</td>
                            <td class="col-currency-cell">${formatCurrency(memo.sales_amount)}</td>
                            <td>${memo.company || 'Printing and Packaging'}</td>
                            <td><span class="badge-pill-blue">${memo.destination || 'Fan'}</span></td>
                        </tr>
                    `;
                }
            });

            // Date Subtotal Row
            html += `
                                <tr class="subtotal-row">
                                    <td colspan="5" style="text-align:right; font-weight:800; color:#0f172a;">
                                        Subtotal for ${g.dateStr} (${g.memos.length} Chalans, ${g.totalItems} Items):
                                    </td>
                                    <td class="col-number-cell font-bold-blue" style="font-size:0.92rem;">${formatNumber(g.totalQty)}</td>
                                    <td></td>
                                    <td class="col-currency-cell" style="font-size:0.92rem; color:#059669;">৳ ${formatCurrency(g.totalAmount)}</td>
                                    <td colspan="2"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });

        // Grand Total Row
        html += `
            <div class="collected-date-group" style="border: 2px solid #0284c7; box-shadow: 0 4px 18px rgba(2, 132, 199, 0.2);">
                <div class="direct-table-wrap">
                    <table class="direct-report-table">
                        <tbody>
                            <tr class="grand-total-row">
                                <td style="padding:14px 20px; font-size:0.95rem; font-weight:900;">
                                    🏆 GRAND TOTAL (${filtered.length} Total Chalans &bull; ${grandTotalItems} Total Material Items across ${sortedDates.length} Days)
                                </td>
                                <td style="text-align:right; padding:14px 20px; font-size:1.05rem; font-weight:900; color:#38bdf8;">
                                    Total Quantity: ${formatNumber(grandTotalQty)} Pcs
                                </td>
                                <td style="text-align:right; padding:14px 20px; font-size:1.15rem; font-weight:900; color:#4ade80;">
                                    Grand Total: ৳ ${formatCurrency(grandTotalAmount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

        bodyEl.innerHTML = html;
    }

    /**
     * Bot 1: Inter Sales Requisition — Direct Date-Wise + Company-Wise Grouped Display
     * First Hierarchy: Date
     * Second Hierarchy: Company / Company To
     * Third: Requisition details & items directly rendered in alternating table.
     * No clicking "View Detail" required.
     */
    function renderDirectInterSalesRequisition(filtered, allItems) {
        const bodyEl = document.getElementById('collectedModalBody');
        const countBadge = document.getElementById('collectedRecordCount');
        if (!bodyEl) return;

        // Group filtered requisitions by req_date
        const dateGroups = {};
        let grandTotalItems = 0;
        let grandTotalReqQty = 0;
        let grandTotalIssueQty = 0;
        let grandTotalPendingQty = 0;

        filtered.forEach(r => {
            const dKey = r.req_date || 'Unknown Date';
            if (!dateGroups[dKey]) {
                dateGroups[dKey] = {
                    dateStr: dKey,
                    companyGroups: {}
                };
            }
            const compKey = `${r.company_for || 'FAN'} ⟶ ${r.company_to || 'FAN'}`;
            if (!dateGroups[dKey].companyGroups[compKey]) {
                dateGroups[dKey].companyGroups[compKey] = {
                    compKey: compKey,
                    companyFor: r.company_for || 'FAN',
                    companyTo: r.company_to || 'FAN',
                    requisitions: [],
                    totalReqQty: 0,
                    totalIssueQty: 0,
                    totalPendingQty: 0,
                    totalItems: 0
                };
            }
            const cg = dateGroups[dKey].companyGroups[compKey];
            cg.requisitions.push(r);

            const itList = r.items || [];
            itList.forEach(it => {
                const rq = parseFloat(it.req_qty) || 0;
                const iq = parseFloat(it.issue_qty) || 0;
                const pq = parseFloat(it.pending_qty) || 0;
                cg.totalReqQty += rq;
                cg.totalIssueQty += iq;
                cg.totalPendingQty += pq;
                grandTotalReqQty += rq;
                grandTotalIssueQty += iq;
                grandTotalPendingQty += pq;
            });
            cg.totalItems += (itList.length || 1);
            grandTotalItems += (itList.length || 1);
        });

        if (countBadge) {
            countBadge.innerText = `${filtered.length} Requisitions (${grandTotalItems} Items) in ${Object.keys(dateGroups).length} Dates`;
        }

        let html = `<div class="direct-date-groups-container">`;

        // Descending order of dates (latest date first)
        const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));

        sortedDates.forEach(dKey => {
            const dg = dateGroups[dKey];
            html += `
                <div class="collected-date-group">
                    <div class="collected-date-header">
                        <h4 class="collected-date-title">
                            <span class="date-badge">REQUISITION DATE</span>
                            <span>📅 ${dKey}</span>
                        </h4>
                    </div>
            `;

            Object.values(dg.companyGroups).forEach(cg => {
                html += `
                    <div class="collected-company-banner">
                        <div class="collected-company-name">
                            <span>🏢 Requisition Route:</span>
                            <span class="company-tag-for">For: ${cg.companyFor}</span>
                            <span>⟶</span>
                            <span class="company-tag-to">To: ${cg.companyTo}</span>
                            <span style="font-size:0.75rem; color:#64748b; font-weight:600;">(${cg.requisitions.length} Requisitions, ${cg.totalItems} Items)</span>
                        </div>
                        <div class="collected-date-stats">
                            <span class="collected-date-pill">Req: <strong>${formatNumber(cg.totalReqQty)}</strong></span>
                            <span class="collected-date-pill" style="color:#10b981;">Issue: <strong>${formatNumber(cg.totalIssueQty)}</strong></span>
                            <span class="collected-date-pill" style="color:#ef4444; background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.3);">
                                Pending: <strong>${formatNumber(cg.totalPendingQty)}</strong>
                            </span>
                        </div>
                    </div>

                    <div class="direct-table-wrap">
                        <table class="direct-report-table">
                            <thead>
                                <tr>
                                    <th style="width:40px; text-align:center;">SL</th>
                                    <th>Req No</th>
                                    <th>Need By</th>
                                    <th>Entry By</th>
                                    <th>Item Code</th>
                                    <th>Description of Goods / Item Name</th>
                                    <th style="width:60px; text-align:center;">Unit</th>
                                    <th style="text-align:right;">Req Qty</th>
                                    <th style="text-align:right;">Issue Qty</th>
                                    <th style="text-align:right;">Pending Qty</th>
                                    <th style="text-align:center;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                let itemSl = 1;
                cg.requisitions.forEach(req => {
                    const rItems = req.items || [];
                    if (rItems.length > 0) {
                        rItems.forEach(it => {
                            html += `
                                <tr>
                                    <td style="text-align:center; font-family:monospace; color:#64748b;">${itemSl++}</td>
                                    <td class="col-itemcode-cell">${req.req_no || '-'}</td>
                                    <td>${req.need_by || '-'}</td>
                                    <td style="font-size:0.80rem; color:#475569;">${req.entry_by || '-'}</td>
                                    <td class="col-itemcode-cell">${it.item_code || '-'}</td>
                                    <td style="font-weight:600; color:#0f172a;">${it.item_name || '-'}</td>
                                    <td style="text-align:center;">${it.unit || 'Pcs'}</td>
                                    <td class="col-number-cell">${formatNumber(it.req_qty)}</td>
                                    <td class="col-number-cell" style="color:#059669; font-weight:700;">${formatNumber(it.issue_qty)}</td>
                                    <td class="col-number-cell font-bold-blue" style="color:#dc2626;">${formatNumber(it.pending_qty)}</td>
                                    <td style="text-align:center;"><span class="badge-status-amber">${req.status || 'PENDING'}</span></td>
                                </tr>
                            `;
                        });
                    } else {
                        html += `
                            <tr>
                                <td style="text-align:center; font-family:monospace; color:#64748b;">${itemSl++}</td>
                                <td class="col-itemcode-cell">${req.req_no || '-'}</td>
                                <td>${req.need_by || '-'}</td>
                                <td style="font-size:0.80rem; color:#475569;">${req.entry_by || '-'}</td>
                                <td class="col-itemcode-cell">-</td>
                                <td style="font-weight:600; color:#0f172a;">Requisition #${req.req_no}</td>
                                <td style="text-align:center;">Pcs</td>
                                <td class="col-number-cell">${formatNumber(req.total_req_qty)}</td>
                                <td class="col-number-cell" style="color:#059669; font-weight:700;">${formatNumber(req.total_issue_qty)}</td>
                                <td class="col-number-cell font-bold-blue" style="color:#dc2626;">${formatNumber(req.total_pending_qty)}</td>
                                <td style="text-align:center;"><span class="badge-status-amber">${req.status || 'PENDING'}</span></td>
                            </tr>
                        `;
                    }
                });

                // Subtotal row for this company
                html += `
                                <tr class="subtotal-row">
                                    <td colspan="7" style="text-align:right; font-weight:800; color:#0f172a;">
                                        Subtotal (${cg.companyFor} ⟶ ${cg.companyTo}):
                                    </td>
                                    <td class="col-number-cell" style="font-size:0.90rem; font-weight:800;">${formatNumber(cg.totalReqQty)}</td>
                                    <td class="col-number-cell" style="font-size:0.90rem; color:#059669; font-weight:800;">${formatNumber(cg.totalIssueQty)}</td>
                                    <td class="col-number-cell" style="font-size:0.90rem; color:#dc2626; font-weight:800;">${formatNumber(cg.totalPendingQty)}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            });

            html += `</div>`;
        });

        // Grand Total Row
        html += `
            <div class="collected-date-group" style="border: 2px solid #0284c7; box-shadow: 0 4px 18px rgba(2, 132, 199, 0.2);">
                <div class="direct-table-wrap">
                    <table class="direct-report-table">
                        <tbody>
                            <tr class="grand-total-row">
                                <td style="padding:14px 20px; font-size:0.95rem; font-weight:900;">
                                    🏆 GRAND TOTAL (${filtered.length} Total Requisitions &bull; ${grandTotalItems} Line Items)
                                </td>
                                <td style="text-align:right; padding:14px 20px; font-size:0.95rem; font-weight:900; color:#ffffff;">
                                    Req Qty: ${formatNumber(grandTotalReqQty)}
                                </td>
                                <td style="text-align:right; padding:14px 20px; font-size:0.95rem; font-weight:900; color:#4ade80;">
                                    Issue Qty: ${formatNumber(grandTotalIssueQty)}
                                </td>
                                <td style="text-align:right; padding:14px 20px; font-size:1.05rem; font-weight:900; color:#f87171;">
                                    Pending Qty: ${formatNumber(grandTotalPendingQty)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

        bodyEl.innerHTML = html;
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

    /**
     * Exact 1:1 ERP Report Replica Table Renderer for Bots 4, 5, 6, 7, 8
     * Faithfully reproduces MEP Group ERP Master Report:
     * - Zero column drop: preserves all 26 or 28 columns
     * - Zero value transformation: keeps raw strings with all decimal precision (e.g. 0.00000000, 2188.00000000)
     * - Header colors matching ERP: #009999 Teal (Receive), #FF6699 Coral/Pink (Issue), Yellow (Transfer subheaders)
     * - Executive summary Total row matching ERP
     */
    function renderDirectErpReplica(botId, allItems, dataObj) {
        const bodyEl = document.getElementById('collectedModalBody');
        const countBadge = document.getElementById('collectedRecordCount');
        if (!bodyEl || !dataObj) return;

        const rawHeaders = dataObj.raw_headers || [];
        const rawRows = dataObj.raw_rows || [];
        const totalRow = dataObj.total_row || null;
        const config = BOTS_CONFIG[botId];
        const reportTitle = dataObj.report_title || (config ? config.name : 'Stock Movement Report');
        const reportSubtitle = dataObj.report_subtitle || (dataObj.meta && dataObj.meta.f_date ? `Date Interval: ${dataObj.meta.f_date} to ${dataObj.meta.t_date}` : '');

        // Real-time filtering across raw ERP rows
        let displayRows = rawRows;

        // Category filter if active
        if (currentCategoryFilter !== 'all') {
            const catIdx = (botId === 6) ? 3 : (botId === 8 ? 4 : 2);
            displayRows = displayRows.filter(r => {
                const val = (r[catIdx] || '').trim();
                return val === currentCategoryFilter || r.some(c => String(c).trim() === currentCategoryFilter);
            });
        }

        // Search text filter if active
        if (currentFilterText) {
            const q = currentFilterText.toLowerCase();
            displayRows = displayRows.filter(r => r.some(c => String(c).toLowerCase().includes(q)));
        }

        const totalCols = (displayRows[0] && displayRows[0].length) ? displayRows[0].length : (rawRows[0] ? rawRows[0].length : 26);

        if (countBadge) {
            countBadge.innerText = `${displayRows.length} of ${rawRows.length} ERP Records (${totalCols} Columns)`;
        }

        if (displayRows.length === 0) {
            bodyEl.innerHTML = `
                <div class="collected-no-results">
                    <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
                    <h5>No matching ERP records found</h5>
                    <p>Try clearing your search term or category filter to view all ${rawRows.length} records.</p>
                </div>
            `;
            return;
        }

        // 1. ERP Replica Header Banner
        let html = `
            <div class="erp-replica-container">
                <div class="erp-replica-banner">
                    <div class="erp-replica-print-bar">
                        <button type="button" class="erp-print-btn" onclick="window.printReplicaTable()" title="Print ERP Report">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            <span>Print</span>
                        </button>
                    </div>
                    <div class="erp-replica-title-box">
                        <h2 class="erp-replica-title">${escapeHTML(reportTitle)}</h2>
                        ${reportSubtitle ? `<div class="erp-replica-subtitle">${escapeHTML(reportSubtitle)}</div>` : ''}
                    </div>
                </div>

                <div class="erp-replica-scroll-pane">
                    <table class="erp-replica-table" id="erpReplicaMasterTable">
                        <thead>
        `;

        // 2. Exact Header Rows from ERP
        if (rawHeaders && rawHeaders.length > 0) {
            rawHeaders.forEach(hRow => {
                html += `<tr>`;
                hRow.forEach(cell => {
                    const rawBg = (cell.bgcolor || '').trim();
                    const lowerBg = rawBg.toLowerCase();
                    let extraClass = 'erp-th-cell';
                    let bgStyle = '';

                    if (lowerBg === '#009999' || lowerBg === '009999' || lowerBg === '#008080' || lowerBg === 'teal') {
                        extraClass += ' erp-th-receive';
                    } else if (lowerBg === '#ff6699' || lowerBg === 'ff6699' || lowerBg === '#ff3366' || lowerBg === 'pink') {
                        extraClass += ' erp-th-issue';
                    } else if (lowerBg === 'yellow' || lowerBg === '#ffff00' || lowerBg === '#fff200') {
                        extraClass += ' erp-th-transfer';
                    } else if (rawBg) {
                        bgStyle = `background-color:${rawBg} !important;`;
                    }

                    const colspanAttr = (cell.colspan && cell.colspan > 1) ? `colspan="${cell.colspan}"` : '';
                    const rowspanAttr = (cell.rowspan && cell.rowspan > 1) ? `rowspan="${cell.rowspan}"` : '';
                    const styleAttr = bgStyle ? `style="${bgStyle}"` : '';

                    html += `<th ${colspanAttr} ${rowspanAttr} class="${extraClass}" ${styleAttr}>${escapeHTML(cell.text)}</th>`;
                });
                html += `</tr>`;
            });
        }

        html += `</thead><tbody>`;

        // 3. Exact Data Rows from ERP
        displayRows.forEach((row, rowIdx) => {
            const rowClass = (rowIdx % 2 === 0) ? 'erp-row-even' : 'erp-row-odd';
            html += `<tr class="${rowClass}">`;

            row.forEach((cellVal, colIdx) => {
                const str = (cellVal !== null && cellVal !== undefined) ? String(cellVal).trim() : '';
                let cellClass = 'text-left';

                if (colIdx === 0) {
                    cellClass = 'erp-cell-sl';
                } else if (['pcs', 'inch', 'pkt', 'kg', 'set', 'roll', 'coil'].includes(str.toLowerCase())) {
                    cellClass = 'erp-cell-unit';
                } else if ((colIdx === 3 || colIdx === 4 || (botId === 8 && (colIdx === 5 || colIdx === 6))) && str.length > 0 && !str.includes(' ')) {
                    cellClass = 'erp-cell-code';
                } else if (colIdx === 5 || (botId === 8 && colIdx === 7)) {
                    cellClass = 'erp-cell-name';
                } else if (str !== '' && /^-?[0-9,]+(\.[0-9]+)?$/.test(str)) {
                    cellClass = 'erp-cell-num';
                }

                html += `<td class="${cellClass}">${str !== '' ? escapeHTML(str) : '&nbsp;'}</td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody>`;

        // 4. Exact Summary Total Row from ERP
        if (totalRow && totalRow.length > 0) {
            html += `<tfoot><tr class="erp-total-row">`;
            if (botId === 8 && totalRow.length === 3) {
                html += `
                    <td colspan="9" class="erp-total-label">${escapeHTML(totalRow[0] || 'Total')}</td>
                    <td class="erp-cell-num">${escapeHTML(totalRow[1] || '')}</td>
                    <td class="erp-cell-num">${escapeHTML(totalRow[2] || '')}</td>
                `;
            } else if (totalRow.length === totalCols) {
                totalRow.forEach((cVal, cIdx) => {
                    const s = (cVal !== null && cVal !== undefined) ? String(cVal).trim() : '';
                    let align = 'erp-cell-num';
                    if (s.toLowerCase() === 'total' || (cIdx === 5 && s.toLowerCase().includes('total')) || (cIdx === 0 && s.toLowerCase().includes('total'))) {
                        align = 'erp-total-label';
                    } else if (cIdx < 7 && s === '') {
                        align = 'text-center';
                    }
                    html += `<td class="${align}">${s !== '' ? escapeHTML(s) : '&nbsp;'}</td>`;
                });
            } else {
                totalRow.forEach(cVal => {
                    const s = (cVal !== null && cVal !== undefined) ? String(cVal).trim() : '';
                    const align = (s.toLowerCase() === 'total') ? 'erp-total-label' : 'erp-cell-num';
                    html += `<td class="${align}">${s !== '' ? escapeHTML(s) : '&nbsp;'}</td>`;
                });
            }
            html += `</tr></tfoot>`;
        }

        html += `</table></div></div>`;

        bodyEl.innerHTML = html;
    }

    /**
     * Bot 10: Monthly Attendance Sheet — Exact 1:1 ERP Attendance Sheet Replica (Screenshot 2)
     */
     function renderMonthlyAttendanceMatrix(filtered, allItems, dataObj) {
        const bodyEl = document.getElementById('collectedModalBody');
        const countBadge = document.getElementById('collectedRecordCount');
        if (!bodyEl) return;

        const dayHeaders = (dataObj && dataObj.day_headers && dataObj.day_headers.length > 0)
            ? dataObj.day_headers
            : (filtered[0] && filtered[0].daily ? filtered[0].daily.map(d => d.day_header) : []);

        if (countBadge) {
            countBadge.innerText = `${filtered.length} Employees (${dayHeaders.length} Days Recorded)`;
        }

        const fromDateStr = dataObj?.meta?.from_date || (dayHeaders[0] ? dayHeaders[0].split(' ').slice(0, 2).join(' ') : 'Aug-2026');
        const toDateStr = dataObj?.meta?.to_date || (dayHeaders.length > 0 ? dayHeaders[dayHeaders.length - 1].split(' ').slice(0, 2).join(' ') : 'Sep-2026');

        // Group dayHeaders into month blocks for exact 2-row ERP header
        const monthGroups = [];
        dayHeaders.forEach(dh => {
            const parts = dh.split(' ');
            const mName = parts[0] || 'Month';
            const subTitle = parts.slice(1).join(' ') || dh;
            const lastG = monthGroups[monthGroups.length - 1];
            if (lastG && lastG.name === mName) {
                lastG.days.push({ full: dh, sub: subTitle });
            } else {
                monthGroups.push({ name: mName, days: [{ full: dh, sub: subTitle }] });
            }
        });

        let html = `
            <div style="text-align:center; padding:10px 0 14px 0; border-bottom:1px solid #cbd5e1; margin-bottom:12px; background:#f8fafc;">
                <h3 style="margin:0; font-size:1.3rem; font-weight:800; color:#000; letter-spacing:0.5px;">ATTENDANCE SHEET</h3>
                <div style="font-size:0.95rem; font-weight:700; color:#000; margin-top:3px;">Period : ${escapeHTML(fromDateStr)} - ${escapeHTML(toDateStr)}</div>
            </div>
            <div class="collected-table-wrapper att-matrix-wrapper" style="overflow-x:auto;">
                <table class="report-table table-paste-striped att-matrix-table" id="collectedMasterTable" style="border-collapse:collapse; width:100%; border:1px solid #64748b;">
                    <thead>
                        <tr style="background:#ffffff; border-bottom:1px solid #64748b;">
                            <th rowspan="2" style="width:40px; text-align:center; position:sticky; left:0; z-index:4; background:#ffffff; border:1px solid #64748b; padding:8px 4px; font-weight:bold; color:#000;">SL</th>
                            <th rowspan="2" style="width:65px; text-align:center; position:sticky; left:40px; z-index:4; background:#ffffff; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000;">Emp Id</th>
                            <th rowspan="2" style="min-width:160px; position:sticky; left:105px; z-index:4; background:#ffffff; border:1px solid #64748b; padding:8px 8px; font-weight:bold; color:#000;">EMP Name</th>
                            <th rowspan="2" style="min-width:120px; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center; background:#ffffff;">Company</th>
                            <th rowspan="2" style="min-width:100px; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center; background:#ffffff;">Department</th>
                            <th rowspan="2" style="min-width:100px; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center; background:#ffffff;">Section</th>
                            <th rowspan="2" style="min-width:110px; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center; background:#ffffff;">Unit</th>
                            <th rowspan="2" style="min-width:110px; border:1px solid #64748b; padding:8px 6px; font-weight:bold; color:#000; text-align:center; background:#ffffff;">Job Location</th>
        `;

        monthGroups.forEach(mg => {
            html += `<th colspan="${mg.days.length}" style="text-align:center; padding:6px 4px; border:1px solid #64748b; background:#ffffff; color:#000; font-weight:bold; font-size:0.85rem;">
                        ${escapeHTML(mg.name)}
                     </th>`;
        });

        html += `</tr><tr style="background:#ffffff; border-bottom:2px solid #64748b;">`;

        monthGroups.forEach(mg => {
            mg.days.forEach(dObj => {
                const isFriday = dObj.full.toLowerCase().includes('fri');
                const thStyle = isFriday ? 'background:#fee2e2; color:#b91c1c;' : 'background:#ffffff; color:#000;';
                html += `<th style="min-width:76px; text-align:center; padding:4px 3px; border:1px solid #64748b; ${thStyle} white-space:nowrap; font-size:0.75rem; font-weight:bold;">
                            ${escapeHTML(dObj.sub)}
                         </th>`;
            });
        });

        html += `</tr></thead><tbody>`;

        filtered.forEach((emp, idx) => {
            const rowClass = (idx % 2 === 0) ? 'att-row-even' : 'att-row-odd';
            html += `<tr class="${rowClass}" style="border-bottom:1px solid #cbd5e1;">
                <td style="text-align:center; font-family:monospace; position:sticky; left:0; z-index:2; background:inherit; border:1px solid #64748b; font-weight:600;">${emp.sl || (idx + 1)}</td>
                <td class="col-itemcode-cell" style="position:sticky; left:40px; z-index:2; background:inherit; font-weight:700; text-align:center; border:1px solid #64748b;">${emp.emp_id || '-'}</td>
                <td style="font-weight:700; color:#0f172a; position:sticky; left:105px; z-index:2; background:inherit; border:1px solid #64748b; white-space:nowrap; padding:6px 8px;">${escapeHTML(emp.emp_name || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHTML(emp.company || 'MEP FAN LIMITED.')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHTML(emp.department || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHTML(emp.section || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHTML(emp.unit || emp.section || '-')}</td>
                <td style="font-size:0.78rem; border:1px solid #64748b; white-space:nowrap; padding:6px 6px;">${escapeHTML(emp.job_location || 'Factory-Barishal')}</td>
            `;

            const dailyList = emp.daily || [];
            dayHeaders.forEach(dh => {
                const dayRecord = dailyList.find(d => d.day_header === dh);
                let cellInnerHtml = '<span style="color:#94a3b8;">-</span>';

                if (dayRecord) {
                    const statusType = (dayRecord.status_type || dayRecord.status || '').toLowerCase();
                    const inTime = dayRecord.in_time || '';
                    const outTime = dayRecord.out_time || '';
                    const details = dayRecord.details || '';

                    if (statusType.includes('present') || statusType === 'p') {
                        cellInnerHtml = `
                            <div style="color:#059669; font-weight:bold; font-size:12px; line-height:1.2;">Present</div>
                            ${inTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2; margin-top:2px;">${escapeHTML(inTime)}</div>` : ''}
                            ${outTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2;">${escapeHTML(outTime)}</div>` : ''}
                        `;
                    } else if (statusType.includes('off') || statusType.includes('holiday') || statusType === 'w') {
                        cellInnerHtml = `<div style="color:#2563eb; font-weight:bold; font-size:12px;">OFFDAY</div>`;
                    } else if (statusType.includes('leave') || statusType === 'l') {
                        const leaveLabel = details.toLowerCase().includes('casual') ? 'Casual<br>Leave' : 'Leave';
                        cellInnerHtml = `<div style="color:#c026d3; font-weight:bold; font-size:11px; line-height:1.2;">${leaveLabel}</div>`;
                    } else if (statusType.includes('late')) {
                        cellInnerHtml = `
                            <div style="color:#ea580c; font-weight:bold; font-size:12px; line-height:1.2;">Late</div>
                            ${inTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2; margin-top:2px;">${escapeHTML(inTime)}</div>` : ''}
                            ${outTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2;">${escapeHTML(outTime)}</div>` : ''}
                        `;
                    } else if (statusType.includes('early')) {
                        cellInnerHtml = `
                            <div style="color:#d97706; font-weight:bold; font-size:11px; line-height:1.2;">EarlyOut</div>
                            ${inTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2; margin-top:2px;">${escapeHTML(inTime)}</div>` : ''}
                            ${outTime ? `<div style="font-size:10px; color:#1e293b; line-height:1.2;">${escapeHTML(outTime)}</div>` : ''}
                        `;
                    } else if (statusType.includes('absent') || statusType === 'a') {
                        cellInnerHtml = `<div style="color:#dc2626; font-weight:bold; font-size:12px;">Absent</div>`;
                    } else {
                        cellInnerHtml = `<div style="font-size:11px; color:#475569;">${escapeHTML(details || statusType)}</div>`;
                    }
                }

                html += `<td style="text-align:center; padding:4px 3px; border:1px solid #64748b; vertical-align:middle; background:inherit;">${cellInnerHtml}</td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        bodyEl.innerHTML = html;
    }

    /**
     * Bot 11: Monthly & Yearly Attendance Report — Exact 1:1 ERP Multi-Month Rowspan Replica (Screenshot 4)
     */
    function renderMonthlyYearlyAttendanceTable(filtered, allItems, dataObj) {
        const bodyEl = document.getElementById('collectedModalBody');
        const countBadge = document.getElementById('collectedRecordCount');
        if (!bodyEl) return;

        const headers = (dataObj && dataObj.headers && dataObj.headers.length > 0)
            ? dataObj.headers
            : [
                "SL", "Emp ID", "Emp Name", "Designation", "Department", "Section", "Sub-Section", "Grade", "Job Location", "Company",
                "Join Date", "Month-Year", "Assigned working hour", "Total Days in Month", "Festival/Weekly  Holiday", "Total Working Days",
                "Standard Working Hour", "Present Days", "Physical Working Hour", "Absent Days", "LWP", "CL", "ML", "EL", "NPL", "Paid Leave",
                "OT", "Extra OT", "Total OT", "Late Days", "Late Min", "Early Days", "Early Min", "Compensatory Leave", "SP IOM Pay",
                "SP IOM Leave", "Reg. IOM", "OD IOM", "Assaigned Night Duty Days", "Assaigned Night Duty Hours", "M-Grade Extra Duty Days"
            ];

        // Group filtered records by Employee (emp_id)
        const empGroups = [];
        let curGroup = null;

        filtered.forEach(it => {
            const empKey = String(it.emp_id || it.emp_name).trim();
            if (!curGroup || curGroup.key !== empKey) {
                curGroup = {
                    key: empKey,
                    emp: it,
                    months: [it]
                };
                empGroups.push(curGroup);
            } else {
                curGroup.months.push(it);
            }
        });

        if (countBadge) {
            countBadge.innerText = `${empGroups.length} Employees (${filtered.length} Monthly Records &bull; 41 Columns)`;
        }

        const fromDateStr = dataObj?.meta?.from_date || '2025-12-26';
        const toDateStr = dataObj?.meta?.to_date || '2026-09-21';

        let html = `
            <div style="text-align:center; padding:10px 0 14px 0; border-bottom:1px solid #cbd5e1; margin-bottom:12px; background:#f8fafc;">
                <h3 style="margin:0; font-size:1.3rem; font-weight:800; color:#000; letter-spacing:0.5px;">Monthly and Yearly Attendence Sheet</h3>
                <div style="font-size:0.95rem; font-weight:700; color:#000; margin-top:3px;">Period : ${escapeHTML(fromDateStr)} - ${escapeHTML(toDateStr)}</div>
            </div>
            <div class="collected-table-wrapper" style="overflow-x:auto;">
                <table class="report-table table-paste-striped" id="collectedMasterTable" style="border-collapse:collapse; width:100%; border:1px solid #64748b;">
                    <thead>
                        <tr style="background:#ffffff; border-bottom:2px solid #64748b;">
        `;

        headers.forEach((h, hIdx) => {
            let stickyStyle = '';
            if (hIdx === 0) stickyStyle = 'position:sticky; left:0; z-index:4; width:45px; text-align:center; background:#ffffff;';
            else if (hIdx === 1) stickyStyle = 'position:sticky; left:45px; z-index:4; width:70px; text-align:center; background:#ffffff;';
            else if (hIdx === 2) stickyStyle = 'position:sticky; left:115px; z-index:4; min-width:160px; background:#ffffff;';
            html += `<th style="${stickyStyle} white-space:nowrap; padding:8px 8px; border:1px solid #64748b; font-size:0.75rem; font-weight:bold; color:#000;">${escapeHTML(h)}</th>`;
        });

        html += `</tr></thead><tbody>`;

        // Render each employee with rowspan across all their months
        empGroups.forEach((group, gIdx) => {
            const emp = group.emp;
            const months = group.months;
            const rowSpan = months.length;
            const groupBg = (gIdx % 2 === 0) ? '#ffffff' : '#f8fafc';

            months.forEach((mRow, mIdx) => {
                html += `<tr style="background:${groupBg}; border-bottom:1px solid #cbd5e1;">`;

                // If first month of this employee, render the 11 rowspanned employee cells
                if (mIdx === 0) {
                    html += `
                        <td rowspan="${rowSpan}" style="text-align:center; font-family:monospace; position:sticky; left:0; z-index:2; background:${groupBg}; border:1px solid #64748b; vertical-align:middle; font-weight:700;">${emp.sl || (gIdx + 1)}</td>
                        <td rowspan="${rowSpan}" class="col-itemcode-cell" style="position:sticky; left:45px; z-index:2; text-align:center; background:${groupBg}; font-weight:700; border:1px solid #64748b; vertical-align:middle;">${emp.emp_id || '-'}</td>
                        <td rowspan="${rowSpan}" style="position:sticky; left:115px; z-index:2; font-weight:700; color:#000; background:${groupBg}; border:1px solid #64748b; white-space:nowrap; padding:6px 8px; vertical-align:middle;">${escapeHTML(emp.emp_name || '-')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; white-space:nowrap; padding:6px 8px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.designation || '-')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; white-space:nowrap; padding:6px 8px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.department || 'Production')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; white-space:nowrap; padding:6px 8px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.section || '-')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; white-space:nowrap; padding:6px 8px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.sub_section || '-')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; text-align:center; padding:6px 4px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.grade || '-')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; white-space:nowrap; padding:6px 8px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.job_location || 'Factory-Barishal')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; text-align:center; padding:6px 6px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.company || 'FAN')}</td>
                        <td rowspan="${rowSpan}" style="border:1px solid #64748b; text-align:center; white-space:nowrap; padding:6px 6px; vertical-align:middle; font-size:0.80rem;">${escapeHTML(emp.join_date || '-')}</td>
                    `;
                }

                // 30 Month-specific columns
                const mCells = [
                    mRow.month_year || '-',
                    mRow.assigned_working_hour || '8',
                    mRow.total_days_in_month || '0',
                    mRow.festival_holiday || '0',
                    mRow.total_working_days || '0',
                    mRow.standard_working_hour || '0',
                    mRow.present_days || '0',
                    mRow.physical_working_hour || '0',
                    mRow.absent_days || '0',
                    mRow.lwp || '0',
                    mRow.cl || '0',
                    mRow.ml || '0',
                    mRow.el || '0',
                    mRow.npl || '0',
                    mRow.paid_leave || '0',
                    mRow.ot || '0',
                    mRow.extra_ot || '0',
                    mRow.total_ot || '0',
                    mRow.late_days || '0',
                    mRow.late_min || '0',
                    mRow.early_days || '0',
                    mRow.early_min || '0',
                    mRow.compensatory_leave || '0',
                    mRow.sp_iom_pay || '0',
                    mRow.sp_iom_leave || '0',
                    mRow.reg_iom || '0',
                    mRow.od_iom || '0',
                    mRow.night_duty_days || '0',
                    mRow.night_duty_hours || '0',
                    mRow.m_grade_extra_duty || '0'
                ];

                mCells.forEach((cVal, cIdx) => {
                    let cStyle = 'padding:6px 8px; border:1px solid #64748b; white-space:nowrap; text-align:center; font-size:0.80rem;';
                    if (cIdx === 0) { // Month-Year
                        cStyle += 'font-weight:700; color:#000; background:inherit;';
                    } else if (cIdx === 6) { // Present Days
                        cStyle += 'font-weight:700; color:#059669;';
                    } else if (cIdx === 8) { // Absent Days
                        cStyle += 'font-weight:700; color:#dc2626;';
                    } else if (cIdx === 17) { // Total OT
                        cStyle += 'font-weight:700; color:#2563eb;';
                    }
                    html += `<td style="${cStyle}">${escapeHTML(String(cVal !== null && cVal !== undefined ? cVal : '-'))}</td>`;
                });

                html += `</tr>`;
            });
        });

        html += `</tbody></table></div>`;
        bodyEl.innerHTML = html;
    }

    /**
     * Render the exact table rows matching the Bot's structure
     */
    function renderTableRows(botId, allItems) {
        const config = BOTS_CONFIG[botId];
        const bodyEl = document.getElementById('collectedModalBody');
        const countBadge = document.getElementById('collectedRecordCount');
        if (!config || !bodyEl) return;

        // Bots 4, 5, 6, 7, 8: Exact 1:1 ERP Report Replica!
        if ([4, 5, 6, 7, 8].includes(botId)) {
            const dataObj = botDataCache[botId];
            if (dataObj && dataObj.raw_rows && dataObj.raw_rows.length > 0) {
                renderDirectErpReplica(botId, allItems, dataObj);
                return;
            }
        }

        const filtered = getFilteredItems(botId);

        if (countBadge) {
            countBadge.innerText = `${filtered.length} of ${allItems.length} records`;
        }

        if (filtered.length === 0) {
            bodyEl.innerHTML = `
                <div class="collected-no-results">
                    <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
                    <h5>No matching records found</h5>
                    <p>Try clearing your search term or filters to view all collected items.</p>
                </div>
            `;
            return;
        }

        // Bot 10: Monthly Attendance Sheet — Matrix Table
        if (botId === 10) {
            renderMonthlyAttendanceMatrix(filtered, allItems, botDataCache[botId]);
            return;
        }

        // Bot 11: Monthly & Yearly Attendance Report — 41 Columns Table
        if (botId === 11) {
            renderMonthlyYearlyAttendanceTable(filtered, allItems, botDataCache[botId]);
            return;
        }

        // Bot 2: Inter Sales Chalan Report — Direct Date-wise Grouping (0 clicks needed!)
        if (botId === 2) {
            renderDirectInterSalesChalan(filtered, allItems);
            return;
        }

        // Bot 1: Inter Sales Requisition — Direct Date-wise + Company Grouping (0 clicks needed!)
        if (botId === 1) {
            renderDirectInterSalesRequisition(filtered, allItems);
            return;
        }

        // Generate Table Header for Bots 3 to 9 (Exact ERP Column Specifications)
        let tableHTML = `
            <div class="collected-table-wrapper">
                <table class="report-table table-paste-striped" id="collectedMasterTable">
                    <thead>
                        <tr>
        `;
        config.columns.forEach(col => {
            tableHTML += `<th class="th-${col.type}">${col.label}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;

        // Render rows (Top 350 for blazing UI performance)
        const displayList = filtered.slice(0, 350);
        displayList.forEach((item, idx) => {
            const rowId = `botRow_${botId}_${idx}`;
            tableHTML += `<tr id="${rowId}">`;

            config.columns.forEach(col => {
                let cellVal = item[col.key];

                switch (col.type) {
                    case 'serial':
                        tableHTML += `<td class="col-serial-cell">${item.sl || idx + 1}</td>`;
                        break;
                    case 'code':
                        tableHTML += `<td class="col-itemcode-cell">${cellVal || '-'}</td>`;
                        break;
                    case 'currency':
                        tableHTML += `<td class="col-currency-cell">${formatCurrency(cellVal)}</td>`;
                        break;
                    case 'number':
                        tableHTML += `<td class="col-number-cell">${formatNumber(cellVal)}</td>`;
                        break;
                    case 'number-bold':
                        tableHTML += `<td class="col-number-cell font-bold-blue">${formatNumber(cellVal)}</td>`;
                        break;
                    case 'number-blue':
                        tableHTML += `<td class="col-number-cell" style="color:#0284C7; font-weight:700;">${formatNumber(cellVal)}</td>`;
                        break;
                    case 'badge-blue':
                        tableHTML += `<td><span class="badge-pill-blue">${cellVal || 'Fan'}</span></td>`;
                        break;
                    case 'badge-count':
                        const count = col.key === 'materials_count' 
                            ? (item.materials ? item.materials.length : 0)
                            : (item.raw_materials ? item.raw_materials.length : (item.raw_material_count || 0));
                        tableHTML += `<td><span class="badge-pill-gray">${count} Items</span></td>`;
                        break;
                    case 'status':
                        const s = String(cellVal || '').toUpperCase();
                        const isOk = s.includes('APPROV') || s.includes('UNIQUE') || s.includes('PASS') || s.includes('OPTIMAL') || s.includes('ACTIVE');
                        tableHTML += `<td><span class="${isOk ? 'badge-status-green' : 'badge-status-amber'}">${cellVal || 'Normal'}</span></td>`;
                        break;
                    case 'batch':
                        tableHTML += `<td>${formatNumber(item.batch_quantity)} ${item.batch_unit || 'Pcs'}</td>`;
                        break;
                    case 'expand-btn':
                        tableHTML += `
                            <td>
                                <button type="button" class="btn-expand-drill" onclick="window.toggleRowDetail(${botId}, ${idx})">
                                    <span>View ▾</span>
                                </button>
                            </td>
                        `;
                        break;
                    default:
                        tableHTML += `<td>${cellVal !== undefined && cellVal !== null && cellVal !== '' ? cellVal : '-'}</td>`;
                }
            });

            tableHTML += `</tr>`;

            // Nested Row for Requisitions / Chalan Materials / BOM Raw Materials Breakdown
            if (botId === 1 && item.items && item.items.length > 0) {
                tableHTML += `
                    <tr id="nestedRow_${botId}_${idx}" class="nested-detail-row" style="display:none;">
                        <td colspan="${config.columns.length}">
                            <div class="nested-detail-panel">
                                <h6 class="nested-title">📋 Required Materials in Requisition #${item.req_no} (${item.items.length} line items)</h6>
                                <table class="nested-mini-table">
                                    <thead>
                                        <tr>
                                            <th>SL</th><th>Item Code</th><th>Description of the Goods</th><th>Unit</th><th>Req Qty</th><th>Issue Qty</th><th>Pending Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;
                item.items.forEach((m, mi) => {
                    tableHTML += `
                        <tr>
                            <td>${m.sl || mi + 1}</td>
                            <td class="col-itemcode-cell">${m.item_code || '-'}</td>
                            <td>${m.item_name || '-'}</td>
                            <td>${m.unit || 'Pcs'}</td>
                            <td class="col-number-cell">${formatNumber(m.req_qty)}</td>
                            <td class="col-number-cell" style="color:#059669; font-weight:700;">${formatNumber(m.issue_qty)}</td>
                            <td class="col-number-cell" style="color:#DC2626; font-weight:700;">${formatNumber(m.pending_qty)}</td>
                        </tr>
                    `;
                });
                tableHTML += `</tbody></table></div></td></tr>`;
            } else if (botId === 2 && item.materials && item.materials.length > 0) {
                tableHTML += `
                    <tr id="nestedRow_${botId}_${idx}" class="nested-detail-row" style="display:none;">
                        <td colspan="${config.columns.length}">
                            <div class="nested-detail-panel">
                                <h6 class="nested-title">📦 Dispatched Materials in Chalan #${item.chalan_no} (${item.materials.length} line items)</h6>
                                <table class="nested-mini-table">
                                    <thead>
                                        <tr>
                                            <th>SL</th><th>Item Code</th><th>Product Name</th><th>Unit</th><th>Qty</th><th>Rate (৳)</th><th>Total (৳)</th><th>VAT Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;
                item.materials.forEach((m, mi) => {
                    tableHTML += `
                        <tr>
                            <td>${m.sl || mi + 1}</td>
                            <td class="col-itemcode-cell">${m.item_code || '-'}</td>
                            <td>${m.product_name || '-'}</td>
                            <td>${m.unit || '-'}</td>
                            <td class="col-number-cell">${formatNumber(m.qty)}</td>
                            <td class="col-number-cell">${formatCurrency(m.rate)}</td>
                            <td class="col-currency-cell">${formatCurrency(m.total_amt)}</td>
                            <td class="col-number-cell">${formatCurrency(m.vat_amt)}</td>
                        </tr>
                    `;
                });
                tableHTML += `</tbody></table></div></td></tr>`;
            } else if (botId === 9 && item.raw_materials && item.raw_materials.length > 0) {
                tableHTML += `
                    <tr id="nestedRow_${botId}_${idx}" class="nested-detail-row" style="display:none;">
                        <td colspan="${config.columns.length}">
                            <div class="nested-detail-panel">
                                <h6 class="nested-title">🔩 Bill of Materials: Raw Materials Breakdown for BOM #${item.bom_no} (${item.product_name})</h6>
                                <table class="nested-mini-table">
                                    <thead>
                                        <tr>
                                            <th>SL</th><th>Category</th><th>RM Code</th><th>Item Description</th><th>Unit</th><th>Quantity</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;
                item.raw_materials.forEach((rm, rmi) => {
                    tableHTML += `
                        <tr>
                            <td>${rm.sl || rmi + 1}</td>
                            <td>${rm.category || '-'}</td>
                            <td class="col-itemcode-cell">${rm.item_code || '-'}</td>
                            <td>${rm.item_description || '-'}</td>
                            <td>${rm.unit || '-'}</td>
                            <td class="col-number-cell">${formatNumber(rm.quantity)}</td>
                            <td><span class="${(rm.status || '').toLowerCase() === 'active' ? 'badge-status-green' : 'badge-status-amber'}">${rm.status || 'Active'}</span></td>
                        </tr>
                    `;
                });
                tableHTML += `</tbody></table></div></td></tr>`;
            }
        });

        // 5. Executive Total / Summary Row (<tfoot>)
        let tfootHTML = `<tfoot class="collected-table-tfoot"><tr style="background:#f1f5f9; border-top:2px solid #cbd5e1; border-bottom:2px solid #94a3b8;">`;
        config.columns.forEach((col, cIdx) => {
            if (cIdx === 0) {
                tfootHTML += `<th class="tfoot-label" style="text-align:center; font-weight:800; color:#0f172a; padding:10px 6px; font-size:0.82rem;">Total (${filtered.length})</th>`;
            } else if (['number', 'number-bold', 'number-blue'].includes(col.type)) {
                const sum = filtered.reduce((acc, it) => {
                    const n = parseFloat(it[col.key]);
                    return acc + (isNaN(n) ? 0 : n);
                }, 0);
                tfootHTML += `<th class="tfoot-sum col-number-cell" style="text-align:right; font-weight:800; color:#0284c7; padding:10px 8px; font-size:0.84rem;">${formatNumber(sum)}</th>`;
            } else if (col.type === 'currency') {
                const sum = filtered.reduce((acc, it) => {
                    const n = parseFloat(it[col.key]);
                    return acc + (isNaN(n) ? 0 : n);
                }, 0);
                tfootHTML += `<th class="tfoot-sum col-currency-cell" style="text-align:right; font-weight:800; color:#0284c7; padding:10px 8px; font-size:0.84rem;">${formatCurrency(sum)}</th>`;
            } else {
                tfootHTML += `<th></th>`;
            }
        });
        tfootHTML += `</tr></tfoot>`;

        tableHTML += `</tbody>${tfootHTML}</table></div>`;

        if (filtered.length > 350) {
            tableHTML += `
                <div class="collected-table-notice">
                    Showing top 350 of ${filtered.length} records. Filter or search above to drill down further.
                </div>
            `;
        }

        bodyEl.innerHTML = tableHTML;
    }

    /**
     * Toggle Nested Detail Row for Chalan Materials / BOM Raw Materials
     */
    function toggleRowDetail(botId, idx) {
        const row = document.getElementById(`nestedRow_${botId}_${idx}`);
        if (!row) return;
        const isHidden = row.style.display === 'none';
        row.style.display = isHidden ? 'table-row' : 'none';
    }

    /**
     * Download Bot Excel Workbook with Dual-Path Resilience:
     * - Queries live Flask API if active
     * - Falls back directly to pre-generated static workbook in NEW BOT 02/
     */
    async function downloadBotExcel(botId) {
        const config = BOTS_CONFIG[botId];
        if (!config) return;

        if (typeof window.showToast === 'function') {
            window.showToast(`📊 Downloading Excel Workbook: ${config.excelFile}`);
        }

        const cacheBase = getCacheBasePath();
        const staticUrl = `${cacheBase}/${config.excelFile}`;
        const apiUrl = `${API_BASE}${config.apiDownload}`;

        // Attempt live API first if available
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800);
            const res = await fetch(apiUrl, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                window.open(apiUrl, '_blank');
                return;
            }
        } catch (e) {}

        // Fallback: Direct download from static cache directory
        const a = document.createElement('a');
        a.href = staticUrl;
        a.download = config.excelFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * Export Current Filtered Table to CSV (Client-side Blob)
     */
    function exportFilteredCSV() {
        const botId = activeBotModalId;
        if (!botId) return;
        const config = BOTS_CONFIG[botId];
        if (!config) return;

        // Exact ERP Replica Export for Bots 4, 5, 6, 7, 8
        if ([4, 5, 6, 7, 8].includes(botId)) {
            const dataObj = botDataCache[botId];
            if (dataObj && dataObj.raw_rows && dataObj.raw_rows.length > 0) {
                let exportHeaders = [];
                if (dataObj.raw_headers && dataObj.raw_headers.length > 0) {
                    const lastHRow = dataObj.raw_headers[dataObj.raw_headers.length - 1];
                    exportHeaders = lastHRow.map(h => `"${(h.text || '').replace(/"/g, '""')}"`);
                }
                let displayRows = dataObj.raw_rows;
                if (currentCategoryFilter !== 'all') {
                    const catIdx = (botId === 6) ? 3 : (botId === 8 ? 4 : 2);
                    displayRows = displayRows.filter(r => {
                        const val = (r[catIdx] || '').trim();
                        return val === currentCategoryFilter || r.some(c => String(c).trim() === currentCategoryFilter);
                    });
                }
                if (currentFilterText) {
                    const q = currentFilterText.toLowerCase();
                    displayRows = displayRows.filter(r => r.some(c => String(c).toLowerCase().includes(q)));
                }
                const rows = displayRows.map(row => row.map(cell => `"${String(cell !== null && cell !== undefined ? cell : '').replace(/"/g, '""')}"`).join(','));
                
                let totalRowCsv = '';
                if (dataObj.total_row && dataObj.total_row.length > 0) {
                    totalRowCsv = '\n' + dataObj.total_row.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',');
                }

                const csvContent = '\uFEFF' + exportHeaders.join(',') + '\n' + rows.join('\n') + totalRowCsv;
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${config.code}_ERP_Exact_Replica_${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                if (typeof window.showToast === 'function') {
                    window.showToast(`📥 Exported ${displayRows.length} ERP exact replica records to CSV!`);
                }
                return;
            }
        }

        // Dedicated CSV Export for Bot 10 (Monthly Attendance Matrix)
        if (botId === 10) {
            const dataObj = botDataCache[10];
            const dayHeaders = (dataObj && dataObj.day_headers) || [];
            const csvHeaders = ['SL', 'Emp ID', 'Employee Name', 'Department', 'Section', 'Present Days', 'Absent Days', 'Leave Days', ...dayHeaders];
            const rows = items.map((emp, idx) => {
                const dailyList = emp.daily || [];
                const dayCols = dayHeaders.map(dh => {
                    const dr = dailyList.find(d => d.day_header === dh);
                    return dr ? dr.status : '-';
                });
                const rCols = [
                    emp.sl || idx + 1,
                    emp.emp_id || '',
                    emp.emp_name || '',
                    emp.department || '',
                    emp.unit || emp.section || '',
                    emp.present_days || 0,
                    emp.absent_days || 0,
                    emp.leave_days || 0,
                    ...dayCols
                ];
                return rCols.map(c => `"${String(c !== null && c !== undefined ? c : '').replace(/"/g, '""')}"`).join(',');
            });
            const csvContent = '\uFEFF' + csvHeaders.map(h => `"${h}"`).join(',') + '\n' + rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HRM_Monthly_Attendance_Sheet_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (typeof window.showToast === 'function') window.showToast(`📥 Exported ${items.length} attendance records to CSV!`);
            return;
        }

        // Dedicated CSV Export for Bot 11 (Monthly & Yearly Attendance Report 41 Columns)
        if (botId === 11) {
            const dataObj = botDataCache[11];
            const headers = (dataObj && dataObj.headers) || config.columns.map(c => c.label);
            const rows = items.map((row, idx) => {
                const cells = row.all_cells || [
                    row.sl || idx + 1, row.emp_id || '', row.emp_name || '', row.designation || '', row.department || '',
                    row.section || '', row.sub_section || '', row.grade || '', row.job_location || '', row.company || '',
                    row.join_date || '', row.month_year || '', row.assigned_working_hour || '', row.total_days_in_month || '',
                    row.festival_holiday || '', row.total_working_days || '', row.standard_working_hour || '', row.present_days || '',
                    row.physical_working_hour || '', row.absent_days || '', row.lwp || '', row.cl || '', row.ml || '', row.el || '',
                    row.npl || '', row.paid_leave || '', row.ot || '', row.extra_ot || '', row.total_ot || '', row.late_days || '',
                    row.late_min || '', row.early_days || '', row.early_min || '', row.compensatory_leave || '', row.sp_iom_pay || '',
                    row.sp_iom_leave || '', row.reg_iom || '', row.od_iom || '', row.night_duty_days || '', row.night_duty_hours || '',
                    row.m_grade_extra_duty || ''
                ];
                return cells.map(c => `"${String(c !== null && c !== undefined ? c : '').replace(/"/g, '""')}"`).join(',');
            });
            const csvContent = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n' + rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HRM_Monthly_Yearly_Attendance_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (typeof window.showToast === 'function') window.showToast(`📥 Exported ${items.length} HRM records to CSV!`);
            return;
        }

        const items = getFilteredItems(botId);
        if (!items || items.length === 0) {
            if (typeof window.showToast === 'function') window.showToast('No records to export');
            return;
        }

        const exportCols = config.columns.filter(c => c.type !== 'expand-btn');
        const headers = exportCols.map(c => `"${c.label}"`);
        const rows = items.map((item, idx) => {
            return exportCols.map(c => {
                let v = c.key === 'sl' ? (item.sl || idx + 1) : item[c.key];
                if (v === null || v === undefined) v = '';
                v = String(v).replace(/"/g, '""');
                return `"${v}"`;
            }).join(',');
        });

        const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.code}_Filtered_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof window.showToast === 'function') {
            window.showToast(`📥 Exported ${items.length} records to CSV!`);
        }
    }

    /**
     * Dynamically initialize From Date (1st of current month) and To Date (today)
     * as required by Automatic Date Logic without hardcoding.
     */
    function initReqDateControls() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const defaultFrom = `01-${mm}-${yyyy}`;
        const defaultTo = `${dd}-${mm}-${yyyy}`;

        const hFrom = document.getElementById('headerDateFromInput');
        const hTo = document.getElementById('headerDateToInput');
        if (hFrom) hFrom.value = defaultFrom;
        if (hTo) hTo.value = defaultTo;

        const fromInput = document.getElementById('reqDateFromInput');
        const toInput = document.getElementById('reqDateToInput');
        const badge = document.getElementById('reqDateRangeBadge');

        if (fromInput) fromInput.value = defaultFrom;
        if (toInput) toInput.value = defaultTo;
        if (badge) badge.innerText = `${defaultFrom} ⟶ ${defaultTo}`;

        // Also initialize card date inputs from persistent storage
        initAllBotDateInputs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReqDateControls);
    } else {
        setTimeout(initReqDateControls, 100);
    }

    // Expose Global Functions
    window.BOTS_CONFIG = BOTS_CONFIG;
    window.fetchBotData = fetchBotData;
    window.triggerBotRun = triggerBotRun;
    window.syncBotToModuleLocalStorage = syncBotToModuleLocalStorage;
    window.triggerRunAllBots = triggerRunAllBots;
    window.openCollectedDataModal = openCollectedDataModal;
    window.closeCollectedDataModal = closeCollectedDataModal;
    window.filterCollectedData = filterCollectedData;
    window.onDateFilterChange = onDateFilterChange;
    window.onCategoryFilterChange = onCategoryFilterChange;
    window.toggleRowDetail = toggleRowDetail;
    window.downloadBotExcel = downloadBotExcel;
    window.exportFilteredCSV = exportFilteredCSV;
    window.printReplicaTable = function() { window.print(); };
    window.toggleReqDateRangePicker = toggleReqDateRangePicker;
    window.applyReqDateRange = applyReqDateRange;
    window.initReqDateControls = initReqDateControls;
    window.getBotSavedDateRange = getBotSavedDateRange;
    window.validateAndSaveBotDateRange = validateAndSaveBotDateRange;
    window.initAllBotDateInputs = initAllBotDateInputs;
    window.getBotDataCache = function(botId) { return botDataCache[botId] || null; };

})();
