import { useEffect, useState } from 'react'
import type { ApiError } from '../../api'
import { warningText, type Lang, type Strings } from '../../i18n'
import { AlertIcon } from '../ui/icons'
import { card } from '../ui/styles'

/** Waiting state: the pipeline's real steps, so a 20-90 s wait doesn't look frozen. */
export function LoadingPanel({ t }: { t: Strings }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, t.loadingSteps.length - 1)), 6000)
    return () => clearInterval(timer)
  }, [t.loadingSteps.length])
  return (
    <div role="status" className={`${card} flex flex-col items-center gap-5 py-10 text-center`}>
      <span aria-hidden="true" className="size-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700 motion-reduce:animate-none" />
      <ol className="space-y-2 text-lg">
        {t.loadingSteps.map((label, i) => (
          <li key={label} className={i === step ? 'font-bold text-ink' : i < step ? 'text-brand-700' : 'text-slate-400'}>
            {label}
          </li>
        ))}
      </ol>
      <p className="max-w-md text-base text-slate-600">{t.loading}</p>
    </div>
  )
}

export function ErrorPanel({ error, t, lang }: { error: ApiError; t: Strings; lang: Lang }) {
  const message = lang === 'en' && error.message ? error.message : (t.errors[error.code] ?? t.errors.default)
  return (
    <div role="alert" className="flex gap-4 rounded-[var(--radius-card)] bg-red-50 p-5 text-red-900 ring-1 ring-red-200 sm:p-6">
      <AlertIcon className="size-7 shrink-0 text-red-700" />
      <div>
        <p className="text-xl font-bold">{t.errorTitle}</p>
        <p className="mt-1 text-lg">{message}</p>
        {error.details?.warnings && error.details.warnings.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 ps-6 text-base">
            {error.details.warnings.map((w) => <li key={w}>{warningText(w, lang)}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}
