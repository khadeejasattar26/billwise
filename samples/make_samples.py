"""Generate two synthetic electricity bills (Oct and Nov 2026) for one fake account.

No real person, account or utility is used. Run with the backend venv:
    backend/.venv/bin/python samples/make_samples.py
"""

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).parent
LATIN_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
LATIN_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
URDU_FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

ACCOUNT = "0000-DEMO-0421"
BILLS = [
    {"file": "bill_2026_10.png", "month": "OCT 2026", "prev": 15230, "curr": 15480,
     "amount": "7,850.00", "due": "08 NOV 2026", "tilt": 0.0},
    {"file": "bill_2026_11.png", "month": "NOV 2026", "prev": 15480, "curr": 15800,
     "amount": "10,420.00", "due": "08 DEC 2026", "tilt": 2.0},
]
ROWS = [
    ("Account No", "کھاتہ نمبر", lambda b: ACCOUNT),
    ("Billing Month", "بلنگ کا مہینہ", lambda b: b["month"]),
    ("Previous Reading", "سابقہ ریڈنگ", lambda b: str(b["prev"])),
    ("Current Reading", "موجودہ ریڈنگ", lambda b: str(b["curr"])),
    ("Units Consumed", "استعمال شدہ یونٹ", lambda b: str(b["curr"] - b["prev"])),
    ("Amount Payable (Rs)", "قابل ادا رقم", lambda b: b["amount"]),
    ("Due Date", "آخری تاریخ", lambda b: b["due"]),
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def draw_bill(bill: dict) -> Image.Image:
    width, height = 1400, 1100
    img = Image.new("RGB", (width, height), "white")
    d = ImageDraw.Draw(img)
    title, label, value = font(LATIN_BOLD, 44), font(LATIN_FONT, 34), font(LATIN_BOLD, 36)
    urdu = font(URDU_FONT, 34)

    d.rectangle([40, 40, width - 40, 170], outline="black", width=3)
    d.text((70, 60), "DEMO POWER CO. - SAMPLE BILL", font=title, fill="black")
    d.text((70, 118), "Synthetic test data. Not a real bill.", font=label, fill="black")
    d.text((width - 70, 75), "بجلی کا بل", font=font(URDU_FONT, 46), fill="black",
           anchor="ra", direction="rtl", language="ur")

    y = 230
    for english, urdu_label, get_value in ROWS:
        d.text((70, y), english, font=label, fill="black")
        d.text((width - 70, y), urdu_label, font=urdu, fill="black", anchor="ra", direction="rtl", language="ur")
        d.text((560, y), get_value(bill), font=value, fill="black")
        d.line([60, y + 70, width - 60, y + 70], fill="#999999", width=1)
        y += 105

    d.text((70, y + 20), "Pay before the due date to avoid a late payment surcharge.", font=label, fill="black")
    return img


def make_it_look_like_a_photo(img: Image.Image, tilt: float) -> Image.Image:
    """Slight rotation, warm paper tint, blur and sensor noise, like a phone photo."""
    random.seed(7)
    img = img.rotate(tilt, expand=True, fillcolor=(235, 228, 210), resample=Image.BICUBIC)
    tint = Image.new("RGB", img.size, (245, 236, 215))
    img = Image.blend(img, tint, 0.25).filter(ImageFilter.GaussianBlur(1.1))
    px = img.load()
    for _ in range(img.size[0] * img.size[1] // 40):
        x, y = random.randrange(img.size[0]), random.randrange(img.size[1])
        shade = random.randint(120, 255)
        px[x, y] = (shade, shade, shade)
    return img


# ---- A bill laid out like the PITC bills issued by Pakistan's government DISCOs -----------------
# Consumer detail, meter info, charges breakdown and a 12-month history table. Fictional company,
# person and numbers. Shows the case BillWise must explain: last month was only partly paid, so
# arrears make the total high, and one month above 200 units made the household "unprotected".

PITC_HISTORY = [  # month, units, bill, payment
    ("Oct 25", 150, 9000, 9000), ("Nov 25", 110, 4200, 4200), ("Dec 25", 80, 2600, 2600),
    ("Jan 26", 85, 2700, 2700), ("Feb 26", 95, 3100, 3100), ("Mar 26", 120, 3900, 3900),
    ("Apr 26", 130, 4300, 4300), ("May 26", 120, 3500, 3500), ("Jun 26", 160, 5000, 5000),
    ("Jul 26", 240, 15000, 15000), ("Aug 26", 90, 4000, 4000), ("Sep 26", 180, 12000, 7000),
]


def draw_pitc_bill() -> Image.Image:
    width, height = 1500, 1900
    img = Image.new("RGB", (width, height), "white")
    d = ImageDraw.Draw(img)
    h1, h2, body, bold, small = (font(LATIN_BOLD, 40), font(LATIN_BOLD, 30), font(LATIN_FONT, 26),
                                 font(LATIN_BOLD, 28), font(LATIN_FONT, 22))
    urdu = font(URDU_FONT, 24)

    def ur(x, y, text):  # Urdu label, right-aligned at x
        d.text((x, y), text, font=urdu, fill="black", anchor="ra", direction="rtl", language="ur")

    def section(y, title):
        d.rectangle([40, y, width - 40, y + 48], fill="#222222")
        d.text((60, y + 8), title, font=h2, fill="white")
        return y + 70

    d.text((60, 40), "DEMO ELECTRIC SUPPLY COMPANY (DESCO)", font=h1, fill="#b00000")
    d.text((60, 95), "ELECTRICITY CONSUMER BILL  -  Sample, not a real bill", font=body, fill="black")

    y = section(150, "CONSUMER DETAIL")
    rows = [("REFERENCE NO", "00 00000 0000000", "حوالہ نمبر"), ("CONSUMER ID", "0000000777", "کنزیومر نمبر"),
            ("CATEGORY", "UNPROTECTED", "زمرہ"), ("TARIFF", "A-1a(01) DOMESTIC", "ٹیرف"),
            ("BILL MONTH", "OCT 26", "مہینہ بل"), ("DUE DATE", "05 NOV 26", "مقررہ تاریخ")]
    for label, value, urdu_label in rows:
        d.text((60, y), label, font=bold, fill="black"); d.text((420, y), value, font=body, fill="black")
        ur(width - 60, y, urdu_label); y += 48

    y = section(y + 20, "METER INFO")
    cols = [(60, "MF", "1", "ضرب"), (330, "PREVIOUS READING", "5000", "سابقہ ریڈنگ"),
            (760, "PRESENT READING", "5100", "موجودہ ریڈنگ"), (1180, "UNITS", "100", "یونٹ")]
    for x, label, value, urdu_label in cols:
        d.text((x, y), label, font=bold, fill="black")
        d.text((x, y + 40), urdu_label, font=urdu, fill="black", direction="rtl", language="ur")
        d.text((x, y + 95), value, font=body, fill="black")
    d.text((60, y + 150), "Fuel Price Adjustment for Aug-26 @ 1.1000/KWH", font=small, fill="black")
    y += 200

    y = section(y, "BILL CHARGES BREAKDOWN (RS.)")
    charges = [("Total Electricity Charges", "4,300", "کل چارجز"), ("Subsidies", "500", "رعایت"),
               ("Net Electricity Charges", "3,800", "نیٹ چارجز"), ("Taxes", "700", "ٹیکس"),
               ("Current Bill", "4,500", "موجودہ بل"), ("Arrears", "5,000", "بقایاجات"),
               ("Total FPA", "100", "فیول ایڈجسٹمنٹ"), ("Grand Total", "9,600", "کل واجبات")]
    for label, value, urdu_label in charges:
        f = bold if label in ("Current Bill", "Grand Total") else body
        d.text((60, y), label, font=f, fill="black"); d.text((620, y), value, font=f, fill="black")
        ur(width - 60, y, urdu_label); y += 44
    d.text((60, y + 10), "PAYABLE WITHIN DUE DATE   9,600", font=bold, fill="black")
    d.text((60, y + 55), "PAYABLE AFTER DUE DATE   9,800", font=bold, fill="black")
    y += 120

    y = section(y, "BILL HISTORY")
    headers = ["MONTH", "UNITS", "BILL (RS.)", "PAYMENT (RS.)"]
    for half, x0 in ((PITC_HISTORY[:6], 60), (PITC_HISTORY[6:], 780)):
        for i, h in enumerate(headers):
            d.text((x0 + i * 170, y), h, font=small, fill="black")
        for r, (month, units, bill, paid) in enumerate(half):
            yy = y + 40 + r * 38
            for i, value in enumerate((month, str(units), f"{bill:,}".replace(",", ""), f"{paid}")):
                d.text((x0 + i * 170, yy), value, font=body, fill="black")
    return img


if __name__ == "__main__":
    pitc = make_it_look_like_a_photo(draw_pitc_bill(), 1.0)
    path = OUT / "bill_pitc_style.png"
    pitc.save(path)
    print(f"wrote {path} ({path.stat().st_size // 1024} KB)")
    for bill in BILLS:
        image = draw_bill(bill)
        if bill["tilt"]:
            image = make_it_look_like_a_photo(image, bill["tilt"])
        path = OUT / bill["file"]
        image.save(path)
        print(f"wrote {path} ({path.stat().st_size // 1024} KB)")
