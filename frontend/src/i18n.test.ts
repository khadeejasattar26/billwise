import { describe, expect, it } from 'vitest'
import { STRINGS, discoName, insightText, warningText } from './i18n'

describe('warningText', () => {
  it('rewrites the charges warning in Urdu with its numbers', () => {
    const msg = 'Charges do not add up: current bill 4,500 + arrears 1,500 + FPA 100 = 6,100, but the total is 9,600.'
    expect(warningText(msg, 'ur')).toBe('موجودہ بل 4,500 + بقایا 1,500 + فیول ایڈجسٹمنٹ 100 = 6,100 روپے بنتے ہیں، مگر کل رقم 9,600 روپے لکھی ہے۔')
  })
  it('rewrites the units warning, including with a multiplying factor', () => {
    expect(warningText('Units 2 do not match readings (2354 - 2242) = 112.', 'ur')).toContain('112 یونٹ بنتے ہیں')
    expect(warningText('Units 50 do not match readings (510 - 500) x MF 10 = 100.', 'ur')).toContain('100 یونٹ')
  })
  it('keeps English as written and falls back to a general Urdu sentence', () => {
    expect(warningText('Missing due date.', 'en')).toBe('Missing due date.')
    expect(warningText('Missing due date.', 'ur')).toBe('بل پر آخری تاریخ نہیں پڑھا جا سکا۔')
    expect(warningText('Something new.', 'ur')).toContain('اصل بل سے ملا لیں')
  })
})

describe('insightText', () => {
  it('names the partly paid month behind the arrears', () => {
    const text = insightText('arrears', { arrears: 5000, from_month: '2026-09-01', billed: 12000, paid: 7000 }, 'en')
    expect(text).toBe('Rs 5,000 of your bill is unpaid money from earlier bills (arrears). The September 2026 bill was Rs 12,000 but only Rs 7,000 was paid.')
  })
  it('returns null for reasons this version does not know', () => {
    expect(insightText('future_reason', {}, 'ur')).toBeNull()
  })
})

describe('discoName', () => {
  it('expands known companies and leaves unknown ones as printed', () => {
    expect(discoName('mepco', 'en')).toBe('MEPCO · Multan Electric Power Company')
    expect(discoName('K Electric', 'ur')).toContain('کے الیکٹرک')
    expect(discoName('DESCO', 'en')).toBe('DESCO')
  })
})

describe('STRINGS', () => {
  it('has the same keys in Urdu and English', () => {
    expect(Object.keys(STRINGS.en).sort()).toEqual(Object.keys(STRINGS.ur).sort())
  })
})
