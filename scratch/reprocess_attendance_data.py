import json
import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOT_DIR = os.path.join(BASE_DIR, "NEW BOT 02")
HRM_DIR = os.path.join(BASE_DIR, "modules", "hrm")

# 1. Reprocess Monthly Attendance Cache (Bot 10)
print("[+] Reprocessing Monthly Attendance Cache (Bot 10)...")
monthly_cache_file = os.path.join(BOT_DIR, "monthly_attendance_cache.json")
with open(monthly_cache_file, "r", encoding="utf-8") as f:
    monthly_data = json.load(f)

for emp in monthly_data.get("items", []):
    for d in emp.get("daily", []):
        details = d.get("details", "")
        times = re.findall(r'(\d{1,2}:\d{2}\s*(?:am|pm)?)', details, re.IGNORECASE)
        in_time = times[0] if len(times) > 0 else ""
        out_time = times[1] if len(times) > 1 else ""

        d_lower = details.lower()
        if "present" in d_lower:
            status_clean = "Present"
        elif "offday" in d_lower or "holiday" in d_lower or "weekly" in d_lower:
            status_clean = "OFFDAY"
        elif "casual" in d_lower:
            status_clean = "Casual Leave"
        elif "leave" in d_lower:
            status_clean = "Leave"
        elif "late" in d_lower:
            status_clean = "Late"
        elif "early" in d_lower:
            status_clean = "EarlyOut"
        elif details.strip().upper() in ["A", "ABSENT"]:
            status_clean = "Absent"
        else:
            status_clean = details.split("\n")[0].strip() if details else "-"

        d["status"] = status_clean
        d["status_type"] = status_clean
        d["in_time"] = in_time
        d["out_time"] = out_time

with open(monthly_cache_file, "w", encoding="utf-8") as f:
    json.dump(monthly_data, f, indent=2, ensure_ascii=False)
print(f"[+] Successfully reprocessed {len(monthly_data.get('items', []))} employees in Bot 10 cache.")

# 2. Reprocess Monthly & Yearly Attendance Cache (Bot 11)
print("[+] Reprocessing Monthly & Yearly Attendance Cache (Bot 11)...")
yearly_cache_file = os.path.join(BOT_DIR, "monthly_yearly_attendance_cache.json")
with open(yearly_cache_file, "r", encoding="utf-8") as f:
    yearly_data = json.load(f)

items = yearly_data.get("items", [])
current_emp = None
reprocessed_items = []
emp_count = 0

for it in items:
    all_cells = it.get("all_cells", [])
    if len(all_cells) >= 41:
        # Primary row with employee identity
        emp_count += 1
        current_emp = {
            "sl": all_cells[0] if len(all_cells) > 0 else str(emp_count),
            "emp_id": all_cells[1] if len(all_cells) > 1 else "",
            "emp_name": all_cells[2] if len(all_cells) > 2 else "",
            "designation": all_cells[3] if len(all_cells) > 3 else "",
            "department": all_cells[4] if len(all_cells) > 4 else "Production",
            "section": all_cells[5] if len(all_cells) > 5 else "",
            "sub_section": all_cells[6] if len(all_cells) > 6 else "",
            "grade": all_cells[7] if len(all_cells) > 7 else "",
            "job_location": all_cells[8] if len(all_cells) > 8 else "",
            "company": all_cells[9] if len(all_cells) > 9 else "MEP FAN LIMITED.",
            "join_date": all_cells[10] if len(all_cells) > 10 else "",
        }
        month_vals = all_cells[11:]
        is_first = True
    else:
        # Sub-row for same employee
        month_vals = all_cells
        is_first = False

    while len(month_vals) < 30:
        month_vals.append("0")

    rec = {
        "sl": current_emp["sl"] if current_emp else "1",
        "emp_id": current_emp["emp_id"] if current_emp else "",
        "emp_name": current_emp["emp_name"] if current_emp else "",
        "designation": current_emp["designation"] if current_emp else "",
        "department": current_emp["department"] if current_emp else "Production",
        "section": current_emp["section"] if current_emp else "",
        "sub_section": current_emp["sub_section"] if current_emp else "",
        "grade": current_emp["grade"] if current_emp else "",
        "job_location": current_emp["job_location"] if current_emp else "Factory-Barishal",
        "company": current_emp["company"] if current_emp else "FAN",
        "join_date": current_emp["join_date"] if current_emp else "",
        "month_year": month_vals[0] if len(month_vals) > 0 else "",
        "assigned_working_hour": month_vals[1] if len(month_vals) > 1 else "0",
        "total_days_in_month": month_vals[2] if len(month_vals) > 2 else "0",
        "festival_holiday": month_vals[3] if len(month_vals) > 3 else "0",
        "total_working_days": month_vals[4] if len(month_vals) > 4 else "0",
        "standard_working_hour": month_vals[5] if len(month_vals) > 5 else "0",
        "present_days": month_vals[6] if len(month_vals) > 6 else "0",
        "physical_working_hour": month_vals[7] if len(month_vals) > 7 else "0",
        "absent_days": month_vals[8] if len(month_vals) > 8 else "0",
        "lwp": month_vals[9] if len(month_vals) > 9 else "0",
        "cl": month_vals[10] if len(month_vals) > 10 else "0",
        "ml": month_vals[11] if len(month_vals) > 11 else "0",
        "el": month_vals[12] if len(month_vals) > 12 else "0",
        "npl": month_vals[13] if len(month_vals) > 13 else "0",
        "paid_leave": month_vals[14] if len(month_vals) > 14 else "0",
        "ot": month_vals[15] if len(month_vals) > 15 else "0",
        "extra_ot": month_vals[16] if len(month_vals) > 16 else "0",
        "total_ot": month_vals[17] if len(month_vals) > 17 else "0",
        "late_days": month_vals[18] if len(month_vals) > 18 else "0",
        "late_min": month_vals[19] if len(month_vals) > 19 else "0",
        "early_days": month_vals[20] if len(month_vals) > 20 else "0",
        "early_min": month_vals[21] if len(month_vals) > 21 else "0",
        "compensatory_leave": month_vals[22] if len(month_vals) > 22 else "0",
        "sp_iom_pay": month_vals[23] if len(month_vals) > 23 else "0",
        "sp_iom_leave": month_vals[24] if len(month_vals) > 24 else "0",
        "reg_iom": month_vals[25] if len(month_vals) > 25 else "0",
        "od_iom": month_vals[26] if len(month_vals) > 26 else "0",
        "night_duty_days": month_vals[27] if len(month_vals) > 27 else "0",
        "night_duty_hours": month_vals[28] if len(month_vals) > 28 else "0",
        "m_grade_extra_duty": month_vals[29] if len(month_vals) > 29 else "0",
        "is_first_month_row": is_first,
        "all_cells": [
            current_emp["sl"], current_emp["emp_id"], current_emp["emp_name"],
            current_emp["designation"], current_emp["department"], current_emp["section"],
            current_emp["sub_section"], current_emp["grade"], current_emp["job_location"],
            current_emp["company"], current_emp["join_date"]
        ] + month_vals
    }
    reprocessed_items.append(rec)

yearly_data["items"] = reprocessed_items
with open(yearly_cache_file, "w", encoding="utf-8") as f:
    json.dump(yearly_data, f, indent=2, ensure_ascii=False)
print(f"[+] Successfully reprocessed {len(reprocessed_items)} records across {emp_count} employees in Bot 11 cache.")

# 3. Export to HRM JS data files
sys.path.insert(0, BOT_DIR)
from export_module_data import export_bot_10, export_bot_11
export_bot_10()
export_bot_11()
print("[+] Successfully exported to HRM JS data files.")
