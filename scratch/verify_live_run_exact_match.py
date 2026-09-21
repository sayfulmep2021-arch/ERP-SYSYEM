import os
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # Load portal
        page.goto("file:///C:/Users/User/OneDrive/My%20Work/ERP%20SYSYEM/index.html")
        page.wait_for_timeout(2000)

        # 1. Open Flash Modal
        print("[1] Opening Flash Modal...")
        page.evaluate("if (typeof window.openFlashModal === 'function') window.openFlashModal();")
        page.wait_for_timeout(1000)

        # 2. Click Collected Data on Bot 10
        print("[2] Opening Bot 10 Collected Data...")
        page.evaluate("if (typeof window.openCollectedDataModal === 'function') window.openCollectedDataModal(10);")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "verified_live_bot10_collected.png"))
        print("[+] Captured Bot 10 Collected Data screenshot.")

        # Close modal
        page.evaluate("if (typeof window.closeCollectedDataModal === 'function') window.closeCollectedDataModal();")
        page.wait_for_timeout(500)

        # 3. Click Collected Data on Bot 11
        print("[3] Opening Bot 11 Collected Data...")
        page.evaluate("if (typeof window.openCollectedDataModal === 'function') window.openCollectedDataModal(11);")
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "verified_live_bot11_collected.png"))
        print("[+] Captured Bot 11 Collected Data screenshot.")

        # Authenticate session
        page.evaluate("""
            sessionStorage.setItem('portal_auth_status', 'true');
            sessionStorage.setItem('portal_auth_role', 'ADMIN');
            sessionStorage.setItem('portal_auth_sig', btoa('ADMIN:::MEP_SECURE_PORTAL_2026'));
            sessionStorage.setItem('portal_current_view', 'hrm');
        """)

        # 4. Navigate to HRM module
        print("[4] Navigating to HRM Module...")
        page.goto("file:///C:/Users/User/OneDrive/My%20Work/ERP%20SYSYEM/index.html?view=hrm&sub=monthly_attendance")
        page.wait_for_timeout(2000)
        page.evaluate("""
            if (typeof window.switchHrmSubPage === 'function') window.switchHrmSubPage('monthly_attendance');
        """)
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "verified_live_hrm_monthly_att.png"))
        print("[+] Captured HRM Monthly Attendance screenshot.")

        # 5. Switch to HRM Monthly & Yearly Attendance Report
        print("[5] Navigating to HRM Monthly & Yearly Attendance Report...")
        page.evaluate("if (typeof window.switchHrmSubPage === 'function') window.switchHrmSubPage('monthly_yearly_attendance_report');")
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "verified_live_hrm_monthly_yearly.png"))
        print("[+] Captured HRM Monthly & Yearly Attendance Report screenshot.")

        browser.close()
        print("[+] ALL VERIFICATIONS COMPLETE!")

if __name__ == "__main__":
    verify()
