import type { Strings } from '../../i18n'
import { CalendarIcon, ChartIcon, ReceiptIcon, SparkIcon } from '../ui/icons'
import { container, sectionTitle } from '../ui/styles'

const ICONS = [ReceiptIcon, SparkIcon, ChartIcon, CalendarIcon]

export function WhatWeCheck({ t }: { t: Strings }) {
  return (
    <section id="checks" aria-labelledby="checks-h" className="border-b border-brand-900/10 bg-brand-50 py-10 sm:py-14">
      <div className={`${container} grid gap-5 lg:grid-cols-[.63fr_1.37fr] lg:gap-14`}>
        <h2 id="checks-h" className={`${sectionTitle} max-w-xs`}>{t.checksTitle}</h2>
        <ul role="list" className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-brand-900/10 bg-brand-900/10 sm:grid-cols-2">
          {t.checks.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <li key={item.title} className="flex gap-3 bg-white p-4 sm:p-5">
                <Icon className="mt-1 size-5 shrink-0 text-brand-700" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-base text-slate-700">{item.text}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
