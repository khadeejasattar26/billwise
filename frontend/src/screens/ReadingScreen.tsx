import type { ApiError } from '../api'
import { FlowLayout } from '../components/layout/FlowLayout'
import { ErrorPanel, LoadingPanel } from '../components/result/StatusPanels'
import { button } from '../components/ui/styles'
import type { Lang, Strings } from '../i18n'

type Props = { lang: Lang; t: Strings; error: ApiError | null; onBack: () => void; onRetake: () => void; onRetry: () => void }

const PHOTO_ERRORS = ['unsupported_file_type', 'file_too_large', 'unreadable_image', 'fields_not_found', 'not_a_bill']
const WAIT_ERRORS = ['daily_limit', 'rate_limited', 'consent_required']

export function ReadingScreen({ lang, t, error, onBack, onRetake, onRetry }: Props) {
  return (
    <FlowLayout t={t} title={error ? t.errorTitle : t.readingTitle} onBack={onBack} actions={error && (
      PHOTO_ERRORS.includes(error.code) ? (
        <button type="button" onClick={onRetake} className={`${button.primary} min-h-16 w-full px-6 text-xl`}>{t.retake}</button>
      ) : !WAIT_ERRORS.includes(error.code) && (
        <button type="button" onClick={onRetry} className={`${button.primary} min-h-16 w-full px-6 text-xl`}>{t.retry}</button>
      )
    )}>
      {!error && <LoadingPanel t={t} />}
      {error && <ErrorPanel error={error} t={t} lang={lang} />}
    </FlowLayout>
  )
}
