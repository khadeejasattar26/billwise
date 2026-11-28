import type { Bill, Comparison } from '../../api'
import type { Lang, Strings } from '../../i18n'
import { formatDate, formatNumber } from '../../lib/format'
import { ArrowDownIcon, ArrowUpIcon } from '../ui/icons'
import { card } from '../ui/styles'

export function SummaryCards({ bill, comparison, lang, t }: { bill: Bill; comparison: Comparison | null; lang: Lang; t: Strings }) {
  return (
    <section aria-labelledby="glance-h">
      <h2 id="glance-h" className="mb-3 text-2xl font-bold text-ink">{t.glance}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t.units} value={formatNumber(bill.units)}
              change={<Change diff={comparison?.units_diff} t={t} format={(n) => formatNumber(n)} />} />
        <Stat label={t.bill} value={t.rupees(formatNumber(bill.amount))}
              change={<Change diff={comparison?.amount_diff} t={t} format={(n) => t.rupees(formatNumber(n))} />} />
        <Stat label={t.dueDate} value={formatDate(bill.due_date, lang, true, true)} />
      </div>
    </section>
  )
}

function Stat({ label, value, change }: { label: string; value: string; change?: React.ReactNode }) {
  return (
    <div className={card}>
      <p className="text-base text-slate-600">{label}</p>
      <p className="mt-1 whitespace-nowrap text-3xl font-extrabold text-ink">{value}</p>
      {change && <div className="mt-2">{change}</div>}
    </div>
  )
}

/** Red for "more than last month", green for "less": colour plus an arrow and words, never colour alone. */
function Change({ diff, t, format }: { diff: number | undefined; t: Strings; format: (n: number) => string }) {
  if (diff === undefined) return <p className="text-base text-slate-500">{t.firstBill}</p>
  if (diff === 0) return <p className="text-base text-slate-600">{t.same}</p>
  const up = diff > 0
  const Icon = up ? ArrowUpIcon : ArrowDownIcon
  return (
    <p className={`inline-flex items-center gap-1 text-base font-semibold ${up ? 'text-red-700' : 'text-emerald-700'}`}>
      <Icon className="size-4 shrink-0" />
      {up ? t.more(format(Math.abs(diff))) : t.less(format(Math.abs(diff)))}
    </p>
  )
}
