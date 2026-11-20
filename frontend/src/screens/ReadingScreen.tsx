import type { ApiError } from '../api'
import { FlowLayout } from '../components/layout/FlowLayout'
import { ErrorPanel, LoadingPanel } from '../components/result/StatusPanels'
import { button } from '../components/ui/styles'
import type { Lang, Strings } from '../i18n'

type Props = { lang: Lang; t: Strings; error: ApiError | null; onRetake: () => void; onRetry: () => void }

/** Waiting (with the pipeline's steps), or what went wrong and the two ways forward. */
export function ReadingScreen({ lang, t, error, onRetake, onRetry }: Props) {
  return (
    <FlowLayout t={t} title={error ? t.errorTitle : t.readingTitle} actions={error && (
      <>
          <button type="button" onClick={onRetake} className={`${button.primary} min-h-16 w-full px-6 text-xl`}>{t.retake}</button>
          {['llm_error', 'network_error', 'speech_failed', 'internal_error', 'unknown'].includes(error.code) && (
            <button type="button" onClick={onRetry} className={`${button.secondary} min-h-14 w-full px-6 text-lg`}>{t.errors.default}</button>
          )}
      </>
    )}>
      {!error && <LoadingPanel t={t} />}
      {error && <ErrorPanel error={error} t={t} lang={lang} />}
    </FlowLayout>
  )
}
