"""OpenCV cleanup that turns a phone photo of a bill into a clean black-on-white page for OCR."""

import io
import threading
import warnings
from contextlib import contextmanager

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError

# Tesseract reads best when text is roughly 30 px tall; small photos are scaled up to this width.
MIN_WIDTH = 1600
# Skew beyond this is more likely a table edge than a tilted photo, so we leave it alone.
MAX_DESKEW_DEGREES = 15.0
# Largest image we decode. The 5 MB upload cap counts compressed bytes: a 0.05 MB white PNG can
# decode to 768 MB and kill the 512 MB container. The site shrinks photos to 2000 px (~4 MP), so
# 12 MP rejects no real bill. Keep in step with OPENCV_IO_MAX_IMAGE_PIXELS in the Dockerfile.
MAX_IMAGE_PIXELS = 12_000_000
ALLOWED_FORMATS = ("PNG", "JPEG")
# A 12 MP photo needs ~36 MB decoded (plus the resized copy). Uploads arrive in parallel, so cap
# how many are decoded at once; the rest wait their turn instead of adding up past 512 MB.
DECODE_SLOTS = 2
DECODE_WAIT_SECONDS = 30
_decode_slots = threading.BoundedSemaphore(DECODE_SLOTS)


class ImageDecodeError(ValueError):
    """The uploaded bytes are not an image OpenCV can read."""


class ServerBusyError(RuntimeError):
    """Every decode slot stayed taken for DECODE_WAIT_SECONDS."""


@contextmanager
def decode_slot(timeout: float = DECODE_WAIT_SECONDS):
    """Hold one of the DECODE_SLOTS while decoding; wait up to `timeout` seconds for one to free up."""
    if not _decode_slots.acquire(timeout=timeout):
        raise ServerBusyError("The server is busy reading other photos. Please try again in a minute.")
    try:
        yield
    finally:
        _decode_slots.release()


def check_header(image_bytes: bytes) -> None:
    """Refuse non-PNG/JPEG files and oversized images from the header alone, before any pixel is decoded."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", Image.DecompressionBombWarning)
            # Image.open reads only the header; the pixels stay compressed.
            with Image.open(io.BytesIO(image_bytes), formats=ALLOWED_FORMATS) as header:
                width, height = header.size
    except Image.DecompressionBombError:  # Pillow's own guard, for images over ~179 million pixels
        raise ImageDecodeError("The image is too large. Upload a photo under 12 megapixels.")
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError):
        raise ImageDecodeError("The file is not a readable JPEG or PNG image.")
    if width * height > MAX_IMAGE_PIXELS:
        raise ImageDecodeError("The image is too large. Upload a photo under 12 megapixels.")


def decode(image_bytes: bytes) -> np.ndarray:
    if not image_bytes:
        raise ImageDecodeError("The file is empty.")
    check_header(image_bytes)
    try:
        image = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    except cv2.error:  # OpenCV raises (rather than returning None) for some malformed input
        image = None
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


# Largest side of the photo sent to the LLM. Phone photos are ~4000 px; the model downsizes them
# anyway, so sending 2000 px cuts upload time and image tokens without losing readable text.
LLM_MAX_SIDE = 2000


def shrink_for_llm(image_bytes: bytes, media_type: str) -> tuple[bytes, str]:
    """Return the photo resized to at most LLM_MAX_SIDE pixels, as JPEG. Small photos pass through."""
    image = decode(image_bytes)
    h, w = image.shape[:2]
    if max(h, w) <= LLM_MAX_SIDE:
        return image_bytes, media_type
    scale = LLM_MAX_SIDE / max(h, w)
    resized = cv2.resize(image, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA)
    ok, encoded = cv2.imencode(".jpg", resized, [cv2.IMWRITE_JPEG_QUALITY, 88])
    return (encoded.tobytes(), "image/jpeg") if ok else (image_bytes, media_type)
