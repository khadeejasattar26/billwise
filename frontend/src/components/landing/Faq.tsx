import type { Strings } from '../../i18n'
import { ChevronIcon } from '../ui/icons'
import { focusRing, sectionTitle } from '../ui/styles'

/** Native <details>: keyboard- and screen-reader-friendly with no extra JavaScript. */
export function Faq({ t }: { t: Strings }) {
  return (
    <section id="faq" aria-labelledby="faq-h" className="min-w-0">
      <h2 id="faq-h" className={sectionTitle}>{t.faqTitle}</h2>
      <div className="mt-4 divide-y divide-brand-900/10 overflow-hidden rounded-[var(--radius-card)] border border-brand-900/10 bg-white">
        {t.faq.map((item) => (
          <details key={item.q} className="group">
            <summary className={`flex min-h-12 cursor-pointer items-center justify-between gap-4 px-4 py-3 text-base font-semibold text-ink hover:bg-brand-50 focus-visible:-outline-offset-4 ${focusRing}`}>
              <span>{item.q}</span>
              <ChevronIcon className="size-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 text-base text-slate-700">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
