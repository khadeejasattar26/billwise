import { describe, expect, it } from 'vitest'
import { SAMPLE_RESULT as PITC_RESULT } from '../data/sampleBill'
import { chartPoints } from './chart'

describe('chartPoints', () => {
  it('plots the printed history oldest first, then this month', () => {
    const points = chartPoints(PITC_RESULT.fields, [PITC_RESULT.bill], null)
    expect(points).toHaveLength(13) // 12 printed months + this bill
    expect(points[0].month).toBe('2025-10-01')
    expect(points.map((p) => p.month)).toEqual([...points.map((p) => p.month)].sort())
    expect(points.at(-1)).toMatchObject({ units: 100, current: true })
  })
  it('falls back to uploaded bills when the bill prints no history', () => {
    const fields = { ...PITC_RESULT.fields, history: [] }
    expect(chartPoints(fields, [PITC_RESULT.bill], null)).toEqual([{ key: '2026-10-01', month: '2026-10-01', units: 100, current: true }])
  })
})
