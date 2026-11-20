import { describe, expect, it } from 'vitest'
import { PITC_RESULT } from '../test/fixtures'
import { chartPoints } from './chart'

describe('chartPoints', () => {
  it('plots the printed history oldest first, then this month', () => {
    const points = chartPoints(PITC_RESULT.fields, [PITC_RESULT.bill], null)
    expect(points.map((p) => p.month)).toEqual(['2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01'])
    expect(points.at(-1)).toMatchObject({ units: 100, current: true })
  })
  it('falls back to uploaded bills when the bill prints no history', () => {
    const fields = { ...PITC_RESULT.fields, history: [] }
    expect(chartPoints(fields, [PITC_RESULT.bill], null)).toEqual([{ key: '2026-10-01', month: '2026-10-01', units: 100, current: true }])
  })
})
