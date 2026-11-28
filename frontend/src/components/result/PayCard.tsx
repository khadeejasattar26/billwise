import type { Bill, BillFields } from '../../api'
import type { Lang, Strings } from '../../i18n'
import { formatDate, formatNumber } from '../../lib/format'
import { CalendarIcon } from '../ui/icons'

/** The one number people came for: how much to pay, by when, and how much more if late. */
export function PayCard({ bill, fields, lang, t }: { bill: Bill; fields: BillFields; lang: Lang; t: Strings }) {
  return (
    <section aria-labelledby="pay-h" className="rounded-[var(--radius-card)] border border-brand-900/10 border-t-[3px] border-t-brand-600 bg-white px-4 pt-4 text-ink shadow-[var(--shadow-card)] sm:px-6 sm:pt-5">
      <h2 id="pay-h" className="text-base text-slate-600 ltr:font-semibold">{t.payLabel}</h2>
      <p className="latin mt-1 text-4xl font-extrabold break-words tracking-tight text-brand-900 tabular-nums sm:text-5xl">{t.rupees(formatNumber(bill.amount))}</p>
      <div className="mt-3 border-t border-brand-900/10 py-3">
        <p className="flex items-center gap-2 text-base text-brand-900 ltr:font-semibold">
          <CalendarIcon className="size-5 shrink-0 text-brand-600" /> {t.payBy(formatDate(bill.due_date, lang, true, true))}
        </p>
        {fields.payable_after_due && fields.payable_after_due > bill.amount && (
          <p className="mt-0.5 ps-7 text-sm text-slate-600">{t.payAfter(t.rupees(formatNumber(fields.payable_after_due)))}</p>
        )}
      </div>
    </section>
  )
}
