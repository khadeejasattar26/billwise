import type { Bill, BillFields } from '../../api'
import type { Lang, Strings } from '../../i18n'
import { PROTECTED_LIMIT } from '../../lib/constants'
import { chartPoints } from '../../lib/chart'
import { monthName } from '../../lib/format'
import { card } from '../ui/styles'

/**
 * Plain-div bar chart with the 200-unit line. Geometry: 16rem tall = 2.5rem month label + 0.25rem
 * gap + 1.5rem headroom for value labels + 11.75rem of bar space; the dashed line uses the same maths.
 */
export function UnitsChart({ fields, bills, currentId, lang, t }: { fields: BillFields; bills: Bill[]; currentId: string | null; lang: Lang; t: Strings }) {
  const points = chartPoints(fields, bills, currentId)
  if (points.length === 0) return null
  const top = Math.max(PROTECTED_LIMIT * 1.15, ...points.map((p) => p.units))
  const limitShare = PROTECTED_LIMIT / top
  return (
    <section aria-labelledby="chart-h" className={card}>
      <h2 id="chart-h" className="mb-3 text-2xl font-bold text-ink">{t.chartTitle}</h2>
      {points.length === 1 && <p className="mb-2 text-base text-slate-600">{t.chartOne}</p>}
      {/* Months read left to right, as on a calendar, even on the Urdu page. */}
      <div dir="ltr">
        <div className="relative h-64">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-red-500"
               style={{ bottom: `calc(2.75rem + ${limitShare} * 11.75rem)` }} />
          <ul className="flex h-full items-end gap-1 sm:gap-2" aria-label={t.chartLabel}>
            {points.map((p, i) => (
              <li key={p.key} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex min-h-0 w-full flex-1 items-end justify-center pt-6">
                  <div className={`relative w-full max-w-12 rounded-t-md ${p.current ? 'bg-brand-600' : p.units > PROTECTED_LIMIT ? 'bg-red-400' : 'bg-slate-300'}`}
                       style={{ height: `${Math.max(3, (p.units / top) * 100)}%` }}>
                    <span className="latin absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-800 sm:text-sm">{p.units}</span>
                  </div>
                </div>
                <span lang={lang} className="flex h-10 w-full flex-col items-center overflow-hidden text-center text-xs leading-tight text-slate-700 sm:text-sm">
                  <span className="max-w-full truncate">{monthName(p.month, lang)}</span>
                  {(i === 0 || p.month.slice(5, 7) === '01') && <span className="latin text-slate-500">{p.month.slice(0, 4)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-red-700">
        <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-red-500" /> {t.chartLimit}
      </p>
    </section>
  )
}
