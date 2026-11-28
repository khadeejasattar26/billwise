import { useEffect, useRef, type ReactNode } from 'react'
import { STEP_COUNT } from '../../flow/screens'
import type { Strings } from '../../i18n'
import { BackIcon } from '../ui/icons'
import { focusRing } from '../ui/styles'

type Props = { t: Strings; title: string; step?: number; onBack?: () => void; wide?: boolean; actions?: ReactNode; children: ReactNode }

/**
 * One screen of the guided flow: back, "step N of 3", one heading, one column (GOV.UK question
 * pages). The heading takes focus on each new screen so screen readers announce where you are.
 */
export function FlowLayout({ t, title, step, onBack, wide, actions, children }: Props) {
  // Focus the heading when the screen appears. Done here, not in App: screens load on demand, so App
  // cannot know when the heading exists (QA caught focus being lost on a screen's first visit).
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])
  return (
    <div className={`mx-auto w-full ${wide ? 'max-w-3xl' : 'max-w-[40rem]'} px-4 pt-3 pb-8 sm:px-6 sm:pt-7 sm:pb-14`}>
      {(onBack || step) && <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-3">
        {onBack ? (
          <button type="button" onClick={onBack}
                  className={`-ms-2 inline-flex min-h-12 items-center gap-1 rounded-xl px-2 text-lg text-brand-800 hover:bg-brand-50 ${focusRing}`}>
            <BackIcon className="size-6 rtl:-scale-x-100" /> {t.back}
          </button>
        ) : <span />}
        {step && <p className="rounded-full bg-brand-50 px-3 py-0.5 text-sm text-brand-800 ltr:font-semibold">{t.stepOf(step, STEP_COUNT)}</p>}
      </div>}
      {step && (
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i + 1 === step ? 'bg-brand-600' : i < step ? 'bg-brand-200' : 'bg-brand-900/10'}`} />
          ))}
        </div>
      )}
      <h1 ref={heading} id="screen-title" tabIndex={-1} className="mt-4 text-3xl text-ink outline-none ltr:font-extrabold ltr:tracking-tight sm:mt-5 sm:text-4xl">{title}</h1>
      <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-5">{children}</div>
      {actions && (
        <div className="step-actions -mx-4 mt-4 grid gap-2.5 border-t border-brand-900/10 bg-paper/95 px-4 pt-3 backdrop-blur sm:mx-0 sm:mt-5 sm:border-0 sm:px-0 sm:pt-0">
          {actions}
        </div>
      )}
    </div>
  )
}
