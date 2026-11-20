import type { UploadResult } from '../api'

/**
 * The synthetic PITC-style bill (samples/bill_pitc_style.png) as the API returned it, with the
 * explanation written once. "See an example" shows it instantly: no upload, no API cost.
 * Fictional company, account and numbers.
 */
export const SAMPLE_RESULT: UploadResult = {
  bill: {
    public_id: null, account_no: '0000000777', billing_month: '2026-10-01', units: 100, amount: 9600, due_date: '2026-11-05',
    explanation: 'You used 80 fewer units than last month, and your total is Rs 9,600. Rs 5,000 of this is unpaid money from earlier bills, which is why the total looks high. Please pay by 5 November 2026.',
    explanation_ur: 'اس مہینے آپ نے پچھلے مہینے سے 80 یونٹ کم استعمال کیے، اور آپ کا کل بل 9,600 روپے ہے۔ اس میں 5,000 روپے پچھلے بلوں کا بقایا ہے، اسی لیے رقم زیادہ لگ رہی ہے۔ براہ کرم یہ بل 5 نومبر 2026 تک جمع کروا دیں۔',
    warnings: [], extraction_mode: 'vision',
    details: { disco: 'DESCO', category: 'UNPROTECTED', current_bill: 4500, arrears: 5000, fpa: 100, taxes: 700, subsidy: 500, payable_after_due: 9800 },
  },
  fields: {
    account_no: '0000000777', billing_month: '2026-10-01', previous_reading: 5000, current_reading: 5100, units: 100,
    amount: 9600, due_date: '2026-11-05', disco: 'DESCO', category: 'UNPROTECTED', multiplying_factor: 1,
    current_bill: 4500, arrears: 5000, fpa: 100, taxes: 700, subsidy: 500, payable_after_due: 9800,
    history: [
      ['2025-10-01', 150, 9000, 9000], ['2025-11-01', 110, 4200, 4200], ['2025-12-01', 80, 2600, 2600],
      ['2026-01-01', 85, 2700, 2700], ['2026-02-01', 95, 3100, 3100], ['2026-03-01', 120, 3900, 3900],
      ['2026-04-01', 130, 4300, 4300], ['2026-05-01', 120, 3500, 3500], ['2026-06-01', 160, 5000, 5000],
      ['2026-07-01', 240, 15000, 15000], ['2026-08-01', 90, 4000, 4000], ['2026-09-01', 180, 12000, 7000],
    ].map(([month, units, bill, payment]) => ({ month: month as string, units: units as number, bill: bill as number, payment: payment as number })),
  },
  comparison: {
    source: 'printed', previous_month: '2026-09-01', previous_units: 180, previous_amount: 12000, units_change_pct: -44.4,
    amount_change_pct: -20, units_diff: -80, amount_diff: -2400, previous_cost_per_unit: null,
  },
  cost_per_unit: 45,
  insights: [
    { code: 'arrears', values: { arrears: 5000, from_month: '2026-09-01', billed: 12000, paid: 7000 } },
    { code: 'units_vs_last_month', values: { units: 100, previous_units: 180, diff: -80, previous_month: '2026-09-01' } },
    { code: 'units_vs_last_year', values: { units: 100, last_year_units: 150, diff: -50, last_year_month: '2025-10-01' } },
    { code: 'unprotected_because', values: { month: '2026-07-01', units: 240, limit: 200, months: 6 } },
    { code: 'fpa', values: { fpa: 100 } },
    { code: 'taxes', values: { taxes: 700, current_bill: 4500 } },
    { code: 'late_fee', values: { extra: 200, payable_after_due: 9800 } },
    { code: 'subsidy', values: { subsidy: 500 } },
  ],
  attempts: 1,
  reminder_scheduled: false,
  stored: false,
}
