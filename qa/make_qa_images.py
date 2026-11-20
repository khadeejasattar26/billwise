"""Edge-case images for the QA suites: not-a-bill photos, broken files, odd sizes and names.
Usage: backend/.venv/bin/python qa/make_qa_images.py qa/images"""
import os
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

out = Path(sys.argv[1] if len(sys.argv) > 1 else "qa/images")
out.mkdir(parents=True, exist_ok=True)
sample = Path(__file__).resolve().parent.parent / "samples" / "bill_pitc_style.png"

Image.new("RGB", (1200, 900), "white").save(out / "blank.png")
random.seed(1)
Image.effect_noise((1000, 800), 80).convert("RGB").save(out / "noise.jpg")
menu = Image.new("RGB", (1200, 900), "white")
draw = ImageDraw.Draw(menu)
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 44)
for i, line in enumerate(["CAFE MENU", "Tea ........ Rs 80", "Samosa ..... Rs 50", "Biryani .... Rs 450"]):
    draw.text((80, 80 + i * 90), line, font=font, fill="black")
menu.save(out / "not_a_bill.png")
bill = Image.open(sample)
bill.rotate(90, expand=True).save(out / "rotated90.png")
bill.resize((300, 380)).save(out / "tiny.png")
bill.convert("RGB").save(out / "jpeg_named_png.png", format="JPEG")
bill.save(out / "UPPER.PNG")
(out / "corrupt.jpg").write_bytes(os.urandom(5000))
(out / "empty.png").write_bytes(b"")
(out / "exactly5mb.png").write_bytes(b"\x89PNG" + b"0" * (5 * 1024 * 1024 - 4))
(out / "bill.heic").write_bytes(b"fake heic")
print(f"wrote {len(list(out.iterdir()))} files to {out}")
