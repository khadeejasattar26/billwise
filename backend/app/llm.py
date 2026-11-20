"""LLM calls. Default: a local Ollama server (free, no key, bill data stays on the machine).

Set LLM_PROVIDER=openai to use GPT instead (see llm_openai.py). Both classes expose the same
four methods, so the agent and API never know which one they are talking to.
"""

import json
import os
from typing import Any

import ollama
from pydantic import ValidationError

from .insights import history_summary, insight_sentences
from .schemas import BillFields, Comparison, Explanation, Insight, cost_per_unit, energy_cost_per_unit

# qwen2.5vl reads both text and images, so one model covers OCR-text extraction and the vision retry.
DEFAULT_MODEL = "qwen2.5vl:3b"
DEFAULT_HOST = "http://localhost:11434"
# Room for the prompt plus one bill photo (qwen2.5vl turns a 1400x1100 image into ~2,000 tokens).
CONTEXT_TOKENS = 8192

EXTRACT_SYSTEM = """You read Pakistani electricity bills. Labels may be in English, Urdu, or both \
(for example "Units Consumed / استعمال شدہ یونٹ", "Due Date / آخری تاریخ").
Each field sits on the same line as its label, usually right after the English label:
- account_no: the "Reference No" / حوالہ نمبر if printed, otherwise "Consumer ID" or "Account No"; \
copy only the number, without spaces
- billing_month: "Billing Month", "Bill Month" / بلنگ کا مہینہ
- previous_reading: "Previous Reading" / سابقہ ریڈنگ
- current_reading: "Current Reading", "Present Reading" / موجودہ ریڈنگ
- units: "Units Consumed", "Units" / استعمال شدہ یونٹ
- amount: "Amount Payable", "Payable Within Due Date" / قابل ادا رقم
- due_date: "Due Date" / آخری تاریخ / مقررہ تاریخ
- disco: the issuing company's short name from the header: LESCO, IESCO, FESCO, GEPCO, MEPCO, \
PESCO, HESCO, SEPCO, QESCO, TESCO, HAZECO or K-Electric
- category: "Category" (PROTECTED / UNPROTECTED) / زمرہ
- multiplying_factor: "MF" / ضرب
- current_bill: "Current Bill" / موجودہ بل (this month's charges, before arrears)
- arrears: "Arrears" / بقایاجات (unpaid amount from earlier bills)
- fpa: "Total FPA", "Fuel Price Adjustment" amount in rupees (not the per-kWh rate)
- taxes: "Taxes" / ٹیکس total
- subsidy: "Subsidies" / رعایت, or the government subsidy amount
- payable_after_due: "Payable After Due Date" / مقررہ تاریخ کے بعد واجب الادا (the first, smallest late amount)
- history: the "Bill History" table: one entry per row with MONTH, UNITS, BILL, PAYMENT. \
Read both halves of the table. Months like "Sep 26" mean 2026-09-01; "Oct 25" means 2025-10-01.
Example line: "Units Consumed 250 استعمال شدہ یونٹ" means units = 250.
amount is the total payable within the due date ("Payable Within Due Date", "Grand Total").
Copy values exactly as printed. Do not calculate or correct anything: if the printed units \
disagree with the meter readings, report the printed units anyway; a separate checker handles that.
Dates: billing_month is the first day of the billing month (OCT 2026 -> 2026-10-01); \
due_date is YYYY-MM-DD (08 NOV 2026 -> 2026-11-08).
Amounts are in PKR as a plain number without commas (7,850.00 -> 7850.0).
Use null only when a label is missing or its value is unreadable. Never invent or guess a value.
If the image is not an electricity bill (a blank page, a random photo, a menu, a receipt) or its text \
cannot be read, set is_electricity_bill to false and every other field to null. Reply with JSON only."""

EXPLAIN_RULES = """You explain an electricity bill to an ordinary Pakistani household, often older \
people with little schooling.
- 2 or 3 short sentences, simple everyday words, no technical terms except "unit" (یونٹ).
- Use only the facts given. Copy numbers exactly; never compute new ones.
- Lead with how many more or fewer units and rupees than last month. Do not use percentages.
- If the facts say there is no earlier bill, do not compare with any previous month.
- If the facts list unpaid arrears, say clearly that part of the total is unpaid money from earlier \
bills; that is usually why a total looks high.
- A lower bill is "lower" or "less", never "saved" or "a saving": the household did not save money.
- Always end with the due date. No headings, no bullet points, no advice."""

# English only: for small local models, whose Urdu is unusable (see urdu_explanation below).
EXPLAIN_SYSTEM_EN = EXPLAIN_RULES + "\nWrite the explanation in English."

EXPLAIN_SYSTEM = EXPLAIN_RULES + """
Return the same explanation twice: "english" and "urdu". Rules for "urdu": everyday spoken Urdu in Urdu script (not Roman Urdu). Say پروٹیکٹڈ / ان پروٹیکٹڈ \
for protected / unprotected and بقایا for arrears. Keep digits as \
0-9 (320, 10,420). Write amounts as "10,420 روپے". Use Urdu month names (اکتوبر، نومبر، دسمبر).
Use exactly these words: بقایا for arrears (never بچا ہوا or بچہ ہوا), کم / زیادہ for lower / higher \
(never بچت), یونٹ for units, آخری تاریخ for the due date. Check spelling before answering."""


def explain_facts(fields: BillFields, comparison: Comparison | None, warnings: list[str],
                  insights: list[Insight] = ()) -> str:
    """The explanation's input as plain sentences with every number pre-computed.

    Small local models misread raw JSON (e.g. inventing a comparison when last month is null),
    so the facts are spelled out and the model only has to rephrase them.
    """
    lines = [
        f"This bill: {fields.units} units (kWh), Rs {fields.amount:,.0f}, "
        f"billing month {fields.billing_month:%B %Y}, due {fields.due_date:%d %B %Y}."
    ]
    per_unit = energy_cost_per_unit(fields)
    if per_unit:
        lines.append(f"Average price this month: Rs {per_unit:.2f} per unit.")
    if comparison is None:
        lines.append("There is no earlier bill on record, so no comparison is possible.")
    else:
        units_diff, amount_diff = comparison.units_diff, comparison.amount_diff
        units_text = ("the same units as last month" if units_diff == 0 else
                      f"{abs(units_diff)} units {'more' if units_diff > 0 else 'fewer'} than last month")
        amount_text = ("the same amount as last month" if amount_diff == 0 else
                       f"Rs {abs(amount_diff):,.0f} {'more' if amount_diff > 0 else 'less'} than last month")
        lines.append(
            f"Previous bill ({comparison.previous_month:%B %Y}): {comparison.previous_units} units, "
            f"Rs {comparison.previous_amount:,.0f}."
        )
        lines.append(f"Difference: {units_text}; {amount_text}.")
        if comparison.source == "printed":
            lines.append("(Last month's figures come from the history table printed on this bill.)")
        if comparison.previous_cost_per_unit:
            lines.append(f"Average price last month: Rs {comparison.previous_cost_per_unit:.2f} per unit.")
    if fields.current_bill and fields.arrears:
        lines.append(f"Of the Rs {fields.amount:,.0f} total, this month's electricity is Rs {fields.current_bill:,.0f}.")
    reasons = insight_sentences(list(insights))
    if reasons:
        lines.append("Reasons found on the bill (mention the most important one, usually arrears or "
                     "unprotected status, before anything else):")
        lines.extend(f"- {r}" for r in reasons)
    if warnings:
        lines.append("The checker flagged: " + " ".join(warnings) + " Say the numbers may need checking.")
    return "\n".join(lines)


ANSWER_SYSTEM = """You answer questions about one household's electricity bills for ordinary \
Pakistani people. Use only the bills, charges, printed history and reasons provided. When asked why a \
bill is high or went up, compare with earlier months and name the concrete reasons given (unpaid \
arrears, more units, unprotected status, FPA, taxes), biggest first. If it does not contain the answer, say so \
in one sentence. Keep answers under 80 words, use simple words, and quote real numbers. Never add, subtract, multiply \
or average numbers yourself: use only figures given (totals are pre-calculated). If a needed figure is \
not given, say you cannot calculate it. Never mention data field names (such as total_paid_rs) or \
"the history summary": speak about the bill. Write the answer in the language the user message tells you to use."""


URDU_MONTHS = ["جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
               "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر"]


def urdu_date(d) -> str:
    return f"{d.day} {URDU_MONTHS[d.month - 1]} {d.year}"


def urdu_explanation(fields: BillFields, comparison: Comparison | None, warnings: list[str],
                     insights: list[Insight] = ()) -> str:
    """Urdu explanation built from a fixed template, no LLM.

    Used with the local 3B model, which loops and invents words in Urdu (tested 2026-11-20).
    Every number comes from the same code-computed facts as the English explanation.
    """
    units, amount = f"{fields.units:,}", f"{fields.amount:,.0f}"
    if comparison is None:
        text = (f"اس مہینے آپ نے {units} یونٹ بجلی استعمال کی اور آپ کا بل {amount} روپے ہے۔ "
                "یہ آپ کا پہلا بل ہے، اس لیے ابھی پچھلے مہینے سے موازنہ نہیں ہو سکتا۔ ")
    else:
        du, da = comparison.units_diff, comparison.amount_diff
        units_part = ("جو پچھلے مہینے جتنی ہی ہے" if du == 0 else
                      f"جو پچھلے مہینے سے {abs(du):,} یونٹ {'زیادہ' if du > 0 else 'کم'} ہے")
        amount_part = ("جو پچھلے مہینے جتنا ہی ہے" if da == 0 else
                       f"جو پچھلے مہینے سے {abs(da):,.0f} روپے {'زیادہ' if da > 0 else 'کم'} ہے")
        text = (f"اس مہینے آپ نے {units} یونٹ بجلی استعمال کی، {units_part}۔ "
                f"آپ کا بل {amount} روپے ہے، {amount_part}۔ ")
    if fields.arrears and fields.arrears > 0:
        text += f"اس بل میں پچھلے بلوں کا {fields.arrears:,.0f} روپے بقایا بھی شامل ہے۔ "
    if warnings:
        text += "بل کے کچھ نمبر آپس میں میل نہیں کھاتے، براہ کرم اصل بل سے تصدیق کر لیں۔ "
    return text + f"براہ کرم یہ بل {urdu_date(fields.due_date)} تک جمع کروا دیں۔"

HISTORY_KEYS = ("billing_month", "units", "amount", "due_date", "warnings")

# Everyday Roman Urdu words. One hit means a Latin-letter question is Roman Urdu, not English.
ROMAN_URDU_WORDS = {
    "mera", "meri", "mere", "hamara", "kya", "kyun", "kyon", "kiyon", "kitna", "kitni", "kitne",
    "hai", "hain", "tha", "thi", "aya", "aaya", "zyada", "ziada", "kam", "mahine", "mahina",
    "bijli", "kaise", "kab", "nahi", "nahin", "batao", "bataen", "kr", "kar", "raha", "rahi",
}


def reply_language(question: str) -> str:
    """'ur' for Urdu script or Roman Urdu, otherwise 'en'. Decided in code: the model guessed wrong."""
    if any("\u0600" <= ch <= "\u06ff" for ch in question):
        return "ur"
    words = {w.strip("?!.,").lower() for w in question.split()}
    return "ur" if words & ROMAN_URDU_WORDS else "en"


def answer_prompt(question: str, history: list[dict[str, Any]], focus: dict[str, Any] | None = None,
                  force_english: bool = False) -> str:
    """Question plus numbers-only bill history, and the asked-about bill's charges and reasons.

    Earlier explanations are left out on purpose: they are in Urdu as well as English, and
    including them made the model answer English questions in Urdu.
    """
    def per_unit(row: dict[str, Any]) -> float | None:
        details = row.get("details") or {}
        if details.get("current_bill"):
            return cost_per_unit(details["current_bill"], row.get("units"))
        return None if details.get("arrears") else cost_per_unit(row.get("amount"), row.get("units"))

    rows = [{k: row.get(k) for k in HISTORY_KEYS} | {"rupees_per_unit": per_unit(row)} for row in history]
    parts = [f"Bills uploaded to BillWise, oldest first:\n{json.dumps(rows, indent=2, default=str)}"]
    details = (focus or {}).get("details") or {}
    if details:
        charges = {k: details.get(k) for k in ("disco", "category", "current_bill", "arrears", "fpa", "taxes",
                                                "subsidy", "payable_after_due") if details.get(k) is not None}
        parts.append(f"The bill being asked about ({focus.get('billing_month')}), total Rs {focus.get('amount')}:\n"
                     f"{json.dumps(charges, indent=2)}")
        parts.append("How the total is made up: the current bill is this month's electricity and already "
                     "includes taxes, with the subsidy already taken off. Total payable = current bill + "
                     "arrears + FPA (+ any other adjustment). Do not add taxes or subtract the subsidy again.")
        if details.get("history"):
            parts.append("History table printed on that bill (month, units, bill, payment):\n"
                         + json.dumps(details["history"], indent=2))
            summary = history_summary(details["history"])
            if summary:
                parts.append("Totals over that history, already calculated (use these, never add up yourself):\n"
                             + json.dumps(summary, indent=2))
        reasons = insight_sentences([Insight(**i) for i in details.get("insights", [])])
        if reasons:
            parts.append("Reasons already worked out from the bill (use these to explain why):\n"
                         + "\n".join(f"- {r}" for r in reasons))
    script = ("Answer in English." if force_english or reply_language(question) == "en"
              else "Answer in Urdu script (not Roman Urdu). Keep digits as 0-9. Write amounts as "
                   "'5,000 روپے' (not 'Rs'). Say پروٹیکٹڈ / ان پروٹیکٹڈ for protected / unprotected, "
                   "بقایا for arrears, and فیول ایڈجسٹمنٹ for FPA.")
    return "\n\n".join(parts) + f"\n\n{script}\nQuestion: {question}"


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
        # The history table adds ~12 rows of JSON, so extraction needs room.
        return self._structured(EXTRACT_SYSTEM, user_message, BillFields, temperature=0, max_output=1500)

    def _structured(self, system: str, user_message: dict[str, Any], model: type, *,
                    temperature: float, max_output: int):
        # `format` constrains generation to this JSON schema, so the reply is always parseable JSON.
        content = self._chat(system, user_message, format=model.model_json_schema(),
                             temperature=temperature, max_output=max_output)
        try:
            return model.model_validate_json(content)
        except ValidationError as exc:
            raise LLMError(f"The model's JSON did not match the {model.__name__} schema: {exc.errors()[0]['msg']}") from exc

    # ---- free text -------------------------------------------------------------------

    def explain(self, fields: BillFields, comparison: Comparison | None, warnings: list[str],
                insights: list[Insight] = ()) -> Explanation:
        facts = explain_facts(fields, comparison, warnings, insights)
        english = self._chat(EXPLAIN_SYSTEM_EN, {"role": "user", "content": f"Facts:\n{facts}"})
        # The 3B model's Urdu is unusable, so Urdu comes from a template filled with the same facts.
        return Explanation(english=english, urdu=urdu_explanation(fields, comparison, warnings, insights))

    def answer(self, question: str, history: list[dict[str, Any]], focus: dict[str, Any] | None = None) -> str:
        # Free-form answers can't be templated, and the 3B model's Urdu is unusable: answer in English.
        prompt = answer_prompt(question, history, focus, force_english=True)
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
