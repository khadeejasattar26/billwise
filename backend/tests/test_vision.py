import cv2
import numpy as np

from app.vision import LLM_MAX_SIDE, shrink_for_llm


def encode(width, height):
    ok, data = cv2.imencode(".png", np.full((height, width, 3), 255, np.uint8))
    return data.tobytes()


def test_large_photos_are_shrunk_to_the_llm_size_as_jpeg():
    data, media_type = shrink_for_llm(encode(4000, 3000), "image/png")
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    assert media_type == "image/jpeg"
    assert max(image.shape[:2]) == LLM_MAX_SIDE


def test_small_photos_are_sent_unchanged():
    original = encode(800, 600)
    assert shrink_for_llm(original, "image/png") == (original, "image/png")
