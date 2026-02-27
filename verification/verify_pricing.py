from playwright.sync_api import sync_playwright

def verify_pricing_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure all elements are rendered
        page = browser.new_page(viewport={"width": 1280, "height": 1024})

        try:
            # Navigate to the home page (where the pricing section is)
            print("Navigating to home page...")
            page.goto("http://localhost:3000", timeout=60000)

            # Wait for the pricing section to load
            print("Waiting for pricing section...")
            # The pricing section has an id="pricing"
            pricing_section = page.locator("#pricing")
            pricing_section.wait_for(timeout=30000)

            # Locate the "Pro" plan card (it's highlighted)
            # We can find it by text or by structure. Let's look for the pricing features.
            print("Verifying accessibility attributes...")

            # Get all list items in the pricing cards
            list_items = page.locator("#pricing li")
            count = list_items.count()
            print(f"Found {count} feature items.")

            if count == 0:
                print("Error: No feature items found!")
                page.screenshot(path="verification/error_no_items.png")
                return

            # Verify the structure of the first few items
            # We expect:
            # 1. An SVG (Check or X) with aria-hidden="true"
            # 2. A span with class "sr-only" containing "Included: " or "Not included: "
            # 3. A span with the feature text

            verified_count = 0
            # We iterate over the first 5 items to verify
            # Note: Playwright's locator methods return handles, so we need to be careful with indexing
            for i in range(min(5, count)):
                item = list_items.nth(i)

                # Check for aria-hidden on SVG
                svg = item.locator("svg")
                # Wait for SVG to be present
                if svg.count() > 0:
                    aria_hidden = svg.get_attribute("aria-hidden")
                    if aria_hidden != "true":
                        print(f"Error: Item {i} SVG missing aria-hidden='true'")
                    else:
                         print(f"Item {i} SVG aria-hidden: {aria_hidden}")
                else:
                    print(f"Error: Item {i} missing SVG")

                # Check for sr-only span
                # We target the specific span with class 'sr-only' inside the li
                sr_span = item.locator("span.sr-only")
                if sr_span.count() > 0:
                    text = sr_span.text_content()
                    if "Included: " in text or "Not included: " in text:
                         print(f"Item {i} sr-only text: '{text}' (Correct)")
                    else:
                        print(f"Error: Item {i} sr-only text incorrect: {text}")
                else:
                    print(f"Error: Item {i} missing sr-only span")

                verified_count += 1

            print(f"Verified {verified_count} items.")

            # Take a screenshot of the pricing section
            # We scroll to the pricing section first
            pricing_section.scroll_into_view_if_needed()
            page.screenshot(path="verification/pricing_accessibility.png")
            print("Screenshot saved to verification/pricing_accessibility.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error_exception.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_pricing_accessibility()
