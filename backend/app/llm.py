"""LLM calls. Default: a local Ollama server (free, no key, bill data stays on the machine).

Set LLM_PROVIDER=openai to use GPT instead (see llm_openai.py). Both classes expose the same
four methods, so the agent and API never know which one they are talking to.
"""

import json
import os
from typing import Any

import ollama
from pydantic import ValidationError

from .schemas import BillFields, Comparison

# qwen2.5vl reads both text and images, so one model covers OCR-text extraction and the vision retry.
DEFAULT_MODEL = "qwen2.5vl:3b"
DEFAULT_HOST = "http://localhost:11434"
# Room for the prompt plus one bill photo (qwen2.5vl turns a 1400x1100 image into ~2,000 tokens).
CONTEXT_TOKENS = 8192

EXTRACT_SYSTEM = """You read Pakistani electricity bills. Labels may be in English, Urdu, or both \
(for example "Units Consumed / استعمال شدہ یونٹ", "Due Date / آخری تاریخ").
Copy values exactly as printed. Do not calculate or correct anything: if the printed units \
disagree with the meter readings, report the printed units anyway; a separate checker handles that.
Dates: billing_month is the first day of the billing month (OCT 2026 -> 2026-10-01); \
due_date is YYYY-MM-DD (08 NOV 2026 -> 2026-11-08).
Amounts are in PKR as a plain number without commas (7,850.00 -> 7850.0).
Use null for any field you cannot find or read with confidence. Reply with JSON only."""

EXPLAIN_SYSTEM = """You explain electricity bills to a household in Pakistan. Write 2 or 3 short, \
plain sentences. Use the exact numbers you are given (units in kWh, amounts in Rs). Say how this \
month compares with last month if that data is present, and mention the due date. \
No headings, no bullet points, no advice you cannot back with the numbers."""

ANSWER_SYSTEM = """You answer questions about one household's electricity bills. Use only the bill \
history provided. If the history does not contain the answer, say so in one sentence. \
Keep answers under 80 words and quote real numbers."""


class LLMError(RuntimeError):
    """The model returned no usable answer (server down, model missing, truncated or invalid output)."""


class OllamaLLM:
    def __init__(self, client: ollama.Client | None = None, model: str | None = None):
        self.model = model or os.getenv("OLLAMA_MODEL", DEFAULT_MODEL)
        self.client = client or ollama.Client(host=os.getenv("OLLAMA_HOST", DEFAULT_HOST), timeout=300)

    # ---- extraction ------------------------------------------------------------------

    def extract_from_text(self, ocr_text: str) -> BillFields:
        prompt = f"OCR text of the bill (may contain recognition errors):\n<ocr>\n{ocr_text}\n</ocr>"
        return self._extract({"role": "user", "content": prompt})

    def extract_from_image(self, image_bytes: bytes, media_type: str) -> BillFields:
        return self._extract({"role": "user", "content": "Read the fields from this bill photo.",
                              "images": [image_bytes]})

    def _extract(self, user_message: dict[str, Any]) -> BillFields:
        # `format` constrains generation to this JSON schema, so the reply is always parseable JSON.
        content = self._chat(EXTRACT_SYSTEM, user_message, format=BillFields.model_json_schema(),
                             temperature=0, max_output=400)
        try:
            return BillFields.model_validate_json(content)
        except ValidationError as exc:
            raise LLMError(f"The model's JSON did not match the bill schema: {exc.errors()[0]['msg']}") from exc

    # ---- free text -------------------------------------------------------------------

    def explain(self, fields: BillFields, comparison: Comparison | None, warnings: list[str]) -> str:
        facts = {
            "this_month": fields.model_dump(mode="json"),
            "last_month": comparison.model_dump(mode="json") if comparison else None,
            "checker_warnings": warnings,
        }
        return self._chat(EXPLAIN_SYSTEM, {"role": "user", "content": f"Bill data:\n{json.dumps(facts, indent=2)}"})

    def answer(self, question: str, history: list[dict[str, Any]]) -> str:
        prompt = (
            f"Bill history, oldest first:\n{json.dumps(history, indent=2, default=str)}\n\n"
            f"Question: {question}"
        )
        return self._chat(ANSWER_SYSTEM, {"role": "user", "content": prompt})

    # ---- shared request + stop checks -----------------------------------------------

    def _chat(self, system: str, user_message: dict[str, Any], *, format: dict | None = None,
              temperature: float = 0.2, max_output: int = 300) -> str:
        try:
            response = self.client.chat(
                model=self.model,
                messages=[{"role": "system", "content": system}, user_message],
                format=format,
                options={"temperature": temperature, "num_ctx": CONTEXT_TOKENS, "num_predict": max_output},
                keep_alive="30m",
            )
        except ConnectionError as exc:
            raise LLMError("Ollama is not running. Start it with `ollama serve`.") from exc
        except ollama.ResponseError as exc:
            if exc.status_code == 404:
                raise LLMError(f"Model {self.model} is not downloaded. Run `ollama pull {self.model}`.") from exc
            raise LLMError(f"Ollama error {exc.status_code}: {exc.error}") from exc

        # Check why generation stopped before trusting the text: "length" means it was cut off.
        if response.done_reason == "length":
            raise LLMError("The model's answer was cut off at the output limit.")
        text = (response.message.content or "").strip()
        if not text:
            raise LLMError("The model returned an empty answer.")
        return text


def make_llm():
    """Pick the LLM from LLM_PROVIDER: "ollama" (default, free, local) or "openai" (paid, hosted)."""
    provider = os.getenv("LLM_PROVIDER", "ollama").strip().lower()
    if provider == "ollama":
        return OllamaLLM()
    if provider == "openai":
        from .llm_openai import OpenAILLM  # imported only when chosen

        return OpenAILLM()
    raise ValueError(f"LLM_PROVIDER must be 'ollama' or 'openai', got {provider!r}.")
