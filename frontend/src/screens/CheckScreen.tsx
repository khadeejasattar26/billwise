import { FlowLayout } from '../components/layout/FlowLayout'
import { AlertIcon, CheckIcon } from '../components/ui/icons'
import { button } from '../components/ui/styles'
import type { Strings } from '../i18n'
import type { PhotoIssue } from '../lib/photo'

export type PhotoState = { url: string; issues: PhotoIssue[] | null; unreadable: boolean }

type Props = { t: Strings; photo: PhotoState; onBack: () => void; onRetake: () => void; onUse: () => void }

/** Review before upload: catches blurry, dark or tiny photos in a second instead of after a 20 s wait. */
export function CheckScreen({ t, photo, onBack, onRetake, onUse }: Props) {
  const checking = photo.issues === null && !photo.unreadable
  const hasIssues = !!photo.issues?.length
  return (
    <FlowLayout t={t} title={t.checkTitle} step={3} onBack={onBack} actions={<>
        {/* The recommended action is the big one: retake when something looks wrong, otherwise continue. */}
        {photo.unreadable || hasIssues ? (
          <>
            <button type="button" onClick={onRetake} className={`${button.primary} min-h-16 w-full px-6 text-xl`}>{t.retake}</button>
            {!photo.unreadable && <button type="button" onClick={onUse} className={`${button.secondary} min-h-14 w-full px-6 text-lg`}>{t.usePhotoAnyway}</button>}
          </>
        ) : (
          <>
            <button type="button" onClick={onUse} disabled={checking} className={`${button.primary} min-h-16 w-full px-6 text-xl`}>{t.usePhoto}</button>
            <button type="button" onClick={onRetake} className={`${button.secondary} min-h-14 w-full px-6 text-lg`}>{t.retake}</button>
          </>
        )}
    </>}>
      {!photo.unreadable && (
        <img src={photo.url} alt={t.previewAlt} className="max-h-[32vh] w-full rounded-[var(--radius-card)] bg-slate-100 object-contain ring-1 ring-slate-900/10" />
      )}
      <div role="status">
        {checking && <p className="text-lg text-slate-700">{t.checking}</p>}
        {photo.unreadable && (
          <p className="flex gap-3 rounded-2xl bg-red-50 p-4 text-lg text-red-900 ring-1 ring-red-200">
            <AlertIcon className="mt-1 size-6 shrink-0 text-red-700" /> {t.checkUnreadable}
          </p>
        )}
        {photo.issues && !hasIssues && (
          <p className="flex items-center gap-3 rounded-[var(--radius-card)] bg-emerald-50 p-4 text-lg text-emerald-950 ring-1 ring-emerald-200">
            <CheckIcon className="size-6 shrink-0 text-emerald-700" /> {t.checkGood}
          </p>
        )}
        {hasIssues && (
          <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-lg text-amber-950 ring-1 ring-amber-300">
            <AlertIcon className="mt-1 size-6 shrink-0 text-amber-700" />
            <div>
              <ul className="space-y-1">{photo.issues!.map((issue) => <li key={issue}>{t.checkIssues[issue]}</li>)}</ul>
              <p className="mt-1 font-semibold">{t.checkAdvice}</p>
            </div>
          </div>
        )}
      </div>
    </FlowLayout>
  )
}
