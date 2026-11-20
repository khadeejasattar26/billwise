import { describe, expect, it } from 'vitest'
import { formatDate, formatNumber, isUrduScript } from './format'

describe('formatNumber', () => {
  it('groups thousands with Western digits, as on Pakistani bills', () => {
    expect(formatNumber(10420)).toBe('10,420')
    expect(formatNumber(32.5625, 2)).toBe('32.56')
  })
})

describe('formatDate', () => {
  it('shortens English months only when asked', () => {
    expect(formatDate('2026-12-08', 'en', true, true)).toBe('8 Dec 2026')
    expect(formatDate('2026-12-08', 'en')).toBe('8 December 2026')
  })
  it('uses Urdu month names with Western digits', () => {
    const urdu = formatDate('2026-12-08', 'ur')
    expect(urdu).toContain('دسمبر')
    expect(urdu).toContain('2026')
  })
})

describe('isUrduScript', () => {
  it('tells Urdu script from English and Roman Urdu', () => {
    expect(isUrduScript('میرا بل کیوں بڑھا؟')).toBe(true)
    expect(isUrduScript('mera bill kitna aya')).toBe(false)
  })
})
