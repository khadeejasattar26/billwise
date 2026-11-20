import { warningText, type Lang, type Strings } from '../../i18n'
import { AlertIcon } from '../ui/icons'

/** Numbers the checker could not reconcile, in the reader's language, with what to do about it. */
export function WarningsBox({ warnings, lang, t }: { warnings: string[]; lang: Lang; t: Strings }) {
  if (warnings.length === 0) return null
  return (
    <div role="alert" className="flex gap-4 rounded-[var(--radius-card)] bg-amber-50 p-5 text-amber-950 ring-1 ring-amber-300 sm:p-6">
      <AlertIcon className="size-7 shrink-0 text-amber-700" />
      <div>
        <p className="text-lg font-bold">{t.warningsTitle}</p>
        <ul className="mt-1 list-disc space-y-1 ps-6">
          {warnings.map((w) => <li key={w}>{warningText(w, lang)}</li>)}
        </ul>
        <p className="mt-2 text-base">{t.warningsHint}</p>
      </div>
    </div>
  )
}
