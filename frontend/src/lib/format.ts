import type { Lang } from '../i18n'

/** Locale for dates. Urdu month names, but digits stay 0-9 as on Pakistani bills. */
export const LOCALE: Record<Lang, string> = { ur: 'ur-PK-u-nu-latn', en: 'en-GB' }

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** "8 Dec 2026" / "8 دسمبر 2026". `short` only shortens English: Urdu has no short month names. */
export function formatDate(iso: string, lang: Lang, withDay = true, short = false): string {
  const month = short && lang === 'en' ? 'short' : 'long'
  const options: Intl.DateTimeFormatOptions = withDay
    ? { day: 'numeric', month, year: 'numeric' }
    : { month, year: 'numeric' }
  return new Date(iso + 'T00:00:00').toLocaleDateString(LOCALE[lang], options)
}

/** Month name alone, for chart labels. */
export function monthName(iso: string, lang: Lang): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-GB', { month: lang === 'ur' ? 'long' : 'short' })
}

/** True when the text is written in Arabic script (Urdu), so it can be laid out right-to-left. */
export function isUrduScript(text: string): boolean {
  return /[؀-ۿ]/.test(text)
}
