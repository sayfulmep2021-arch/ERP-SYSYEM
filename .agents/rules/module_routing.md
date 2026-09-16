# ERP SYSTEM — WORKSPACE ARCHITECTURE & DIRECTORY ROUTING RULES

## 🎯 Primary Directive: Token Optimization & Direct Scoping
This workspace is strictly divided into modular folders to minimize token usage and accelerate development.
**NEVER execute broad searches (grep, find, or listing) across the entire project root.**
Whenever a user prompt mentions a module, feature, or report, immediately navigate directly to the corresponding module directory:

---

## 📁 Module Directory Map

### 1. Production Module ➔ modules/production/
- **Scope**: All finished goods reports, assembly, armature, winding, BOM, production planning, floor stock, damage, variance, and FG summary.
- **Key HTML Pages**:
  - fg_summary.html (Stock Movement Report Finish Good FG)
  - fg_pending_report.html (Complete vs Pending Report)
  - production_plan.html, daily_production_plan.html
  - assemble_summary.html, fan_assemble_erp.html
  - armature_summary.html, armature_winding_erp.html
  - bom.html, bom_with_sfg.html, rm_requirement_summary_bom.html
  - check_floor_stock.html, check_fg_need_item.html, check_rm_prd_possible.html
  - daily_fg_production_entry.html, daily_production_received_assemble.html
  - closing_finish_good_fg.html, closing_all_sfg.html, store_position_report.html
  - monthly_production_summary_physical.html, monthly_damage_summary.html
  - yearly_production_summary_physical.html, yearly_production_summary_erp.html, yearly_damage_summary.html
  - fan_damage_calculation_entry.html, report_all_section_sfg.html, master.html
- **Key Data & Engines**:
  - fg_summary_data.js, fg_pending_modal_engine.js, erp_engine.js
  - assemble_summary_data.js, armature_summary_data.js, bom_data.js
  - daily_fg_production_data.js, closing_fg_data.js, store_position_data.js
  - all_section_sfg_data.js, monthly_production_archive_engine.js, physical_production_report_engine.js

### 2. Warehouse Module ➔ modules/warehouse/
- **Scope**: Warehouse dashboard, intersales requisitions, per day received, spare parts, stock levels.
- **Files**:
  - warehouse_dashboard.html
  - intersales_requisition.html
  - per_day_received.html
  - spare_parts.html
  - warehouse_module_engine.js
  - warehouse_module.css

### 3. HRM Module ➔ modules/hrm/
- **Scope**: Human Resource Management, worker rosters, line attendance, employee database.
- **Files**:
  - hrm_section_armature_winding.html
  - hrm_section_assemble_line.html
  - hrm_section_dimmer_blade.html
  - hrm_module_engine.js
  - hrm_database_data.js

### 4. MIS Module & Security Gate ➔ modules/mis/ (and MIS section in index.html)
- **Scope**: Management Information System, Security PIN verification (Master PIN: 96420), system options.
- **Files**:
  - mis_opt_access.svg, mis_opt_edit.svg, mis_opt_links.svg, mis_opt_others.svg, mis_opt_theme.svg
  - MIS settings and SVG option tiles.

### 5. Shared Core & Global Architecture ➔ shared/
- **shared/js/**:
  - master_database.js (Master Central DB)
  - portal_auth.js (Authentication, login, role permissions: Admin vs View-Only)
  - portal_settings.js (Portal configuration)
  - portal_guard.js (Session and role guards)
  - portal_modals.js (Shared dialogs, Complete vs Pending modal, PIN modal)
  - portal_modules_data.js (Module definitions and navigation structure)
  - portal_dashboard_runtime.js (Main dashboard metrics and KPI calculations)
  - portal_performance_graph.js (Charts and graph engines)
  - report_sidebar.js (Unified collapsible left sidebar for all reports)
  - sidebar_dynamic_models.js (Dynamic model navigation switcher)
  - data_backup_engine.js (Central backup system)
  - smart_firebase_sync.js (Cloud realtime synchronization)
  - notification_system.js (Toasts and audit alerts)
  - notebook_engine.js (Notes system)
  - xlsx.full.min.js (SheetJS export engine)
- **shared/css/**:
  - portal_styles.css (Enterprise theme, glassmorphism, responsive grid)
  - report_sidebar.css (Sidebar drawer styles)
  - corporate_design_system.css (Design tokens, badges, pills)
- **shared/assets/**:
  - Logos, module icons, 3D banners, user avatars.

### 6. Root Gateway ➔ /
- index.html (Central Enterprise Portal Gateway & Module Chooser)
- Launch_Desktop_App.bat, Start_PWA_Server.bat, server.ps1
- Backward-compatibility redirect stubs (for existing browser bookmarks).

---

## ⚡ Antigravity Prompt Handling Rules
1. **Targeted Inspection**: When asked to modify a report (e.g. fg_summary.html), open modules/production/fg_summary.html directly. DO NOT grep the root directory.
2. **Path Awareness**: Relative paths inside modules/ referencing shared assets use ../../shared/...
3. **Preserve Compatibility**: Keep root forwarder stubs so direct URL access from Chrome tabs never results in 404.
