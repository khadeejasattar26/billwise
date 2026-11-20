"""OpenCV cleanup that turns a phone photo of a bill into a clean black-on-white page for OCR."""

import cv2
import numpy as np

# Tesseract reads best when text is roughly 30 px tall; small photos are scaled up to this width.
MIN_WIDTH = 1600
# Skew beyond this is more likely a table edge than a tilted photo, so we leave it alone.
MAX_DESKEW_DEGREES = 15.0


class ImageDecodeError(ValueError):
    """The uploaded bytes are not an image OpenCV can read."""


def decode(image_bytes: bytes) -> np.ndarray:
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ImageDecodeError("The file is not a readable JPEG or PNG image.")
    return image


def estimate_skew(gray: np.ndarray) -> float:
    """Angle in degrees that the text block is tilted, from the smallest rectangle around all ink."""
    _, ink = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    # Remove specks (dust, sensor noise) so they don't stretch the rectangle to the whole frame.
    ink = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    points = cv2.findNonZero(ink)
    if points is None:
        return 0.0
    angle = cv2.minAreaRect(points)[-1]
    # OpenCV versions disagree on the range (4.5+: (0, 90]; 5.x: [-90, 0)); fold into (-45, 45].
    while angle > 45:
        angle -= 90
    while angle <= -45:
        angle += 90
    return float(angle)


def deskew(gray: np.ndarray) -> np.ndarray:
    angle = estimate_skew(gray)
    if abs(angle) < 0.3 or abs(angle) > MAX_DESKEW_DEGREES:
        return gray
    h, w = gray.shape
    matrix = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    return cv2.warpAffine(gray, matrix, (w, h), flags=cv2.INTER_CUBIC, borderValue=255)


def clean(image_bytes: bytes) -> np.ndarray:
    """Grayscale -> upscale -> denoise -> deskew -> adaptive threshold. Returns a binary image."""
    gray = cv2.cvtColor(decode(image_bytes), cv2.COLOR_BGR2GRAY)
    if gray.shape[1] < MIN_WIDTH:
        scale = MIN_WIDTH / gray.shape[1]
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    gray = cv2.fastNlMeansDenoising(gray, h=15)
    gray = deskew(gray)
    # Adaptive threshold handles shadows and uneven phone lighting better than one global cut-off.
    return cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, blockSize=31, C=15
    )
