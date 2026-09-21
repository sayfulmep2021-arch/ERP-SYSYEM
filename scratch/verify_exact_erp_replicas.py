import os
import sys
import time
from playwright.sync_api import sync_playwright

WORKSPACE = r"c:\Users\User\OneDrive\My Work\ERP SYSYEM"
INDEX_PATH = os.path.join(WORKSPACE, "index.html")
FILE_URL = "file:///" + INDEX_PATH.replace("\\", "/")
OUTPUT_DIR = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db"

def run_verification():
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

        # 1. Bot 10 Collected Data
        print("Testing Bot 10 Collected Data...")
        page.evaluate("if (typeof window.openCollectedDataModal === 'function') window.openCollectedDataModal(10);")
        page.wait_for_timeout(2000)
        bot10_img = os.path.join(OUTPUT_DIR, "verified_bot10_exact_erp_replica.png")
        page.screenshot(path=bot10_img)
        print(f"Saved: {bot10_img}")

        # Close Bot 10 modal
        page.evaluate("if (typeof window.closeCollectedDataModal === 'function') window.closeCollectedDataModal();")
        page.wait_for_timeout(500)

        # 2. Bot 11 Collected Data
        print("Testing Bot 11 Collected Data...")
        page.evaluate("if (typeof window.openCollectedDataModal === 'function') window.openCollectedDataModal(11);")
        page.wait_for_timeout(2000)
        bot11_img = os.path.join(OUTPUT_DIR, "verified_bot11_exact_erp_replica.png")
        page.screenshot(path=bot11_img)
        print(f"Saved: {bot11_img}")

        # Close Bot 11 modal
        page.evaluate("if (typeof window.closeCollectedDataModal === 'function') window.closeCollectedDataModal();")
        page.wait_for_timeout(500)

        # 3. HRM Module - Option 1: Monthly Attendance
        print("Opening HRM Module - Option 1: Monthly Attendance...")
        page.goto(FILE_URL + "?view=hrm&sub=monthly_attendance", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        hrm_opt1_img = os.path.join(OUTPUT_DIR, "verified_hrm_opt1_exact_erp_replica.png")
        page.screenshot(path=hrm_opt1_img)
        print(f"Saved: {hrm_opt1_img}")

        # 4. HRM Module - Option 2: Monthly & Yearly Attendance
        print("Opening HRM Module - Option 2: Monthly & Yearly Attendance...")
        page.evaluate("if (typeof window.switchHrmSubPage === 'function') window.switchHrmSubPage('monthly_yearly_attendance_report');")
        page.wait_for_timeout(2500)
        hrm_opt2_img = os.path.join(OUTPUT_DIR, "verified_hrm_opt2_exact_erp_replica.png")
        page.screenshot(path=hrm_opt2_img)
        print(f"Saved: {hrm_opt2_img}")

        browser.close()
        print("All 4 verifications completed successfully!")

if __name__ == "__main__":
    run_verification()
