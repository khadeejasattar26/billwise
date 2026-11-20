"""Hands the saved bill to n8n, which schedules the due-date reminder. n8n being down never fails an upload."""

import logging
import os
from typing import Any

import httpx

log = logging.getLogger(__name__)


def send_to_n8n(bill: dict[str, Any]) -> bool:
    """POST the bill to N8N_WEBHOOK_URL. Returns True if n8n accepted it; False if skipped or failed."""
    url = os.getenv("N8N_WEBHOOK_URL", "").strip()
    if not url:
        return False
    try:
        response = httpx.post(url, json=bill, timeout=5.0)
        response.raise_for_status()
        return True
    except httpx.HTTPError as exc:
        log.warning("n8n webhook failed, reminder not scheduled: %s", exc)
        return False
