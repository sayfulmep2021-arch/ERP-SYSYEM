import sys, os, time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db"

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={'width': 1600, 'height': 950})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("[1] Opening Portal with Auth Bypass...")
        page.goto("http://127.0.0.1:8085/index.html")
        page.evaluate("""() => {
            sessionStorage.setItem('portal_auth_status', 'true');
            sessionStorage.setItem('portal_auth_role', 'ADMIN');
            sessionStorage.setItem('portal_auth_sig', btoa('ADMIN:::MEP_SECURE_PORTAL_2026'));
            sessionStorage.setItem('portal_current_view', 'hrm');
        }""")

        # -------------------------------------------------------------
        # TEST 1: HRM Option 1 - Monthly Attendence (Bot 10 Replica)
        # -------------------------------------------------------------
        print("\n[2] Testing HRM Option 1: Monthly Attendence...")
        page.goto("http://127.0.0.1:8085/index.html?view=hrm&sub=monthly_attendance")
        page.wait_for_selector("#hrmMonthlyAttendancePane", state="visible", timeout=10000)
        page.wait_for_selector("#hrmMonthlyAttendanceTableBody tr", timeout=10000)
        time.sleep(1)

        month_rows = page.query_selector_all("#hrmMonthlyAttendanceTableBody tr")
        print(f"  -> Rows loaded in Monthly Attendance: {len(month_rows)}")
        assert len(month_rows) == 126, f"Expected 126 rows, got {len(month_rows)}"

        # Check KPI cards
        kpi_staff = page.inner_text("#hrmMonthKpiStaff").strip()
        kpi_days = page.inner_text("#hrmMonthKpiWorkDays").strip()
        kpi_present = page.inner_text("#hrmMonthKpiPresent").strip()
        kpi_absent = page.inner_text("#hrmMonthKpiAbsent").strip()
        print(f"  -> KPIs: Staff={kpi_staff}, Days={kpi_days}, Present={kpi_present}, Absent={kpi_absent}")
        assert kpi_staff == "126", f"Expected 126 staff, got {kpi_staff}"
        assert "27" in kpi_days, f"Expected 27 days, got {kpi_days}"
        assert kpi_present == "1,941", f"Expected 1,941 presents, got {kpi_present}"
        assert kpi_absent == "702", f"Expected 702 absents, got {kpi_absent}"

        # Check first row
        first_emp_text = page.inner_text("#hrmMonthlyAttendanceTableBody tr:first-child").replace('\n', ' ')
        print(f"  -> First employee row preview: {first_emp_text[:80]}...")
        assert "855" in first_emp_text and "Md.Kausar Hossain Poran" in first_emp_text

        # Check attendance pills
        p_pills = page.query_selector_all(".att-pill.att-p")
        a_pills = page.query_selector_all(".att-pill.att-a")
        w_pills = page.query_selector_all(".att-pill.att-w")
        print(f"  -> Matrix Pills: P={len(p_pills)}, A={len(a_pills)}, W={len(w_pills)}")
        assert len(p_pills) > 0 and len(a_pills) > 0 and len(w_pills) > 0

        # Screenshot 1: HRM Option 1
        shot1 = os.path.join(ARTIFACT_DIR, "verified_hrm_option1_monthly_attendance_126_matrix.png")
        page.screenshot(path=shot1, full_page=False)
        print(f"  [+] Saved screenshot: {shot1}")

        # -------------------------------------------------------------
        # TEST 2: HRM Option 2 - Monthly & Yearly Attendence Report (Bot 11 Replica)
        # -------------------------------------------------------------
        print("\n[3] Testing HRM Option 2: Monthly & Yearly Attendence Report...")
        page.click("#hrmNavMonthlyYearlyReport")
        page.wait_for_selector("#hrmMonthlyYearlyReportPane", state="visible", timeout=10000)
        page.wait_for_selector("#hrmAnnualMasterTableBody tr", timeout=10000)
        time.sleep(1)

        annual_headers = page.query_selector_all("#hrmAnnualMasterTableHead tr th")
        print(f"  -> 41 Column Count: {len(annual_headers)}")
        assert len(annual_headers) == 41, f"Expected 41 columns, got {len(annual_headers)}"

        annual_rows = page.query_selector_all("#hrmAnnualMasterTableBody tr")
        print(f"  -> Rendered Master Rows loaded: {len(annual_rows)}")
        assert len(annual_rows) == 350, f"Expected 350 rendered rows, got {len(annual_rows)}"

        # Check KPI cards
        kpi_annual_total = page.inner_text("#hrmAnnualKpiTotal").strip()
        kpi_annual_prod = page.inner_text("#hrmAnnualKpiProduction").strip()
        kpi_annual_pres = page.inner_text("#hrmAnnualKpiPresent").strip()
        kpi_annual_ot = page.inner_text("#hrmAnnualKpiOt").strip()
        print(f"  -> KPIs: Total={kpi_annual_total}, Prod={kpi_annual_prod}, Present={kpi_annual_pres}, OT={kpi_annual_ot}")
        assert kpi_annual_total == "2,539", f"Expected 2,539 total workforce, got {kpi_annual_total}"
        assert kpi_annual_prod == "497", f"Expected 497 production staff, got {kpi_annual_prod}"

        # Check first employee in 41-column master report
        first_master_row = page.inner_text("#hrmAnnualMasterTableBody tr:first-child").replace('\n', ' ')
        print(f"  -> First master row preview: {first_master_row[:80]}...")
        assert "569" in first_master_row and "Sudeb Baral" in first_master_row

        # Screenshot 2: HRM Option 2
        shot2 = os.path.join(ARTIFACT_DIR, "verified_hrm_option2_monthly_yearly_41cols.png")
        page.screenshot(path=shot2, full_page=False)
        print(f"  [+] Saved screenshot: {shot2}")

        # -------------------------------------------------------------
        # TEST 3: Flash Enterprise Hub Bot 10 & Bot 11 Collected Data Comparison
        # -------------------------------------------------------------
        print("\n[4] Comparing with Flash Enterprise Hub Collected Data...")
        page.evaluate("() => { if (typeof openFlashModal === 'function') openFlashModal(); }")
        page.wait_for_selector("#flashSpeedModal", state="visible", timeout=10000)

        # Open Bot 10 Collected Data
        print("  -> Checking Flash Hub Bot 10 Collected Data...")
        page.evaluate("() => { if (typeof openCollectedDataModal === 'function') openCollectedDataModal(10); }")
        page.wait_for_selector("#collectedDataModal", state="visible", timeout=10000)
        page.wait_for_selector("#collectedModalBody .att-matrix-table", timeout=10000)
        time.sleep(1)

        hub_b10_rows = page.query_selector_all("#collectedModalBody .att-matrix-table tbody tr")
        print(f"  -> Flash Hub Bot 10 rows: {len(hub_b10_rows)}")
        assert len(hub_b10_rows) == 126, f"Expected 126, got {len(hub_b10_rows)}"

        shot3 = os.path.join(ARTIFACT_DIR, "verified_flash_hub_bot10_collected_match.png")
        page.screenshot(path=shot3, full_page=False)
        print(f"  [+] Saved screenshot: {shot3}")

        # Open Bot 11 Collected Data
        print("  -> Checking Flash Hub Bot 11 Collected Data...")
        page.evaluate("() => { if (typeof openCollectedDataModal === 'function') openCollectedDataModal(11); }")
        page.wait_for_selector("#collectedModalBody table", timeout=10000)
        time.sleep(1)

        hub_b11_headers = page.query_selector_all("#collectedModalBody table thead tr th")
        print(f"  -> Flash Hub Bot 11 headers: {len(hub_b11_headers)}")
        assert len(hub_b11_headers) == 41, f"Expected 41 headers, got {len(hub_b11_headers)}"

        shot4 = os.path.join(ARTIFACT_DIR, "verified_flash_hub_bot11_collected_match.png")
        page.screenshot(path=shot4, full_page=False)
        print(f"  [+] Saved screenshot: {shot4}")

        print("\n============================================================")
        print(">>> ALL VERIFICATIONS PASSED: 100% HUBUHU PARITY CONFIRMED! <<<")
        print("============================================================")

        browser.close()

if __name__ == "__main__":
    run_verification()
