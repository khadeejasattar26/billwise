import type { Bill, BillFields } from '../api'

export type ChartPoint = { key: string; month: string; units: number; current: boolean }

/** Months to plot: the bill's printed 12-month history when present, otherwise earlier uploads. */
export function chartPoints(fields: BillFields, bills: Bill[], currentId: string | null): ChartPoint[] {
  const printed = fields.history.filter((r) => r.units !== null && r.month !== fields.billing_month)
  if (printed.length >= 2 && fields.billing_month && fields.units !== null) {
    const points = [...printed]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((r) => ({ key: r.month, month: r.month, units: r.units as number, current: false }))
    return [...points, { key: fields.billing_month, month: fields.billing_month, units: fields.units, current: true }]
  }
  return bills.map((b) => ({ key: b.public_id ?? b.billing_month, month: b.billing_month, units: b.units, current: b.public_id === currentId }))
}
