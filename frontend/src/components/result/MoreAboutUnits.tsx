import type { Comparison, UploadResult } from '../../api'
import type { Strings } from '../../i18n'
import { AC_KW } from '../../lib/constants'
import { formatNumber } from '../../lib/format'
import { ChevronIcon } from '../ui/icons'
import { card, focusRing } from '../ui/styles'

/** Price per unit (this month's charges ÷ units, never the total with arrears). */
export function PerUnit({ result, t }: { result: UploadResult; t: Strings }) {
  if (result.cost_per_unit === null) return null
  const before = result.comparison?.previous_cost_per_unit
  return (
    <section aria-labelledby="per-unit-h" className={card}>
      <h2 id="per-unit-h" className="mb-2 text-2xl font-bold text-ink">{t.perUnitTitle}</h2>
      <p className="text-xl font-semibold">{t.perUnitNow(formatNumber(result.cost_per_unit, 2))}</p>
      {before != null && <p className="text-slate-700">{t.perUnitBefore(formatNumber(before, 2))}</p>}
    </section>
  )
}

/** What a unit means in everyday appliances, and what this month's change is worth. */
export function WhatIsAUnit({ comparison, t }: { comparison: Comparison | null; t: Strings }) {
  const diff = comparison?.units_diff ?? 0
  return (
    <details className={`group ${card}`}>
      <summary className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg text-2xl font-bold text-ink ${focusRing}`}>
        <span>{t.whatIsUnit}</span>
        <ChevronIcon className="size-6 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 space-y-3">
        <p>{t.unitDefinition}</p>
        <ul className="list-disc space-y-1 ps-6">
          {t.unitExamples.map((example) => <li key={example}>{example}</li>)}
        </ul>
        {diff > 0 && <p className="font-semibold">{t.extraUnits(formatNumber(diff), formatNumber(diff / AC_KW))}</p>}
        {diff < 0 && <p className="font-semibold">{t.fewerUnits(formatNumber(-diff))}</p>}
        <p className="text-base text-slate-600">{t.approxNote}</p>
      </div>
    </details>
  )
}
