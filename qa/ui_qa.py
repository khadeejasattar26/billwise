"""BillWise browser QA for the guided flow (Edge via Playwright). Frontend at :5173, backend at :8000.
Usage: python qa/ui_qa.py <qa-images-dir> <screenshot-dir>"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent
Q, SHOTS = sys.argv[1], sys.argv[2]
SAMPLE = str(REPO / "samples" / "bill_pitc_style.png")
URL = "http://localhost:5173"
AXE = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js"
results = []

UR = {"start": "اپنا بل چیک کریں", "sample": "نمونہ دیکھیں", "agree": "ہاں، یہ میرا بل ہے اور میں متفق ہوں",
      "camera": "کیمرہ کھولیں", "use": "یہ تصویر استعمال کریں", "anyway": "پھر بھی یہی تصویر استعمال کریں",
      "retake": "دوبارہ تصویر لیں", "details": "پوری تفصیل دیکھیں", "ask": "سوال پوچھیں", "chip": "میرا بل کیوں زیادہ ہے؟",
      "good": "تصویر صاف لگ رہی ہے", "blurry": "تصویر دھندلی لگ رہی ہے", "unreadable": "یہ تصویر کھل نہیں سکی",
      "not_bill": "بجلی کے بل کی نہیں لگتی", "larger": "بڑے حروف"}


def check(case, ok, detail=""):
    results.append((case, ok))
    print(f"{'PASS' if ok else 'FAIL'}  {case}  {detail}", flush=True)


def page_for(browser, width=390, height=844, lang="ur", mobile=True):
    ctx = browser.new_context(viewport={"width": width, "height": height}, is_mobile=mobile, has_touch=mobile)
    ctx.add_init_script(f"try {{ if (!sessionStorage.getItem('qa')) {{ localStorage.setItem('billwise-lang', '{lang}'); localStorage.setItem('billwise-large-text', '0'); sessionStorage.setItem('qa', '1') }} }} catch (e) {{}}")
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "status of 4" not in m.text else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    return page, errors


def hash_(page):
    return page.url.split("#", 1)[1] if "#" in page.url else "/"


def btn(page, key):
    return page.get_by_role("button", name=UR[key], exact=True)


def to_check(page, photo):
    btn(page, "start").click()
    btn(page, "agree").click()
    page.set_input_files("#gallery-input", photo)
    page.wait_for_function("document.querySelector('[role=status]') && !document.querySelector('[role=status]').innerText.includes('جانچی جا رہی')", timeout=15000)


def small_targets(page):
    """Visible buttons and links (not inline text links) smaller than 44x44 px (WCAG 2.5.5)."""
    return page.evaluate("""(() => [...document.querySelectorAll('button, a[href], summary, input[type=checkbox]')]
      .filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
                     return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !e.closest('.sr-only') && !(e.tagName === 'A' && s.display === 'inline') })
      .filter(e => { const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 44 })
      .map(e => `${e.tagName} "${(e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 18)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`))()""")


def axe(page):
    page.add_script_tag(url=AXE)
    report = page.evaluate("axe.run(document, {resultTypes: ['violations']}).then(r => r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length})))")
    return [v for v in report if v["impact"] in ("serious", "critical")]


with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    # F1-F2 home, 3 taps to the camera
    page, errors = page_for(browser)
    check("F1 home loads in Urdu, right-to-left, with a title", page.evaluate("document.documentElement.lang + '/' + document.documentElement.dir") == "ur/rtl" and "BillWise" in page.title())
    check("F1 home: no small tap targets", not small_targets(page), str(small_targets(page)))
    check("F1 home: no serious accessibility violations", not axe(page), str(axe(page)))
    btn(page, "start").click()
    try:  # the screen loads on demand, then focuses its heading
        page.wait_for_function("document.activeElement && document.activeElement.id === 'screen-title'", timeout=3000)
        focused = True
    except Exception:
        focused = False
    check("F2 tap 1 opens consent as step 1 of 3, focus on its heading", hash_(page) == "/consent" and focused)
    check("F2 consent: no small tap targets / accessibility issues", not small_targets(page) and not axe(page), str(small_targets(page)))
    btn(page, "agree").click()
    with page.expect_file_chooser() as chooser:
        btn(page, "camera").click()
    check("F2 tap 3 opens the camera (capture=environment)", chooser.value is not None and page.get_attribute("#camera-input", "capture") == "environment")
    check("F2 photo: no small tap targets / accessibility issues", not small_targets(page) and not axe(page), str(small_targets(page)))
    chooser.value.set_files(SAMPLE)
    page.locator(f"text={UR['good']}").wait_for(timeout=15000)
    check("F4 a clear photo passes the check; 'use this photo' is the main action", btn(page, "use").is_visible())
    check("F4 check: no small tap targets / accessibility issues", not small_targets(page) and not axe(page), str(small_targets(page)))
    page.go_back(); page.wait_for_timeout(300)
    back_to = hash_(page)
    page.go_forward(); page.wait_for_timeout(300)
    check("F5 browser back and forward move between steps", back_to == "/photo" and hash_(page) == "/check", f"back -> {back_to}")
    btn(page, "use").click()
    page.locator("#pay-h").wait_for(timeout=150000)
    check("F6 the bill is read and the answer screen opens", hash_(page) == "/answer")
    page.go_back(); page.wait_for_timeout(300)
    check("F6 back from the answer skips the 'reading' screen", hash_(page) == "/check", hash_(page))
    page.go_forward(); page.wait_for_timeout(300)
    pay = page.locator("#pay-h").locator("..").inner_text()
    check("F7 answer leads with the amount and the due date", "9,600" in pay and "نومبر" in pay, pay.replace("\n", " ")[:80])
    check("F7 answer: no small tap targets / accessibility issues", not small_targets(page) and not axe(page), str(small_targets(page)))
    btn(page, "details").click(); page.locator("#glossary-h").wait_for()
    check("F7 details explain the words on the bill", page.locator("dt", has_text="بقایا").count() == 1)
    check("F7 details: no small tap targets / accessibility issues", not small_targets(page) and not axe(page), str(small_targets(page)))
    page.go_back(); btn(page, "ask").click()
    btn(page, "chip").click()
    answer = page.locator("[data-testid=answer]"); answer.wait_for(timeout=90000)
    check("F7 a ready-made question gets an Urdu answer, right-to-left", answer.get_attribute("dir") == "rtl")
    check("F7 ask: no small tap targets / accessibility issues", not small_targets(page) and not axe(page), str(small_targets(page)))
    check("F1 no console errors in the whole flow", not errors, "; ".join(errors)[:200])
    page.context.close()

    # F3 guard: a typed link cannot skip consent
    page, _ = page_for(browser)
    page.goto(URL + "/#/photo"); page.reload(); page.wait_for_timeout(500)
    check("F3 opening #/photo directly goes to consent first", hash_(page) == "/consent", hash_(page))
    page.context.close()

    # F4 photo check outcomes
    page, _ = page_for(browser)
    to_check(page, f"{Q}/blurred.jpg")
    check("F4 a blurry photo is flagged and 'retake' becomes the main action",
          page.locator(f"text={UR['blurry']}").count() == 1 and btn(page, "retake").is_visible() and btn(page, "anyway").is_visible())
    page.go_back(); page.set_input_files("#gallery-input", f"{Q}/corrupt.jpg"); page.locator(f"text={UR['unreadable']}").wait_for(timeout=10000)
    check("F4 a file that is not a picture offers only 'retake'", btn(page, "anyway").count() == 0)
    # F8 a photo that is not a bill, end to end
    page.go_back(); page.set_input_files("#gallery-input", f"{Q}/blank.png"); page.wait_for_timeout(1500)
    btn(page, "anyway").click()
    page.locator(f"text={UR['not_bill']}").wait_for(timeout=120000)
    check("F8 a non-bill photo ends with a clear Urdu message and a retake button", btn(page, "retake").is_visible())
    btn(page, "retake").click(); page.wait_for_timeout(300)
    check("F8 'retake' returns to the photo step", hash_(page) == "/photo")
    page.context.close()

    # F9 sample: instant and free
    page, _ = page_for(browser)
    calls = []
    page.on("request", lambda r: calls.append(r.url) if "/bills" in r.url else None)
    btn(page, "sample").click(); page.locator("#pay-h").wait_for(timeout=3000)
    check("F9 'see an example' opens an answer instantly with no upload", hash_(page) == "/answer" and not calls)
    page.context.close()

    # F10-F11 language and text size
    page, _ = page_for(browser)
    page.get_by_role("button", name="Switch to English").click(); page.reload(); page.wait_for_load_state("networkidle")
    check("F10 English survives a reload, left-to-right, English title", page.evaluate("document.documentElement.dir") == "ltr" and "Understand" in page.title())
    page.context.close()
    page, _ = page_for(browser, width=360, height=740)
    before = page.evaluate("parseFloat(getComputedStyle(document.documentElement).fontSize)")
    btn(page, "larger").click()
    after = page.evaluate("parseFloat(getComputedStyle(document.documentElement).fontSize)")
    check("F11 'larger text' enlarges the page by 20% without sideways scrolling",
          round(after / before, 2) == 1.2 and page.evaluate("document.documentElement.scrollWidth") <= 360, f"{before}px -> {after}px")
    page.context.close()

    # F12 keyboard
    page, _ = page_for(browser, width=1280, height=900, mobile=False)
    stops, invisible = [], []
    for _ in range(8):
        page.keyboard.press("Tab")
        info = page.evaluate("(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return {t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 20), w: r.width, h: r.height} })()")
        stops.append(info["t"]); invisible += [info] if info["w"] < 2 or info["h"] < 2 else []
    check("F12 first Tab stop is 'skip to content' and every Tab stop is visible", stops[0] == "مواد پر جائیں" and not invisible, str(stops[:5]))
    btn(page, "start").focus(); page.keyboard.press("Tab"); page.keyboard.press("Shift+Tab")
    outline = page.evaluate("getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineWidth")
    check("F12 focused buttons show a visible outline", outline.startswith("solid") and not outline.endswith(" 0px"), outline)
    page.context.close()

    # F13 widths
    for width in (320, 375, 768, 1280):
        page, _ = page_for(browser, width=width, mobile=width < 768)
        btn(page, "sample").click(); page.locator("#pay-h").wait_for(timeout=3000)
        overflow = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check(f"F13 {width}px: answer screen has no sideways scrolling", overflow <= 1, f"overflow={overflow}px")
        if width == 375:
            page.screenshot(path=f"{SHOTS}/qa-answer-375.png", full_page=True)
        page.context.close()

    page, _ = page_for(browser, lang="en", width=1280, height=900, mobile=False)
    btn_en = page.get_by_role("button", name="See an example", exact=True); btn_en.click(); page.locator("#pay-h").wait_for(timeout=3000)
    check("F14 English answer: no serious accessibility violations", not axe(page), str(axe(page)))
    page.context.close()
    browser.close()

print("\nSUMMARY:", sum(ok for _, ok in results), "passed,", sum(not ok for _, ok in results), "failed")
