import os, sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

WORKSPACE = r"c:\Users\User\OneDrive\My Work\ERP SYSYEM"
INDEX_PATH = os.path.join(WORKSPACE, "index.html")
FILE_URL = "file:///" + INDEX_PATH.replace("\\", "/")

def debug():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={"width": 1600, "height": 1000})
        page = context.new_page()

        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}".encode('utf-8', 'replace').decode('utf-8')))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        page.goto(FILE_URL, wait_until="domcontentloaded")
        page.evaluate("""() => {
            sessionStorage.setItem('portal_auth_status', 'true');
            sessionStorage.setItem('portal_auth_role', 'ADMIN');
            sessionStorage.setItem('portal_auth_sig', btoa('ADMIN:::MEP_SECURE_PORTAL_2026'));
        }""")

        page.goto(FILE_URL + "?view=hrm&sub=monthly_attendance", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        res = page.evaluate("""() => {
            const dash = document.getElementById('hrmDashboardPane');
            const att = document.getElementById('hrmMonthlyAttendancePane');
            const rep = document.getElementById('hrmMonthlyYearlyReportPane');
            return {
                dashDisplay: dash ? window.getComputedStyle(dash).display : null,
                attDisplay: att ? window.getComputedStyle(att).display : null,
                repDisplay: rep ? window.getComputedStyle(rep).display : null,
                hasHrmEngine: typeof window.HRM_ENGINE !== 'undefined',
                hasSwitchHrmSubPage: typeof window.switchHrmSubPage !== 'undefined',
            };
        }""")
        print("Initial state:", res)

        print("Calling window.switchHrmSubPage('monthly_attendance')...")
        call_res = page.evaluate("""() => {
            try {
                window.switchHrmSubPage('monthly_attendance');
                const dash = document.getElementById('hrmDashboardPane');
                const att = document.getElementById('hrmMonthlyAttendancePane');
                return {
                    success: true,
                    dashDisplay: dash ? window.getComputedStyle(dash).display : null,
                    attDisplay: att ? window.getComputedStyle(att).display : null,
                };
            } catch (err) {
                return { success: false, error: err.toString(), stack: err.stack };
            }
        }""")
        print("Call result:", call_res)

        browser.close()

if __name__ == "__main__":
    debug()
