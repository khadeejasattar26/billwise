import type { BillFields } from '../../api'
import type { Lang, Strings } from '../../i18n'
import { formatDate, formatNumber } from '../../lib/format'
import { AlertIcon, ChevronIcon } from '../ui/icons'
import { card, focusRing } from '../ui/styles'

type CoreField = 'account_no' | 'billing_month' | 'previous_reading' | 'current_reading' | 'units' | 'amount' | 'due_date'

/** Words in the (English) checker warnings that point at each field, to highlight its row. */
const WARN_WORDS: Record<CoreField, string> = {
  account_no: 'account no', billing_month: 'billing month', previous_reading: 'readings',
  current_reading: 'readings', units: 'units', amount: 'amount', due_date: 'due date',
}

export function BillDetails({ fields, warnings, technical, lang, t }: { fields: BillFields; warnings: string[]; technical: string; lang: Lang; t: Strings }) {
  const keys = Object.keys(WARN_WORDS) as CoreField[]
  const flagged = (key: CoreField) => warnings.some((w) => w.toLowerCase().includes(WARN_WORDS[key]))

  function show(key: CoreField): string {
    const value = fields[key]
    if (value === null || value === '') return '—'
    if (key === 'billing_month') return formatDate(String(value), lang, false)
    if (key === 'due_date') return formatDate(String(value), lang)
    if (key === 'amount') return t.rupees(formatNumber(Number(value), 2))
    return String(value)
  }

  return (
    <details open={warnings.length > 0} className={`group ${card}`}>
      <summary className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg text-2xl font-bold text-ink ${focusRing}`}>
        <span>{t.detailsTitle}</span>
        <ChevronIcon className="size-6 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>
      <table className="mt-4 w-full">
        <tbody>
          {keys.map((key) => (
            <tr key={key} className={`border-b border-slate-900/10 last:border-0 ${flagged(key) ? 'bg-amber-50' : ''}`}>
              <th scope="row" className="w-1/2 py-2.5 pe-4 text-start font-medium text-slate-600">
                <span className="inline-flex items-center gap-2">
                  {t.fields[key]}
                  {flagged(key) && <AlertIcon className="size-5 text-amber-700" />}
                  {flagged(key) && <span className="sr-only">{t.hasWarning}</span>}
                </span>
              </th>
              <td className="latin py-2.5 font-semibold">{show(key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-slate-500">{t.technical}: {technical}</p>
    </details>
  )
}
