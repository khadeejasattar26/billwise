from app.ratelimit import HOUR, RateLimiter


def test_a_visitor_is_blocked_after_the_hourly_limit_and_allowed_an_hour_later(monkeypatch):
    monkeypatch.setenv("RATE_LIMITS", "on")
    limiter = RateLimiter()
    assert [limiter.check("upload", "1.1.1.1", 2, now=0) for _ in range(3)] == [None, None, "client"]
    assert limiter.check("upload", "2.2.2.2", 2, now=0) is None  # other visitors unaffected
    assert limiter.check("upload", "1.1.1.1", 2, now=HOUR + 1) is None


def test_the_whole_site_stops_at_the_daily_total(monkeypatch):
    monkeypatch.setenv("RATE_LIMITS", "on")
    limiter = RateLimiter()
    results = [limiter.check("upload", f"10.0.0.{i}", 5, per_day_total=3, now=0) for i in range(4)]
    assert results == [None, None, None, "site"]


def test_limits_can_be_switched_off_for_local_development(monkeypatch):
    monkeypatch.setenv("RATE_LIMITS", "off")
    limiter = RateLimiter()
    assert all(limiter.check("upload", "1.1.1.1", 1, now=0) is None for _ in range(5))
