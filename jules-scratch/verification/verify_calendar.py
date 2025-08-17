from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:4321")

        # Wait for the calendar to be visible
        expect(page.locator(".grid.grid-cols-7")).to_be_visible(timeout=15000)

        # Take a screenshot of the main page
        page.screenshot(path="jules-scratch/verification/main_page.png")

        # Click on a day to open the modal (e.g., the 15th day)
        day_element = page.locator(".p-2.h-24.sm\\:h-28.flex.flex-col").filter(has_text="15")
        day_element.click()

        # Wait for the modal to be visible
        expect(page.locator(".fixed.inset-0")).to_be_visible(timeout=5000)

        # Take a screenshot of the modal
        page.screenshot(path="jules-scratch/verification/modal_view.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Take a screenshot even if it fails to see the state
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
