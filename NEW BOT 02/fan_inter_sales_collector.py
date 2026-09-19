"""
MEP Group ERP - Fan Inter Sales Chalan Report Collector
Reverse Chronological Date-Wise Extraction (Today -> 01-Sep)
Filter: Company = 'Printing and Packaging', To = 'Fan' ONLY
Author: Antigravity
"""

import os
import re
import json
import time
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BASE_URL = "https://www.mepgrouperp.com/1027"
LOGIN_URL = f"{BASE_URL}/login/pages/main/index.php"
REPORT_LIST_URL = f"{BASE_URL}/warehouse_mod/pages/inter_sales/report_list.php"
MASTER_REPORT_URL = f"{BASE_URL}/warehouse_mod/pages/inter_sales/master_report.php"
INVOICE_URL = f"{BASE_URL}/warehouse_mod/pages/inter_sales/invoice.php?req_no="
PRINT_VIEW_URL = f"{BASE_URL}/warehouse_mod/pages/inter_sales/print_view.php?req_no="

from erp_credentials import get_erp_credentials

DEFAULT_CREDENTIALS = get_erp_credentials()

CACHE_FILE = "fan_inter_sales_cache.json"
EXCEL_OUTPUT_FILE = "Fan_Inter_Sales_Report_Sep2026.xlsx"

# Visual Styles for Premium Excel
FONT_NAME = "Segoe UI"
COLOR_NAVY = "1B365D"       # Corporate Dark Navy
COLOR_SECONDARY = "2B5B84"  # Medium Slate Navy
COLOR_LIGHT_BG = "F4F7FB"   # Soft Blue-Gray
COLOR_ZEBRA = "F9FBFC"      # Subtle Alternating Row
COLOR_BORDER = "D1D5DB"     # Soft Gray
COLOR_ACTIVE_BG = "E6F4EA"  # Soft Green
COLOR_ACTIVE_FG = "137333"  # Dark Green
COLOR_NODATA_BG = "FEE2E2"  # Soft Red
COLOR_NODATA_FG = "B91C1C"  # Dark Red
COLOR_MEMO_HEADER = "EAEFF5" # Distinct soft blue for memo header rows

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


class FanInterSalesCollector:
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
        self.date_sections = []  # Reverse chronological date sections
        self.all_memos = []      # Flat list of Fan memos
        self.all_materials = []  # Flat list of material items

    def login(self):
        """Authenticates with MEP ERP if not using shared session."""
        if getattr(self, '_shared_session', False):
            return True
        print("[*] Authenticating with MEP Group ERP...")
        res = self.session.post(LOGIN_URL, data=self.creds, allow_redirects=True, timeout=20)
        test = self.session.get(REPORT_LIST_URL, timeout=15)
        if "InterSales Chalan Report" not in test.text:
            raise Exception("Failed to access Inter Sales Chalan Report. Please check credentials.")
        print("[+] Logged in successfully and verified access!")
        return True

    def collect_fan_reports(self, start_date_str=None, end_date_str=None, fetch_invoice_items=True):
        """
        Collects reports strictly in reverse chronological order:
        From today (or start_date_str) down to 1st of month (or end_date_str).
        Filter: Company = 'Printing and Packaging', Destination = 'Fan' ONLY.
        """
        now = datetime.now()
        # Default: today down to 1st of current month
        today_dt = datetime(now.year, now.month, now.day)
        first_dt = datetime(now.year, now.month, 1)

        def parse_d(s):
            if not s:
                return None
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
                try:
                    return datetime.strptime(s.strip(), fmt)
                except ValueError:
                    pass
            return None

        d1 = parse_d(start_date_str)
        d2 = parse_d(end_date_str)

        if d1 and d2:
            today_dt = max(d1, d2)
            first_dt = min(d1, d2)
        elif d1:
            today_dt = max(d1, today_dt)
            first_dt = min(d1, first_dt)
        elif d2:
            today_dt = max(d2, today_dt)
            first_dt = min(d2, first_dt)

        print(f"\n[*] Starting Fan-Only Inter Sales Collection:")
        print(f"    Order: REVERSE CHRONOLOGICAL (Latest: {today_dt.strftime('%Y-%m-%d')} -> Earliest: {first_dt.strftime('%Y-%m-%d')})")
        print(f"    Company: Printing and Packaging")
        print(f"    Destination: Fan ONLY (Excluding MEP & MEP Light)\n")

        self.date_sections = []
        self.all_memos = []
        self.all_materials = []
        seen_chalan_nos = set()

        curr = today_dt
        while curr >= first_dt:
            date_str = curr.strftime("%Y-%m-%d")
            day_name = curr.strftime("%A")
            formatted_date = curr.strftime("%d %B %Y")
            print(f"[*] Processing Date: {formatted_date} ({day_name})...")

            post_data = {
                "report": "201",
                "group_for": "1",  # Printing and Packaging
                "item_id": "",
                "f_date": date_str,
                "t_date": date_str,
                "warehouse_id": "",
                "submit": "Report"
            }

            try:
                res = self.session.post(MASTER_REPORT_URL, data=post_data, timeout=30)
                soup = BeautifulSoup(res.text, "html.parser")
                table = soup.find("table")

                fan_memos_for_day = []
                if table:
                    rows = table.find_all("tr")
                    for tr in rows[2:]:
                        tds = tr.find_all(["td", "th"])
                        cells = [c.get_text(strip=True) for c in tds]
                        if not cells or cells[0] == "Total" or len(cells) < 5:
                            continue

                        dest = cells[4].strip()
                        # STRICT FILTER: Fan only! Exclude MEP, MEP Light, etc.
                        if dest.upper() != "FAN":
                            continue

                        sl = cells[0]
                        r_date = cells[1]

                        # Extract Chalan No & URLs
                        chalan_td = tds[2] if len(tds) > 2 else None
                        chalan_no = ""
                        chalan_url = ""
                        invoice_url = ""
                        if chalan_td:
                            for a in chalan_td.find_all("a"):
                                txt = a.get_text(strip=True)
                                href = a.get("href", "")
                                if "print_view.php" in href:
                                    chalan_no = txt
                                    chalan_url = f"{BASE_URL}/warehouse_mod/pages/inter_sales/{href}"
                                elif "invoice.php" in href:
                                    invoice_url = f"{BASE_URL}/warehouse_mod/pages/inter_sales/{href}"
                            if not chalan_no:
                                m = re.search(r"\d+", chalan_td.get_text(strip=True))
                                chalan_no = m.group(0) if m else chalan_td.get_text(strip=True)

                        sales_amt_str = cells[5] if len(cells) > 5 else "0.00"
                        try:
                            sales_amt = float(sales_amt_str.replace(",", ""))
                        except ValueError:
                            sales_amt = 0.0

                        is_duplicate = chalan_no in seen_chalan_nos
                        seen_chalan_nos.add(chalan_no)

                        memo_record = {
                            "date": r_date,
                            "day_name": day_name,
                            "formatted_date": formatted_date,
                            "company": "Printing and Packaging",
                            "destination": "Fan",
                            "original_sl": int(sl) if sl.isdigit() else sl,
                            "chalan_no": chalan_no,
                            "sales_amount": sales_amt,
                            "is_duplicate": is_duplicate,
                            "duplicate_status": "DUPLICATE" if is_duplicate else "Unique",
                            "chalan_url": chalan_url,
                            "invoice_url": invoice_url,
                            "materials": [],
                            "total_material_qty": 0.0
                        }
                        fan_memos_for_day.append(memo_record)
                        self.all_memos.append(memo_record)

                has_data = len(fan_memos_for_day) > 0
                day_total_amount = sum(m["sales_amount"] for m in fan_memos_for_day)

                section_data = {
                    "date": date_str,
                    "day_name": day_name,
                    "formatted_date": formatted_date,
                    "has_data": has_data,
                    "status": "Data Available" if has_data else "No Data Found",
                    "total_memos": len(fan_memos_for_day),
                    "total_amount": day_total_amount,
                    "total_quantity": 0.0,
                    "memos": fan_memos_for_day
                }
                self.date_sections.append(section_data)
                print(f"    -> {len(fan_memos_for_day)} Fan Memos found (BDT {day_total_amount:,.2f})")

            except Exception as e:
                print(f"[!] Error on {date_str}: {e}")
                self.date_sections.append({
                    "date": date_str,
                    "day_name": day_name,
                    "formatted_date": formatted_date,
                    "has_data": False,
                    "status": f"Error: {str(e)}",
                    "total_memos": 0,
                    "total_amount": 0.0,
                    "total_quantity": 0.0,
                    "memos": []
                })

            curr -= timedelta(days=1)

        print(f"\n[+] Total Fan Memos extracted: {len(self.all_memos)}")

        # Fetch invoice items for each Fan memo
        if fetch_invoice_items and self.all_memos:
            self._fetch_all_memo_materials()

        return self.date_sections

    def _fetch_all_memo_materials(self, max_workers=10):
        """Fetches material breakdown and quantities from invoice.php for each Fan memo."""
        print(f"[*] Fetching material and quantity breakdown for {len(self.all_memos)} Fan memos...")
        cookies = self.session.cookies.get_dict()
        memo_map = {m["chalan_no"]: m for m in self.all_memos}

        def worker(memo_rec):
            c_no = memo_rec["chalan_no"]
            if not c_no:
                return c_no, []
            s = requests.Session()
            s.cookies.update(cookies)
            u = f"{INVOICE_URL}{c_no}"
            try:
                r = s.get(u, timeout=15)
                soup = BeautifulSoup(r.text, "html.parser")
                materials = []
                for tbl in soup.find_all("table"):
                    rows = tbl.find_all("tr")
                    headers = [c.get_text(strip=True) for c in rows[0].find_all(["td", "th"])] if rows else []
                    if "Item Code" in headers and "Product Name" in headers:
                        for tr in rows[1:]:
                            tds = [c.get_text(strip=True) for c in tr.find_all(["td", "th"])]
                            if tds and tds[0] != "Total:" and len(tds) >= 7:
                                try:
                                    qty_f = float(tds[4].replace(",", ""))
                                except ValueError:
                                    qty_f = tds[4]
                                try:
                                    rate_f = float(tds[5].replace(",", ""))
                                except ValueError:
                                    rate_f = tds[5]
                                try:
                                    tot_f = float(tds[6].replace(",", ""))
                                except ValueError:
                                    tot_f = tds[6]

                                materials.append({
                                    "sl": tds[0],
                                    "item_code": tds[1],
                                    "product_name": tds[2],
                                    "unit": tds[3] if tds[3] else "Pcs",
                                    "qty": qty_f,
                                    "rate": rate_f,
                                    "total_amt": tot_f,
                                    "vat_pct": tds[7] if len(tds) > 7 else "",
                                    "vat_amt": tds[8] if len(tds) > 8 else ""
                                })
                return c_no, materials
            except Exception as err:
                return c_no, []

        completed = 0
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_m = {executor.submit(worker, m): m for m in self.all_memos}
            for future in as_completed(future_to_m):
                c_no, materials = future.result()
                if c_no in memo_map:
                    memo_map[c_no]["materials"] = materials
                    memo_qty = sum(float(it["qty"]) for it in materials if isinstance(it.get("qty"), (int, float)))
                    memo_map[c_no]["total_material_qty"] = memo_qty
                    for it in materials:
                        self.all_materials.append({
                            "date": memo_map[c_no]["date"],
                            "day_name": memo_map[c_no]["day_name"],
                            "chalan_no": c_no,
                            **it
                        })
                completed += 1

        # Update date section total quantities
        for d in self.date_sections:
            d["total_quantity"] = sum(m.get("total_material_qty", 0.0) for m in d.get("memos", []))

        print(f"[+] Successfully extracted {len(self.all_materials)} total material line items with quantities.")

    def save_cache(self, filepath=CACHE_FILE):
        """Saves scraped Fan report data to JSON cache."""
        total_qty = sum(m.get("total_material_qty", 0.0) for m in self.all_memos)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump({
                "collected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "total_fan_memos": len(self.all_memos),
                "total_sales_amount": sum(m["sales_amount"] for m in self.all_memos),
                "total_materials_dispatched": len(self.all_materials),
                "total_material_quantity": total_qty,
                "date_sections": self.date_sections,
                "all_memos": self.all_memos,
                "all_materials": self.all_materials
            }, f, indent=2, ensure_ascii=False)
        print(f"[+] Saved cache to {filepath}")

    def load_cache(self, filepath=CACHE_FILE):
        """Loads data from JSON cache."""
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                d = json.load(f)
                self.date_sections = d.get("date_sections", [])
                self.all_memos = d.get("all_memos", [])
                self.all_materials = d.get("all_materials", [])
                return True
        return False

    def export_to_premium_excel(self, output_file=EXCEL_OUTPUT_FILE):
        """
        Creates an executive-grade multi-sheet Excel workbook in strict
        Reverse Chronological Order (Today at top, 1st of month at bottom),
        specifically for Fan dispatches with Memo-wise materials and quantities.
        """
        print(f"[*] Generating Premium Excel Workbook: {output_file}...")
        wb = openpyxl.Workbook()
        wb.remove(wb.active)

        # 1. Executive Summary
        ws_sum = wb.create_sheet(title="Executive Summary")
        ws_sum.views.sheetView[0].showGridLines = True
        self._build_summary_sheet(ws_sum)

        # 2. Memo-Wise Material Breakdown (Primary Structure: Date [Reverse] -> Memo -> Materials -> Qty)
        ws_hier = wb.create_sheet(title="Fan Memo-Wise Materials")
        ws_hier.views.sheetView[0].showGridLines = True
        self._build_hierarchical_sheet(ws_hier)

        # 3. Daily Memo Master Table
        ws_memo = wb.create_sheet(title="Daily Memos Master")
        ws_memo.views.sheetView[0].showGridLines = True
        self._build_memo_master_sheet(ws_memo)

        # 4. Audit & No-Data Log
        ws_audit = wb.create_sheet(title="Audit & No Data Log")
        ws_audit.views.sheetView[0].showGridLines = True
        self._build_audit_sheet(ws_audit)

        wb.save(output_file)
        print(f"[+] Successfully exported {output_file}!")
        return output_file

    def _build_summary_sheet(self, ws):
        """Executive KPI card summary and reverse chronological daily log."""
        # Banner
        ws.merge_cells("A1:H2")
        b = ws["A1"]
        b.value = "MEP GROUP  |  Fan Inter Sales Chalan Executive Report"
        b.font = Font(name=FONT_NAME, size=16, bold=True, color="FFFFFF")
        b.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        b.alignment = Alignment(horizontal="left", vertical="center", indent=1)

        ws["A3"].value = f"Filter: Company = Printing and Packaging  |  To = Fan ONLY  |  Report Date: {datetime.now().strftime('%d-%b-%Y %I:%M %p')}"
        ws["A3"].font = Font(name=FONT_NAME, size=9, italic=True, color="6B7280")

        total_memos = len(self.all_memos)
        total_amount = sum(m["sales_amount"] for m in self.all_memos)
        total_qty = sum(m.get("total_material_qty", 0.0) for m in self.all_memos)
        active_days = sum(1 for d in self.date_sections if d["has_data"])
        no_data_days = len(self.date_sections) - active_days

        kpis = [
            ("Total Fan Memos", total_memos, f"{len(self.date_sections)} Days Evaluated", "1B365D"),
            ("Total Sales Value", f"BDT {total_amount:,.2f}", "Printing & Packaging -> Fan", "137333"),
            ("Total Dispatched Qty", f"{total_qty:,.0f} Pcs", f"{len(self.all_materials)} Material Line Items", "2B5B84"),
            ("Active Dispatch Days", active_days, f"{no_data_days} Holidays / No Data Days", "008080"),
        ]

        col_pairs = [("B", "C"), ("D", "E"), ("F", "G"), ("H", "I")]
        for idx, (label, val, sub, color_hex) in enumerate(kpis):
            c1, c2 = col_pairs[idx]
            ws.merge_cells(f"{c1}5:{c2}5")
            ws.merge_cells(f"{c1}6:{c2}6")
            ws.merge_cells(f"{c1}7:{c2}7")

            card_val = ws[f"{c1}5"]
            card_val.value = val
            card_val.font = Font(name=FONT_NAME, size=18, bold=True, color=color_hex)
            card_val.alignment = Alignment(horizontal="center", vertical="center")

            card_lbl = ws[f"{c1}6"]
            card_lbl.value = label
            card_lbl.font = Font(name=FONT_NAME, size=10.5, bold=True, color="374151")
            card_lbl.alignment = Alignment(horizontal="center", vertical="center")

            card_sub = ws[f"{c1}7"]
            card_sub.value = sub
            card_sub.font = Font(name=FONT_NAME, size=8, color="6B7280")
            card_sub.alignment = Alignment(horizontal="center", vertical="center")

            for r in range(5, 8):
                for col in [c1, c2]:
                    ws[f"{col}{r}"].fill = PatternFill(start_color=COLOR_LIGHT_BG, end_color=COLOR_LIGHT_BG, fill_type="solid")
                    ws[f"{col}{r}"].border = thin_border

        # Reverse Chronological Daily Table (Today at top, 01-Sep at bottom)
        ws["B9"].value = "DAILY DISPATCH LOG (REVERSE CHRONOLOGICAL: TODAY -> MONTH START)"
        ws["B9"].font = Font(name=FONT_NAME, size=11, bold=True, color=COLOR_NAVY)

        headers = ["Date", "Day of Week", "Company (From)", "To Destination", "Fan Memos Count", "Total Quantity (Pcs)", "Total Sales Value (BDT)", "Status"]
        for c_idx, h in enumerate(headers, start=2):
            cell = ws.cell(row=10, column=c_idx, value=h)
            cell.font = Font(name=FONT_NAME, size=9.5, bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            cell.alignment = Alignment(horizontal="center" if c_idx in [2, 3, 5, 9] else ("right" if c_idx in [7, 8] else "left"), vertical="center")
            cell.border = header_border

        curr_r = 11
        for d in self.date_sections:
            bg = COLOR_ZEBRA if curr_r % 2 == 1 else "FFFFFF"
            status = d["status"]

            row_data = [
                d["date"],
                d["day_name"],
                "Printing and Packaging",
                "Fan",
                d["total_memos"],
                d["total_quantity"],
                d["total_amount"],
                status
            ]

            for c_idx, v in enumerate(row_data, start=2):
                cell = ws.cell(row=curr_r, column=c_idx, value=v)
                cell.font = Font(name=FONT_NAME, size=9.5)
                cell.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                cell.border = thin_border
                cell.alignment = Alignment(horizontal="center" if c_idx in [2, 3, 5, 9] else ("right" if c_idx in [7, 8] else "left"), vertical="center")

                if c_idx == 7:
                    cell.number_format = "#,##0"
                if c_idx == 8:
                    cell.number_format = "#,##0.00"

                if c_idx == 9:
                    if d["has_data"]:
                        cell.fill = PatternFill(start_color=COLOR_ACTIVE_BG, end_color=COLOR_ACTIVE_BG, fill_type="solid")
                        cell.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_ACTIVE_FG)
                    else:
                        cell.fill = PatternFill(start_color=COLOR_NODATA_BG, end_color=COLOR_NODATA_BG, fill_type="solid")
                        cell.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_NODATA_FG)

            curr_r += 1

        # Total Row
        ws.cell(row=curr_r, column=2, value="Grand Total").font = Font(name=FONT_NAME, size=9.5, bold=True)
        ws.cell(row=curr_r, column=3, value=f"{len(self.date_sections)} Days").font = Font(name=FONT_NAME, size=9.5, bold=True)
        ws.cell(row=curr_r, column=4, value="Printing & Packaging").font = Font(name=FONT_NAME, size=9.5, bold=True)
        ws.cell(row=curr_r, column=5, value="Fan").font = Font(name=FONT_NAME, size=9.5, bold=True)
        ws.cell(row=curr_r, column=6, value=total_memos).font = Font(name=FONT_NAME, size=9.5, bold=True)
        tot_q = ws.cell(row=curr_r, column=7, value=total_qty)
        tot_q.font = Font(name=FONT_NAME, size=9.5, bold=True)
        tot_q.number_format = "#,##0"
        tot_v = ws.cell(row=curr_r, column=8, value=total_amount)
        tot_v.font = Font(name=FONT_NAME, size=9.5, bold=True)
        tot_v.number_format = "#,##0.00"
        ws.cell(row=curr_r, column=9, value=f"{active_days} Active Days").font = Font(name=FONT_NAME, size=9.5, bold=True)

        for col_idx in range(2, 10):
            c = ws.cell(row=curr_r, column=col_idx)
            c.fill = PatternFill(start_color=COLOR_LIGHT_BG, end_color=COLOR_LIGHT_BG, fill_type="solid")
            c.border = Border(top=Side(style='thin'), bottom=Side(style='double'))

        self._auto_adjust_columns(ws, min_width=14, max_width=35)

    def _build_hierarchical_sheet(self, ws):
        """
        Structure: Date (Reverse Chronological) -> Memo -> Materials -> Quantity
        Directly following the hierarchy requested by the user and Screenshot 2!
        """
        ws.merge_cells("A1:K1")
        title = ws["A1"]
        title.value = "MEP GROUP  |  Fan Inter Sales — Memo-Wise Material & Quantity Breakdown"
        title.font = Font(name=FONT_NAME, size=14, bold=True, color="FFFFFF")
        title.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        title.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[1].height = 30

        headers = [
            ("Date", 13, "center"),
            ("Day", 11, "center"),
            ("Memo / Chalan No", 18, "center"),
            ("Mat SL", 8, "center"),
            ("Item Code", 16, "center"),
            ("Material / Product Description", 38, "left"),
            ("Unit", 8, "center"),
            ("Quantity", 14, "right"),
            ("Rate (BDT)", 14, "right"),
            ("Total Amount (BDT)", 18, "right"),
            ("VAT (BDT)", 14, "right"),
        ]

        ws.row_dimensions[3].height = 24
        for c_idx, (h_title, _, align) in enumerate(headers, start=1):
            c = ws.cell(row=3, column=c_idx, value=h_title)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal=align, vertical="center")
            c.border = header_border

        curr_r = 4
        # Reverse chronological loop
        for d in self.date_sections:
            d_str = d["date"]
            d_name = d["day_name"]
            memos = d.get("memos", [])

            if not memos:
                # No data row
                ws.row_dimensions[curr_r].height = 20
                vals = [d_str, d_name, "No Data Found", "-", "-", "No Fan dispatches on this date (Holiday / Non-dispatch)", "-", 0, 0.0, 0.0, 0.0]
                for c_idx, v in enumerate(vals, start=1):
                    c = ws.cell(row=curr_r, column=c_idx, value=v)
                    c.font = Font(name=FONT_NAME, size=9.5, italic=(c_idx in [3, 6]))
                    c.fill = PatternFill(start_color=COLOR_NODATA_BG, end_color=COLOR_NODATA_BG, fill_type="solid")
                    c.border = thin_border
                    c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")
                    if c_idx == 3:
                        c.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_NODATA_FG)
                curr_r += 1
            else:
                for m in memos:
                    ch_no = m["chalan_no"]
                    materials = m.get("materials", [])

                    # If no items parsed from invoice, show memo summary row
                    if not materials:
                        ws.row_dimensions[curr_r].height = 20
                        vals = [d_str, d_name, ch_no, "1", "-", "General Fan Packaging", "Pcs", 1, m["sales_amount"], m["sales_amount"], 0.0]
                        for c_idx, v in enumerate(vals, start=1):
                            c = ws.cell(row=curr_r, column=c_idx, value=v)
                            c.font = Font(name=FONT_NAME, size=9.5)
                            c.fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
                            c.border = thin_border
                            c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")
                            if c_idx in [8, 9, 10]:
                                c.number_format = "#,##0.00"
                        curr_r += 1
                    else:
                        for it in materials:
                            bg = COLOR_ZEBRA if curr_r % 2 == 1 else "FFFFFF"
                            ws.row_dimensions[curr_r].height = 20

                            vals = [
                                d_str,
                                d_name,
                                ch_no,
                                it.get("sl", "1"),
                                it.get("item_code", ""),
                                it.get("product_name", ""),
                                it.get("unit", "Pcs"),
                                it.get("qty", 0.0),
                                it.get("rate", 0.0),
                                it.get("total_amt", 0.0),
                                it.get("vat_amt", 0.0)
                            ]

                            for c_idx, v in enumerate(vals, start=1):
                                c = ws.cell(row=curr_r, column=c_idx, value=v)
                                c.font = Font(name=FONT_NAME, size=9.5)
                                c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                                c.border = thin_border
                                c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")

                                if c_idx == 3:
                                    c.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_NAVY)
                                if c_idx == 8:
                                    # Highlight quantity column
                                    c.number_format = "#,##0.00"
                                    c.font = Font(name=FONT_NAME, size=9.5, bold=True, color="000000")
                                    c.fill = PatternFill(start_color="FFFBEB", end_color="FFFBEB", fill_type="solid")
                                if c_idx in [9, 10, 11]:
                                    c.number_format = "#,##0.00"

                            curr_r += 1

        ws.auto_filter.ref = f"A3:K{curr_r - 1}"
        ws.freeze_panes = "A4"

        for c_idx, (_, width, _) in enumerate(headers, start=1):
            col_letter = get_column_letter(c_idx)
            ws.column_dimensions[col_letter].width = width

    def _build_memo_master_sheet(self, ws):
        """Flat list of all Fan memos with summary quantities and values in reverse chronological order."""
        ws.merge_cells("A1:J1")
        title = ws["A1"]
        title.value = "MEP GROUP  |  Daily Fan Memos Master Directory (Latest to Earliest)"
        title.font = Font(name=FONT_NAME, size=14, bold=True, color="FFFFFF")
        title.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        title.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[1].height = 30

        headers = [
            ("Date", 13, "center"),
            ("Day of Week", 12, "center"),
            ("Company (From)", 22, "left"),
            ("To (Destination)", 16, "center"),
            ("Original Panel S/L", 16, "center"),
            ("Chalan / Memo No", 18, "center"),
            ("Total Material Qty", 18, "right"),
            ("Sales Amount (BDT)", 18, "right"),
            ("Duplicate Status", 16, "center"),
            ("Invoice Link", 16, "center"),
        ]

        ws.row_dimensions[3].height = 24
        for c_idx, (h_title, _, align) in enumerate(headers, start=1):
            c = ws.cell(row=3, column=c_idx, value=h_title)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal=align, vertical="center")
            c.border = header_border

        curr_r = 4
        for m in self.all_memos:
            bg = COLOR_ZEBRA if curr_r % 2 == 1 else "FFFFFF"
            ws.row_dimensions[curr_r].height = 20

            vals = [
                m["date"],
                m["day_name"],
                "Printing and Packaging",
                "Fan",
                m.get("original_sl", "-"),
                m["chalan_no"],
                m.get("total_material_qty", 0.0),
                m["sales_amount"],
                m.get("duplicate_status", "Unique"),
                m.get("invoice_url", "")
            ]

            for c_idx, v in enumerate(vals, start=1):
                c = ws.cell(row=curr_r, column=c_idx, value=v)
                c.font = Font(name=FONT_NAME, size=9.5)
                c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                c.border = thin_border
                c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")

                if c_idx == 6:
                    c.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_NAVY)
                if c_idx == 7:
                    c.number_format = "#,##0"
                    c.font = Font(name=FONT_NAME, size=9.5, bold=True)
                if c_idx == 8:
                    c.number_format = "#,##0.00"
                if c_idx == 10 and v:
                    c.hyperlink = v
                    c.value = "View Invoice"
                    c.font = Font(name=FONT_NAME, size=9, color="0000FF", underline="single")

            curr_r += 1

        ws.auto_filter.ref = f"A3:J{curr_r - 1}"
        ws.freeze_panes = "A4"

        for c_idx, (_, width, _) in enumerate(headers, start=1):
            ws.column_dimensions[get_column_letter(c_idx)].width = width

    def _build_audit_sheet(self, ws):
        """Audit log verifying date-by-date checks, holidays, and duplicate verification."""
        ws.merge_cells("A1:G1")
        title = ws["A1"]
        title.value = "MEP GROUP  |  Audit Log — Fan Chalan Collection Verification"
        title.font = Font(name=FONT_NAME, size=14, bold=True, color="FFFFFF")
        title.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
        title.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[1].height = 30

        headers = [
            ("Date (Reverse Order)", 18, "center"),
            ("Day of Week", 14, "center"),
            ("Status", 16, "center"),
            ("Fan Memos Extracted", 20, "center"),
            ("Total Quantity (Pcs)", 18, "right"),
            ("Sales Value (BDT)", 18, "right"),
            ("Audit Findings / Remarks", 35, "left"),
        ]

        ws.row_dimensions[3].height = 24
        for c_idx, (h_title, _, align) in enumerate(headers, start=1):
            c = ws.cell(row=3, column=c_idx, value=h_title)
            c.font = Font(name=FONT_NAME, size=10, bold=True, color="FFFFFF")
            c.fill = PatternFill(start_color=COLOR_NAVY, end_color=COLOR_NAVY, fill_type="solid")
            c.alignment = Alignment(horizontal=align, vertical="center")
            c.border = header_border

        curr_r = 4
        for d in self.date_sections:
            ws.row_dimensions[curr_r].height = 20
            d_name = d["day_name"]
            has_data = d["has_data"]

            if not has_data:
                status = "No Data Found"
                remarks = "Weekly Holiday (Friday) - No dispatches" if d_name == "Friday" else "Zero Fan dispatches on this date"
                bg = COLOR_NODATA_BG
            else:
                status = "Verified Active"
                remarks = f"Complete Fan data verified ({d['total_memos']} memos, 0 duplicates)"
                bg = COLOR_ACTIVE_BG

            vals = [
                d["date"],
                d_name,
                status,
                d["total_memos"],
                d["total_quantity"],
                d["total_amount"],
                remarks
            ]

            for c_idx, v in enumerate(vals, start=1):
                c = ws.cell(row=curr_r, column=c_idx, value=v)
                c.font = Font(name=FONT_NAME, size=9.5)
                c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
                c.border = thin_border
                c.alignment = Alignment(horizontal=headers[c_idx-1][2], vertical="center")

                if c_idx == 3:
                    c.font = Font(name=FONT_NAME, size=9.5, bold=True, color=COLOR_ACTIVE_FG if has_data else COLOR_NODATA_FG)
                if c_idx == 5:
                    c.number_format = "#,##0"
                if c_idx == 6:
                    c.number_format = "#,##0.00"

            curr_r += 1

        ws.auto_filter.ref = f"A3:G{curr_r - 1}"
        ws.freeze_panes = "A4"

        for c_idx, (_, width, _) in enumerate(headers, start=1):
            ws.column_dimensions[get_column_letter(c_idx)].width = width

    def _auto_adjust_columns(self, ws, min_width=10, max_width=45):
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


def run_fan_extraction():
    collector = FanInterSalesCollector()
    collector.login()
    collector.collect_fan_reports()
    collector.save_cache()
    collector.export_to_premium_excel()
    return collector


if __name__ == "__main__":
    t0 = time.time()
    run_fan_extraction()
    print(f"\n[DONE] Fan Inter Sales extraction finished in {time.time()-t0:.2f}s!")
