import sys
import os

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(channel="chrome", headless=True)
        except Exception:
            browser = p.chromium.launch(channel="msedge", headless=True)

        context = browser.new_context(viewport={'width': 1366, 'height': 850})
        page = context.new_page()

        file_url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
        print(f"Loading URL: {file_url}")
        page.goto(file_url, wait_until="load")
        page.wait_for_timeout(1000)

        # Ensure login state
        page.evaluate("""() => {
            sessionStorage.setItem('portal_auth_status', 'true');
            sessionStorage.setItem('portal_user_role', 'admin');
            sessionStorage.setItem('portal_user_name', 'Sayful Islam');
            if (typeof window.checkPortalAuth === 'function') {
                window.checkPortalAuth();
            }
        }""")
        page.reload()
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(1000)

        # Open Flash Modal
        print("Opening Flash Enterprise Hub Modal...")
        page.evaluate("() => { if (typeof openFlashModal === 'function') openFlashModal(); }")
        page.wait_for_selector("#flashSpeedModal", state="visible")
        page.wait_for_timeout(500)

        # 1. Verify Top Header Date Cards exist
        for bot_id, expected_name in [(1, "Inter Sales Requisition"), (10, "Monthly Attendance"), (11, "Monthly & Yearly Attendance")]:
            card = page.query_selector(f"#headerDateCard_{bot_id}")
            assert card is not None, f"Header date card for Bot {bot_id} not found!"
            from_el = page.query_selector(f"#headerDateFrom_{bot_id}")
            to_el = page.query_selector(f"#headerDateTo_{bot_id}")
            badge_el = page.query_selector(f"#headerDateBadge_{bot_id}")
            assert from_el is not None, f"From date input for Bot {bot_id} not found in header!"
            assert to_el is not None, f"To date input for Bot {bot_id} not found in header!"
            assert badge_el is not None, f"Badge for Bot {bot_id} not found in header!"
            print(f"✓ Bot {bot_id} ({expected_name}) header date controls present. Values: {from_el.input_value()} -> {to_el.input_value()} | {badge_el.inner_text()}")

        # 2. Verify Bot Cards 1, 10, 11 have NO inline date boxes
        for bot_id in [1, 10, 11]:
            old_box = page.query_selector(f"#flashCard{bot_id} .flash-card-date-box")
            assert old_box is None, f"flashCard{bot_id} should NOT have .flash-card-date-box!"
            old_from = page.query_selector(f"#flashDateFrom_{bot_id}")
            assert old_from is None, f"flashCard{bot_id} should NOT have inline #flashDateFrom_{bot_id}!"
            print(f"✓ Bot card {bot_id} is completely clean of inline date boxes!")

        # 3. Test changing dates and saving for Bot 10
        print("Testing date editing & saving for Bot 10...")
        page.fill("#headerDateFrom_10", "01-09-2026")
        page.fill("#headerDateTo_10", "21-09-2026")
        
        # Click save button inside headerDateCard_10
        save_btn_10 = page.query_selector("#headerDateCard_10 .flash-hdc-save-btn")
        save_btn_10.click()
        page.wait_for_timeout(300)

        # Check badge
        badge_text_10 = page.inner_text("#headerDateBadge_10")
        assert "01-09-2026 to 21-09-2026" in badge_text_10, f"Badge did not update! Got: {badge_text_10}"
        print(f"✓ Saved indicator badge updated: {badge_text_10}")

        # Check localStorage persistence
        ls_val_10 = page.evaluate("() => localStorage.getItem('flash_bot_date_range_10')")
        assert "01-09-2026" in ls_val_10 and "21-09-2026" in ls_val_10, f"localStorage missing saved dates: {ls_val_10}"
        print(f"✓ localStorage persisted: {ls_val_10}")

        # 4. Reload page and verify strict invariance
        print("Reloading page to verify strict date invariance...")
        page.reload(wait_until="load")
        page.wait_for_timeout(1000)
        page.evaluate("() => { if (typeof openFlashModal === 'function') openFlashModal(); }")
        page.wait_for_selector("#flashSpeedModal", state="visible")
        page.wait_for_timeout(500)

        reloaded_from_10 = page.input_value("#headerDateFrom_10")
        reloaded_to_10 = page.input_value("#headerDateTo_10")
        assert reloaded_from_10 == "01-09-2026", f"Expected 01-09-2026 after reload, got: {reloaded_from_10}"
        assert reloaded_to_10 == "21-09-2026", f"Expected 21-09-2026 after reload, got: {reloaded_to_10}"
        print("✓ Strict Invariance CONFIRMED! Dates preserved perfectly across reload.")

        # 5. Take screenshot of the entire modal
        modal_el = page.query_selector(".flash-modal-card")
        screenshot_path = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db\verified_header_multidate_modal.png"
        modal_el.screenshot(path=screenshot_path)
        print(f"✓ Screenshot saved to {screenshot_path}")

        browser.close()
        print("All automated verification steps passed with 100% success!")

if __name__ == "__main__":
    run()
