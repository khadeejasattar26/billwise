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


def test_list_requires_an_account_number_and_uses_the_shared_error_shape():
    response = client.get("/bills")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_request"
