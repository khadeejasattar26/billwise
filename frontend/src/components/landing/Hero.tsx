import type { ReactNode } from 'react'
import type { Strings } from '../../i18n'
import { CheckIcon } from '../ui/icons'
import { container } from '../ui/styles'

/**
 * The promise, the upload card and four trust badges. Phones: headline -> upload card -> details, so
 * the card is on the first screen. Desktop: text on one side, the card beside it.
 */
export function Hero({ t, children }: { t: Strings; children: ReactNode }) {
  return (
    <section id="top" aria-labelledby="hero-h" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
      <div className={`${container} grid gap-6 py-6 sm:py-12 lg:grid-cols-[1.1fr_1fr] lg:gap-x-12 lg:gap-y-5`}>
        <div className="space-y-3 lg:col-start-1">
          <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">{t.heroEyebrow}</p>
          {/* Nastaliq needs far more line height than Latin, or stacked lines collide. */}
          <h1 id="hero-h" className="text-3xl font-extrabold text-ink ltr:leading-tight ltr:sm:text-5xl rtl:leading-[2.25] rtl:sm:text-4xl">
            {t.heroTitle}
          </h1>
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-2">{children}</div>
        <div className="space-y-5 lg:col-start-1">
          <p className="max-w-xl text-lg text-slate-700 sm:text-xl">{t.heroText}</p>
          <ul className="flex flex-wrap gap-2">
            {t.badges.map((badge) => (
              <li key={badge} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-base font-semibold text-slate-800 ring-1 ring-slate-900/10">
                <CheckIcon className="size-4 text-brand-700" /> {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
