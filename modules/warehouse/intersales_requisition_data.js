const RAW_INTERSALES_REQUISITION_DATA = {
  "meta": {
    "title": "Inter Sales Requisition",
    "full_title": "Inter Sales Requisition (Warehouse -> Requisition Status -> FAN)",
    "f_date": "2026-09-01",
    "t_date": "2026-09-19",
    "company_to": "FAN",
    "total_requisitions": 1,
    "pending_requisitions": 1,
    "total_items": 6,
    "total_req_qty": 392500.0,
    "total_issue_qty": 30947.0,
    "total_pending_qty": 361553.0,
    "collected_at": "2026-09-19 15:20:01"
  },
  "requisitions": [
    {
      "req_no": "2326",
      "req_date": "2026-09-09",
      "company_for": "FAN",
      "company_to": "Printing and Packaging",
      "need_by": "2026-09-09",
      "entry_by": "Md. Rabbi Howladar",
      "status": "PENDING",
      "items": [
        {
          "sl": "1",
          "item_code": "3201010073",
          "item_name": "Capacitor Master Carton-Fan",
          "unit": "Pcs",
          "req_qty": 6500.0,
          "issue_qty": 128.0,
          "pending_qty": 6372.0
        },
        {
          "sl": "2",
          "item_code": "3201010074",
          "item_name": "Capacitor Inner box 2.5 \u00b5F -Fan",
          "unit": "Pcs",
          "req_qty": 13000.0,
          "issue_qty": 327.0,
          "pending_qty": 12673.0
        },
        {
          "sl": "3",
          "item_code": "3201010075",
          "item_name": "Capacitor Inner box 3.5 \u00b5F -Fan",
          "unit": "Pcs",
          "req_qty": 13000.0,
          "issue_qty": 492.0,
          "pending_qty": 12508.0
        },
        {
          "sl": "4",
          "item_code": "3201010076",
          "item_name": "Capacitor Warranty Card 2.5 \u00b5F -Fan",
          "unit": "Pcs",
          "req_qty": 155000.0,
          "issue_qty": 0.0,
          "pending_qty": 155000.0
        },
        {
          "sl": "5",
          "item_code": "3201010077",
          "item_name": "Capacitor Warranty Card 3.5 \u00b5F -Fan",
          "unit": "Pcs",
          "req_qty": 155000.0,
          "issue_qty": 0.0,
          "pending_qty": 155000.0
        },
        {
          "sl": "6",
          "item_code": "700100035",
          "item_name": "QC Pass Sticker (Fan)- Blue Color",
          "unit": "Pcs",
          "req_qty": 50000.0,
          "issue_qty": 30000.0,
          "pending_qty": 20000.0
        }
      ],
      "total_req_qty": 392500.0,
      "total_issue_qty": 30947.0,
      "total_pending_qty": 361553.0,
      "materials_count": 6,
      "from_warehouse": "FAN Floor",
      "to_warehouse": "Ground Floor Fan Store (FAN-1)"
    }
  ]
};
if (typeof window !== 'undefined') { window.RAW_INTERSALES_REQUISITION_DATA = RAW_INTERSALES_REQUISITION_DATA; }
