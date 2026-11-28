# 0013: Refuse images over 40 megapixels before decoding them
- Date: 2026-11-28
- Status: Accepted
- Related: `backend/app/vision.py` (`check_header`, `MAX_IMAGE_PIXELS`), `Dockerfile` (`OPENCV_IO_MAX_IMAGE_PIXELS`), `backend/tests/test_vision.py`

**Context:** The 5 MB upload cap counts compressed bytes. A 0.05 MB white PNG of 16,000 x 16,000 px made OpenCV allocate about 900 MB, enough to kill the 512 MB Render container and take the site down; anyone can send one.

**Decision:** Two limits of 40 megapixels, ten times the ~4 MP the site sends after shrinking photos to 2,000 px. Pillow reads only the header and refuses non-PNG/JPEG files or oversized images; OpenCV's own limit is set in the Dockerfile as a backstop. We rejected lowering the upload cap: compressed size says nothing about decoded size.

**Consequences:** One upload can no longer crash the server, and renamed TIFF/WebP files are refused. Direct API uploads of very large photos (over 40 MP) now get "unreadable_image".

**Revisit when:** The host gets more memory, or real uploads above 40 MP appear.
