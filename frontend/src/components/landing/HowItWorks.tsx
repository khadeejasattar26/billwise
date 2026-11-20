import type { Strings } from '../../i18n'
import { CameraIcon, CheckIcon, SpeakerIcon } from '../ui/icons'
import { card, container, sectionTitle } from '../ui/styles'

const ICONS = [CameraIcon, CheckIcon, SpeakerIcon]

export function HowItWorks({ t }: { t: Strings }) {
  return (
    <section id="how" aria-labelledby="how-h" className={`${container} scroll-mt-20 py-12`}>
      <h2 id="how-h" className={sectionTitle}>{t.howTitle}</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {t.howSteps.map((step, i) => {
          const Icon = ICONS[i]
          return (
            <li key={step.title} className={`${card} flex gap-4`}>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon className="size-6" />
              </span>
              <div>
                <p className="latin text-sm font-bold text-brand-700">{i + 1}</p>
                <h3 className="text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-base text-slate-700">{step.text}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
