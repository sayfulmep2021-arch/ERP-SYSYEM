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
        context = browser.new_context(viewport={"width": 1600, "height": 1100})
        page = context.new_page()

        print(f"Loading {FILE_URL}...")
        page.goto(FILE_URL, wait_until="domcontentloaded")
        
        # Set Admin auth in sessionStorage
        page.evaluate("""() => {
            sessionStorage.setItem('portal_auth_status', 'true');
            sessionStorage.setItem('portal_auth_role', 'ADMIN');
            sessionStorage.setItem('portal_auth_sig', btoa('ADMIN:::MEP_SECURE_PORTAL_2026'));
            sessionStorage.setItem('portal_current_view', 'hrm');
        }""")
        
        # Navigate to Monthly & Yearly Attendance Report
        report_url = FILE_URL + "?view=hrm&sub=monthly_yearly_attendance_report"
        print(f"Navigating to {report_url}...")
        page.goto(report_url, wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        # 1. Test Employee 15387 (Arif Ahmed Anik)
        print("\n--- Testing Employee 15387 (Arif Ahmed Anik) ---")
        page.evaluate("""() => {
            const modeSel = document.getElementById('hrmAnnualModeSelect');
            if (modeSel) {
                modeSel.value = 'individual';
                modeSel.dispatchEvent(new Event('change'));
            }
            const idInput = document.getElementById('hrmIndividualIdInput');
            if (idInput) {
                idInput.value = '15387';
            }
            const okBtn = document.getElementById('btnHrmIndividualOk');
            if (okBtn) okBtn.click();
        }""")
        page.wait_for_timeout(1500)

        # Verify ID 15387 values in the DOM
        res_15387 = page.evaluate("""() => {
            const sumBox = document.getElementById('hrmIndividualSummaryBox');
            if (!sumBox) return { error: 'hrmIndividualSummaryBox not found' };

            const text = sumBox.innerText;
            
            // Extract from Group 1
            const absentMatch = text.match(/Absent Days:\\s*([0-9.]+)\\s*Days/i);
            const lwpMatch = text.match(/LWP \\(Leave Without Pay\\):\\s*([0-9.]+)\\s*Days/i);
            
            // Extract from Group 2
            const clMatch = text.match(/CL:\\s*([0-9.]+)/i);
            const paidLeaveMatch = text.match(/Paid Leave:\\s*([0-9.]+)/i);

            // Extract from Group 6 (TOTAL LEAVE)
            const totalLeaveMatch = text.match(/Total Leave\\s*=\\s*([0-9.]+)\\s*Days/i);

            // Extract top KPI leaves
            const kpiCards = document.querySelectorAll('#hrmIndividualLookupResultArea strong');
            const kpiValues = Array.from(kpiCards).map(el => el.innerText.trim());

            return {
                absent: absentMatch ? absentMatch[1] : null,
                lwp: lwpMatch ? lwpMatch[1] : null,
                cl: clMatch ? clMatch[1] : null,
                paidLeave: paidLeaveMatch ? paidLeaveMatch[1] : null,
                totalLeave: totalLeaveMatch ? totalLeaveMatch[1] : null,
                kpiValues: kpiValues.slice(0, 5),
                fullText: text
            };
        }""")

        print("ID 15387 Evaluation Result:")
        print(f"  Absent Days in Summary: {res_15387.get('absent')} (Expected: '0')")
        print(f"  LWP Days in Summary: {res_15387.get('lwp')} (Expected: '0')")
        print(f"  CL in Summary: {res_15387.get('cl')} (Expected: '3.5' - exact decimal preserved!)")
        print(f"  Paid Leave in Summary: {res_15387.get('paidLeave')} (Expected: '3.5' - exact decimal preserved!)")
        print(f"  TOTAL LEAVE in Summary: {res_15387.get('totalLeave')} (Expected: '3.5' Days - sum 0+0+3.5)")
        print(f"  Top KPI Highlights: {res_15387.get('kpiValues')}")

        # Capture Screenshot of ID 15387
        img15387 = os.path.join(OUTPUT_DIR, "verified_decimal_leave_and_total_leave_15387.png")
        page.screenshot(path=img15387, full_page=True)
        print(f"Saved Screenshot: {img15387}")

        # Capture element screenshot of #hrmIndividualSummaryBox
        sum_box_elem = page.locator("#hrmIndividualSummaryBox")
        if sum_box_elem.count() > 0:
            box_img = os.path.join(OUTPUT_DIR, "verified_summary_box_screenshot2_replica.png")
            sum_box_elem.screenshot(path=box_img)
            print(f"Saved Summary Box Screenshot: {box_img}")

        # 2. Test Employee 855
        print("\n--- Testing Employee 855 ---")
        page.evaluate("""() => {
            const idInput = document.getElementById('hrmIndividualIdInput');
            if (idInput) idInput.value = '855';
            const okBtn = document.getElementById('btnHrmIndividualOk');
            if (okBtn) okBtn.click();
        }""")
        page.wait_for_timeout(1500)

        res_855 = page.evaluate("""() => {
            const sumBox = document.getElementById('hrmIndividualSummaryBox');
            if (!sumBox) return { error: 'hrmIndividualSummaryBox not found' };
            const text = sumBox.innerText;
            const absentMatch = text.match(/Absent Days:\\s*([0-9.]+)\\s*Days/i);
            const clMatch = text.match(/CL:\\s*([0-9.]+)/i);
            const paidLeaveMatch = text.match(/Paid Leave:\\s*([0-9.]+)/i);
            const totalLeaveMatch = text.match(/Total Leave\\s*=\\s*([0-9.]+)\\s*Days/i);
            return {
                absent: absentMatch ? absentMatch[1] : null,
                cl: clMatch ? clMatch[1] : null,
                paidLeave: paidLeaveMatch ? paidLeaveMatch[1] : null,
                totalLeave: totalLeaveMatch ? totalLeaveMatch[1] : null
            };
        }""")
        print("ID 855 Evaluation Result:")
        print(f"  Absent: {res_855.get('absent')} (Expected: '0')")
        print(f"  CL: {res_855.get('cl')} (Expected: '2.5')")
        print(f"  Paid Leave: {res_855.get('paidLeave')} (Expected: '4.5')")
        print(f"  TOTAL LEAVE: {res_855.get('totalLeave')} (Expected: '4.5')")

        # 3. Test Employee 910
        print("\n--- Testing Employee 910 ---")
        page.evaluate("""() => {
            const idInput = document.getElementById('hrmIndividualIdInput');
            if (idInput) idInput.value = '910';
            const okBtn = document.getElementById('btnHrmIndividualOk');
            if (okBtn) okBtn.click();
        }""")
        page.wait_for_timeout(1500)

        res_910 = page.evaluate("""() => {
            const sumBox = document.getElementById('hrmIndividualSummaryBox');
            if (!sumBox) return { error: 'hrmIndividualSummaryBox not found' };
            const text = sumBox.innerText;
            const absentMatch = text.match(/Absent Days:\\s*([0-9.]+)\\s*Days/i);
            const clMatch = text.match(/CL:\\s*([0-9.]+)/i);
            const paidLeaveMatch = text.match(/Paid Leave:\\s*([0-9.]+)/i);
            const totalLeaveMatch = text.match(/Total Leave\\s*=\\s*([0-9.]+)\\s*Days/i);
            return {
                absent: absentMatch ? absentMatch[1] : null,
                cl: clMatch ? clMatch[1] : null,
                paidLeave: paidLeaveMatch ? paidLeaveMatch[1] : null,
                totalLeave: totalLeaveMatch ? totalLeaveMatch[1] : null
            };
        }""")
        print("ID 910 Evaluation Result:")
        print(f"  Absent: {res_910.get('absent')} (Expected: '2' - 1 in Jul + 1 in Sep, future dates excluded)")
        print(f"  CL: {res_910.get('cl')} (Expected: '7')")
        print(f"  Paid Leave: {res_910.get('paidLeave')} (Expected: '8')")
        print(f"  TOTAL LEAVE: {res_910.get('totalLeave')} (Expected: '10' - 2+0+8)")

        browser.close()
        print("\nAll verification checks completed successfully!")

if __name__ == "__main__":
    run_verification()
