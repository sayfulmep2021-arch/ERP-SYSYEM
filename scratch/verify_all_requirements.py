import os, time
from playwright.sync_api import sync_playwright

FILE_URL = "file:///C:/Users/User/OneDrive/My%20Work/ERP%20SYSYEM/index.html"
OUTPUT_DIR = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db"

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("[1] Opening ERP Portal with Auth Bypass...")
        page.goto(FILE_URL)
        page.evaluate("""() => {
            sessionStorage.setItem('portal_auth_status', 'true');
            sessionStorage.setItem('portal_auth_role', 'ADMIN');
            sessionStorage.setItem('portal_auth_sig', btoa('ADMIN:::MEP_SECURE_PORTAL_2026'));
            sessionStorage.setItem('portal_current_view', 'hrm');
            localStorage.removeItem('mep_monthly_attendance_bot_data');
            localStorage.removeItem('mep_monthly_yearly_attendance_bot_data');
        }""")

        # -------------------------------------------------------------
        # TEST 1: Screenshot 1 - Monthly Attendance (Bot 10 Source)
        # -------------------------------------------------------------
        print("\n[2] Testing Screenshot 1: Monthly Attendance (Bot 10 Exact Replica)...")
        page.goto(FILE_URL + "?view=hrm&sub=monthly_attendance", wait_until="domcontentloaded")
        page.wait_for_selector("#hrmMonthlyAttendancePane", state="visible", timeout=10000)
        page.wait_for_selector("#hrmMonthlyAttendanceTableBody tr", timeout=10000)
        time.sleep(2)

        # Verify KPI values
        kpi_staff = page.inner_text("#hrmMonthKpiStaff").strip()
        kpi_workdays = page.inner_text("#hrmMonthKpiWorkDays").strip()
        kpi_present = page.inner_text("#hrmMonthKpiPresent").strip()
        kpi_absent = page.inner_text("#hrmMonthKpiAbsent").strip()

        print(f"  Monthly Attendance KPIs -> Staff: {kpi_staff}, Workdays: {kpi_workdays}, Present: {kpi_present}, Absent: {kpi_absent}")
        assert kpi_staff == "108", f"Expected 108 staff, got {kpi_staff}"
        assert "27" in kpi_workdays, f"Expected 27 days, got {kpi_workdays}"
        assert kpi_present == "1,926", f"Expected 1,926 present, got {kpi_present}"
        assert kpi_absent == "262", f"Expected 262 absent, got {kpi_absent}"

        # Verify Table rows
        row1_id = page.evaluate("document.querySelector('#hrmMonthlyAttendanceTableBody tr:nth-child(1) td:nth-child(2)').textContent.trim()")
        row1_name = page.evaluate("document.querySelector('#hrmMonthlyAttendanceTableBody tr:nth-child(1) td:nth-child(3)').textContent.trim()")
        row2_id = page.evaluate("document.querySelector('#hrmMonthlyAttendanceTableBody tr:nth-child(2) td:nth-child(2)').textContent.trim()")
        row2_name = page.evaluate("document.querySelector('#hrmMonthlyAttendanceTableBody tr:nth-child(2) td:nth-child(3)').textContent.trim()")
        row3_id = page.evaluate("document.querySelector('#hrmMonthlyAttendanceTableBody tr:nth-child(3) td:nth-child(2)').textContent.trim()")
        row3_name = page.evaluate("document.querySelector('#hrmMonthlyAttendanceTableBody tr:nth-child(3) td:nth-child(3)').textContent.trim()")

        print(f"  Row 1 -> ID: {row1_id}, Name: {row1_name}")
        print(f"  Row 2 -> ID: {row2_id}, Name: {row2_name}")
        print(f"  Row 3 -> ID: {row3_id}, Name: {row3_name}")

        assert row1_id == "855", f"Expected row 1 ID 855, got {row1_id}"
        assert row2_id == "910", f"Expected row 2 ID 910, got {row2_id}"
        assert row3_id == "924", f"Expected row 3 ID 924, got {row3_id}"

        # Verify 868 is not in table
        has_868 = page.evaluate("Array.from(document.querySelectorAll('#hrmMonthlyAttendanceTableBody tr td:nth-child(2)')).some(td => td.textContent.trim() === '868')")
        assert not has_868, "Error: Inactive ID 868 found in monthly attendance table!"
        print("  [OK] Employee 868 successfully verified ABSENT (not in active table)")

        s1_path = os.path.join(OUTPUT_DIR, "verified_screenshot1_bound.png")
        page.screenshot(path=s1_path)
        print(f"  [OK] Saved screenshot: {s1_path}")

        # -------------------------------------------------------------
        # TEST 2: Screenshot 3 - Monthly & Yearly Attendance Report (Individual Lookup)
        # -------------------------------------------------------------
        print("\n[3] Testing Screenshot 3: Monthly & Yearly Attendance Report...")
        page.goto(FILE_URL + "?view=hrm&sub=monthly_yearly_attendance_report", wait_until="domcontentloaded")
        page.wait_for_selector("#hrmMonthlyYearlyReportPane", state="visible", timeout=10000)
        page.wait_for_selector("#hrmAnnualMasterTableBody tr", timeout=10000)
        time.sleep(2)

        # Check toolbar elements exist
        id_input = page.query_selector("#hrmIndividualIdInput")
        btn_ok = page.query_selector("#btnHrmIndividualOk")
        assert id_input is not None, "Missing #hrmIndividualIdInput"
        assert btn_ok is not None, "Missing #btnHrmIndividualOk"
        print("  [OK] Toolbar ID input & OK button verified")

        # Test Search with valid ID 855
        print("\n[4] Searching for valid ID 855...")
        page.fill("#hrmIndividualIdInput", "855")
        page.click("#btnHrmIndividualOk")
        time.sleep(2)

        # Verify Individual Card is displayed
        ind_card_visible = page.is_visible("#hrmIndividualLookupCard")
        assert ind_card_visible, "Error: #hrmIndividualLookupCard not visible after search"

        res_text = page.inner_text("#hrmIndividualLookupResultArea")
        assert "855" in res_text, "Error: ID 855 not found in result area"
        assert "Md.Kausar Hossain Poran" in res_text, "Error: Name not found in result area"
        assert "Senior Operator" in res_text, "Error: Designation not found in result area"
        assert "Assemble Line" in res_text, "Error: Section not found in result area"
        assert "41-COLUMN MONTHLY ATTENDANCE REGISTER" in res_text, "Error: 41-col register missing"
        assert "DAILY PUNCH ATTENDANCE LOGS" in res_text, "Error: Daily punches missing"
        print("  [OK] Valid ID 855 search successfully displayed individual card & 41-col table & daily punches")

        s3_path = os.path.join(OUTPUT_DIR, "verified_screenshot3_id_855.png")
        page.screenshot(path=s3_path)
        print(f"  [OK] Saved screenshot: {s3_path}")

        # Test Search with Invalid ID 99999
        print("\n[5] Searching for invalid ID 99999...")
        page.fill("#hrmIndividualIdInput", "99999")
        page.click("#btnHrmIndividualOk")
        time.sleep(2)

        not_found_text = page.inner_text("#hrmIndividualLookupResultArea")
        assert "No Data Found for this ID" in not_found_text, f"Expected 'No Data Found', got: {not_found_text}"
        assert "99999" in not_found_text, "Expected '99999' in not found message"
        print("  [OK] Invalid ID 99999 correctly shows 'No Data Found for this ID: 99999'")

        s3_nf_path = os.path.join(OUTPUT_DIR, "verified_screenshot3_id_not_found.png")
        page.screenshot(path=s3_nf_path)
        print(f"  [OK] Saved screenshot: {s3_nf_path}")

        # Test Reset
        print("\n[6] Testing Clear / Reset button...")
        page.click("#btnHrmResetLookup")
        time.sleep(2)

        master_visible = page.is_visible("#hrmAnnualMasterTableCard")
        assert master_visible, "Error: Master table card not restored after reset"
        print("  [OK] Master register successfully restored on reset")

        browser.close()
        print("\n[PASS] ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
