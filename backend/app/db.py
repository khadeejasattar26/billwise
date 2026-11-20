"""PostgreSQL access. Every query is parameterised; values never enter SQL through string formatting."""

import os
import uuid
from pathlib import Path
from datetime import date
from typing import Any

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

DEFAULT_URL = "postgresql://billwise:billwise@localhost:5433/billwise"

COLUMNS = (
    "id, public_id, account_no, billing_month, units, amount, due_date, explanation, explanation_ur, details, "
    "warnings, extraction_mode, created_at"
)


def connect() -> psycopg.Connection:
    return psycopg.connect(os.getenv("DATABASE_URL", DEFAULT_URL), row_factory=dict_row)


def upsert_bill(
    *,
    account_no: str,
    billing_month: date,
    units: int,
    amount: float,
    due_date: date,
    explanation: str,
    explanation_ur: str,
    details: dict[str, Any],
    warnings: list[str],
    extraction_mode: str,
    ocr_text: str,
) -> dict[str, Any]:
    """Insert the bill, or overwrite the existing one for the same account and month."""
    sql = f"""
        INSERT INTO bills (account_no, billing_month, units, amount, due_date,
                           explanation, explanation_ur, details, warnings, extraction_mode, ocr_text)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (account_no, billing_month) DO UPDATE SET
            units = EXCLUDED.units,
            amount = EXCLUDED.amount,
            due_date = EXCLUDED.due_date,
            explanation = EXCLUDED.explanation,
            explanation_ur = EXCLUDED.explanation_ur,
            details = EXCLUDED.details,
            warnings = EXCLUDED.warnings,
            extraction_mode = EXCLUDED.extraction_mode,
            ocr_text = EXCLUDED.ocr_text,
            created_at = now()
        RETURNING {COLUMNS}
    """
    params = (account_no, billing_month, units, amount, due_date,
              explanation, explanation_ur, Jsonb(details), warnings, extraction_mode, ocr_text)
    with connect() as conn:
        return conn.execute(sql, params).fetchone()


def previous_bill(account_no: str, billing_month: date) -> dict[str, Any] | None:
    """The latest bill for this account dated before billing_month, or None."""
    sql = f"""
        SELECT {COLUMNS} FROM bills
        WHERE account_no = %s AND billing_month < %s
        ORDER BY billing_month DESC LIMIT 1
    """
    with connect() as conn:
        return conn.execute(sql, (account_no, billing_month)).fetchone()


def bills_for_account(account_no: str) -> list[dict[str, Any]]:
    sql = f"SELECT {COLUMNS} FROM bills WHERE account_no = %s ORDER BY billing_month"
    with connect() as conn:
        return conn.execute(sql, (account_no,)).fetchall()


def get_bill(public_id: str) -> dict[str, Any] | None:
    """Look a bill up by its random public id. Invalid UUIDs simply find nothing."""
    try:
        uuid.UUID(public_id)
    except ValueError:
        return None
    with connect() as conn:
        return conn.execute(f"SELECT {COLUMNS} FROM bills WHERE public_id = %s", (public_id,)).fetchone()


def delete_older_than(days: int) -> int:
    """Delete bills uploaded more than `days` ago. Returns how many were deleted."""
    with connect() as conn:
        return conn.execute("DELETE FROM bills WHERE created_at < now() - make_interval(days => %s)",
                            (days,)).rowcount


def init_schema() -> None:
    """Create the table and apply migrations. Every statement is idempotent (IF NOT EXISTS)."""
    root = Path(__file__).resolve().parent.parent
    files = [root / "schema.sql", *sorted((root / "migrations").glob("*.sql"))]
    with connect() as conn:
        for path in files:
            conn.execute(path.read_text())
