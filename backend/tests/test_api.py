from fastapi.testclient import TestClient

from app.main import app, get_llm


class ExplodingLLM:
    """Any LLM call in these tests is a bug: uploads must be rejected before reaching Claude."""

    def __getattr__(self, name):
        raise AssertionError(f"LLM.{name} must not be called")


app.dependency_overrides[get_llm] = ExplodingLLM
client = TestClient(app)


def test_upload_rejects_a_pdf_with_415():
    response = client.post("/bills", files={"image": ("bill.pdf", b"%PDF-1.7", "application/pdf")})
    assert response.status_code == 415
    assert response.json()["error"]["code"] == "unsupported_file_type"


def test_upload_rejects_a_6_mb_file_with_413():
    six_mb = b"\x89PNG" + b"0" * (6 * 1024 * 1024)
    response = client.post("/bills", files={"image": ("bill.png", six_mb, "image/png")})
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "file_too_large"


def test_bills_cannot_be_listed_by_account_number():
    assert client.get("/bills", params={"account_no": "0000-DEMO-0421"}).status_code in (404, 405)


def test_a_made_up_bill_id_finds_nothing_and_uses_the_shared_error_shape():
    response = client.get("/bills/123/history")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "bill_not_found"


def test_questions_must_have_at_least_three_characters():
    response = client.post("/bills/00000000-0000-0000-0000-000000000000/ask", json={"question": "a"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_request"


def test_speech_url_rejects_an_unknown_language_without_calling_the_voice_service():
    response = client.get("/speech", params={"text": "سلام", "lang": "fr"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_request"


def test_an_empty_file_is_rejected_with_400_not_a_server_error():
    response = client.post("/bills", files={"image": ("bill.png", b"", "image/png")}, data={"consent": "true"})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "unreadable_image"


def test_allowed_origins_accepts_a_comma_list_and_trims_trailing_slashes():
    from app.main import allowed_origins

    assert allowed_origins("https://billwise.vercel.app/, https://example.org ,") == [
        "https://billwise.vercel.app", "https://example.org"]
