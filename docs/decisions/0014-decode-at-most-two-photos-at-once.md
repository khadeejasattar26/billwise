# 0014: Decode at most two photos at once, each under 12 megapixels
- Date: 2026-11-28
- Status: Accepted
- Related: amends [0013](0013-cap-decoded-image-size.md); `backend/app/vision.py` (`decode_slot`, `MAX_IMAGE_PIXELS`), `backend/app/main.py` (`/bills`), `Dockerfile`, `backend/tests/test_vision.py`, `backend/tests/test_storage_off.py`

**Context:** Decision 0013 stopped one oversized upload, but uploads arrive in parallel. Eight 12 MP photos decoded at the same moment used about 600 MB in a local test, more than the 512 MB Render container.

**Decision:** Lower the limit from 40 to 12 MP (three times the ~4 MP the site sends) and let only two photos be decoded at once; the rest wait up to 30 seconds, then get HTTP 503 "server_busy". The same eight uploads then peaked at about 160 MB. We rejected only lowering the limit: parallel uploads still add up.

**Consequences:** Parallel uploads can no longer exhaust memory. A busy moment makes some visitors wait or retry.

**Revisit when:** The host gets more memory or CPU, or busy errors appear in real use.
