import type { Insight } from '../../api'
import { insightText, type Lang, type Strings } from '../../i18n'
import { AlertIcon, CheckIcon } from '../ui/icons'
import { card } from '../ui/styles'

/** Reasons that decide whether a bill is "high": shown first and marked with a warning icon. */
const IMPORTANT = new Set(['arrears', 'unprotected_because', 'unprotected', 'over_limit'])

export function WhyCard({ insights, printed, lang, t }: { insights: Insight[]; printed: boolean; lang: Lang; t: Strings }) {
  const reasons = insights
    .map((i) => ({ code: i.code, text: insightText(i.code, i.values, lang) }))
    .filter((r): r is { code: string; text: string } => r.text !== null)
    .sort((a, b) => Number(IMPORTANT.has(b.code)) - Number(IMPORTANT.has(a.code)))
  if (reasons.length === 0) return null
  return (
    <section aria-labelledby="why-h" className={card}>
      <h2 id="why-h" className="mb-4 text-2xl font-bold text-ink">{t.whyTitle}</h2>
      <ul className="space-y-3">
        {reasons.map((r) => {
          const important = IMPORTANT.has(r.code)
          return (
            <li key={r.code} className={`flex gap-3 rounded-2xl p-3 ${important ? 'bg-amber-50 font-semibold text-amber-950 ring-1 ring-amber-200' : ''}`}>
              {important
                ? <AlertIcon className="mt-1 size-6 shrink-0 text-amber-700" />
                : <CheckIcon className="mt-1 size-6 shrink-0 text-brand-700" />}
              <span>{r.text}</span>
            </li>
          )
        })}
      </ul>
      {printed && <p className="mt-4 text-base text-slate-600">{t.whyFromPrinted}</p>}
    </section>
  )
}
