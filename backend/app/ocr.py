"""Tesseract OCR over the cleaned bill image, reading English and Urdu together."""

import numpy as np
import pytesseract

LANGUAGES = "eng+urd"
# psm 4 = "a single column of text of variable sizes", which suits label/value rows on a bill.
CONFIG = "--psm 4"


def read_text(clean_image: np.ndarray) -> str:
    return pytesseract.image_to_string(clean_image, lang=LANGUAGES, config=CONFIG).strip()
