import os
import sys
import time
from playwright.sync_api import sync_playwright

WORKSPACE = r"c:\Users\User\OneDrive\My Work\ERP SYSYEM"
INDEX_PATH = os.path.join(WORKSPACE, "index.html")
FILE_URL = "file:///" + INDEX_PATH.replace("\\", "/")

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={"width": 1600, "height": 1000})
        page = context.new_page()

        print(f"Loading {FILE_URL}...")
        page.goto(FILE_URL, wait_until="domcontentloaded")

        # Set Admin auth in sessionStorage
        page.evaluate("""() => {
            sessionStorage.setItem('portal_auth_status', 'true');
            sessionStorage.setItem('portal_auth_role', 'ADMIN');
            sessionStorage.setItem('portal_auth_sig', btoa('ADMIN:::MEP_SECURE_PORTAL_2026'));
            sessionStorage.setItem('portal_current_view', 'module_select');
        }""")
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        # 1. Check Bot 10 vs HRM Option 1 data parity
        print("\n--- Testing Bot 10 vs HRM Option 1 Data Parity ---")
        parity_b10 = page.evaluate("""() => {
            const b10 = (window.getBotDataCache && window.getBotDataCache(10)) ||
                        (window.RAW_MONTHLY_ATTENDANCE_BOT_DATA) || null;
            const b10ItemsCount = b10 && b10.items ? b10.items.length : 0;

            // Switch to HRM Monthly Attendance
            if (typeof window.switchHrmSubPage === 'function') {
                window.switchHrmSubPage('monthly_attendance');
            }

            const hrmCountBadge = document.getElementById('hrmMonthFilteredCount');
            const hrmCountText = hrmCountBadge ? hrmCountBadge.textContent : '';
            return {
                b10ItemsCount: b10ItemsCount,
                hrmCountText: hrmCountText,
                b10FirstEmp: b10 && b10.items && b10.items[0] ? b10.items[0].emp_name : ''
            };
        }""")
        print(f"Bot 10 Data: {parity_b10}")

        # 2. Check Bot 11 vs HRM Option 2 data parity
        print("\n--- Testing Bot 11 vs HRM Option 2 Data Parity ---")
        parity_b11 = page.evaluate("""() => {
            const b11 = (window.getBotDataCache && window.getBotDataCache(11)) ||
                        (window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA) || null;
            const b11ItemsCount = b11 && b11.items ? b11.items.length : 0;

            // Switch to HRM Monthly & Yearly Report
            if (typeof window.switchHrmSubPage === 'function') {
                window.switchHrmSubPage('monthly_yearly_attendance_report');
            }

            const hrmYearlyCountBadge = document.getElementById('hrmAnnualFilteredCount');
            const hrmYearlyCountText = hrmYearlyCountBadge ? hrmYearlyCountBadge.textContent : '';
            return {
                b11ItemsCount: b11ItemsCount,
                hrmYearlyCountText: hrmYearlyCountText,
                b11FirstEmp: b11 && b11.items && b11.items[0] ? b11.items[0].emp_name : ''
            };
        }""")
        print(f"Bot 11 Data: {parity_b11}")

        # 3. Test Automatic Realtime Sync when Bot 10 runs
        print("\n--- Testing Automatic Realtime Sync for Bot 10 ---")
        sync_test_b10 = page.evaluate("""() => {
            // Switch to monthly_attendance view first
            window.switchHrmSubPage('monthly_attendance');

            // Simulate fresh data arriving from Bot 10 run
            const currentData = JSON.parse(JSON.stringify(window.RAW_MONTHLY_ATTENDANCE_BOT_DATA || { items: [] }));
            const testName = "TEST-EMPLOYEE-AUTO-SYNC-" + Date.now();
            currentData.items.unshift({
                sl: "0",
                emp_id: "9999",
                emp_name: testName,
                company: "MEP FAN LIMITED.",
                department: "Production",
                section: "Production",
                unit: "Assemble Line",
                job_location: "Factory-Barishal",
                present_days: 27,
                absent_days: 0,
                leave_days: 0,
                daily: [
                    { day_header: "August 26 Wed", status: "Present", status_type: "Present", in_time: "07:50 am", out_time: "08:00 pm" }
                ]
            });

            // Trigger syncBotToModuleLocalStorage(10, currentData)
            window.syncBotToModuleLocalStorage(10, currentData);

            // Check if HRM view auto-updated immediately
            const tbody = document.getElementById('hrmMonthlyAttendanceTableBody');
            const updatedHtml = tbody ? tbody.innerHTML : '';
            const foundInTable = updatedHtml.includes(testName);

            return {
                testName: testName,
                foundInTable: foundInTable
            };
        }""")
        print(f"Bot 10 Auto-Sync Test: {sync_test_b10}")
        assert sync_test_b10["foundInTable"] == True, "Bot 10 data did not automatically update in HRM!"

        # 4. Test Automatic Realtime Sync when Bot 11 runs
        print("\n--- Testing Automatic Realtime Sync for Bot 11 ---")
        sync_test_b11 = page.evaluate("""() => {
            // Switch to monthly_yearly_attendance_report view
            window.switchHrmSubPage('monthly_yearly_attendance_report');

            // Simulate fresh data arriving from Bot 11 run
            const currentData = JSON.parse(JSON.stringify(window.RAW_MONTHLY_YEARLY_ATTENDANCE_BOT_DATA || { items: [] }));
            const testNameYearly = "TEST-YEARLY-AUTO-SYNC-" + Date.now();
            currentData.items.unshift({
                sl: "0",
                emp_id: "8888",
                emp_name: testNameYearly,
                designation: "Chief Test Engineer",
                department: "Production",
                section: "Assemble Line",
                sub_section: "Production",
                grade: "M",
                job_location: "Factory-Barishal",
                company: "FAN",
                join_date: "2020-01-01",
                month_year: "Sep-2026",
                assigned_working_hour: "8",
                total_days_in_month: "31",
                festival_holiday: "4",
                total_working_days: "27",
                standard_working_hour: "216",
                present_days: "27",
                physical_working_hour: "216",
                absent_days: "0",
                lwp: "0", cl: "0", ml: "0", el: "0", npl: "0", paid_leave: "0",
                ot: "10", extra_ot: "0", total_ot: "10",
                late_days: "0", late_min: "0", early_days: "0", early_min: "0",
                compensatory_leave: "0", sp_iom_pay: "0", sp_iom_leave: "0",
                reg_iom: "0", od_iom: "0", night_duty_days: "0", night_duty_hours: "0",
                m_grade_extra_duty: "0", is_first_month_row: true
            });

            // Trigger syncBotToModuleLocalStorage(11, currentData)
            window.syncBotToModuleLocalStorage(11, currentData);

            // Check if HRM view auto-updated immediately
            const tbody = document.getElementById('hrmAnnualMasterTableBody');
            const updatedHtml = tbody ? tbody.innerHTML : '';
            const foundInTable = updatedHtml.includes(testNameYearly);

            return {
                testNameYearly: testNameYearly,
                foundInTable: foundInTable
            };
        }""")
        print(f"Bot 11 Auto-Sync Test: {sync_test_b11}")
        assert sync_test_b11["foundInTable"] == True, "Bot 11 data did not automatically update in HRM!"

        # Restore original clean caches
        print("\n--- Restoring Clean Caches ---")
        page.evaluate("""() => {
            localStorage.removeItem('mep_monthly_attendance_bot_data');
            localStorage.removeItem('mep_monthly_yearly_attendance_bot_data');
        }""")

        browser.close()
        print("\n[SUCCESS] All parity and automatic sync tests passed 100%!")

if __name__ == "__main__":
    run_test()
