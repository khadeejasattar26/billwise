import { Companies } from '../components/landing/Companies'
import { Faq } from '../components/landing/Faq'
import { HowItWorks } from '../components/landing/HowItWorks'
import { WhatWeCheck } from '../components/landing/WhatWeCheck'
import { PayCard } from '../components/result/PayCard'
import { CameraIcon, CheckIcon } from '../components/ui/icons'
import { button, container } from '../components/ui/styles'
import { SAMPLE_RESULT } from '../data/sampleBill'
import type { Lang, Strings } from '../i18n'

type Props = { lang: Lang; t: Strings; onStart: () => void; onSample: () => void }

/** Landing: the promise, two clear actions, and a real answer card (Linear/Stripe: show the product). */
export function HomeScreen({ lang, t, onStart, onSample }: Props) {
  const sample = SAMPLE_RESULT
  const explanation = lang === 'ur' ? sample.bill.explanation_ur : sample.bill.explanation
  return (
    <>
      <section aria-labelledby="screen-title" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[34rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-brand-100),transparent)]" />
        <div className={`${container} grid items-center gap-10 py-8 sm:py-16 lg:grid-cols-[1.15fr_1fr]`}>
          <div className="space-y-5">
            <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-base text-brand-800">{t.heroEyebrow}</p>
            <h1 id="screen-title" tabIndex={-1} className="text-4xl text-ink outline-none ltr:font-extrabold ltr:leading-tight ltr:sm:text-6xl rtl:leading-[2.1] rtl:sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="max-w-xl text-lg text-slate-700 sm:text-xl">{t.heroText}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onStart} className={`${button.primary} min-h-14 px-7 text-xl`}>
                <CameraIcon className="size-6" /> {t.startCta}
              </button>
              <button type="button" onClick={onSample} className={`${button.secondary} min-h-14 px-7 text-xl`}>
                {t.sampleCta}
              </button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {t.badges.map((badge) => (
                <li key={badge} className="inline-flex items-center gap-1.5 text-base text-slate-700">
                  <CheckIcon className="size-5 text-brand-700" /> {badge}
                </li>
              ))}
            </ul>
          </div>
          {/* The real answer components with the example bill, shown as a picture of the product. */}
          <figure className="mx-auto w-full max-w-md">
            <div aria-hidden="true" className="pointer-events-none space-y-3 rounded-[2rem] bg-slate-900/5 p-3 ring-1 ring-slate-900/10 sm:p-4">
              <PayCard bill={sample.bill} fields={sample.fields} lang={lang} t={t} headingId="pay-preview-h" />
              <div className="rounded-[var(--radius-card)] bg-brand-800 p-5 text-lg text-white">{explanation}</div>
            </div>
            <figcaption className="mt-3 text-center text-base text-slate-600">{t.previewCaption}</figcaption>
          </figure>
        </div>
      </section>
      <HowItWorks t={t} />
      <WhatWeCheck t={t} />
      <Companies t={t} />
      <Faq t={t} />
    </>
  )
}
