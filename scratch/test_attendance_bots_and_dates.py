import os
import sys
import time
import json

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from playwright.sync_api import sync_playwright

WORKSPACE_DIR = r"c:\Users\User\OneDrive\My Work\ERP SYSYEM"
INDEX_PATH = os.path.join(WORKSPACE_DIR, "index.html").replace("\\", "/")
FILE_URL = f"file:///{INDEX_PATH}"

def run_test():
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(channel="chrome", headless=True)
        except Exception:
            browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print(f"Loading ERP Portal: {FILE_URL}")
        page.goto(FILE_URL)
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(1000)

        # Ensure logged in
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
        page.wait_for_timeout(1500)

        print("Opening Flash Enterprise Hub Modal...")
        page.evaluate("() => { if (typeof openFlashModal === 'function') openFlashModal(); }")
        page.wait_for_timeout(800)

        # 1. Verify 11 Cards and Modules: 11 Live
        modal_visible = page.is_visible("#flashSpeedModal")
        print(f"Flash Modal visible: {modal_visible}")
        assert modal_visible, "Flash Modal failed to open!"

        stat_pills = page.inner_text(".flash-stats-group")
        print(f"Stats group text: {stat_pills.strip()}")
        assert "11 Live" in stat_pills, f"Expected '11 Live' in stats group, got: {stat_pills}"

        cards = page.query_selector_all(".flash-cards-grid .flash-card")
        print(f"Total Flash Cards in Grid: {len(cards)}")
        assert len(cards) == 11, f"Expected 11 flash cards, found {len(cards)}"

        # 2. Verify Bot 10 & Bot 11 cards
        card10_title = page.inner_text("#flashCard10 .flash-card-title")
        card11_title = page.inner_text("#flashCard11 .flash-card-title")
        print(f"Card 10 Title: {card10_title}")
        print(f"Card 11 Title: {card11_title}")
        assert "Monthly Attendance" in card10_title
        assert "Monthly & Yearly Attendance" in card11_title

        # Take screenshot of the 11 cards grid
        os.makedirs(r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db", exist_ok=True)
        screenshot_hub = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db\verified_flash_hub_11_cards.png"
        page.screenshot(path=screenshot_hub)
        print(f"Screenshot saved: {screenshot_hub}")

        # 3. Test Date Range Persistence for Bot 10
        from_val_10 = page.input_value("#flashDateFrom_10")
        to_val_10 = page.input_value("#flashDateTo_10")
        print(f"Bot 10 initial dates: {from_val_10} to {to_val_10}")

        # Change to custom date range: 05-09-2026 to 18-09-2026
        page.fill("#flashDateFrom_10", "05-09-2026")
        page.fill("#flashDateTo_10", "18-09-2026")
        page.click("#flashDateBox_10 .flash-card-save-btn")
        page.wait_for_timeout(500)

        badge_text = page.inner_text("#flashDateBadge_10")
        print(f"Bot 10 updated badge: {badge_text}")
        assert "05-09-2026 to 18-09-2026" in badge_text, "Date badge did not update after save!"

        saved_storage = page.evaluate("() => localStorage.getItem('flash_bot_date_range_10')")
        print(f"Bot 10 localStorage saved: {saved_storage}")
        assert "05-09-2026" in saved_storage and "18-09-2026" in saved_storage

        # Strict Invariance Test: Reload page and verify date has NOT changed!
        print("Testing page reload persistence...")
        page.reload()
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(1000)

        page.evaluate("() => { if (typeof openFlashModal === 'function') openFlashModal(); }")
        page.wait_for_timeout(600)

        reloaded_from_10 = page.input_value("#flashDateFrom_10")
        reloaded_to_10 = page.input_value("#flashDateTo_10")
        print(f"Bot 10 dates after reload: {reloaded_from_10} to {reloaded_to_10}")
        assert reloaded_from_10 == "05-09-2026", f"Expected 05-09-2026, got {reloaded_from_10}"
        assert reloaded_to_10 == "18-09-2026", f"Expected 18-09-2026, got {reloaded_to_10}"

        # 4. Test Collected Data Modal for Bot 10 (Monthly Attendance Matrix)
        print("Testing Collected Data for Bot 10 (Monthly Attendance Sheet)...")
        page.click("#flashDataBtn10")
        page.wait_for_timeout(1200)

        modal_collected = page.is_visible("#collectedDataModal")
        assert modal_collected, "Collected Data Modal did not open for Bot 10!"

        title_text = page.inner_text("#collectedModalHeader .collected-title")
        print(f"Bot 10 Modal Title: {title_text}")
        assert "Monthly Attendance" in title_text

        record_count = page.inner_text("#collectedRecordCount")
        print(f"Bot 10 Record Count: {record_count}")
        assert "126" in record_count

        # Verify daily attendance table matrix
        matrix_headers = page.query_selector_all("#collectedMasterTable thead th")
        print(f"Bot 10 Matrix Header count: {len(matrix_headers)}")
        assert len(matrix_headers) >= 28, f"Expected at least 28 header columns (8 meta + 21 days), got {len(matrix_headers)}"

        pills = page.query_selector_all(".att-pill")
        print(f"Bot 10 Total Attendance Pills rendered: {len(pills)}")
        assert len(pills) > 100, "Expected attendance pills rendered in matrix!"

        screenshot_bot10 = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db\verified_bot10_collected_data_matrix.png"
        page.screenshot(path=screenshot_bot10)
        print(f"Screenshot saved: {screenshot_bot10}")

        # Close Bot 10 modal
        page.click(".collected-close-btn")
        page.wait_for_timeout(500)

        # 5. Test Collected Data Modal for Bot 11 (Monthly & Yearly Attendance Report)
        print("Testing Collected Data for Bot 11 (Monthly & Yearly Attendance Report)...")
        page.click("#flashDataBtn11")
        page.wait_for_timeout(1200)

        title_text_11 = page.inner_text("#collectedModalHeader .collected-title")
        print(f"Bot 11 Modal Title: {title_text_11}")
        assert "Monthly & Yearly Attendance" in title_text_11

        record_count_11 = page.inner_text("#collectedRecordCount")
        print(f"Bot 11 Record Count: {record_count_11}")
        assert "317" in record_count_11

        table_11_cols = page.query_selector_all("#collectedMasterTable thead th")
        print(f"Bot 11 Table Column count: {len(table_11_cols)}")
        assert len(table_11_cols) == 41, f"Expected 41 columns for Bot 11, got {len(table_11_cols)}"

        screenshot_bot11 = r"C:\Users\User\.gemini\antigravity\brain\bf939c46-89d4-415f-b5c5-3a41799571db\verified_bot11_collected_data_41cols.png"
        page.screenshot(path=screenshot_bot11)
        print(f"Screenshot saved: {screenshot_bot11}")

        # Close Bot 11 modal
        page.click(".collected-close-btn")
        page.wait_for_timeout(500)

        print("ALL TESTS PASSED SUCCESSFULLY!")
        browser.close()

if __name__ == "__main__":
    run_test()
