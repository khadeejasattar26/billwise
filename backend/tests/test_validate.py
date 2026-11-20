from datetime import date

from app.agent import validate_fields
from app.schemas import BillFields


def good_bill(**overrides) -> BillFields:
    values = dict(account_no="0000-DEMO-0421", billing_month=date(2026, 10, 1),
                  previous_reading=15230, current_reading=15480, units=250,
                  amount=7850.0, due_date=date(2026, 11, 8))
    values.update(overrides)
    return BillFields(**values)


def test_validate_passes_a_correct_bill():
    assert validate_fields(good_bill()) == []


def test_validate_fails_when_units_do_not_match_the_reading_difference():
    errors = validate_fields(good_bill(units=300))
    assert len(errors) == 1
    assert "do not match readings" in errors[0]


def test_validate_fails_on_a_missing_due_date():
    assert validate_fields(good_bill(due_date=None)) == ["Missing due date."]


def test_validate_fails_when_due_date_is_before_billing_month():
    assert any("not after billing month" in e for e in validate_fields(good_bill(due_date=date(2026, 9, 1))))
