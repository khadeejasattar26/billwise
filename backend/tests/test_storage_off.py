"""STORAGE=off (public site): nothing is saved, consent is required, questions carry the bill."""

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app import db, vision
from app import main as app_main
from app.main import app, get_llm
from app.schemas import Explanation
from tests.test_insights import BILL


class FakeLLM:
    def __init__(self):
        self.answered = None

    def extract_from_text(self, ocr_text):
        raise AssertionError("OCR is off, so text extraction must not run")

    def extract_from_image(self, image_bytes, media_type):
        return BILL

    def explain(self, fields, comparison, warnings, insights):
        return Explanation(english="e", urdu="u")

    def answer(self, question, history, focus):
        self.answered = (question, history, focus)
        return "answer"


def png() -> bytes:
    return cv2.imencode(".png", np.full((200, 300, 3), 255, np.uint8))[1].tobytes()


@pytest.fixture
def client(monkeypatch):
    llm = FakeLLM()
    monkeypatch.setattr(app_main, "STORAGE", "off")
    monkeypatch.setattr(app_main, "OCR_MODE", "off")
    monkeypatch.setenv("RATE_LIMITS", "off")

    def no_database(*args, **kwargs):
        raise AssertionError("STORAGE=off must never touch the database")

    for name in ("connect", "upsert_bill", "previous_bill", "get_bill", "bills_for_account", "delete_older_than"):
        monkeypatch.setattr(db, name, no_database)
    app.dependency_overrides[get_llm] = lambda: llm
    yield TestClient(app), llm
    app.dependency_overrides.clear()


def test_upload_without_consent_is_refused(client):
    http, _ = client
    response = http.post("/bills", files={"image": ("bill.png", png(), "image/png")})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "consent_required"


def test_an_upload_gets_503_server_busy_when_every_decode_slot_stays_taken(client, monkeypatch):
    http, _ = client

    def busy(timeout=None):
        raise vision.ServerBusyError("The server is busy reading other photos. Please try again in a minute.")

    monkeypatch.setattr(vision, "decode_slot", busy)
    response = http.post("/bills", files={"image": ("bill.png", png(), "image/png")}, data={"consent": "true"})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "server_busy"


def test_with_storage_off_an_upload_is_explained_and_saved_nowhere(client):
    http, _ = client
    response = http.post("/bills", files={"image": ("bill.png", png(), "image/png")}, data={"consent": "true"})
    assert response.status_code == 201
    body = response.json()
    assert body["stored"] is False
    assert body["bill"]["public_id"] is None
    assert body["comparison"]["source"] == "printed"
    assert body["insights"][0]["code"] == "arrears"


def test_a_question_carries_the_bill_so_nothing_needs_to_be_stored(client):
    http, llm = client
    bill = {"billing_month": "2026-10-01", "units": 100, "amount": 9600, "due_date": "2026-11-05",
            "details": {"arrears": 5000, "history": [{"month": "2026-09-01", "units": 180, "bill": 12000, "payment": 7000}]}}
    response = http.post("/ask", json={"question": "Why is my bill high?", "bill": bill})
    assert response.status_code == 200
    assert response.json()["answer"] == "answer"
    question, history, focus = llm.answered
    assert focus["details"]["arrears"] == 5000 and history == [focus]


def test_health_reports_the_storage_mode_for_the_privacy_notice(client):
    http, _ = client
    assert http.get("/health").json() == {"status": "ok", "storage": "off"}


def test_stored_bill_routes_find_nothing_when_storage_is_off(client):
    http, _ = client
    assert http.get("/bills/00000000-0000-0000-0000-000000000000/history").status_code == 404
