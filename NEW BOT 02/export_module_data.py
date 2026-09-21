import os, json
from datetime import datetime

BASE_DIR = os.path.abspath(r"c:\Users\User\OneDrive\My Work\ERP SYSYEM\NEW BOT 02")
PROD_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "modules", "production"))
WH_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "modules", "warehouse"))
HRM_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "modules", "hrm"))

def export_bot_1():
    p = os.path.join(BASE_DIR, "intersales_requisition_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    t = os.path.join(WH_DIR, "intersales_requisition_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_INTERSALES_REQUISITION_DATA = " + json.dumps(data, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_INTERSALES_REQUISITION_DATA = RAW_INTERSALES_REQUISITION_DATA; }\n")
    print(f"[+] Exported Bot 1 to {t}")
    return True

def export_bot_2():
    p = os.path.join(BASE_DIR, "fan_inter_sales_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    t = os.path.join(WH_DIR, "inter_sales_chalan_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_INTER_SALES_CHALAN_DATA = " + json.dumps(data, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_INTER_SALES_CHALAN_DATA = RAW_INTER_SALES_CHALAN_DATA; }\n")
    print(f"[+] Exported Bot 2 to {t}")
    return True

def export_bot_3():
    p = os.path.join(BASE_DIR, "spare_parts_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    t = os.path.join(WH_DIR, "spare_parts_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_SPARE_PARTS_DATA = " + json.dumps(data, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_SPARE_PARTS_DATA = RAW_SPARE_PARTS_DATA; }\n")
    print(f"[+] Exported Bot 3 to {t}")
    return True

def export_bot_4():
    p = os.path.join(BASE_DIR, "fan_assemble_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    items = data.get("items", [])
    formatted = []
    for idx, it in enumerate(items, 1):
        formatted.append({
            "id": f"erp_fa_{it.get('erp_code', idx)}",
            "sl": str(idx),
            "origSl": str(it.get("sl", idx)),
            "company": it.get("company", "FAN"),
            "category": it.get("category", "Finished Goods"),
            "erpCode": it.get("erp_code", ""),
            "code": it.get("code", ""),
            "name": it.get("item_name", ""),
            "itemName": it.get("item_name", ""),
            "unit": it.get("unit", "Pcs"),
            "opening": float(it.get("opening", 0.0) or 0.0),
            "openingAdjust": float(it.get("opening_adjust", 0.0) or 0.0),
            "storeReceive": float(it.get("store_receive", 0.0) or 0.0),
            "sectionReceive": float(it.get("section_receive", 0.0) or 0.0),
            "productionReceive": float(it.get("production_receive", 0.0) or 0.0),
            "damageReceive": float(it.get("damage_receive", 0.0) or 0.0),
            "othersReceive": float(it.get("others_receive", 0.0) or 0.0),
            "totalReceive": float(it.get("total_receive", 0.0) or 0.0),
            "consumption": float(it.get("consumption", 0.0) or 0.0),
            "wipIssue": float(it.get("wip_issue", 0.0) or 0.0),
            "issueOpeningAdjust": float(it.get("issue_opening_adjust", 0.0) or 0.0),
            "issueToRepair": float(it.get("issue_to_repair", 0.0) or 0.0),
            "issueToDamage": float(it.get("issue_to_damage", 0.0) or 0.0),
            "inTransit": float(it.get("in_transit", 0.0) or 0.0),
            "totalIssue": float(it.get("total_issue", 0.0) or 0.0),
            "closing": float(it.get("closing", 0.0) or 0.0),
            "binClosing": float(it.get("bin_closing", 0.0) or 0.0),
            "diff": float(it.get("diff", 0.0) or 0.0),
            "remarks": it.get("remarks", "")
        })
    t = os.path.join(PROD_DIR, "fan_assemble_erp_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_FAN_ASSEMBLE_ERP_DATA = " + json.dumps(formatted, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_FAN_ASSEMBLE_ERP_DATA = RAW_FAN_ASSEMBLE_ERP_DATA; }\n")
    print(f"[+] Exported Bot 4 to {t}")
    return True

def export_bot_5():
    p = os.path.join(BASE_DIR, "armature_winding_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    items = data.get("items", [])
    formatted = []
    for idx, it in enumerate(items, 1):
        formatted.append({
            "id": f"erp_aw_{it.get('erp_code', idx)}",
            "sl": str(idx),
            "origSl": str(it.get("sl", idx)),
            "company": it.get("company", "FAN"),
            "category": it.get("category", "Ceiling Raw"),
            "erpCode": it.get("erp_code", ""),
            "code": it.get("code", ""),
            "name": it.get("item_name", ""),
            "itemName": it.get("item_name", ""),
            "unit": it.get("unit", "Pcs"),
            "opening": float(it.get("opening", 0.0) or 0.0),
            "openingAdjust": float(it.get("opening_adjust", 0.0) or 0.0),
            "storeReceive": float(it.get("store_receive", 0.0) or 0.0),
            "sectionReceive": float(it.get("section_receive", 0.0) or 0.0),
            "productionReceive": float(it.get("production_receive", 0.0) or 0.0),
            "damageReceive": float(it.get("damage_receive", 0.0) or 0.0),
            "othersReceive": float(it.get("others_receive", 0.0) or 0.0),
            "totalReceive": float(it.get("total_receive", 0.0) or 0.0),
            "consumption": float(it.get("consumption", 0.0) or 0.0),
            "wipIssue": float(it.get("wip_issue", 0.0) or 0.0),
            "issueOpeningAdjust": float(it.get("issue_opening_adjust", 0.0) or 0.0),
            "issueToRepair": float(it.get("issue_to_repair", 0.0) or 0.0),
            "issueToDamage": float(it.get("issue_to_damage", 0.0) or 0.0),
            "inTransit": float(it.get("in_transit", 0.0) or 0.0),
            "totalIssue": float(it.get("total_issue", 0.0) or 0.0),
            "closing": float(it.get("closing", 0.0) or 0.0),
            "binClosing": float(it.get("bin_closing", 0.0) or 0.0),
            "diff": float(it.get("diff", 0.0) or 0.0),
            "remarks": it.get("remarks", "")
        })
    t = os.path.join(PROD_DIR, "armature_winding_erp_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_ARMATURE_WINDING_ERP_DATA = " + json.dumps(formatted, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_ARMATURE_WINDING_ERP_DATA = RAW_ARMATURE_WINDING_ERP_DATA; }\n")
    print(f"[+] Exported Bot 5 to {t}")
    return True

def export_bot_6():
    p = os.path.join(BASE_DIR, "stock_movement_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    items = data.get("items", [])
    formatted = []
    for idx, it in enumerate(items, 1):
        formatted.append({
            "sl": idx,
            "origSl": str(it.get("sl", idx)),
            "company": it.get("company", "3"),
            "itemGroup": it.get("item_group", "Finished Goods"),
            "category": it.get("product_category", "Fan Group"),
            "code": it.get("code", ""),
            "itemName": it.get("item_name", ""),
            "unit": it.get("unit", "Pcs"),
            "opening": float(it.get("opening", 0.0) or 0.0),
            "totalReceive": float(it.get("total_stock", 0.0) or 0.0) - float(it.get("opening", 0.0) or 0.0),
            "otherReceive": float(it.get("other_receive", 0.0) or 0.0),
            "totalStock": float(it.get("total_stock", 0.0) or 0.0),
            "transfer": float(it.get("transfer_total", 0.0) or 0.0),
            "outTotal": float(it.get("out_total", 0.0) or 0.0),
            "closing": float(it.get("closing", 0.0) or 0.0),
            "binClosing": float(it.get("bin_closing", 0.0) or 0.0),
            "diff": float(it.get("diff", 0.0) or 0.0),
            "rate": float(it.get("rate", 0.0) or 0.0),
            "remarks": it.get("remarks", "")
        })
    t = os.path.join(PROD_DIR, "closing_fg_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_CLOSING_FG_DATA = " + json.dumps(formatted, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_CLOSING_FG_DATA = RAW_CLOSING_FG_DATA; }\n")
    print(f"[+] Exported Bot 6 to {t}")
    return True

def export_bot_7():
    p = os.path.join(BASE_DIR, "semi_finished_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    items = data.get("items", [])
    formatted = []
    for idx, it in enumerate(items, 1):
        formatted.append({
            "sl": idx,
            "origSl": str(it.get("sl", idx)),
            "company": it.get("company", "FAN"),
            "category": it.get("category", "FAN SFG"),
            "erpCode": it.get("erp_code", ""),
            "code": it.get("code", ""),
            "itemName": it.get("item_name", ""),
            "unit": it.get("unit", "Pcs"),
            "opening": float(it.get("opening", 0.0) or 0.0),
            "openingAdjust": float(it.get("opening_adjust", 0.0) or 0.0),
            "storeReceive": float(it.get("store_receive", 0.0) or 0.0),
            "sectionReceive": float(it.get("section_receive", 0.0) or 0.0),
            "prodReceive": float(it.get("production_receive", 0.0) or 0.0),
            "damageReceive": float(it.get("damage_receive", 0.0) or 0.0),
            "othersReceive": float(it.get("others_receive", 0.0) or 0.0),
            "totalReceive": float(it.get("total_receive", 0.0) or 0.0),
            "consumption": float(it.get("consumption", 0.0) or 0.0),
            "wipIssue": float(it.get("wip_issue", 0.0) or 0.0),
            "openingAdjustIssue": float(it.get("issue_opening_adjust", 0.0) or 0.0),
            "issueToRepair": float(it.get("issue_to_repair", 0.0) or 0.0),
            "issueToDamage": float(it.get("issue_to_damage", 0.0) or 0.0),
            "inTransit": float(it.get("in_transit", 0.0) or 0.0),
            "totalIssue": float(it.get("total_issue", 0.0) or 0.0),
            "closing": float(it.get("closing", 0.0) or 0.0),
            "binClosing": float(it.get("bin_closing", 0.0) or 0.0),
            "diff": float(it.get("diff", 0.0) or 0.0),
            "remarks": it.get("remarks", "")
        })
    t = os.path.join(PROD_DIR, "closing_all_sfg_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_CLOSING_ALL_SFG_DATA = " + json.dumps(formatted, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_CLOSING_ALL_SFG_DATA = RAW_CLOSING_ALL_SFG_DATA; }\n")
    print(f"[+] Exported Bot 7 to {t}")
    return True

def export_bot_8():
    p = os.path.join(BASE_DIR, "fan_store_stock_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    items = data.get("items", [])
    formatted = []
    for idx, it in enumerate(items, 1):
        formatted.append({
            "sl": idx,
            "company": it.get("company", "FAN"),
            "group": it.get("group", ""),
            "category": it.get("category", ""),
            "subCategory": it.get("subcategory", ""),
            "itemCode": it.get("item_code", ""),
            "fg": it.get("fg", ""),
            "itemName": it.get("item_name", ""),
            "unit": it.get("unit", "Pcs"),
            "storeQty": float(it.get("store_qty", 0.0) or 0.0),
            "sectionQty": float(it.get("section_qty", 0.0) or 0.0),
            "totalQty": float(it.get("total_qty", 0.0) or 0.0)
        })
    t = os.path.join(PROD_DIR, "store_position_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_STORE_POSITION_REPORT_DATA = " + json.dumps(formatted, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_STORE_POSITION_REPORT_DATA = RAW_STORE_POSITION_REPORT_DATA; }\n")
    print(f"[+] Exported Bot 8 to {t}")
    return True

def export_bot_9():
    p = os.path.join(BASE_DIR, "mep_bom_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    t = os.path.join(PROD_DIR, "bom_view_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_BOM_VIEW_DATA = " + json.dumps(data, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_BOM_VIEW_DATA = RAW_BOM_VIEW_DATA; }\n")
    print(f"[+] Exported Bot 9 to {t}")
    return True

def export_bot_10():
    p = os.path.join(BASE_DIR, "monthly_attendance_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    t = os.path.join(HRM_DIR, "monthly_attendance_bot_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_MONTHLY_ATTENDANCE_BOT_DATA = " + json.dumps(data, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_MONTHLY_ATTENDANCE_BOT_DATA = RAW_MONTHLY_ATTENDANCE_BOT_DATA; }\n")
    print(f"[+] Exported Bot 10 to {t}")
    return True

def export_bot_11():
    p = os.path.join(BASE_DIR, "monthly_yearly_attendance_cache.json")
    if not os.path.exists(p): return False
    with open(p, "r", encoding="utf-8") as f: data = json.load(f)
    t = os.path.join(HRM_DIR, "monthly_yearly_attendance_bot_data.js")
    with open(t, "w", encoding="utf-8") as f:
        f.write("const RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA = " + json.dumps(data, indent=2) + ";\nif (typeof window !== 'undefined') { window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA = RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA; }\n")
    print(f"[+] Exported Bot 11 to {t}")
    return True

def export_bot_by_id(b):
    fn_map = {
        1: export_bot_1, 2: export_bot_2, 3: export_bot_3,
        4: export_bot_4, 5: export_bot_5, 6: export_bot_6,
        7: export_bot_7, 8: export_bot_8, 9: export_bot_9,
        10: export_bot_10, 11: export_bot_11
    }
    fn = fn_map.get(b)
    return fn() if fn else False

def export_all_bots():
    return {i: export_bot_by_id(i) for i in range(1, 12)}

if __name__ == "__main__":
    r = export_all_bots()
    print("Export results:", r)
