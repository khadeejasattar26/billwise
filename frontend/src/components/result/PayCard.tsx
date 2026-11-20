import type { Bill, BillFields } from '../../api'
import type { Lang, Strings } from '../../i18n'
import { formatDate, formatNumber } from '../../lib/format'
import { CalendarIcon } from '../ui/icons'

/** The one number people came for: how much to pay, by when, and how much more if late. */
export function PayCard({ bill, fields, lang, t, headingId = 'pay-h' }: { bill: Bill; fields: BillFields; lang: Lang; t: Strings; headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-slate-900/5">
      <h2 id={headingId} className="text-lg text-slate-600">{t.payLabel}</h2>
      <p className="latin mt-1 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{t.rupees(formatNumber(bill.amount))}</p>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-lg font-semibold text-amber-950 ring-1 ring-amber-200">
        <CalendarIcon className="size-5 text-amber-700" /> {t.payBy(formatDate(bill.due_date, lang, true, true))}
      </p>
      {fields.payable_after_due && fields.payable_after_due > bill.amount && (
        <p className="mt-3 text-base text-slate-600">{t.payAfter(t.rupees(formatNumber(fields.payable_after_due)))}</p>
      )}
    </section>
  )
}
