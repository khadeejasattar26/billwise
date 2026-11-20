from types import SimpleNamespace

from app.ratelimit import HOUR, RateLimiter, client_ip


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


def fake_request(forwarded: str, peer: str = "10.0.0.1"):
    return SimpleNamespace(headers={"x-forwarded-for": forwarded}, client=SimpleNamespace(host=peer))


def test_a_visitor_cannot_fake_their_address_with_x_forwarded_for(monkeypatch):
    monkeypatch.delenv("TRUSTED_PROXY_HOPS", raising=False)
    assert client_ip(fake_request("6.6.6.6")) == "10.0.0.1"  # no proxy trusted: header ignored


def test_behind_one_proxy_the_address_it_appended_is_used(monkeypatch):
    monkeypatch.setenv("TRUSTED_PROXY_HOPS", "1")
    # The visitor sent "6.6.6.6"; the proxy appended the real address 203.0.113.9.
    assert client_ip(fake_request("6.6.6.6, 203.0.113.9")) == "203.0.113.9"
