import type { Strings } from '../../i18n'
import { CameraIcon, CheckIcon, SpeakerIcon } from '../ui/icons'
import { container, sectionTitle } from '../ui/styles'

const ICONS = [CameraIcon, CheckIcon, SpeakerIcon]

export function HowItWorks({ t }: { t: Strings }) {
  return (
    <section id="how" aria-labelledby="how-h" className="border-b border-brand-900/10 bg-white">
      <div className={`${container} py-8 sm:py-11`}>
        <h2 id="how-h" className={sectionTitle}>{t.howTitle}</h2>
        <ol role="list" className="mt-4 grid divide-y divide-brand-900/10 border-y border-brand-900/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {t.howSteps.map((step, i) => {
            const Icon = ICONS[i]
            return (
              <li key={step.title} className="flex gap-3 py-4 md:px-5 md:py-5 md:first:ps-0 md:last:pe-0">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-ink">{step.title}</h3>
                  <p className="mt-1 text-base text-slate-700">{step.text}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
