"""Thin HTTP layer. Business logic lives in vision, ocr, agent, db and notify."""

import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import date
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, Query, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from starlette.exceptions import HTTPException as StarletteHTTPException

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from . import db, notify, ocr, tts, vision  # noqa: E402  (after load_dotenv so modules see .env)
from .ratelimit import (  # noqa: E402
    ASKS_PER_HOUR, SPEECH_PER_HOUR, UPLOADS_PER_DAY_TOTAL, UPLOADS_PER_HOUR, client_ip, limiter,
)
from .agent import build_graph  # noqa: E402
from .llm import LLMError, make_llm  # noqa: E402
from .schemas import energy_cost_per_unit  # noqa: E402

logging.basicConfig(level=logging.INFO)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MEDIA_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
# Fields beyond the required seven, stored in the `details` JSON column.
# "tesseract" (default): OpenCV + Tesseract first, photo only as a retry. "off": photo straight to the
# vision model, for small hosts where OCR is too slow (decision 0009).
OCR_MODE = os.getenv("OCR_MODE", "tesseract").lower()
# "postgres" (default): save each bill so later uploads compare with it and questions look it up.
# "off": store nothing on the server; the browser keeps the result and sends it back with questions
# (decision 0010, for the public site).
STORAGE = os.getenv("STORAGE", "postgres").lower()
# Bills are deleted this many days after upload: they carry account numbers and amounts.
RETENTION_DAYS = int(os.getenv("RETENTION_DAYS", "30"))
DETAIL_FIELDS = {"disco", "category", "multiplying_factor", "current_bill", "arrears", "fpa", "taxes",
                 "subsidy", "payable_after_due", "history"}

@asynccontextmanager
async def lifespan(_: FastAPI):
    # On a fresh hosted database (e.g. Neon), create the table and apply migrations at startup.
    if os.getenv("AUTO_MIGRATE") == "1" and STORAGE != "off":
        db.init_schema()
    yield


app = FastAPI(title="BillWise", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ---- one error shape everywhere: {"error": {"code": ..., "message": ...}} ---------------

class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str, details: dict | None = None):
        self.status, self.code, self.message, self.details = status, code, message, details


def error_response(status: int, code: str, message: str, details: dict | None = None) -> JSONResponse:
    body = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return JSONResponse(status_code=status, content=body)


@app.exception_handler(ApiError)
def handle_api_error(_: Request, exc: ApiError):
    return error_response(exc.status, exc.code, exc.message, exc.details)


@app.exception_handler(StarletteHTTPException)
def handle_http_error(_: Request, exc: StarletteHTTPException):
    return error_response(exc.status_code, "http_error", str(exc.detail))


@app.exception_handler(RequestValidationError)
def handle_validation_error(_: Request, exc: RequestValidationError):
    first = exc.errors()[0]
    where = ".".join(str(part) for part in first["loc"])
    return error_response(422, "invalid_request", f"{where}: {first['msg']}")


@app.exception_handler(LLMError)
def handle_llm_error(_: Request, exc: LLMError):
    return error_response(502, "llm_error", str(exc))


@app.exception_handler(Exception)
def handle_unexpected(_: Request, exc: Exception):
    logging.exception("Unhandled error")
    return error_response(500, "internal_error", "Something went wrong on the server.")


# ---- dependencies (overridden in tests) ------------------------------------------------

_llm = make_llm()


def get_llm():
    return _llm


# ---- routes ----------------------------------------------------------------------------

@app.get("/health")
def health():
    # `storage` lets the page show the right privacy notice before anything is uploaded.
    return {"status": "ok", "storage": STORAGE}


def check_limit(request: Request, bucket: str, per_hour: int, per_day_total: int | None = None) -> None:
    blocked = limiter.check(bucket, client_ip(request), per_hour, per_day_total)
    if blocked == "site":
        raise ApiError(429, "daily_limit", "The demo has reached today's limit. Please try again tomorrow.")
    if blocked == "client":
        raise ApiError(429, "rate_limited", "Too many requests from you. Please wait an hour and try again.")


@app.post("/bills", status_code=201)
def upload_bill(request: Request, image: UploadFile = File(...), consent: bool = Form(False),
                llm=Depends(get_llm)):
    suffix = Path(image.filename or "").suffix.lower()
    if suffix not in MEDIA_TYPES:
        raise ApiError(415, "unsupported_file_type", "Upload a .jpg, .jpeg or .png photo of the bill.")
    image_bytes = image.file.read(MAX_UPLOAD_BYTES + 1)
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise ApiError(413, "file_too_large", "The image is larger than 5 MB.")
    if not consent:
        # The page's checkbox: own bill (or permission), and agreement to send the photo to OpenAI (USA).
        raise ApiError(400, "consent_required", "Please confirm the consent checkbox before uploading.")
    check_limit(request, "upload", UPLOADS_PER_HOUR, UPLOADS_PER_DAY_TOTAL)

    try:
        llm_image, llm_media_type = vision.shrink_for_llm(image_bytes, MEDIA_TYPES[suffix])
        # OCR_MODE=off skips OpenCV + Tesseract: on a 0.1-CPU free host they took 1-6 minutes per photo.
        ocr_text = ocr.read_text(vision.clean(image_bytes)) if OCR_MODE != "off" else ""
    except vision.ImageDecodeError as exc:
        raise ApiError(400, "unreadable_image", str(exc))

    previous_bill = db.previous_bill if STORAGE != "off" else (lambda account, month: None)
    graph = build_graph(llm, previous_bill)
    state = graph.invoke({"image_bytes": llm_image, "media_type": llm_media_type, "ocr_text": ocr_text})
    fields, warnings = state["fields"], state["warnings"]

    required = (fields.account_no, fields.billing_month, fields.units, fields.amount, fields.due_date)
    if any(value in (None, "") for value in required):
        raise ApiError(422, "fields_not_found", "Could not read the required fields from this bill.",
                       {"warnings": warnings, "fields": fields.model_dump(mode="json")})

    record = {
        "account_no": fields.account_no, "billing_month": fields.billing_month, "units": fields.units,
        "amount": fields.amount, "due_date": fields.due_date, "explanation": state["explanation"].english,
        "explanation_ur": state["explanation"].urdu,
        "details": fields.model_dump(mode="json", include=DETAIL_FIELDS)
        | {"insights": [i.model_dump(mode="json") for i in state["insights"]]},
        "warnings": warnings, "extraction_mode": state["mode"],
    }
    if STORAGE == "off":
        bill_json = _jsonable(record | {"public_id": None})  # returned to the browser, saved nowhere
        reminder_scheduled = False
    else:
        # ocr_text is not stored: it can contain the consumer's name and address.
        bill = db.upsert_bill(**record, ocr_text="")
        db.delete_older_than(RETENTION_DAYS)
        bill_json = _jsonable(bill)
        reminder_scheduled = notify.send_to_n8n(bill_json)

    return {
        "bill": bill_json,
        "fields": fields.model_dump(mode="json"),
        "comparison": state["comparison"].model_dump(mode="json") if state.get("comparison") else None,
        "cost_per_unit": energy_cost_per_unit(fields),
        "insights": [i.model_dump(mode="json") for i in state["insights"]],
        "attempts": state["attempts"],
        "reminder_scheduled": reminder_scheduled,
        "stored": STORAGE != "off",
    }


@app.get("/bills/{public_id}/history")
def bill_history(public_id: str):
    """Earlier uploads for the same account. Needs the random id from an upload, never an account number."""
    bill = db.get_bill(public_id) if STORAGE != "off" else None
    if bill is None:
        raise ApiError(404, "bill_not_found", "No bill with this id.")
    return {"bills": [_jsonable(row) for row in db.bills_for_account(bill["account_no"])]}


class Question(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)


@app.post("/bills/{public_id}/ask")
def ask_about_bill(public_id: str, body: Question, request: Request, llm=Depends(get_llm)):
    check_limit(request, "ask", ASKS_PER_HOUR)
    bill = db.get_bill(public_id) if STORAGE != "off" else None
    if bill is None:
        raise ApiError(404, "bill_not_found", "No bill with this id.")
    history = [_jsonable(row) for row in db.bills_for_account(bill["account_no"])]
    return {"answer": llm.answer(body.question, history, _jsonable(bill))}


class BillContext(BaseModel):
    """The bill as the browser received it from the upload, sent back with a question (STORAGE=off)."""

    billing_month: date
    units: int
    amount: float
    due_date: date
    warnings: list[str] = Field(default_factory=list, max_length=20)
    details: dict[str, Any] = Field(default_factory=dict)

    @field_validator("details")
    @classmethod
    def details_not_huge(cls, value: dict[str, Any]) -> dict[str, Any]:
        if len(json.dumps(value)) > 20_000:
            raise ValueError("details too large")
        return value


class QuestionWithBill(Question):
    bill: BillContext


@app.post("/ask")
def ask_with_bill(body: QuestionWithBill, request: Request, llm=Depends(get_llm)):
    """Answer a question about a bill the browser holds, so the server needs to store nothing."""
    check_limit(request, "ask", ASKS_PER_HOUR)
    bill = body.bill.model_dump(mode="json")
    return {"answer": llm.answer(body.question, [bill], bill)}


class SpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=tts.MAX_CHARS)
    lang: str = Field("ur", pattern="^(ur|en)$")


async def _speech_response(text: str, lang: str, request: Request) -> Response:
    check_limit(request, "speech", SPEECH_PER_HOUR)
    try:
        audio = await tts.synthesize(text, lang)
    except tts.SpeechError as exc:
        raise ApiError(502, "speech_failed", str(exc))
    return Response(content=audio, media_type="audio/mpeg")


@app.post("/speech")
async def speech(body: SpeechRequest, request: Request):
    """MP3 of the text in a Pakistani Urdu (or English) voice, for the Listen button."""
    return await _speech_response(body.text, body.lang, request)


@app.get("/speech")
async def speech_get(request: Request, text: str = Query(..., min_length=1, max_length=tts.MAX_CHARS),
                     lang: str = Query("ur", pattern="^(ur|en)$")):
    """Same audio as a plain URL, so the page can set <audio src> inside the tap.

    iPhone Safari only allows audio that starts during the user's tap; fetching first and
    playing afterwards can be blocked.
    """
    return await _speech_response(text, lang, request)


# ---- the built React site, when deployed as one container --------------------------------

FRONTEND_DIST = Path(os.getenv("FRONTEND_DIST", "")) if os.getenv("FRONTEND_DIST") else None
if FRONTEND_DIST and (FRONTEND_DIST / "index.html").is_file():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/", include_in_schema=False)
    def index():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/favicon.svg", include_in_schema=False)
    def favicon():
        return FileResponse(FRONTEND_DIST / "favicon.svg")


PRIVATE_COLUMNS = {"id", "ocr_text"}  # never sent to the browser


def _jsonable(row: dict) -> dict:
    """Convert dates, UUIDs and Decimals from Postgres into JSON-friendly values."""
    out = {}
    for key, value in row.items():
        if key in PRIVATE_COLUMNS:
            continue
        if key == "public_id":
            out[key] = str(value) if value is not None else None
        elif hasattr(value, "isoformat"):
            out[key] = value.isoformat()
        elif key == "amount":
            out[key] = float(value)
        else:
            out[key] = value
    return out
