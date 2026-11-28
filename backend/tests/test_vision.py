import struct
import zlib

import cv2
import numpy as np

import pytest

from app.vision import LLM_MAX_SIDE, MAX_IMAGE_PIXELS, ImageDecodeError, decode, shrink_for_llm


def encode(width, height, ext=".png"):
    ok, data = cv2.imencode(ext, np.full((height, width, 3), 255, np.uint8))
    return data.tobytes()


def png_bomb(width, height):
    """A valid all-white 1-bit PNG, built without ever holding the decoded image in memory."""
    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))

    row = b"\x00" + b"\xff" * ((width + 7) // 8)  # filter byte + packed 1-bit pixels
    packer = zlib.compressobj(9)
    idat = b"".join(packer.compress(row) for _ in range(height)) + packer.flush()
    ihdr = struct.pack(">IIBBBBB", width, height, 1, 0, 0, 0, 0)  # 1-bit grayscale
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


def test_a_decompression_bomb_is_refused_before_decoding():
    # 0.03 MB on the wire, but OpenCV would allocate 16,000 x 16,000 x 3 bytes = 768 MB to decode it:
    # enough to get the 512 MB Render container killed (the audit's denial-of-service finding).
    bomb = png_bomb(16_000, 16_000)
    assert len(bomb) < 5 * 1024 * 1024
    with pytest.raises(ImageDecodeError, match="too large"):
        decode(bomb)


def test_an_image_just_over_the_pixel_limit_is_refused():
    # 7,000 x 6,000 = 42 MP: under Pillow's own bomb guard (~179 MP), so our limit must catch it.
    assert 7_000 * 6_000 > MAX_IMAGE_PIXELS
    with pytest.raises(ImageDecodeError, match="too large"):
        decode(png_bomb(7_000, 6_000))


@pytest.mark.parametrize("ext", [".bmp", ".tiff", ".webp"])
def test_formats_other_than_png_and_jpeg_are_refused_even_if_renamed(ext):
    # The route trusts the file name; a TIFF renamed .png must not reach OpenCV's other decoders.
    with pytest.raises(ImageDecodeError, match="not a readable JPEG or PNG"):
        decode(encode(100, 100, ext))


def test_jpeg_photos_still_decode():
    assert decode(encode(800, 600, ".jpg")).shape == (600, 800, 3)


def test_large_photos_are_shrunk_to_the_llm_size_as_jpeg():
    data, media_type = shrink_for_llm(encode(4000, 3000), "image/png")
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    assert media_type == "image/jpeg"
    assert max(image.shape[:2]) == LLM_MAX_SIDE


def test_small_photos_are_sent_unchanged():
    original = encode(800, 600)
    assert shrink_for_llm(original, "image/png") == (original, "image/png")


@pytest.mark.parametrize("data", [b"", b"\x00" * 10, b"not an image at all"])
def test_empty_or_broken_files_raise_a_clear_error_not_a_crash(data):
    with pytest.raises(ImageDecodeError):
        decode(data)
