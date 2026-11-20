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


if __name__ == "__main__":
    for bill in BILLS:
        image = draw_bill(bill)
        if bill["tilt"]:
            image = make_it_look_like_a_photo(image, bill["tilt"])
        path = OUT / bill["file"]
        image.save(path)
        print(f"wrote {path} ({path.stat().st_size // 1024} KB)")
