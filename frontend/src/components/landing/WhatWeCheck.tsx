import type { Strings } from '../../i18n'
import { CalendarIcon, ChartIcon, ReceiptIcon, SparkIcon } from '../ui/icons'
import { container, sectionTitle } from '../ui/styles'

const ICONS = [ReceiptIcon, SparkIcon, ChartIcon, CalendarIcon]

export function WhatWeCheck({ t }: { t: Strings }) {
  return (
    <section id="checks" aria-labelledby="checks-h" className="scroll-mt-20 bg-brand-900 py-14 text-white">
      <div className={container}>
        <h2 id="checks-h" className={`${sectionTitle} text-white`}>{t.checksTitle}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.checks.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <li key={item.title} className="space-y-2">
                <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-brand-200">
                  <Icon className="size-6" />
                </span>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-base text-brand-100">{item.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
