import type { Strings } from '../../i18n'
import { ChevronIcon } from '../ui/icons'
import { container, focusRing, sectionTitle } from '../ui/styles'

/** Native <details>: keyboard- and screen-reader-friendly with no extra JavaScript. */
export function Faq({ t }: { t: Strings }) {
  return (
    <section id="faq" aria-labelledby="faq-h" className={`${container} scroll-mt-20 py-12`}>
      <h2 id="faq-h" className={sectionTitle}>{t.faqTitle}</h2>
      <div className="mt-6 divide-y divide-slate-900/10 overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-slate-900/5">
        {t.faq.map((item) => (
          <details key={item.q} className="group">
            <summary className={`flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-lg font-semibold text-ink hover:bg-slate-50 ${focusRing}`}>
              <span>{item.q}</span>
              <ChevronIcon className="size-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-base text-slate-700">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
