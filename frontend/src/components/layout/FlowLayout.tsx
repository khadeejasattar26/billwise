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
    <div className={`mx-auto w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} px-4 pt-4 sm:pt-8 ${actions ? '' : 'pb-16'}`}>
      <div className="flex min-h-12 items-center justify-between gap-3">
        {onBack ? (
          <button type="button" onClick={onBack}
                  className={`-ms-2 inline-flex min-h-12 items-center gap-1 rounded-xl px-2 text-lg text-brand-800 hover:bg-brand-50 ${focusRing}`}>
            <BackIcon className="size-6 rtl:-scale-x-100" /> {t.back}
          </button>
        ) : <span />}
        {step && <p className="text-base text-slate-600">{t.stepOf(step, STEP_COUNT)}</p>}
      </div>
      {step && (
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      )}
      <h1 ref={heading} id="screen-title" tabIndex={-1} className="mt-3 text-3xl text-ink outline-none ltr:font-extrabold sm:text-4xl">{title}</h1>
      <div className="mt-6 space-y-6">{children}</div>
      {/* The screen's main action stays pinned to the bottom, so it is reachable on small phones and
          with large text; it clears the iPhone home bar (safe-area inset). */}
      {actions && (
        <div className="sticky bottom-0 -mx-4 mt-6 space-y-3 border-t border-slate-900/10 bg-paper/95 px-4 pt-3 backdrop-blur pb-[max(1rem,env(safe-area-inset-bottom))]">
          {actions}
        </div>
      )}
    </div>
  )
}
