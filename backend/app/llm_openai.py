"""Optional hosted LLM: OpenAI GPT through the official `openai` SDK. Paid per token.

Selected with LLM_PROVIDER=openai. Same four methods and prompts as the local OllamaLLM, so the
agent and API do not change. The key is read from OPENAI_API_KEY in backend/.env.
"""

import base64
import logging
import os
from typing import Any

import openai

from .llm import ANSWER_SYSTEM, EXPLAIN_SYSTEM, EXTRACT_SYSTEM, LLMError, answer_prompt, explain_facts
from .schemas import BillFields, Comparison, Explanation

log = logging.getLogger(__name__)


class OpenAILLM:
    def __init__(self, client: openai.OpenAI | None = None, model: str | None = None):
        self.model = model or os.getenv("OPENAI_MODEL", "")
        self._client = client  # created lazily so importing never needs a key

    @property
    def client(self) -> openai.OpenAI:
        if self._client is None:
            if not os.getenv("OPENAI_API_KEY"):
                raise LLMError("OPENAI_API_KEY is not set. Add it to backend/.env and restart the server.")
            if not self.model:
                raise LLMError("OPENAI_MODEL is not set. Add it to backend/.env and restart the server.")
            self._client = openai.OpenAI(timeout=120)
        return self._client

    # ---- extraction ------------------------------------------------------------------

    def extract_from_text(self, ocr_text: str) -> BillFields:
        prompt = f"OCR text of the bill (may contain recognition errors):\n<ocr>\n{ocr_text}\n</ocr>"
        return self._extract(prompt)

    def extract_from_image(self, image_bytes: bytes, media_type: str) -> BillFields:
        data_url = f"data:{media_type};base64,{base64.standard_b64encode(image_bytes).decode('ascii')}"
        return self._extract([
            {"type": "image_url", "image_url": {"url": data_url}},
            {"type": "text", "text": "Read the fields from this bill photo."},
        ])

    def _extract(self, content: str | list[dict[str, Any]]) -> BillFields:
        return self._structured(EXTRACT_SYSTEM, content, BillFields)

    def _structured(self, system: str, content: str | list[dict[str, Any]], model: type):
        client = self.client
        try:
            # response_format=<Pydantic model> turns on strict structured output: the reply must match.
            completion = self._guard(lambda: client.chat.completions.parse(
                model=self.model,
                messages=[{"role": "system", "content": system},
                          {"role": "user", "content": content}],
                response_format=model,
            ))
        except openai.LengthFinishReasonError as exc:
            raise LLMError("The model's answer was cut off at the output limit.") from exc
        except openai.ContentFilterFinishReasonError as exc:
            raise LLMError("The model's content filter blocked this request.") from exc
        message = completion.choices[0].message
        if message.refusal:
            raise LLMError(f"The model declined: {message.refusal}")
        if message.parsed is None:
            raise LLMError(f"The model returned no structured {model.__name__}.")
        return message.parsed

    # ---- free text -------------------------------------------------------------------

    def explain(self, fields: BillFields, comparison: Comparison | None, warnings: list[str]) -> Explanation:
        return self._structured(EXPLAIN_SYSTEM, f"Facts:\n{explain_facts(fields, comparison, warnings)}", Explanation)

    def answer(self, question: str, history: list[dict[str, Any]]) -> str:
        return self._text(ANSWER_SYSTEM, answer_prompt(question, history))

    def _text(self, system: str, prompt: str) -> str:
        client = self.client
        completion = self._guard(lambda: client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        ))
        choice = completion.choices[0]
        # Check why generation stopped before trusting the text.
        if choice.finish_reason == "length":
            raise LLMError("The model's answer was cut off at the output limit.")
        if choice.finish_reason == "content_filter":
            raise LLMError("The model's content filter blocked this request.")
        text = (choice.message.content or "").strip()
        if not text:
            raise LLMError("The model returned an empty answer.")
        return text

    # ---- shared error mapping --------------------------------------------------------

    @staticmethod
    def _guard(call):
        try:
            completion = call()
            # Token counts per call, so the cost of each upload can be read from the server log.
            if completion.usage:
                log.info("openai tokens model=%s input=%d output=%d", completion.model,
                         completion.usage.prompt_tokens, completion.usage.completion_tokens)
            return completion
        except openai.AuthenticationError as exc:
            raise LLMError("OPENAI_API_KEY is invalid.") from exc
        except openai.NotFoundError as exc:
            raise LLMError(f"Model not found or not available to this key: {exc.message}") from exc
        except openai.RateLimitError as exc:
            raise LLMError("OpenAI rate limit or quota reached. Check your credits.") from exc
        except openai.APIStatusError as exc:
            raise LLMError(f"OpenAI API error {exc.status_code}: {exc.message}") from exc
        except openai.APIConnectionError as exc:
            raise LLMError("Could not reach the OpenAI API.") from exc
