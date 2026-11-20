"""Read the explanation aloud on the server, so it works on any phone or browser.

Browsers only speak Urdu when the device has an Urdu voice installed, and many don't. This uses
Microsoft's neural voices through the `edge-tts` package (free, no key; it calls the same
service as Microsoft Edge's "Read aloud", which is not an official public API and could change).
The text sent is the explanation only: amounts and dates, no name or account number.
"""

import edge_tts

VOICES = {"ur": "ur-PK-UzmaNeural", "en": "en-GB-SoniaNeural"}
MAX_CHARS = 1500


class SpeechError(RuntimeError):
    """The speech service could not produce audio."""


async def synthesize(text: str, lang: str) -> bytes:
    """MP3 audio of `text`, spoken a little slower than normal for older listeners."""
    communicate = edge_tts.Communicate(text[:MAX_CHARS], VOICES.get(lang, VOICES["ur"]), rate="-10%")
    audio = bytearray()
    try:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.extend(chunk["data"])
    except Exception as exc:  # network failure or a service change; the frontend falls back to the browser voice
        raise SpeechError(f"Speech service failed: {exc}") from exc
    if not audio:
        raise SpeechError("Speech service returned no audio.")
    return bytes(audio)
