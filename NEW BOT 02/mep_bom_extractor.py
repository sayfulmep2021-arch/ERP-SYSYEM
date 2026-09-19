"""
MEP ERP BOM Scraper & Premium Excel Generator
Author: Antigravity
"""

import os
import re
import json
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Constants
BASE_URL = "https://www.mepgrouperp.com/1027"
LOGIN_URL = f"{BASE_URL}/login/pages/main/index.php"
BOM_STATUS_URL = f"{BASE_URL}/production_mod/pages/BOM/bom_status.php"
BOM_DETAIL_URL = f"{BASE_URL}/production_mod/pages/BOM/bom_print_view.php?bom_no="

from erp_credentials import get_erp_credentials

DEFAULT_CREDENTIALS = get_erp_credentials()

CACHE_FILE = "mep_bom_cache.json"
EXCEL_OUTPUT_FILE = "MEP_BOM_Master_Report.xlsx"

# Visual Styles for Premium Excel
FONT_NAME = "Segoe UI"
COLOR_NAVY = "1B365D"       # Corporate Dark Navy
COLOR_SECONDARY = "2B5B84"  # Medium Slate Navy
COLOR_ACCENT = "008080"     # Teal / Accent
COLOR_LIGHT_BG = "F4F7FB"   # Soft Blue-Gray
COLOR_ZEBRA = "F9FBFC"      # Subtle Alternating Row
COLOR_BORDER = "D1D5DB"     # Soft Gray
COLOR_ACTIVE_BG = "E6F4EA"  # Soft Green
COLOR_ACTIVE_FG = "137333"  # Dark Green
COLOR_INACTIVE_BG = "FCE8E6"# Soft Red
COLOR_INACTIVE_FG = "C5221F"# Dark Red

thin_border = Border(
    left=Side(style='thin', color=COLOR_BORDER),
    right=Side(style='thin', color=COLOR_BORDER),
    top=Side(style='thin', color=COLOR_BORDER),
    bottom=Side(style='thin', color=COLOR_BORDER)
)

header_border = Border(
    left=Side(style='thin', color=COLOR_NAVY),
    right=Side(style='thin', color=COLOR_NAVY),
    top=Side(style='medium', color=COLOR_NAVY),
    bottom=Side(style='medium', color=COLOR_NAVY)
)


class MEPBomExtractor:
    def __init__(self, credentials=None, session=None):
        self.creds = credentials or DEFAULT_CREDENTIALS
        if session:
            self.session = session
            self._shared_session = True
        else:
            self.session = requests.Session()
            self.session.headers.update({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            })
            self._shared_session = False
        self.boms = []

    def login(self):
        """Authenticates with MEP ERP if not using shared session."""
        if getattr(self, '_shared_session', False):
            return True
        print("[*] Logging into MEP Group ERP...")
        res = self.session.post(LOGIN_URL, data=self.creds, allow_redirects=True, timeout=20)
        if "login" in res.url.lower() and "home.php" not in res.url.lower():
            test = self.session.get(BOM_STATUS_URL, timeout=15)
            if "Bill of Materials" not in test.text:
                raise Exception(f"Login failed! Returned URL: {res.url}")
        print("[+] Logged in successfully!")
        return True

    def fetch_bom_list(self):
        """Fetches the master list of all BOM records."""
        print("[*] Querying all BOM records from ERP...")
        post_data = {
            "section_id": "",
            "group_for": "",
            "item_id": "",
            "master_fg_id": "",
            "fdate": "",
            "tdate": "",
            "submitit": "VIEW DETAIL"
        }
        res = self.session.post(BOM_STATUS_URL, data=post_data, timeout=30)
        soup = BeautifulSoup(res.text, "html.parser")
        tbody = soup.find("tbody")
        if not tbody:
            raise Exception("Could not find BOM table body in ERP response.")

        rows = tbody.find_all("tr")
        bom_headers = []
        for r in rows:
            cols = [td.get_text(strip=True) for td in r.find_all("td")]
            if len(cols) >= 8:
                link = r.find("a")
                href = link.get("href") if link else ""
                bom_headers.append({
                    "sl": cols[0],
                    "bom_no": cols[1],
                    "bom_date": cols[2],
                    "section": cols[3],
                    "item_code": cols[4],
                    "product_name": cols[5],
                    "entry_by": cols[6],
                    "status": cols[7],
                    "href": href
                })
        print(f"[+] Found {len(bom_headers)} BOM records in ERP.")
        return bom_headers

    def parse_bom_detail_html(self, html, basic_info):
        """Parses individual BOM detail HTML."""
        soup = BeautifulSoup(html, "html.parser")
        detail = {
            **basic_info,
            "product_name_detail": basic_info.get("product_name", ""),
            "batch_quantity": "1.00000",
            "batch_unit": "Pcs",
            "floor": basic_info.get("section", ""),
            "edit_by": "",
            "approved_by": "",
            "edited_on": "",
            "approved_on": "",
            "raw_materials": [],
            "overhead_costs": [],
            "by_products": []
        }

        # Extract metadata from table cells
        for tr in soup.find_all("tr"):
            tds = [td.get_text(strip=True) for td in tr.find_all("td", recursive=False)]
            if len(tds) >= 3 and tds[1] == ":":
                lbl = tds[0].lower()
                val = tds[2]
                if "product name" in lbl:
                    detail["product_name_detail"] = val
                elif "quantity" in lbl:
                    parts = val.split()
                    detail["batch_quantity"] = parts[0] if parts else val
                    detail["batch_unit"] = parts[1] if len(parts) > 1 else "Pcs"
                elif "floor" in lbl:
                    detail["floor"] = val
                elif "edit by" in lbl:
                    detail["edit_by"] = val
                elif "approved by" in lbl:
                    detail["approved_by"] = val

            if len(tds) >= 2:
                lbl = tds[0].lower()
                val = tds[1]
                if "edited on" in lbl:
                    detail["edited_on"] = val
                elif "approved on" in lbl:
                    detail["approved_on"] = val
                elif "bom date" in lbl:
                    detail["bom_date_detail"] = val

        # Extract tables: Raw Materials, Overhead, By-Products
        for tr in soup.find_all("tr"):
            txt = tr.get_text(strip=True)
            if txt == "Raw Materials Required":
                tbl = tr.find_parent("table")
                if tbl:
                    for r in tbl.find_all("tr", recursive=False)[2:]:
                        cols = [c.get_text(strip=True) for c in r.find_all(["td", "th"], recursive=False)]
                        if len(cols) >= 7 and cols[0].isdigit():
                            try:
                                qty_val = float(cols[5])
                            except ValueError:
                                qty_val = cols[5]
                            detail["raw_materials"].append({
                                "sl": int(cols[0]),
                                "category": cols[1],
                                "item_code": cols[2],
                                "item_description": cols[3],
                                "unit": cols[4],
                                "quantity": qty_val,
                                "status": cols[6]
                            })
            elif txt == "Factory Overhead Cost":
                tbl = tr.find_parent("table")
                if tbl:
                    for r in tbl.find_all("tr", recursive=False)[2:]:
                        cols = [c.get_text(strip=True) for c in r.find_all(["td", "th"], recursive=False)]
                        if len(cols) >= 4 and cols[0].isdigit():
                            try:
                                amt_val = float(cols[3])
                            except ValueError:
                                amt_val = cols[3]
                            detail["overhead_costs"].append({
                                "sl": int(cols[0]),
                                "ledger_group": cols[1],
                                "ledger_name": cols[2],
                                "amount": amt_val
                            })
            elif txt == "Rejected/By Product":
                tbl = tr.find_parent("table")
                if tbl:
                    for r in tbl.find_all("tr", recursive=False)[2:]:
                        cols = [c.get_text(strip=True) for c in r.find_all(["td", "th"], recursive=False)]
                        if len(cols) >= 8 and cols[0].isdigit():
                            try:
                                qty_val = float(cols[6])
                            except ValueError:
                                qty_val = cols[6]
                            detail["by_products"].append({
                                "sl": int(cols[0]),
                                "category": cols[1],
                                "item_code": cols[2],
                                "item_description": cols[3],
                                "unit": cols[4],
                                "ratio": cols[5],
                                "quantity": qty_val,
                                "status": cols[7]
                            })

        detail["raw_material_count"] = len(detail["raw_materials"])
        return detail

    def fetch_all_details(self, bom_headers, max_workers=10):
        """Fetches all BOM details concurrently."""
        print(f"[*] Fetching details for {len(bom_headers)} BOMs using {max_workers} threads...")
        cookies = self.session.cookies.get_dict()
        results = []

        def worker(item):
            s = requests.Session()
            s.cookies.update(cookies)
            s.headers.update(self.session.headers)
            url = f"{BASE_URL}/production_mod/pages/BOM/{item['href']}"
            resp = s.get(url, timeout=20)
            return self.parse_bom_detail_html(resp.text, item)

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_bom = {executor.submit(worker, b): b for b in bom_headers}
            completed = 0
            for future in as_completed(future_to_bom):
                try:
                    data = future.result()
                    results.append(data)
                    completed += 1
                    if completed % 10 == 0 or completed == len(bom_headers):
                        print(f"  -> Progress: {completed}/{len(bom_headers)} ({completed*100//len(bom_headers)}%)")
                except Exception as e:
                    bom_info = future_to_bom[future]
                    print(f"[!] Error fetching BOM {bom_info.get('bom_no')}: {e}")

        results.sort(key=lambda x: int(x.get("sl", 0)))
        self.boms = results
        return results

    def save_cache(self, filepath=CACHE_FILE):
        """Saves scraped data to JSON file."""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump({
                "extracted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "total_boms": len(self.boms),
                "data": self.boms
            }, f, indent=2, ensure_ascii=False)
        print(f"[+] Saved cache to {filepath}")

    def load_cache(self, filepath=CACHE_FILE):
        """Loads cached data from JSON file."""
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                d = json.load(f)
                self.boms = d.get("data", [])
                return True
        return False

    def export_to_premium_excel(self, output_file=EXCEL_OUTPUT_FILE):
        """Creates the executive-grade multi-sheet Excel workbook."""
        print(f"[*] Generating Premium Excel Workbook: {output_file}...")
        wb = openpyxl.Workbook()
        wb.remove(wb.active)

        # 1. Executive Summary Sheet
        ws_dash = wb.create_sheet(title="Executive Summary")
        ws_dash.views.sheetView[0].showGridLines = True
        self._build_dashboard_sheet(ws_dash)

        # 2. BOM Master Directory Sheet
        ws_master = wb.create_sheet(title="BOM Master Directory")
        ws_master.views.sheetView[0].showGridLines = True
        self._build_master_directory_sheet(ws_master)

        # 3. Itemized Raw Materials Sheet
        ws_raw = wb.create_sheet(title="Raw Materials Master")
        ws_raw.views.sheetView[0].showGridLines = True
        self._build_raw_materials_sheet(ws_raw)

        # 4. Factory Overhead Costs Sheet
        ws_ovh = wb.create_sheet(title="Factory Overheads")
        ws_ovh.views.sheetView[0].showGridLines = True
        self._build_overhead_sheet(ws_ovh)

        # 5. By-Products & Scrap Sheet
        ws_scrap = wb.create_sheet(title="By-Products & Scrap")
        ws_scrap.views.sheetView[0].showGridLines = True
        self._build_scrap_sheet(ws_scrap)

        # 6. Single BOM Printable Spec Template
        ws_spec = wb.create_sheet(title="BOM Spec Viewer")
        ws_spec.views.sheetView[0].showGridLines = True
        self._build_spec_viewer_sheet(ws_spec)

        wb.save(output_file)
        print(f"[+] Successfully exported {output_file}!")
        return output_file

    def _build_dashboard_sheet(self, ws):
        """Builds an executive KPI summary sheet."""
        ws.merge_cells("A1:H2")
        banner = ws["A1"]
        banner.value = "MEP GROUP  |  Bill of Materials (BOM) Executive Dashboard"
        banner.font = Font(name=FONT_NAME, size=16, bold=True, color="FFFFFF")
        banner.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        banner.alignment = Alignment(horizontal="left", vertical="center", indent=1)

        ws["A3"].value = f"Data Source: MEP Group ERP  |  Report Generated: {datetime.now().strftime('%d-%b-%Y %I:%M %p')}"
        ws["A3"].font = Font(name=FONT_NAME, size=9, italic=True, color="6B7280")

        total_boms = len(self.boms)
        total_raw_rows = sum(len(b.get("raw_materials", [])) for b in self.boms)
        unique_raw_codes = set()
        active_raw_count = 0
        inactive_raw_count = 0
        section_stats = {}

        for b in self.boms:
            sec = b.get("section", "Other")
            if sec not in section_stats:
                section_stats[sec] = {"boms": 0, "raw_items": 0}
            section_stats[sec]["boms"] += 1
            section_stats[sec]["raw_items"] += len(b.get("raw_materials", []))

            for rm in b.get("raw_materials", []):
                unique_raw_codes.add(rm.get("item_code"))
                if rm.get("status", "").lower() == "active":
                    active_raw_count += 1
                else:
                    inactive_raw_count += 1

        kpis = [
            ("Total BOMs", total_boms, "BOM records in ERP", "1B365D"),
            ("Total Ingredients", total_raw_rows, "Total line items required", "2B5B84"),
            ("Unique Materials", len(unique_raw_codes), "Distinct raw items cataloged", "008080"),
            ("Active Status Items", active_raw_count, f"{inactive_raw_count} Inactive items", "137333"),
        ]

        col_pairs = [("B", "C"), ("D", "E"), ("F", "G"), ("H", "I")]
        for idx, (label, val, sub, color_hex) in enumerate(kpis):
            c1, c2 = col_pairs[idx]
            ws.merge_cells(f"{c1}5:{c2}5")
            ws.merge_cells(f"{c1}6:{c2}6")
            ws.merge_cells(f"{c1}7:{c2}7")

            card_val = ws[f"{c1}5"]
            card_val.value = val
            card_val.font = Font(name=FONT_NAME, size=20, bold=True, color=color_hex)
            card_val.alignment = Alignment(horizontal="center", vertical="center")

            card_lbl = ws[f"{c1}6"]
            card_lbl.value = label
            card_lbl.font = Font(name=FONT_NAME, size=11, bold=True, color="374151")
            card_lbl.alignment = Alignment(horizontal="center", vertical="center")

            card_sub = ws[f"{c1}7"]
            card_sub.value = sub
            card_sub.font = Font(name=FONT_NAME, size=8, color="6B7280")
            card_sub.alignment = Alignment(horizontal="center", vertical="center")

            for r in range(5, 8):
                for c in [c1, c2]:
                    ws[f"{c}{r}"].fill = PatternFill(start_color=COLOR_LIGHT_BG, end_color=COLOR_LIGHT_BG, fill_type="solid")
                    ws[f"{c}{r}"].border = thin_border

        ws["B9"].value = "MANUFACTURING SECTION BREAKDOWN"
        ws["B9"].font = Font(name=FONT_NAME, size=12, bold=True, color=COLOR_NAVY)

        sec_headers = ["Section / Department", "Total BOMs", "% of Total", "Raw Material Items", "Avg Materials / BOM"]
        for c_idx, h in enumerate(sec_headers, start=2):
            cell = ws.cell(row=10, column=c_idx, value=h)
            cell.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            cell.alignment = Alignment(horizontal="center" if c_idx > 2 else "left", vertical="center")
            cell.border = header_border

        curr_row = 11
        for sec_name, stats in sorted(section_stats.items(), key=lambda x: x[1]["boms"], reverse=True):
            pct = (stats["boms"] / total_boms) if total_boms else 0
            avg_mat = (stats["raw_items"] / stats["boms"]) if stats["boms"] else 0
            bg = COLOR_ZEBRA if curr_row % 2 == 1 else "FFFFFF"

            row_data = [sec_name, stats["boms"], f"{pct*100:.1f}%", stats["raw_items"], f"{avg_mat:.1f}"]
            for c_idx, val in enumerate(row_data, start=2):
                cell = ws.cell(row=curr_row, column=c_idx, value=val)
                cell.font = Font(name=FONT_NAME, size=10)
                cell.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                cell.alignment = Alignment(horizontal="center" if c_idx > 2 else "left", vertical="center")
                cell.border = thin_border
            curr_row += 1

        # Total Row
        ws.cell(row=curr_row, column=2, value="Grand Total").font = Font(name=FONT_NAME, size=10, bold=True)
        ws.cell(row=curr_row, column=3, value=total_boms).font = Font(name=FONT_NAME, size=10, bold=True)
        ws.cell(row=curr_row, column=4, value="100.0%").font = Font(name=FONT_NAME, size=10, bold=True)
        ws.cell(row=curr_row, column=5, value=total_raw_rows).font = Font(name=FONT_NAME, size=10, bold=True)
        ws.cell(row=curr_row, column=6, value=f"{total_raw_rows/total_boms:.1f}").font = Font(name=FONT_NAME, size=10, bold=True)
        for c_idx in range(2, 7):
            c = ws.cell(row=curr_row, column=c_idx)
            c.fill = PatternFill(start_color=COLOR_LIGHT_BG, end_color=COLOR_LIGHT_BG, fill_type="solid")
            c.border = Border(top=Side(style='thin'), bottom=Side(style='double'))
            if c_idx > 2:
                c.alignment = Alignment(horizontal="center")

        curr_row += 3
        ws.cell(row=curr_row, column=2, value="📌 QUICK NAVIGATION & GUIDE:").font = Font(name=FONT_NAME, size=11, bold=True, color=COLOR_NAVY)
        curr_row += 1
        guides = [
            ("BOM Master Directory", "Contains all 96 finished/semi-finished goods with master metadata and approver details."),
            ("Raw Materials Master", "Every raw material required across all BOMs. Ideal for Pivot Tables, ERP bulk uploads, and material planning."),
            ("Factory Overheads", "Breakdown of ledger groups and factory overhead allocations."),
            ("By-Products & Scrap", "Catalog of expected scrap and by-products generated per production batch."),
            ("BOM Spec Viewer", "A clean printable specification sheet format for any chosen BOM No."),
        ]
        for title, desc in guides:
            ws.cell(row=curr_row, column=2, value=f"• {title}:").font = Font(name=FONT_NAME, size=10, bold=True, color=COLOR_SECONDARY)
            ws.cell(row=curr_row, column=3, value=desc).font = Font(name=FONT_NAME, size=9.5, color="4B5563")
            curr_row += 1

        self._auto_adjust_columns(ws, min_width=15, max_width=45)

    def _build_master_directory_sheet(self, ws):
        """Builds the master BOM table containing all 96 BOMs."""
        ws.merge_cells("A1:M1")
        title = ws["A1"]
        title.value = "MEP GROUP  |  BOM Master Directory (Finished & Semi-Finished Goods)"
        title.font = Font(name=FONT_NAME, size=14, bold=True, color="FFFFFF")
        title.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        title.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[1].height = 30

        headers = [
            ("SL", 6, "center"),
            ("BOM No", 14, "center"),
            ("BOM Date", 12, "center"),
            ("Section", 22, "left"),
            ("Item Code", 14, "center"),
            ("Product Name", 38, "left"),
            ("Batch Qty", 11, "right"),
            ("Unit", 8, "center"),
            ("Ingredients Count", 16, "center"),
            ("Created By", 18, "left"),
            ("Approved By", 18, "left"),
            ("Approved Date", 14, "center"),
            ("Status", 12, "center"),
        ]

        ws.row_dimensions[3].height = 24
        for c_idx, (h_title, _, align) in enumerate(headers, start=1):
            c = ws.cell(row=3, column=c_idx, value=h_title)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal=align, vertical="center", wrap_text=True)
            c.border = header_border

        for r_idx, b in enumerate(self.boms, start=4):
            bg = COLOR_ZEBRA if r_idx % 2 == 1 else "FFFFFF"
            status = b.get("status", "APPROVED")

            qty_val = 1.0
            try:
                qty_val = float(b.get("batch_quantity", 1))
            except ValueError:
                pass

            row_vals = [
                int(b.get("sl", r_idx - 3)),
                b.get("bom_no", ""),
                b.get("bom_date", ""),
                b.get("section", ""),
                b.get("item_code", ""),
                b.get("product_name", ""),
                qty_val,
                b.get("batch_unit", "Pcs"),
                len(b.get("raw_materials", [])),
                b.get("entry_by", "") or b.get("edit_by", ""),
                b.get("approved_by", ""),
                b.get("approved_on", ""),
                status,
            ]

            ws.row_dimensions[r_idx].height = 20
            for c_idx, val in enumerate(row_vals, start=1):
                c = ws.cell(row=r_idx, column=c_idx, value=val)
                c.font = Font(name=FONT_NAME, size=9.5)
                c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                c.border = thin_border
                c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")

                if c_idx == 7:
                    c.number_format = "#,##0.00"

                if c_idx == 13:
                    if status.upper() == "APPROVED":
                        c.fill = PatternFill(start_color=COLOR_ACTIVE_BG, end_color=COLOR_ACTIVE_BG, fill_type="solid")
                        c.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_ACTIVE_FG)

        ws.auto_filter.ref = f"A3:M{len(self.boms) + 3}"
        ws.freeze_panes = "A4"

        for c_idx, (_, width, _) in enumerate(headers, start=1):
            col_letter = get_column_letter(c_idx)
            ws.column_dimensions[col_letter].width = width

    def _build_raw_materials_sheet(self, ws):
        """Builds the comprehensive itemized raw materials table."""
        ws.merge_cells("A1:L1")
        title = ws["A1"]
        title.value = "MEP GROUP  |  Complete Itemized Raw Materials Breakdown (Master Database)"
        title.font = Font(name=FONT_NAME, size=14, bold=True, color="FFFFFF")
        title.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        title.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[1].height = 30

        headers = [
            ("BOM No", 14, "center"),
            ("Parent Product Name", 34, "left"),
            ("Manufacturing Section", 20, "left"),
            ("Batch Size", 10, "right"),
            ("Batch Unit", 9, "center"),
            ("Mat SL", 7, "center"),
            ("Raw Material Category", 18, "left"),
            ("Material Item Code", 16, "center"),
            ("Material Description", 34, "left"),
            ("Unit", 8, "center"),
            ("Required Quantity", 16, "right"),
            ("Item Status", 11, "center"),
        ]

        ws.row_dimensions[3].height = 24
        for c_idx, (h_title, _, align) in enumerate(headers, start=1):
            c = ws.cell(row=3, column=c_idx, value=h_title)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal=align, vertical="center", wrap_text=True)
            c.border = header_border

        curr_row = 4
        for b in self.boms:
            bom_no = b.get("bom_no", "")
            p_name = b.get("product_name", "")
            section = b.get("section", "")
            batch_qty = 1.0
            try:
                batch_qty = float(b.get("batch_quantity", 1))
            except ValueError:
                pass
            batch_unit = b.get("batch_unit", "Pcs")

            for rm in b.get("raw_materials", []):
                bg = COLOR_ZEBRA if curr_row % 2 == 1 else "FFFFFF"
                status = rm.get("status", "Active")

                row_vals = [
                    bom_no,
                    p_name,
                    section,
                    batch_qty,
                    batch_unit,
                    rm.get("sl", 1),
                    rm.get("category", ""),
                    rm.get("item_code", ""),
                    rm.get("item_description", ""),
                    rm.get("unit", ""),
                    rm.get("quantity", 0.0),
                    status
                ]

                ws.row_dimensions[curr_row].height = 19
                for c_idx, val in enumerate(row_vals, start=1):
                    c = ws.cell(row=curr_row, column=c_idx, value=val)
                    c.font = Font(name=FONT_NAME, size=9.5)
                    c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                    c.border = thin_border
                    c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")

                    if c_idx == 4:
                        c.number_format = "#,##0.00"
                    elif c_idx == 11:
                        c.number_format = "#,##0.000000"

                    if c_idx == 12:
                        if status.lower() == "active":
                            c.fill = PatternFill(start_color=COLOR_ACTIVE_BG, end_color=COLOR_ACTIVE_BG, fill_type="solid")
                            c.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_ACTIVE_FG)
                        else:
                            c.fill = PatternFill(start_color=COLOR_INACTIVE_BG, end_color=COLOR_INACTIVE_BG, fill_type="solid")
                            c.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_INACTIVE_FG)

                curr_row += 1

        ws.auto_filter.ref = f"A3:L{curr_row - 1}"
        ws.freeze_panes = "A4"

        for c_idx, (_, width, _) in enumerate(headers, start=1):
            col_letter = get_column_letter(c_idx)
            ws.column_dimensions[col_letter].width = width

    def _build_overhead_sheet(self, ws):
        """Builds the factory overhead cost table."""
        ws.merge_cells("A1:G1")
        title = ws["A1"]
        title.value = "MEP GROUP  |  Factory Overhead Costs by BOM"
        title.font = Font(name=FONT_NAME, size=14, bold=True, color="FFFFFF")
        title.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        title.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[1].height = 30

        headers = [
            ("BOM No", 14, "center"),
            ("Product Name", 34, "left"),
            ("Section", 20, "left"),
            ("SL", 6, "center"),
            ("Ledger Group", 24, "left"),
            ("Ledger Name", 28, "left"),
            ("Amount", 16, "right"),
        ]

        ws.row_dimensions[3].height = 24
        for c_idx, (h_title, _, align) in enumerate(headers, start=1):
            c = ws.cell(row=3, column=c_idx, value=h_title)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal=align, vertical="center")
            c.border = header_border

        curr_row = 4
        for b in self.boms:
            for ovh in b.get("overhead_costs", []):
                bg = COLOR_ZEBRA if curr_row % 2 == 1 else "FFFFFF"
                row_vals = [
                    b.get("bom_no", ""),
                    b.get("product_name", ""),
                    b.get("section", ""),
                    ovh.get("sl", 1),
                    ovh.get("ledger_group", ""),
                    ovh.get("ledger_name", ""),
                    ovh.get("amount", 0.0)
                ]
                for c_idx, val in enumerate(row_vals, start=1):
                    c = ws.cell(row=curr_row, column=c_idx, value=val)
                    c.font = Font(name=FONT_NAME, size=9.5)
                    c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                    c.border = thin_border
                    c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")
                    if c_idx == 7:
                        c.number_format = "#,##0.00"
                curr_row += 1

        if curr_row == 4:
            ws.cell(row=4, column=1, value="No direct factory overhead records allocated in current BOMs.").font = Font(name=FONT_NAME, italic=True, color="6B7280")
        else:
            ws.auto_filter.ref = f"A3:G{curr_row - 1}"
            ws.freeze_panes = "A4"

        for c_idx, (_, width, _) in enumerate(headers, start=1):
            ws.column_dimensions[get_column_letter(c_idx)].width = width

    def _build_scrap_sheet(self, ws):
        """Builds by-products / rejected items table."""
        ws.merge_cells("A1:J1")
        title = ws["A1"]
        title.value = "MEP GROUP  |  By-Products & Rejected / Scrap Items"
        title.font = Font(name=FONT_NAME, size=14, bold=True, color="FFFFFF")
        title.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        title.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[1].height = 30

        headers = [
            ("BOM No", 14, "center"),
            ("Product Name", 32, "left"),
            ("SL", 6, "center"),
            ("Category", 18, "left"),
            ("Item Code", 14, "center"),
            ("Item Description", 30, "left"),
            ("Unit", 8, "center"),
            ("Ratio", 10, "right"),
            ("Quantity", 14, "right"),
            ("Status", 10, "center")
        ]

        ws.row_dimensions[3].height = 24
        for c_idx, (h_title, _, align) in enumerate(headers, start=1):
            c = ws.cell(row=3, column=c_idx, value=h_title)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal=align, vertical="center")
            c.border = header_border

        curr_row = 4
        for b in self.boms:
            for bp in b.get("by_products", []):
                bg = COLOR_ZEBRA if curr_row % 2 == 1 else "FFFFFF"
                row_vals = [
                    b.get("bom_no", ""),
                    b.get("product_name", ""),
                    bp.get("sl", 1),
                    bp.get("category", ""),
                    bp.get("item_code", ""),
                    bp.get("item_description", ""),
                    bp.get("unit", ""),
                    bp.get("ratio", ""),
                    bp.get("quantity", 0.0),
                    bp.get("status", "")
                ]
                for c_idx, val in enumerate(row_vals, start=1):
                    c = ws.cell(row=curr_row, column=c_idx, value=val)
                    c.font = Font(name=FONT_NAME, size=9.5)
                    c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                    c.border = thin_border
                    c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")
                curr_row += 1

        if curr_row == 4:
            ws.cell(row=4, column=1, value="No by-product / scrap records registered in current BOMs.").font = Font(name=FONT_NAME, italic=True, color="6B7280")
        else:
            ws.auto_filter.ref = f"A3:J{curr_row - 1}"
            ws.freeze_panes = "A4"

        for c_idx, (_, width, _) in enumerate(headers, start=1):
            ws.column_dimensions[get_column_letter(c_idx)].width = width

    def _build_spec_viewer_sheet(self, ws):
        """Builds a formatted single BOM printable layout sheet populated with the first BOM."""
        first_bom = self.boms[0] if self.boms else {}

        ws.merge_cells("A1:G1")
        c1 = ws["A1"]
        c1.value = "MEP FAN LIMITED."
        c1.font = Font(name=FONT_NAME, size=16, bold=True, color=COLOR_NAVY)
        c1.alignment = Alignment(horizontal="center", vertical="center")

        ws.merge_cells("A2:G2")
        c2 = ws["A2"]
        c2.value = "Gogon Gali, Barishal-8200  |  Production Module"
        c2.font = Font(name=FONT_NAME, size=9, color="4B5563")
        c2.alignment = Alignment(horizontal="center", vertical="center")

        ws.merge_cells("A3:G3")
        c3 = ws["A3"]
        c3.value = "BILL OF MATERIALS (BOM) SPECIFICATION"
        c3.font = Font(name=FONT_NAME, size=12, bold=True, color="FFFFFF")
        c3.fill = PatternFill(start_color=COLOR_SECONDARY, end_color=COLOR_SECONDARY, fill_type="solid")
        c3.alignment = Alignment(horizontal="center", vertical="center")

        meta_left = [
            ("Product Name:", first_bom.get("product_name", "")),
            ("Finished Code:", first_bom.get("item_code", "")),
            ("Batch Quantity:", f"{first_bom.get('batch_quantity', 1)} {first_bom.get('batch_unit', 'Pcs')}"),
            ("Floor / Section:", first_bom.get("section", "")),
        ]

        meta_right = [
            ("BOM No:", first_bom.get("bom_no", "")),
            ("BOM Date:", first_bom.get("bom_date", "")),
            ("Approved By:", first_bom.get("approved_by", "")),
            ("Status:", first_bom.get("status", "APPROVED")),
        ]

        for i in range(4):
            r = 5 + i
            ws.cell(row=r, column=1, value=meta_left[i][0]).font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_NAVY)
            ws.cell(row=r, column=2, value=meta_left[i][1]).font = Font(name=FONT_NAME, size=9.5)
            ws.cell(row=r, column=5, value=meta_right[i][0]).font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_NAVY)
            ws.cell(row=r, column=6, value=meta_right[i][1]).font = Font(name=FONT_NAME, size=9.5, bold=(i==3))

        ws.cell(row=10, column=1, value="REQUIRED RAW MATERIALS & COMPONENTS").font = Font(name=FONT_NAME, size=11, bold=True, color=COLOR_NAVY)
        rm_headers = ["SL", "Category", "Item Code", "Item Description", "Unit", "Quantity Required", "Status"]
        for c_idx, h in enumerate(rm_headers, start=1):
            c = ws.cell(row=11, column=c_idx, value=h)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal="center" if c_idx in [1, 3, 5, 7] else ("right" if c_idx == 6 else "left"))
            c.border = header_border

        curr_r = 12
        for rm in first_bom.get("raw_materials", []):
            bg = COLOR_ZEBRA if curr_r % 2 == 1 else "FFFFFF"
            vals = [
                rm.get("sl", 1),
                rm.get("category", ""),
                rm.get("item_code", ""),
                rm.get("item_description", ""),
                rm.get("unit", ""),
                rm.get("quantity", 0.0),
                rm.get("status", "Active")
            ]
            for c_idx, val in enumerate(vals, start=1):
                c = ws.cell(row=curr_r, column=c_idx, value=val)
                c.font = Font(name=FONT_NAME, size=9.5)
                c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                c.border = thin_border
                c.alignment = Alignment(horizontal="center" if c_idx in [1, 3, 5, 7] else ("right" if c_idx == 6 else "left"))
                if c_idx == 6:
                    c.number_format = "#,##0.000000"
            curr_r += 1

        self._auto_adjust_columns(ws, min_width=12, max_width=40)

    def _auto_adjust_columns(self, ws, min_width=10, max_width=50):
        """Auto-fits column widths based on content."""
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                if cell.row in [1, 2] and cell.coordinate != "A1":
                    continue
                if cell.value:
                    val_str = str(cell.value)
                    if len(val_str) > max_len and len(val_str) < 80:
                        max_len = len(val_str)
            adjusted_width = max(max_len + 3, min_width)
            ws.column_dimensions[col_letter].width = min(adjusted_width, max_width)


def run_full_extraction():
    extractor = MEPBomExtractor()
    extractor.login()
    bom_headers = extractor.fetch_bom_list()
    extractor.fetch_all_details(bom_headers, max_workers=12)
    extractor.save_cache()
    extractor.export_to_premium_excel()
    return extractor


if __name__ == "__main__":
    t0 = time.time()
    run_full_extraction()
    print(f"\n[DONE] Full scraping & Excel generation finished in {time.time()-t0:.2f} seconds!")
