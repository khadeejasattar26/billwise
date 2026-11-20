"""All Claude calls, through the official anthropic SDK. The API key is read from ANTHROPIC_API_KEY."""

import base64
import json
import os
from typing import Any

import anthropic

from .schemas import BillFields, Comparison

MODEL = "claude-opus-5-5"
MAX_TOKENS = 16000
# On a safety refusal the API re-runs the request on a fallback model chosen by refusal category.
FALLBACK_BETA = "server-side-fallback-2026-07-01"

EXTRACT_SYSTEM = """You read Pakistani electricity bills. Labels may be in English, Urdu, or both \
(for example "Units Consumed / استعمال شدہ یونٹ", "Due Date / آخری تاریخ").
Copy values exactly as printed. Do not calculate or correct anything: if the printed units \
disagree with the meter readings, report the printed units anyway; a separate checker handles that.
Use null for any field you cannot find or read with confidence. Amounts are in PKR without commas."""

EXPLAIN_SYSTEM = """You explain electricity bills to a household in Pakistan. Write 2 or 3 short, \
plain sentences. Use the exact numbers you are given (units in kWh, amounts in Rs). Say how this \
month compares with last month if that data is present, and mention the due date. \
No headings, no bullet points, no advice you cannot back with the numbers."""

ANSWER_SYSTEM = """You answer questions about one household's electricity bills. Use only the bill \
history provided. If the history does not contain the answer, say so in one sentence. \
Keep answers under 80 words and quote real numbers."""


class LLMError(RuntimeError):
    """Claude returned no usable answer (refusal, truncated output, or an API failure)."""


class ClaudeLLM:
    def __init__(self, client: anthropic.Anthropic | None = None):
        # Created lazily so importing the app (and running tests) never needs a key.
        self._client = client

    @property
    def client(self) -> anthropic.Anthropic:
        if self._client is None:
            if not os.getenv("ANTHROPIC_API_KEY"):
                raise LLMError("ANTHROPIC_API_KEY is not set. Add it to backend/.env and restart the server.")
            self._client = anthropic.Anthropic()
        return self._client

    # ---- extraction ------------------------------------------------------------------

    def extract_from_text(self, ocr_text: str) -> BillFields:
        content = f"OCR text of the bill (may contain recognition errors):\n<ocr>\n{ocr_text}\n</ocr>"
        return self._extract([{"type": "text", "text": content}])

    def extract_from_image(self, image_bytes: bytes, media_type: str) -> BillFields:
        data = base64.standard_b64encode(image_bytes).decode("ascii")
        return self._extract([
            {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": data}},
            {"type": "text", "text": "Read the fields from this bill photo."},
        ])

    def _extract(self, content: list[dict[str, Any]]) -> BillFields:
        response = self._call(
            self.client.beta.messages.parse,
            system=EXTRACT_SYSTEM,
            messages=[{"role": "user", "content": content}],
            output_format=BillFields,
        )
        if response.parsed_output is None:
            raise LLMError("Claude returned no structured bill fields.")
        return response.parsed_output

    # ---- free text -------------------------------------------------------------------

    def explain(self, fields: BillFields, comparison: Comparison | None, warnings: list[str]) -> str:
        facts = {
            "this_month": fields.model_dump(mode="json"),
            "last_month": comparison.model_dump(mode="json") if comparison else None,
            "checker_warnings": warnings,
        }
        return self._text(EXPLAIN_SYSTEM, f"Bill data:\n{json.dumps(facts, indent=2)}")

    def answer(self, question: str, history: list[dict[str, Any]]) -> str:
        prompt = (
            f"Bill history, oldest first:\n{json.dumps(history, indent=2, default=str)}\n\n"
            f"Question: {question}"
        )
        return self._text(ANSWER_SYSTEM, prompt)

    def _text(self, system: str, prompt: str) -> str:
        response = self._call(
            self.client.beta.messages.create,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in response.content if block.type == "text").strip()
        if not text:
            raise LLMError("Claude returned an empty answer.")
        return text

    # ---- shared request + stop_reason checks -------------------------------------------

    def _call(self, method, **kwargs):
        try:
            response = method(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                output_config={"effort": "medium"},
                betas=[FALLBACK_BETA],
                fallbacks="default",
                **kwargs,
            )
        except anthropic.AuthenticationError as exc:
            raise LLMError("ANTHROPIC_API_KEY is missing or invalid.") from exc
        except anthropic.RateLimitError as exc:
            raise LLMError("Claude rate limit reached; try again in a minute.") from exc
        except anthropic.APIStatusError as exc:
            raise LLMError(f"Claude API error {exc.status_code}: {exc.message}") from exc
        except anthropic.APIConnectionError as exc:
            raise LLMError("Could not reach the Claude API.") from exc

        # Check why generation stopped before trusting any content.
        if response.stop_reason == "refusal":
            category = response.stop_details.category if response.stop_details else None
            raise LLMError(f"Claude declined this request (category: {category}).")
        if response.stop_reason == "max_tokens":
            raise LLMError("Claude's answer was cut off at the token limit.")
        return response
