import { SAMPLE_RESULT } from '../../data/sampleBill'
import type { Lang, Strings } from '../../i18n'
import { chartPoints } from '../../lib/chart'
import { formatDate, formatNumber } from '../../lib/format'
import { CalendarIcon, ReceiptIcon } from '../ui/icons'

const { bill, fields } = SAMPLE_RESULT
const months = chartPoints(fields, [bill], bill.public_id).slice(-6)
const maxUnits = Math.max(...months.map((month) => month.units), 1)

export function BillPreview({ lang, t }: { lang: Lang; t: Strings }) {
  const monthLabel = (month: string) => formatDate(month, lang, false, true)

  return (
    <figure className="mx-auto w-full min-w-0 max-w-xl rounded-[var(--radius-card)] bg-white text-ink shadow-[0_20px_56px_-24px_#031027] ring-1 ring-white/35">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-t-[var(--radius-card)] border-b border-brand-900/10 bg-paper px-4 py-3 sm:px-6">
        <span className="inline-flex items-center gap-2 text-sm ltr:font-semibold sm:text-base">
          <ReceiptIcon className="size-5 shrink-0 text-brand-700" /> {t.previewCaption}
        </span>
        <span className="rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-800 ltr:font-semibold sm:text-sm">{t.sampleLabel}</span>
      </figcaption>
      <div className="px-4 pt-3 pb-4 sm:px-6 sm:pt-4">
        <dl className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
          <div className="min-w-0">
            <dt className="text-sm text-slate-600 sm:text-base">{t.previewAmount}</dt>
            <dd className="latin text-3xl font-bold break-words tracking-tight tabular-nums sm:text-[2.75rem]">{t.rupees(formatNumber(bill.amount))}</dd>
          </div>
          <div className="min-w-0 sm:pb-1">
            <dt className="flex items-center gap-1.5 text-sm text-slate-600">
              <CalendarIcon className="size-4 shrink-0 text-brand-600" /> {t.dueDate}
            </dt>
            <dd className="text-base text-ink ltr:font-semibold">
              <time dateTime={bill.due_date}>{formatDate(bill.due_date, lang, true, true)}</time>
            </dd>
          </div>
        </dl>
        <section aria-labelledby="preview-usage" className="mt-3 border-t border-brand-900/10 pt-3 sm:mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <h2 id="preview-usage" className="text-sm ltr:font-semibold sm:text-base">{t.chartLabel}</h2>
            <p className="text-sm text-brand-700 ltr:font-semibold">{t.previewUnits(formatNumber(bill.units))}</p>
          </div>
          <ol dir="ltr" role="list" className="bill-usage-plot mt-3 flex h-16 gap-1 border-b border-brand-200 sm:h-20 sm:gap-2">
            {months.map((month) => (
              <li key={month.key} className="flex min-w-0 flex-1 items-end justify-center">
                <span lang={lang} dir="auto" className="sr-only">{monthLabel(month.month)}, {t.previewUnitsLabel(formatNumber(month.units))}</span>
                <span aria-hidden="true" className={`w-full max-w-10 rounded-t-sm ${month.current ? 'bg-brand-700' : 'bg-brand-400'}`}
                      style={{ height: `${month.units / maxUnits * 100}%` }} />
              </li>
            ))}
          </ol>
          <div dir="ltr" aria-hidden="true" className="mt-1 flex justify-between gap-2 text-xs text-slate-600 sm:text-sm">
            <span dir="auto">{monthLabel(months[0].month)}</span>
            <span dir="auto">{monthLabel(bill.billing_month)}</span>
          </div>
        </section>
      </div>
      {fields.arrears !== null && (
        <p className="flex items-center gap-2 rounded-b-[var(--radius-card)] border-t border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800 sm:px-6 sm:text-base">
          <ReceiptIcon className="size-5 shrink-0" /> {t.previewArrears(t.rupees(formatNumber(fields.arrears)))}
        </p>
      )}
    </figure>
  )
}
