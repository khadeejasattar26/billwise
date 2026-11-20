import { describe, expect, it } from 'vitest'
import { hashFor, screenFromHash } from './screens'

describe('screens in the URL hash', () => {
  it('round-trips every screen and treats anything unknown as home', () => {
    for (const s of ['consent', 'photo', 'check', 'reading', 'answer', 'details', 'ask'] as const) {
      expect(screenFromHash(hashFor(s))).toBe(s)
    }
    expect(screenFromHash('')).toBe('home')
    expect(screenFromHash('#/nonsense')).toBe('home')
  })
})
