import type { ApiError } from '../../api'
import { warningText, type Lang, type Strings } from '../../i18n'
import { AlertIcon } from '../ui/icons'
import { card } from '../ui/styles'

export function LoadingPanel({ t }: { t: Strings }) {
  return (
    <div role="status" className={`${card} flex items-center gap-4`}>
      <span aria-hidden="true" className="size-8 shrink-0 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-700 motion-reduce:animate-none" />
      <p className="text-lg text-slate-700">{t.loading}</p>
    </div>
  )
}

export function ErrorPanel({ error, t, lang }: { error: ApiError; t: Strings; lang: Lang }) {
  const message = t.errors[error.code] ?? t.errors.default
  return (
    <div role="alert" className="flex gap-4 rounded-[var(--radius-card)] bg-red-50 p-5 text-red-900 ring-1 ring-red-200 sm:p-6">
      <AlertIcon className="size-7 shrink-0 text-red-700" />
      <div className="min-w-0">
        <p className="text-lg">{message}</p>
        {error.details?.warnings && error.details.warnings.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 ps-6 text-base">
            {error.details.warnings.map((w) => <li key={w}>{warningText(w, lang)}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}
