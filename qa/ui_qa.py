"""BillWise UI QA in Edge (Playwright). Frontend at :5173, backend at :8000."""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent
Q, SHOTS = sys.argv[1], sys.argv[2]
SAMPLES = str(REPO / "samples")
results = []


def check(case, ok, detail=""):
    results.append((case, ok))
    print(f"{'PASS' if ok else 'FAIL'}  {case}  {detail}", flush=True)


def new_page(browser, lang="ur", width=900):
    page = browser.new_page(viewport={"width": width, "height": 900})
    page.add_init_script(f"try {{ if (!sessionStorage.getItem('qa')) {{ localStorage.setItem('billwise-lang', '{lang}'); sessionStorage.setItem('qa', '1') }} }} catch (e) {{}}")
    errors = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "status of 4" not in m.text else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    return page, errors


def upload(page, path, wait="#plain-h"):
    if not page.get_by_role("checkbox").is_checked():
        page.get_by_role("checkbox").check()
    page.set_input_files("#bill-file", path)
    page.locator(wait).first.wait_for(timeout=150_000)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    # U1 first load
    page, errors = new_page(browser)
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    check("U1 page loads in Urdu, right-to-left", page.evaluate("document.documentElement.lang + '/' + document.documentElement.dir") == "ur/rtl")
    check("U1 no console errors on load", not errors, "; ".join(errors)[:200])

    # U2 consent + keyboard
    upload_btn = page.get_by_role("button", name="بل کی تصویر اپ لوڈ کریں")
    check("U2 upload button disabled before consent", upload_btn.is_disabled())
    # Tab from the top until the consent box; every stop on the way must be visible (no invisible stops).
    invisible, focused = [], None
    for _ in range(15):
        page.keyboard.press("Tab")
        info = page.evaluate("(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return {type: e.type || e.tagName, w: r.width, h: r.height, label: (e.innerText || e.getAttribute('aria-label') || '').slice(0, 20)} })()")
        if info["w"] < 2 or info["h"] < 2:
            invisible.append(info)
        if info["type"] == "checkbox":
            focused = "checkbox"
            break
    page.keyboard.press("Space")
    check("U2 consent reachable by keyboard (Tab) and ticked with Space", focused == "checkbox" and page.get_by_role("checkbox").is_checked(), f"focused={focused}")
    check("U2 every Tab stop before it is visible", not invisible, str(invisible))
    page.keyboard.press("Tab")
    outline = page.evaluate("getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineWidth")
    check("U2 focused upload button shows a visible focus outline", "none" not in outline and not outline.endswith(" 0px"), outline)

    # U3 language switch persists
    page.get_by_role("button", name="Switch to English").click()
    page.reload()
    page.wait_for_load_state("networkidle")
    check("U3 English choice survives a reload, left-to-right", page.evaluate("document.documentElement.lang + '/' + document.documentElement.dir") == "en/ltr")
    page.close()

    # U4 error messages in Urdu
    page, errors = new_page(browser)
    page.goto("http://localhost:5173")
    upload(page, f"{Q}/corrupt.jpg", wait="[role=alert]")
    msg = page.locator("[role=alert]").first.inner_text()
    check("U4 broken file shows an Urdu error", "تصویر کھل نہیں سکی" in msg, msg.replace("\n", " ")[:90])
    upload(page, f"{Q}/blank.png", wait="[role=alert]")
    page.wait_for_timeout(500)
    msg = page.locator("[role=alert]").first.inner_text()
    check("U4 non-bill photo shows a specific Urdu message (not 'something went wrong')", "کچھ غلط ہو گیا" not in msg and "بل" in msg, msg.replace("\n", " ")[:120])

    # U5/U6/U7 results, stale state, same file twice
    upload(page, f"{SAMPLES}/bill_pitc_style.png")
    check("U5 results show reasons, breakdown and chart", page.locator("#why-h").is_visible() and page.locator("#charges-h").is_visible() and page.locator("#chart-h").is_visible())
    page.fill("#question", "میرا بل کیوں بڑھا؟")
    page.locator("form button[type=submit]").click()
    answer = page.locator("[data-testid=answer]")
    answer.wait_for(timeout=60_000)
    check("U5 Urdu answer is laid out right-to-left", answer.get_attribute("dir") == "rtl")
    first_answer = answer.inner_text()
    upload(page, f"{SAMPLES}/bill_2026_11.png")
    page.wait_for_function("document.querySelector('#plain-h') && !document.querySelector('[role=status]')", timeout=150_000)
    stale_answer = page.locator("[data-testid=answer]").count() > 0
    stale_question = page.input_value("#question")
    check("U6 a new upload clears the previous bill's question and answer", not stale_answer and stale_question == "", f"old answer still shown={stale_answer}, question box='{stale_question}'")
    upload(page, f"{SAMPLES}/bill_2026_11.png")
    page.wait_for_timeout(1000)
    check("U7 uploading the same file twice in a row works", page.locator("#plain-h").is_visible())
    page.get_by_role("button", name="Switch to English").click()
    check("U5 switching language after upload switches the explanation", page.locator("#plain-h").inner_text() == "In plain words")
    check("U1 no console errors during the whole flow", not errors, "; ".join(errors)[:200])
    page.close()

    # U8 phone widths
    for width in (320, 375, 768):
        page, errors = new_page(browser, width=width)
        page.goto("http://localhost:5173")
        upload(page, f"{SAMPLES}/bill_pitc_style.png")
        overflow = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check(f"U8 {width}px wide: no sideways scrolling", overflow <= 1, f"overflow={overflow}px")
        if width == 320:
            page.screenshot(path=f"{SHOTS}/qa-320.png", full_page=True)
        page.close()

    # U9 accessibility scan with axe-core
    for lang in ("ur", "en"):
        page, errors = new_page(browser, lang=lang)
        page.goto("http://localhost:5173")
        upload(page, f"{SAMPLES}/bill_pitc_style.png")
        page.add_script_tag(url="https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js")
        report = page.evaluate("axe.run(document, {resultTypes: ['violations']}).then(r => r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0].target.join(' ')})))")
        serious = [v for v in report if v["impact"] in ("serious", "critical")]
        check(f"U9 accessibility ({lang}): no serious or critical axe violations", not serious, json.dumps(report)[:400])
        page.close()

    # U10 ask box rules
    page, errors = new_page(browser, lang="en")
    page.goto("http://localhost:5173")
    upload(page, f"{SAMPLES}/bill_pitc_style.png")
    page.fill("#question", "hi")
    check("U10 Ask is disabled for questions under 3 characters", page.locator("form button[type=submit]").is_disabled())
    page.fill("#question", "Why is my bill so high?")
    page.press("#question", "Enter")
    page.locator("[data-testid=answer]").wait_for(timeout=60_000)
    check("U10 pressing Enter sends the question; English answer is left-to-right",
          page.locator("[data-testid=answer]").get_attribute("dir") == "ltr")
    page.close()
    browser.close()

print("\nSUMMARY:", sum(ok for _, ok in results), "passed,", sum(not ok for _, ok in results), "failed")
