import type { UploadResult } from '../api'

/** The synthetic PITC-style sample bill (samples/bill_pitc_style.png), as the API returns it. */
export const PITC_RESULT: UploadResult = {
  bill: {
    public_id: null, account_no: '0000000777', billing_month: '2026-10-01', units: 100, amount: 9600, due_date: '2026-11-05',
    explanation: 'You used 80 fewer units than last month. Rs 5,000 is unpaid from earlier bills.',
    explanation_ur: 'اس مہینے 80 یونٹ کم استعمال ہوئے۔ 5,000 روپے بقایا ہے۔',
    warnings: [], extraction_mode: 'vision', details: {},
  },
  fields: {
    account_no: '0000000777', billing_month: '2026-10-01', previous_reading: 5000, current_reading: 5100, units: 100,
    amount: 9600, due_date: '2026-11-05', disco: 'MEPCO', category: 'UNPROTECTED', multiplying_factor: 1,
    current_bill: 4500, arrears: 5000, fpa: 100, taxes: 700, subsidy: 500, payable_after_due: 9800,
    history: [
      { month: '2026-08-01', units: 90, bill: 4000, payment: 4000 },
      { month: '2026-07-01', units: 240, bill: 15000, payment: 15000 },
      { month: '2026-09-01', units: 180, bill: 12000, payment: 7000 },
    ],
  },
  comparison: {
    source: 'printed', previous_month: '2026-09-01', previous_units: 180, previous_amount: 12000, units_change_pct: -44.4,
    amount_change_pct: -20, units_diff: -80, amount_diff: -2400, previous_cost_per_unit: null,
  },
  cost_per_unit: 45,
  insights: [
    { code: 'units_vs_last_month', values: { units: 100, previous_units: 180, diff: -80, previous_month: '2026-09-01' } },
    { code: 'arrears', values: { arrears: 5000, from_month: '2026-09-01', billed: 12000, paid: 7000 } },
  ],
  attempts: 1,
  reminder_scheduled: false,
  stored: false,
}
