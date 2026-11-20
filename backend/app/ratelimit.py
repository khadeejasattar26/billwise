"""Upload and question limits for the public site, so strangers can't run up the owner's OpenAI bill.

In memory, so limits reset when the server restarts; that is fine for one small container. The
real safety net is the monthly spending cap set in the OpenAI dashboard.
"""

import os
import time
from collections import defaultdict, deque

from fastapi import Request

HOUR = 3600
DAY = 86400


def _limit(name: str, default: int) -> int:
    return int(os.getenv(name, default))


class RateLimiter:
    def __init__(self) -> None:
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def _allow(self, key: str, limit: int, window: int, now: float) -> bool:
        hits = self.hits[key]
        while hits and hits[0] <= now - window:
            hits.popleft()
        if len(hits) >= limit:
            return False
        hits.append(now)
        return True

    def check(self, bucket: str, client: str, per_hour: int, per_day_total: int | None = None,
              now: float | None = None) -> str | None:
        """None if allowed; otherwise "client" (this visitor's hourly limit) or "site" (daily total)."""
        if os.getenv("RATE_LIMITS", "on").lower() == "off":
            return None
        now = time.time() if now is None else now
        if per_day_total is not None:
            daily = self.hits[f"{bucket}:site"]
            while daily and daily[0] <= now - DAY:
                daily.popleft()
            if len(daily) >= per_day_total:
                return "site"
        if not self._allow(f"{bucket}:{client}", per_hour, HOUR, now):
            return "client"
        if per_day_total is not None:
            self.hits[f"{bucket}:site"].append(now)
        return None


def client_ip(request: Request) -> str:
    # Behind Hugging Face's proxy the visitor's address is the first X-Forwarded-For entry.
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = RateLimiter()

UPLOADS_PER_HOUR = _limit("UPLOADS_PER_HOUR", 5)
UPLOADS_PER_DAY_TOTAL = _limit("UPLOADS_PER_DAY_TOTAL", 50)
ASKS_PER_HOUR = _limit("ASKS_PER_HOUR", 20)
SPEECH_PER_HOUR = _limit("SPEECH_PER_HOUR", 30)
