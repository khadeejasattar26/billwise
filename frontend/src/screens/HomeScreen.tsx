import { BillPreview } from '../components/landing/BillPreview'
import { Companies } from '../components/landing/Companies'
import { Faq } from '../components/landing/Faq'
import { HowItWorks } from '../components/landing/HowItWorks'
import { WhatWeCheck } from '../components/landing/WhatWeCheck'
import { BackIcon, CameraIcon, CheckIcon, SpeakerIcon } from '../components/ui/icons'
import { button, container, focusRing } from '../components/ui/styles'
import type { Lang, Strings } from '../i18n'

type Props = { lang: Lang; t: Strings; onStart: () => void; onSample: () => void }

export function HomeScreen({ lang, t, onStart, onSample }: Props) {
  return (
    <>
      <section aria-labelledby="screen-title" className="home-hero text-white">
        <div className={`${container} grid items-center gap-7 pt-7 pb-8 sm:gap-9 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-[4.75rem]`}>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm text-brand-200 ltr:font-semibold ltr:tracking-wide sm:text-base">
              <span aria-hidden="true" className="h-0.5 w-5 shrink-0 bg-accent" />
              {t.heroEyebrow}
            </p>
            <h1 id="screen-title" tabIndex={-1} className="mt-2 text-4xl outline-none ltr:font-bold ltr:leading-[1.06] ltr:tracking-[-.04em] sm:mt-3 ltr:sm:text-6xl ltr:xl:text-[4.15rem] rtl:sm:text-5xl">
              {t.heroTitle} <span className="block text-accent">{t.heroTitleAccent}</span>
            </h1>
            <p className="mt-2 max-w-[29rem] text-lg text-brand-100 ltr:leading-relaxed sm:mt-4 sm:text-xl">{t.heroText}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 sm:mt-6">
              <button type="button" onClick={onStart} className={`${button.light} min-h-14 px-4 py-1.5 text-lg sm:px-5`}>
                <CameraIcon className="size-5 shrink-0" /> {t.startCta}
              </button>
              <button type="button" onClick={onSample} className={`inline-flex min-h-12 items-center gap-1 rounded-md px-1 text-base text-white underline decoration-white/40 underline-offset-4 hover:decoration-white ltr:font-semibold sm:px-2 sm:text-lg ${focusRing}`}>
                {t.sampleCta} <BackIcon className="size-4 shrink-0 ltr:-scale-x-100" />
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-0.5 text-sm text-brand-100 sm:mt-5">
              <li className="inline-flex items-center gap-1.5"><CheckIcon className="size-4 shrink-0 text-accent" />{t.freeToUse}</li>
              <li className="inline-flex items-center gap-1.5"><SpeakerIcon className="size-4 shrink-0 text-accent" />{t.listenInBothLanguages}</li>
            </ul>
          </div>
          <BillPreview lang={lang} t={t} />
        </div>
      </section>
      <HowItWorks t={t} />
      <WhatWeCheck t={t} />
      <div className={`${container} grid gap-8 py-10 sm:py-14 lg:grid-cols-[.87fr_1.13fr] lg:gap-14`}>
        <Companies t={t} />
        <Faq t={t} />
      </div>
    </>
  )
}
